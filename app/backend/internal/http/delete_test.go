package httpserver_test

import (
	"fmt"
	"net/http"
	"slices"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
)

// Ticket #24: Beiträge aus der Beitragsübersicht löschen.

func TestDeletePostRemovesItEverywhere(t *testing.T) {
	srv, db := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	public := func(path string) (*http.Response, string) { return newBrowser(t, srv).do(http.MethodGet, path, nil) }

	in := draftInput("Wird gelöscht", "ai-audit", "data-analytics")
	in.Featured = true
	in.Texts = append(in.Texts, api.PostText{Lang: "en", Title: "To be deleted", Summary: "Short", BodyMarkdown: "Text."})
	p := b.createPost(in)
	b.action(p.Id, "publish", http.StatusOK)
	keep := b.createPost(draftInput("Bleibt erhalten", "ai-audit"))
	b.action(keep.Id, "publish", http.StatusOK)

	for _, path := range []string{"/api/posts", "/api/posts?featured=true", "/api/topics/ai-audit", "/api/topics/data-analytics"} {
		if s := publicSlugs(t, public, path); !slices.Contains(s, p.Slug) {
			t.Fatalf("%s vor dem Löschen ohne Beitrag: %v", path, s)
		}
	}

	resp, body := b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNoContent)

	// Redaktion: nicht mehr in der Liste, nicht mehr abrufbar.
	resp, body = b.do(http.MethodGet, "/api/admin/posts", nil)
	wantStatus(t, resp, body, http.StatusOK)
	for _, s := range decode[api.EditorPostList](t, body).Items {
		if s.Id == p.Id {
			t.Fatal("gelöschter Beitrag in der Beitragsliste")
		}
	}
	resp, body = b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNotFound)

	// Öffentlich: 404 und nirgends mehr gelistet, der andere Beitrag bleibt.
	for _, path := range []string{"/api/posts", "/api/posts?featured=true", "/api/topics/ai-audit", "/api/topics/data-analytics"} {
		s := publicSlugs(t, public, path)
		if slices.Contains(s, p.Slug) {
			t.Errorf("%s enthält gelöschten Beitrag: %v", path, s)
		}
		if path == "/api/topics/ai-audit" && !slices.Contains(s, keep.Slug) {
			t.Errorf("%s ohne den verbleibenden Beitrag: %v", path, s)
		}
	}
	for _, path := range []string{"/api/posts/" + p.Slug, "/de/blog/" + p.Slug, "/en/blog/" + p.Slug} {
		resp, body := public(path)
		wantStatus(t, resp, body, http.StatusNotFound)
	}
	if _, sitemap := public("/sitemap.xml"); strings.Contains(sitemap, p.Slug) || !strings.Contains(sitemap, keep.Slug) {
		t.Errorf("Sitemap nach dem Löschen falsch:\n%s", sitemap)
	}

	// Sprachfassungen und Themenzuordnungen sind mit dem Beitrag entfernt.
	for _, table := range []string{"post_translations", "post_topics"} {
		var n int
		if err := db.QueryRow(`SELECT COUNT(*) FROM `+table+` WHERE post_id = ?`, p.Id).Scan(&n); err != nil {
			t.Fatal(err)
		}
		if n != 0 {
			t.Errorf("%s: %d Zeilen übrig", table, n)
		}
	}

	// Ein zweites Löschen findet nichts mehr.
	resp, body = b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNotFound)
}

func TestDeleteDraft(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	p := b.createPost(draftInput("Entwurf weg"))
	resp, body := b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNoContent)
	resp, body = b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNotFound)
}

func TestDeleteRequiresEditorSessionAndCSRF(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	p := editor.createPost(draftInput("Geschützt vor Löschen"))
	path := fmt.Sprintf("/api/admin/posts/%d", p.Id)

	anon := newBrowser(t, srv)
	resp, body := anon.do(http.MethodDelete, path, nil)
	wantStatus(t, resp, body, http.StatusUnauthorized)

	token := editor.csrf
	editor.csrf = ""
	resp, body = editor.do(http.MethodDelete, path, nil)
	wantStatus(t, resp, body, http.StatusForbidden)
	editor.csrf = token

	resp, body = editor.do(http.MethodDelete, path, nil, "X-CSRF-Token", "falsch")
	wantStatus(t, resp, body, http.StatusForbidden)

	resp, body = editor.do(http.MethodGet, path, nil)
	wantStatus(t, resp, body, http.StatusOK)

	// Admin-Konten dürfen Beiträge ebenfalls verwalten.
	admin := newBrowser(t, srv)
	admin.mustLogin(adminEmail)
	resp, body = admin.do(http.MethodDelete, path, nil)
	wantStatus(t, resp, body, http.StatusNoContent)
}
