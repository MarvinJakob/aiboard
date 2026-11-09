package httpserver_test

import (
	"encoding/xml"
	"net/http"
	"strings"
	"testing"
)

func TestProfileDirectAndReload(t *testing.T) {
	srv, _ := newServer(t, false)
	for _, tc := range []struct{ lang, title, description string }{
		{"de", "Marvin Jakob – Profil", "IT-Berater und Full-Stack-Entwickler"},
		{"en", "Marvin Jakob – Profile", "IT consultant and full-stack developer"},
	} {
		t.Run(tc.lang, func(t *testing.T) {
			for range 2 {
				resp, body := get(t, srv, "/"+tc.lang+"/profil")
				if resp.StatusCode != http.StatusOK {
					t.Fatalf("status: %d", resp.StatusCode)
				}
				for _, want := range []string{
					`<html lang="` + tc.lang + `">`,
					`<title>` + tc.title + ` · KI Perspektiven</title>`,
					`<meta name="description" content="Marvin Jakob: ` + tc.description,
					`<link rel="canonical" href="https://example.test/` + tc.lang + `/profil">`,
					`hreflang="de" href="https://example.test/de/profil"`,
					`hreflang="en" href="https://example.test/en/profil"`,
					`hreflang="x-default" href="https://example.test/de/profil"`,
					`<meta property="og:title" content="` + tc.title + ` · KI Perspektiven">`,
				} {
					if !strings.Contains(body, want) {
						t.Errorf("missing %s", want)
					}
				}
				if strings.Contains(body, "noindex") {
					t.Error("profile must be indexable")
				}
			}
		})
	}
}

func TestProfileSitemap(t *testing.T) {
	srv, _ := newServer(t, false)
	resp, body := get(t, srv, "/sitemap.xml")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status: %d", resp.StatusCode)
	}
	var sitemap struct {
		URLs []struct {
			Loc   string `xml:"loc"`
			Links []struct {
				Lang string `xml:"hreflang,attr"`
				Href string `xml:"href,attr"`
			} `xml:"link"`
		} `xml:"url"`
	}
	if err := xml.Unmarshal([]byte(body), &sitemap); err != nil {
		t.Fatal(err)
	}
	for _, lang := range []string{"de", "en"} {
		found := false
		for _, url := range sitemap.URLs {
			if url.Loc != "https://example.test/"+lang+"/profil" {
				continue
			}
			found = true
			links := map[string]string{}
			for _, link := range url.Links {
				links[link.Lang] = link.Href
			}
			for _, alternate := range []string{"de", "en", "x-default"} {
				target := alternate
				if target == "x-default" {
					target = "de"
				}
				if links[alternate] != "https://example.test/"+target+"/profil" {
					t.Errorf("%s: missing alternate %s", lang, alternate)
				}
			}
		}
		if !found {
			t.Errorf("missing %s profile in sitemap", lang)
		}
	}
}
