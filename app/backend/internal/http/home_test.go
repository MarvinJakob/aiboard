package httpserver_test

import (
	"net/http"
	"os"
	"strings"
	"testing"
)

// Ticket #101: Die serverseitig ausgelieferte Startseite trägt Titel und Beschreibung der neuen Landingpage.
// Dieselben Texte setzt das Frontend bei clientseitiger Navigation (frontend/src/i18n/home.ts).
func TestHomeMeta(t *testing.T) {
	srv, _ := newServer(t, false)
	source, err := os.ReadFile("../../../frontend/src/i18n/home.ts")
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct{ lang, title, description string }{
		{"de", "KI verstehen. Sinnvoll einsetzen.", "Praxiswissen für den professionellen Einsatz von KI. Mit klarem Blick auf Nutzen, Grenzen und Verantwortung."},
		{"en", "Understand AI. Use it wisely.", "Practical knowledge for the professional use of AI. With a clear view of benefits, limits and responsibility."},
	} {
		t.Run(tc.lang, func(t *testing.T) {
			resp, body := get(t, srv, "/"+tc.lang)
			if resp.StatusCode != http.StatusOK {
				t.Fatalf("status: %d", resp.StatusCode)
			}
			for _, want := range []string{
				`<html lang="` + tc.lang + `">`,
				`<title>` + tc.title + ` · KI Perspektiven</title>`,
				`<meta name="description" content="` + tc.description + `">`,
				`<meta property="og:title" content="` + tc.title + ` · KI Perspektiven">`,
			} {
				if !strings.Contains(body, want) {
					t.Errorf("fehlt: %s", want)
				}
			}
			for _, want := range []string{"title: '" + tc.title + "'", "description: '" + tc.description + "'"} {
				if !strings.Contains(string(source), want) {
					t.Errorf("Frontend weicht ab, erwartet in home.ts: %s", want)
				}
			}
		})
	}
}
