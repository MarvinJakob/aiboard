package httpserver_test

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
)

func (b *browser) users() []api.User {
	b.t.Helper()
	resp, body := b.do(http.MethodGet, "/api/admin/users", nil)
	wantStatus(b.t, resp, body, http.StatusOK)
	return decode[api.UserList](b.t, body).Items
}

func (b *browser) setActive(id int64, active bool, want int) (api.User, string) {
	b.t.Helper()
	resp, body := b.do(http.MethodPatch, fmt.Sprintf("/api/admin/users/%d", id), api.UserPatch{Active: active})
	wantStatus(b.t, resp, body, want)
	if want != http.StatusOK {
		return api.User{}, body
	}
	return decode[api.User](b.t, body), body
}

func findUser(us []api.User, email string) (api.User, bool) {
	for _, u := range us {
		if u.Email == email {
			return u, true
		}
	}
	return api.User{}, false
}

// Anforderung 11: Konten anzeigen und mit eindeutiger E-Mail-Adresse und Startpasswort anlegen.
func TestAdminListsAndCreatesAccounts(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)

	list := admin.users()
	if len(list) != 2 || list[0].Email != adminEmail || list[1].Email != editorEmail {
		t.Fatalf("Konten: %+v", list)
	}
	_, body := admin.do(http.MethodGet, "/api/admin/users", nil)
	if strings.Contains(body, "argon2") || strings.Contains(strings.ToLower(body), "password") {
		t.Fatalf("Antwort enthält Passwortdaten: %s", body)
	}

	resp, body := admin.do(http.MethodPost, "/api/admin/users", api.NewUser{Email: " Neu@Example.test ", Password: "startpasswort-1"})
	wantStatus(t, resp, body, http.StatusCreated)
	created := decode[api.User](t, body)
	if created.Email != "neu@example.test" || created.Role != "editor" || !created.Active || created.Id == 0 {
		t.Fatalf("angelegt: %+v", created)
	}
	if _, ok := findUser(admin.users(), "neu@example.test"); !ok {
		t.Fatal("neues Konto fehlt in der Liste")
	}

	// Die E-Mail-Adresse ist eindeutig, auch bei anderer Schreibweise.
	resp, body = admin.do(http.MethodPost, "/api/admin/users", api.NewUser{Email: "NEU@example.test", Password: "anderes-passwort"})
	wantStatus(t, resp, body, http.StatusConflict)
	for _, bad := range []api.NewUser{
		{Email: "keine-adresse", Password: "startpasswort-1"},
		{Email: "kurz@example.test", Password: "zu-kurz"},
		{Email: "", Password: ""},
	} {
		resp, body := admin.do(http.MethodPost, "/api/admin/users", bad)
		wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	}
	if n := len(admin.users()); n != 3 {
		t.Fatalf("%d Konten, erwartet 3", n)
	}

	// Ein neu angelegtes Konto kann sich anmelden und landet in der Beitragsliste.
	neu := newBrowser(t, srv)
	if status, me := neu.login("neu@example.test", "startpasswort-1"); status != http.StatusOK || me.Role != "editor" {
		t.Fatalf("Anmeldung neues Konto: %d %+v", status, me)
	}
	resp, _ = neu.do(http.MethodGet, "/redaktion/anmelden", nil)
	wantRedirect(t, resp, "/redaktion")
}

// Anforderung 11: Deaktivieren beendet auch geöffnete Sitzungen, Reaktivieren erlaubt die Anmeldung wieder.
func TestDeactivateAndReactivate(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	second := newBrowser(t, srv) // zweite offene Sitzung desselben Kontos
	second.mustLogin(editorEmail)
	getMe(t, editor, http.StatusOK)

	u, _ := findUser(admin.users(), editorEmail)
	off, _ := admin.setActive(u.Id, false, http.StatusOK)
	if off.Active {
		t.Fatalf("nicht deaktiviert: %+v", off)
	}

	for _, b := range []*browser{editor, second} {
		getMe(t, b, http.StatusUnauthorized)
		resp, _ := b.do(http.MethodGet, "/redaktion", nil)
		wantRedirect(t, resp, "/redaktion/anmelden")
		resp, body := b.do(http.MethodPost, "/api/admin/posts", draftInput("Nach Deaktivierung"))
		wantStatus(t, resp, body, http.StatusUnauthorized)
	}
	if status, _ := newBrowser(t, srv).login(editorEmail, testPass); status != http.StatusUnauthorized {
		t.Fatalf("Anmeldung trotz Deaktivierung: %d", status)
	}
	if got, _ := findUser(admin.users(), editorEmail); got.Active {
		t.Fatal("Liste zeigt Konto als aktiv")
	}

	on, _ := admin.setActive(u.Id, true, http.StatusOK)
	if !on.Active {
		t.Fatalf("nicht reaktiviert: %+v", on)
	}
	again := newBrowser(t, srv)
	if status, _ := again.login(editorEmail, testPass); status != http.StatusOK {
		t.Fatalf("Anmeldung nach Reaktivierung: %d", status)
	}
	getMe(t, again, http.StatusOK)
	// Alte Sitzungen bleiben ungültig.
	getMe(t, editor, http.StatusUnauthorized)
}

func TestAdminCannotDeactivateSelf(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	admin := newBrowser(t, srv)
	me := admin.mustLogin(adminEmail)
	_, body := admin.setActive(me.Id, false, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "eigene Konto") {
		t.Errorf("Meldung: %s", body)
	}
	getMe(t, admin, http.StatusOK)
	admin.setActive(9999, false, http.StatusNotFound)
}

// Anforderung 11: Konten ohne Admin-Rolle nutzen die Benutzerverwaltung weder über die Oberfläche
// noch über die API.
func TestUserManagementIsAdminOnly(t *testing.T) {
	srv, db := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	var adminID int64
	if err := db.QueryRow("SELECT id FROM users WHERE email = ?", adminEmail).Scan(&adminID); err != nil {
		t.Fatal(err)
	}
	for _, c := range []struct {
		method, path string
		body         any
	}{
		{http.MethodGet, "/api/admin/users", nil},
		{http.MethodPost, "/api/admin/users", api.NewUser{Email: "x@example.test", Password: "startpasswort-1"}},
		{http.MethodPatch, fmt.Sprintf("/api/admin/users/%d", adminID), api.UserPatch{Active: false}},
		{http.MethodGet, "/redaktion/benutzer", nil},
	} {
		resp, body := editor.do(c.method, c.path, c.body)
		wantStatus(t, resp, body, http.StatusForbidden)
	}
	var active bool
	var n int
	_ = db.QueryRow("SELECT active FROM users WHERE id = ?", adminID).Scan(&active)
	_ = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&n)
	if !active || n != 2 {
		t.Fatalf("Konten verändert: active=%v, anzahl=%d", active, n)
	}

	// Admin ohne CSRF-Token: ebenfalls abgelehnt.
	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)
	admin.csrf = ""
	resp, body := admin.do(http.MethodPost, "/api/admin/users", api.NewUser{Email: "y@example.test", Password: "startpasswort-1"})
	wantStatus(t, resp, body, http.StatusForbidden)
}
