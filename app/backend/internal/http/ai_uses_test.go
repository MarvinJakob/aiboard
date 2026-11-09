package httpserver_test

import (
	"encoding/xml"
	"net/http"
	"strings"
	"testing"
)

// Ticket #78: Die Startseite verlinkt „Zur ausführlichen Einordnung“ auf /{lang}/ki-einsatzfelder.
// Die Seite muss direkt aufrufbar sein (kein 404 beim Neuladen) und in der Sitemap stehen.
func TestAiUsesDirectAndReload(t *testing.T) {
	srv, _ := newServer(t, false)
	for _, tc := range []struct{ lang, title string }{
		{"de", "Wofür KI heute eingesetzt wird"},
		{"en", "What AI is used for today"},
	} {
		t.Run(tc.lang, func(t *testing.T) {
			resp, body := get(t, srv, "/"+tc.lang+"/ki-einsatzfelder")
			if resp.StatusCode != http.StatusOK {
				t.Fatalf("status: %d", resp.StatusCode)
			}
			for _, want := range []string{
				`<html lang="` + tc.lang + `">`,
				`<title>` + tc.title + ` · KI Perspektiven</title>`,
				`<link rel="canonical" href="https://example.test/` + tc.lang + `/ki-einsatzfelder">`,
				`hreflang="de" href="https://example.test/de/ki-einsatzfelder"`,
				`hreflang="en" href="https://example.test/en/ki-einsatzfelder"`,
			} {
				if !strings.Contains(body, want) {
					t.Errorf("missing %s", want)
				}
			}
		})
	}
}

func TestAiUsesSitemap(t *testing.T) {
	srv, _ := newServer(t, false)
	_, body := get(t, srv, "/sitemap.xml")
	var sitemap struct {
		URLs []struct {
			Loc string `xml:"loc"`
		} `xml:"url"`
	}
	if err := xml.Unmarshal([]byte(body), &sitemap); err != nil {
		t.Fatal(err)
	}
	for _, lang := range []string{"de", "en"} {
		want := "https://example.test/" + lang + "/ki-einsatzfelder"
		found := false
		for _, u := range sitemap.URLs {
			found = found || u.Loc == want
		}
		if !found {
			t.Errorf("missing %s in sitemap", want)
		}
	}
}
