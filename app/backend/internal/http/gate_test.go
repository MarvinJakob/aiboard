package httpserver_test

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
	httpserver "ki-web/backend/internal/http"
	"ki-web/backend/internal/service"
)

// newGatedServer startet die Anwendung mit Zugangsschutz und einem Testkonto (Ticket #49).
func newGatedServer(t *testing.T) *httptest.Server {
	t.Helper()
	srv, db := newServer(t, true, func(c *httpserver.Config) { c.RequireLogin = true })
	createUser(t, db, editorEmail, service.RoleEditor)
	return srv
}

// Ticket #49, Kriterium 1: Ohne Sitzung führen Seiten zur Anmeldung, die öffentliche API antwortet mit 401.
func TestGateRedirectsPagesAndRejectsAPI(t *testing.T) {
	srv := newGatedServer(t)
	if err := os.WriteFile(filepath.Join(mediaDirOf(srv), "bild.webp"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	b := newBrowser(t, srv)

	for path, want := range map[string]string{
		"/":                          "/redaktion/anmelden?weiter=%2F",
		"/de/blog":                   "/redaktion/anmelden?weiter=%2Fde%2Fblog",
		"/de/themen/ai-audit?quiz=1": "/redaktion/anmelden?weiter=%2Fde%2Fthemen%2Fai-audit%3Fquiz%3D1",
		"/de/impressum":              "/redaktion/anmelden?weiter=%2Fde%2Fimpressum",
		"/sitemap.xml":               "/redaktion/anmelden?weiter=%2Fsitemap.xml",
		"/assets/app-abc.js":         "/redaktion/anmelden?weiter=%2Fassets%2Fapp-abc.js",
		"/media/bild.webp":           "/redaktion/anmelden?weiter=%2Fmedia%2Fbild.webp",
	} {
		resp, body := b.do(http.MethodGet, path, nil)
		wantRedirect(t, resp, want)
		if strings.Contains(body, "KI Perspektiven</title>") {
			t.Errorf("%s: Seite ohne Anmeldung ausgeliefert", path)
		}
		if got := resp.Header.Get("X-Robots-Tag"); !strings.Contains(got, "noindex") {
			t.Errorf("%s: X-Robots-Tag %q, erwartet noindex", path, got)
		}
	}

	for _, path := range []string{"/api/topics?lang=de", "/api/posts?lang=de", "/api/audit?lang=de"} {
		resp, body := b.do(http.MethodGet, path, nil)
		wantStatus(t, resp, body, http.StatusUnauthorized)
	}
}

// Ticket #49: Anmeldung, Redaktionsfrontend und Healthcheck bleiben ohne Sitzung erreichbar.
func TestGateKeepsLoginReachable(t *testing.T) {
	srv, _ := newServer(t, false, func(c *httpserver.Config) { c.RequireLogin = true })
	b := newBrowser(t, srv)

	for _, path := range []string{"/redaktion/anmelden", "/redaktion/anmelden?weiter=%2Fde", "/redaktion/assets/redaktion-1.js", "/redaktion/favicon.svg", "/api/health"} {
		resp, body := b.do(http.MethodGet, path, nil)
		wantStatus(t, resp, body, http.StatusOK)
	}
	// Geschützte Redaktionsseiten führen wie bisher zur Anmeldung.
	resp, _ := b.do(http.MethodGet, "/redaktion", nil)
	wantRedirect(t, resp, "/redaktion/anmelden")
	// Die Anmelde-API antwortet fachlich und nicht mit der Umleitung.
	status, _ := b.login("niemand@example.test", "falsches-passwort")
	if status != http.StatusUnauthorized {
		t.Fatalf("anmeldung mit falschen daten: status %d, erwartet 401", status)
	}
}

// Ticket #54: Direkte Links in beiden Sprachen bleiben vor Anmeldung und nach Sitzungsablauf gesperrt.
func TestGateProtectsDevelopmentPagesAfterSessionExpiry(t *testing.T) {
	srv, db := newServer(t, true, func(c *httpserver.Config) { c.RequireLogin = true })
	createUser(t, db, editorEmail, service.RoleEditor)
	b := newBrowser(t, srv)
	paths := []string{"/"}
	for _, lang := range []string{"de", "en"} {
		for _, page := range []string{"", "/blog", "/blog/beispiel", "/profil", "/themen/ki-datenanalyse", "/themen/ai-audit", "/themen/ai-audit/strategie"} {
			paths = append(paths, "/"+lang+page)
		}
	}
	checkClosed := func() {
		t.Helper()
		for _, path := range paths {
			resp, body := b.do(http.MethodGet, path, nil)
			wantRedirect(t, resp, "/redaktion/anmelden?weiter="+url.QueryEscape(path))
			if strings.Contains(body, `id="root"`) {
				t.Fatalf("%s: geschütztes Frontend ausgeliefert", path)
			}
		}
		for _, path := range []string{"/api/topics?lang=en", "/api/posts?lang=en", "/api/audit?lang=en"} {
			resp, body := b.do(http.MethodGet, path, nil)
			wantStatus(t, resp, body, http.StatusUnauthorized)
		}
	}
	checkClosed()
	b.mustLogin(editorEmail)
	resp, body := b.do(http.MethodGet, "/en/profil", nil)
	wantStatus(t, resp, body, http.StatusOK)
	if _, err := db.Exec("UPDATE sessions SET expires_at = '2000-01-01T00:00:00Z'"); err != nil {
		t.Fatal(err)
	}
	checkClosed()
}

// Ticket #49, Kriterien 2 und 3: Nach der Anmeldung ist die Webseite wie bisher erreichbar, und die
// Anmeldeseite führt zum gemerkten Ziel. Fremde Ziele werden ignoriert.
func TestGateAllowsSignedInVisitors(t *testing.T) {
	b := newBrowser(t, newGatedServer(t))
	b.mustLogin(editorEmail)

	for _, path := range []string{"/", "/de/blog", "/assets/app-abc.js", "/api/topics?lang=de", "/api/posts?lang=de"} {
		resp, body := b.do(http.MethodGet, path, nil)
		wantStatus(t, resp, body, http.StatusOK)
	}

	for weiter, want := range map[string]string{
		"%2Fde%2Fblog":                "/de/blog",
		"%2Fde%2Fthemen%3Fa%3D1":      "/de/themen?a=1",
		"%2F%2Fboese.example%2F":      "/redaktion",
		"%2F%5Cboese.example":         "/redaktion",
		"https%3A%2F%2Fboese.example": "/redaktion",
		"":                            "/redaktion",
	} {
		resp, _ := b.do(http.MethodGet, "/redaktion/anmelden?weiter="+weiter, nil)
		wantRedirect(t, resp, want)
	}

	// Nach der Abmeldung ist die Webseite wieder gesperrt.
	resp, body := b.do(http.MethodPost, "/api/auth/logout", nil)
	wantStatus(t, resp, body, http.StatusNoContent)
	resp, _ = b.do(http.MethodGet, "/de/blog", nil)
	wantRedirect(t, resp, "/redaktion/anmelden?weiter=%2Fde%2Fblog")
}

// Ticket #49, Kriterium 4: robots.txt sperrt die ganze Webseite, auch für Angemeldete.
func TestGateClosesRobots(t *testing.T) {
	srv := newGatedServer(t)
	anon := newBrowser(t, srv)
	signedIn := newBrowser(t, srv)
	signedIn.mustLogin(editorEmail)
	for _, b := range []*browser{anon, signedIn} {
		resp, body := b.do(http.MethodGet, "/robots.txt", nil)
		wantStatus(t, resp, body, http.StatusOK)
		if body != "User-agent: *\nDisallow: /\n" {
			t.Errorf("robots.txt: %q", body)
		}
		if strings.Contains(body, "Sitemap") {
			t.Error("robots.txt verweist bei Zugangsschutz auf die Sitemap")
		}
	}
}

// Tickets #49 (Kriterium 5) und #108: Ohne Zugangsschutz – der Standard – sind alle öffentlichen Seiten
// und die öffentliche API ohne Sitzung erreichbar. Entwürfe bleiben verborgen, die Redaktion geschützt.
func TestNoGateByDefault(t *testing.T) {
	srv, _ := newServer(t, true)
	b := newBrowser(t, srv)

	paths := []string{"/"}
	for _, lang := range []string{"de", "en"} {
		for _, page := range []string{"", "/blog", "/blog/ki-veraendert-softwareteams", "/profil", "/ki-einsatzfelder",
			"/impressum", "/datenschutz", "/themen/ai-audit", "/themen/ai-audit/strategie-und-wirtschaftlichkeit"} {
			paths = append(paths, "/"+lang+page)
		}
		for _, tp := range getJSON[api.TopicList](t, srv, "/api/topics?lang="+lang, http.StatusOK).Items {
			paths = append(paths, "/"+lang+"/themen/"+tp.Slug)
		}
	}
	for _, path := range paths {
		// Der Browser folgt keinen Umleitungen: 200 heißt, die Seite kommt direkt und ohne Umweg zur Anmeldung.
		resp, body := b.do(http.MethodGet, path, nil)
		wantStatus(t, resp, body, http.StatusOK)
		if !strings.Contains(body, `id="root"`) {
			t.Errorf("%s: öffentliches Frontend fehlt", path)
		}
		if got := resp.Header.Get("X-Robots-Tag"); strings.Contains(got, "nofollow") {
			t.Errorf("%s: X-Robots-Tag %q des Zugangsschutzes", path, got)
		}
	}

	for _, lang := range []string{"de", "en"} {
		for _, path := range []string{"/api/topics", "/api/topics/ai-audit", "/api/posts", "/api/posts?featured=true",
			"/api/posts/ki-veraendert-softwareteams", "/api/audit", "/api/audit/dimensions/strategie-und-wirtschaftlichkeit"} {
			sep := "?"
			if strings.Contains(path, "?") {
				sep = "&"
			}
			resp, body := b.do(http.MethodGet, path+sep+"lang="+lang, nil)
			wantStatus(t, resp, body, http.StatusOK)
		}
	}

	// Entwürfe bleiben unveröffentlicht (geplante Beiträge: TestScheduledPostAppearsWhenDue).
	resp, body := b.do(http.MethodGet, "/api/posts/entwurf-ki-in-der-datenanalyse", nil)
	wantStatus(t, resp, body, http.StatusNotFound)
	// Redaktion und Redaktions-API behalten ihre eigene Prüfung.
	resp, _ = b.do(http.MethodGet, "/redaktion", nil)
	wantRedirect(t, resp, "/redaktion/anmelden")
	resp, body = b.do(http.MethodGet, "/api/admin/posts", nil)
	wantStatus(t, resp, body, http.StatusUnauthorized)

	_, body = get(t, srv, "/robots.txt")
	if !strings.Contains(body, "Sitemap:") || strings.Contains(body, "Disallow: /\n") {
		t.Errorf("robots.txt ohne Zugangsschutz: %q", body)
	}
}
