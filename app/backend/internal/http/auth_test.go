package httpserver_test

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/service"
)

const (
	editorEmail = "redakteurin@example.test"
	adminEmail  = "admin@example.test"
	testPass    = "sicheres-passwort-1"
)

// browser ist ein HTTP-Client mit Cookies, der Weiterleitungen nicht folgt.
type browser struct {
	t    *testing.T
	srv  *httptest.Server
	c    *http.Client
	csrf string
}

func newBrowser(t *testing.T, srv *httptest.Server) *browser {
	t.Helper()
	jar, _ := cookiejar.New(nil)
	return &browser{t: t, srv: srv, c: &http.Client{
		Jar:           jar,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}}
}

// do schickt eine Anfrage. Bei schreibenden Aufrufen wird das CSRF-Token mitgeschickt, sofern vorhanden.
func (b *browser) do(method, path string, body any, header ...string) (*http.Response, string) {
	b.t.Helper()
	var rd io.Reader
	if body != nil {
		buf, _ := json.Marshal(body)
		rd = bytes.NewReader(buf)
	}
	req, err := http.NewRequest(method, b.srv.URL+path, rd)
	if err != nil {
		b.t.Fatal(err)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if b.csrf != "" && method != http.MethodGet {
		req.Header.Set("X-CSRF-Token", b.csrf)
	}
	for i := 0; i+1 < len(header); i += 2 {
		req.Header.Set(header[i], header[i+1])
	}
	resp, err := b.c.Do(req)
	if err != nil {
		b.t.Fatal(err)
	}
	defer resp.Body.Close()
	out, _ := io.ReadAll(resp.Body)
	return resp, string(out)
}

// login meldet an und merkt sich das CSRF-Token.
func (b *browser) login(email, password string) (int, api.Me) {
	b.t.Helper()
	resp, body := b.do(http.MethodPost, "/api/auth/login", api.LoginRequest{Email: email, Password: password})
	var me api.Me
	if resp.StatusCode == http.StatusOK {
		if err := json.Unmarshal([]byte(body), &me); err != nil {
			b.t.Fatal(err)
		}
		b.csrf = me.CsrfToken
	}
	return resp.StatusCode, me
}

func (b *browser) mustLogin(email string) api.Me {
	b.t.Helper()
	status, me := b.login(email, testPass)
	if status != http.StatusOK {
		b.t.Fatalf("anmeldung %s: status %d", email, status)
	}
	return me
}

func createUser(t *testing.T, db *sql.DB, email string, role service.Role) service.User {
	t.Helper()
	u, err := service.NewAccounts(db).CreateUser(context.Background(), email, testPass, role)
	if err != nil {
		t.Fatal(err)
	}
	return u
}

func newServerWithAccounts(t *testing.T) (*httptest.Server, *sql.DB) {
	t.Helper()
	srv, db := newServer(t, false)
	createUser(t, db, editorEmail, service.RoleEditor)
	createUser(t, db, adminEmail, service.RoleAdmin)
	return srv, db
}

func wantStatus(t *testing.T, resp *http.Response, body string, want int) {
	t.Helper()
	if resp.StatusCode != want {
		t.Fatalf("%s %s: status %d, erwartet %d (%s)", resp.Request.Method, resp.Request.URL.Path, resp.StatusCode, want, body)
	}
}

func wantRedirect(t *testing.T, resp *http.Response, location string) {
	t.Helper()
	if resp.StatusCode != http.StatusSeeOther || resp.Header.Get("Location") != location {
		t.Fatalf("%s: status %d nach %q, erwartet 303 nach %q", resp.Request.URL.Path, resp.StatusCode, resp.Header.Get("Location"), location)
	}
}

// Anforderung 6: Nach der Anmeldung führt die Redaktion zur Beitragsliste, Admin-Konten zur Benutzerverwaltung.
func TestLoginLeadsToHomeByRole(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	for _, tc := range []struct {
		email, role, home string
	}{
		{editorEmail, "editor", "/redaktion"},
		{"  Admin@Example.TEST ", "admin", "/redaktion/benutzer"},
	} {
		b := newBrowser(t, srv)
		me := b.mustLogin(tc.email)
		if string(me.Role) != tc.role || me.CsrfToken == "" || me.Id == 0 {
			t.Errorf("%s: unerwartete Antwort %+v", tc.email, me)
		}
		resp, _ := b.do(http.MethodGet, "/redaktion/anmelden", nil)
		wantRedirect(t, resp, tc.home)
		resp, body := b.do(http.MethodGet, tc.home, nil)
		wantStatus(t, resp, body, http.StatusOK)
		if !strings.Contains(body, `id="redaktion"`) {
			t.Errorf("%s: Redaktionsfrontend erwartet, erhalten %q", tc.home, body)
		}
		me2 := getMe(t, b, http.StatusOK)
		if me2.Email != strings.ToLower(strings.TrimSpace(tc.email)) {
			t.Errorf("me: %+v", me2)
		}
	}
}

func getMe(t *testing.T, b *browser, want int) api.Me {
	t.Helper()
	resp, body := b.do(http.MethodGet, "/api/auth/me", nil)
	wantStatus(t, resp, body, want)
	var me api.Me
	_ = json.Unmarshal([]byte(body), &me)
	return me
}

// Das Sitzungscookie ist HttpOnly und SameSite=Lax.
func TestSessionCookieAttributes(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	resp, body := b.do(http.MethodPost, "/api/auth/login", api.LoginRequest{Email: editorEmail, Password: testPass})
	wantStatus(t, resp, body, http.StatusOK)
	c := resp.Header.Get("Set-Cookie")
	for _, want := range []string{"ki_session=", "HttpOnly", "SameSite=Lax", "Path=/"} {
		if !strings.Contains(c, want) {
			t.Errorf("Set-Cookie %q ohne %q", c, want)
		}
	}
	if strings.Contains(body, "password") || strings.Contains(body, "argon2") {
		t.Errorf("Antwort enthält Passwortdaten: %s", body)
	}
}

func TestLoginRejectsWrongCredentials(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	_, unknown := b.do(http.MethodPost, "/api/auth/login", api.LoginRequest{Email: "niemand@example.test", Password: testPass})
	for _, c := range []api.LoginRequest{
		{Email: editorEmail, Password: "falsches-passwort"},
		{Email: "niemand@example.test", Password: testPass},
	} {
		resp, body := b.do(http.MethodPost, "/api/auth/login", c)
		wantStatus(t, resp, body, http.StatusUnauthorized)
		if body != unknown {
			t.Errorf("Antworten unterscheiden sich und verraten Konten: %q / %q", body, unknown)
		}
		if resp.Header.Get("Set-Cookie") != "" {
			t.Errorf("Fehlversuch setzt Cookie")
		}
	}
	resp, body := b.do(http.MethodPost, "/api/auth/login", api.LoginRequest{Email: "", Password: ""})
	wantStatus(t, resp, body, http.StatusBadRequest)
	getMe(t, b, http.StatusUnauthorized)
}

// Anforderung 6: Es gibt keinen Endpunkt zur Selbstregistrierung.
func TestNoSelfRegistration(t *testing.T) {
	srv, db := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	for _, p := range []string{"/api/auth/register", "/api/auth/signup", "/api/register", "/api/users", "/api/admin/users"} {
		resp, body := b.do(http.MethodPost, p, map[string]string{"email": "neu@example.test", "password": testPass})
		if resp.StatusCode < 400 {
			t.Errorf("POST %s: status %d (%s)", p, resp.StatusCode, body)
		}
	}
	var n int
	if err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&n); err != nil || n != 2 {
		t.Fatalf("Konten: %d (%v), erwartet 2", n, err)
	}
	// Neue Konten können sich nicht selbst anmelden.
	if status, _ := b.login("neu@example.test", testPass); status != http.StatusUnauthorized {
		t.Errorf("Anmeldung ohne Konto: %d", status)
	}
}

// Anforderung 6: Ohne Anmeldung öffnen weder Redaktionsseiten noch die Redaktions-API.
func TestEditorialRequiresLogin(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	for _, p := range []string{"/redaktion", "/redaktion/", "/redaktion/benutzer", "/redaktion/beitraege/1", "/redaktion/irgendwas"} {
		resp, _ := b.do(http.MethodGet, p, nil)
		wantRedirect(t, resp, "/redaktion/anmelden")
		if resp.Header.Get("Cache-Control") != "no-store" {
			t.Errorf("%s: Cache-Control %q", p, resp.Header.Get("Cache-Control"))
		}
	}
	resp, body := b.do(http.MethodGet, "/redaktion/anmelden", nil)
	wantStatus(t, resp, body, http.StatusOK)
	if resp.Header.Get("X-Robots-Tag") != "noindex" || resp.Header.Get("Cache-Control") != "no-store" {
		t.Errorf("Anmeldeseite: Header %v", resp.Header)
	}
	resp, body = b.do(http.MethodGet, "/redaktion/assets/redaktion-1.js", nil)
	wantStatus(t, resp, body, http.StatusOK)

	for _, c := range []struct{ method, path string }{
		{http.MethodGet, "/api/auth/me"},
		{http.MethodPost, "/api/auth/logout"},
		{http.MethodGet, "/api/admin/posts"},
		{http.MethodPost, "/api/admin/posts"},
		{http.MethodPut, "/api/admin/posts/1"},
		{http.MethodPost, "/api/admin/posts/1/publish"},
		{http.MethodGet, "/api/admin/users"},
	} {
		resp, body := b.do(c.method, c.path, map[string]string{})
		wantStatus(t, resp, body, http.StatusUnauthorized)
	}
	// Ein ausgedachtes Cookie hilft nicht.
	resp, body = b.do(http.MethodGet, "/api/auth/me", nil, "Cookie", "ki_session=ausgedacht")
	wantStatus(t, resp, body, http.StatusUnauthorized)
}

// Anforderungen 6 und 11: Die Rolle entscheidet über Seiten und API-Aufrufe.
func TestRolesAreEnforced(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	resp, body := editor.do(http.MethodGet, "/redaktion/benutzer", nil)
	wantStatus(t, resp, body, http.StatusForbidden)
	resp, body = editor.do(http.MethodGet, "/api/admin/users", nil)
	wantStatus(t, resp, body, http.StatusForbidden)
	resp, body = editor.do(http.MethodPost, "/api/admin/users", map[string]string{})
	wantStatus(t, resp, body, http.StatusForbidden)

	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)
	for _, p := range []string{"/redaktion", "/redaktion/benutzer"} {
		resp, body := admin.do(http.MethodGet, p, nil)
		wantStatus(t, resp, body, http.StatusOK)
	}
	resp, body = admin.do(http.MethodGet, "/redaktion/gibt-es-nicht", nil)
	wantStatus(t, resp, body, http.StatusNotFound)
}

// Schreibende Aufrufe brauchen das CSRF-Token der Sitzung und dieselbe Herkunft.
func TestCSRFProtection(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	token := b.csrf

	b.csrf = ""
	resp, body := b.do(http.MethodPost, "/api/auth/logout", nil)
	wantStatus(t, resp, body, http.StatusForbidden)
	b.csrf = "falsch"
	resp, body = b.do(http.MethodPost, "/api/auth/logout", nil)
	wantStatus(t, resp, body, http.StatusForbidden)

	b.csrf = token
	resp, body = b.do(http.MethodPost, "/api/auth/logout", nil, "Origin", "https://angreifer.example")
	wantStatus(t, resp, body, http.StatusForbidden)
	resp, body = b.do(http.MethodPost, "/api/auth/login", api.LoginRequest{Email: editorEmail, Password: testPass}, "Origin", "https://angreifer.example")
	wantStatus(t, resp, body, http.StatusForbidden)
	getMe(t, b, http.StatusOK) // Sitzung besteht weiter

	resp, body = b.do(http.MethodPost, "/api/auth/logout", nil, "Origin", srv.URL)
	wantStatus(t, resp, body, http.StatusNoContent)
}

// Anforderung 6: Nach der Abmeldung ist für den Zugriff eine neue Anmeldung nötig.
func TestLogoutEndsSession(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	old := sessionCookieValue(t, b, srv)

	resp, body := b.do(http.MethodPost, "/api/auth/logout", nil)
	wantStatus(t, resp, body, http.StatusNoContent)
	if c := resp.Header.Get("Set-Cookie"); !strings.Contains(c, "ki_session=;") || !strings.Contains(c, "Max-Age=0") {
		t.Errorf("Cookie wird nicht geleert: %q", c)
	}
	getMe(t, b, http.StatusUnauthorized)
	resp, _ = b.do(http.MethodGet, "/redaktion", nil)
	wantRedirect(t, resp, "/redaktion/anmelden")

	// Auch mit dem alten Cookie-Wert ist die Sitzung ungültig, weil sie serverseitig gelöscht ist.
	other := newBrowser(t, srv)
	resp, body = other.do(http.MethodGet, "/api/auth/me", nil, "Cookie", "ki_session="+old)
	wantStatus(t, resp, body, http.StatusUnauthorized)
	resp, _ = other.do(http.MethodGet, "/redaktion", nil, "Cookie", "ki_session="+old)
	wantRedirect(t, resp, "/redaktion/anmelden")
}

func sessionCookieValue(t *testing.T, b *browser, srv *httptest.Server) string {
	t.Helper()
	req, _ := http.NewRequest(http.MethodGet, srv.URL, nil)
	for _, c := range b.c.Jar.Cookies(req.URL) {
		if c.Name == "ki_session" {
			return c.Value
		}
	}
	t.Fatal("kein Sitzungscookie")
	return ""
}

// Abgelaufene Sitzungen sind ungültig.
func TestExpiredSession(t *testing.T) {
	srv, db := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	if _, err := db.Exec("UPDATE sessions SET expires_at = '2000-01-01T00:00:00Z'"); err != nil {
		t.Fatal(err)
	}
	getMe(t, b, http.StatusUnauthorized)
	resp, _ := b.do(http.MethodGet, "/redaktion", nil)
	wantRedirect(t, resp, "/redaktion/anmelden")
}

// Anmeldeversuche werden je IP-Adresse begrenzt.
func TestLoginRateLimit(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	for i := 0; i < 10; i++ {
		if status, _ := b.login(editorEmail, "falsch-falsch"); status != http.StatusUnauthorized {
			t.Fatalf("Versuch %d: %d", i+1, status)
		}
	}
	if status, _ := b.login(editorEmail, testPass); status != http.StatusTooManyRequests {
		t.Fatalf("nach 10 Fehlversuchen: %d, erwartet 429", status)
	}
}

// Die Entwicklungsdaten enthalten je ein Testkonto für Redaktion und Administration.
func TestDevSeedAccounts(t *testing.T) {
	srv, _ := newServer(t, true)
	for email, pw := range map[string]string{"redaktion@example.test": "redaktion-test", "admin@example.test": "admin-test-123"} {
		if status, _ := newBrowser(t, srv).login(email, pw); status != http.StatusOK {
			t.Errorf("%s: %d", email, status)
		}
	}
}
