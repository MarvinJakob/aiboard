package httpserver_test

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/gif"
	"image/jpeg"
	"image/png"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"ki-web/backend/internal/api"
)

// Ticket #25: Titelbild für Beiträge.

// 1 × 1 Pixel WebP (verlustfrei).
var tinyWebP, _ = base64.StdEncoding.DecodeString("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==")

func testImage(w, h int, transparent bool) *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			a := uint8(255)
			if transparent && x < w/2 {
				a = 0
			}
			img.SetNRGBA(x, y, color.NRGBA{R: uint8(x * 255 / w), G: uint8(y * 255 / h), B: 120, A: a})
		}
	}
	return img
}

func jpegBytes(t *testing.T, w, h int) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, testImage(w, h, false), &jpeg.Options{Quality: 90}); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

// jpegWithExif fügt nach dem SOI-Marker ein APP1-Segment mit Exif-Daten und GPS-Kennung ein.
func jpegWithExif(t *testing.T, w, h int) []byte {
	t.Helper()
	plain := jpegBytes(t, w, h)
	payload := append([]byte("Exif\x00\x00"), []byte("GPSLatitude=52.52;Kamera=Testkamera")...)
	seg := []byte{0xFF, 0xE1, byte((len(payload) + 2) >> 8), byte(len(payload) + 2)}
	out := append([]byte{}, plain[:2]...)
	out = append(out, seg...)
	out = append(out, payload...)
	return append(out, plain[2:]...)
}

func pngBytes(t *testing.T, w, h int, transparent bool) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := png.Encode(&buf, testImage(w, h, transparent)); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func (b *browser) uploadCover(id int64, filename string, data []byte) (*http.Response, string) {
	b.t.Helper()
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw, err := mw.CreateFormFile("file", filename)
	if err != nil {
		b.t.Fatal(err)
	}
	fw.Write(data)
	mw.Close()
	req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("%s/api/admin/posts/%d/cover", b.srv.URL, id), &body)
	if err != nil {
		b.t.Fatal(err)
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	if b.csrf != "" {
		req.Header.Set("X-CSRF-Token", b.csrf)
	}
	resp, err := b.c.Do(req)
	if err != nil {
		b.t.Fatal(err)
	}
	defer resp.Body.Close()
	var out bytes.Buffer
	out.ReadFrom(resp.Body)
	return resp, out.String()
}

func (b *browser) mustUploadCover(id int64, filename string, data []byte) api.EditorPost {
	b.t.Helper()
	resp, body := b.uploadCover(id, filename, data)
	wantStatus(b.t, resp, body, http.StatusOK)
	return decode[api.EditorPost](b.t, body)
}

var keyPattern = regexp.MustCompile(`^/media/([0-9a-f]{32})-960\.(jpg|png)$`)

// coverFiles liefert Schlüssel, Endung und die vier Dateien eines Titelbilds.
func coverFiles(t *testing.T, srv interface{ Close() }, dir string, p api.EditorPost) (string, string, []string) {
	t.Helper()
	if p.Cover == nil {
		t.Fatal("kein Titelbild")
	}
	m := keyPattern.FindStringSubmatch(p.Cover.Src)
	if m == nil {
		t.Fatalf("Dateiname nicht vom Server vergeben: %s", p.Cover.Src)
	}
	var files []string
	for _, v := range []string{"480", "960", "1600", "og"} {
		files = append(files, filepath.Join(dir, m[1]+"-"+v+"."+m[2]))
	}
	return m[1], m[2], files
}

func decodeFile(t *testing.T, path string) image.Config {
	t.Helper()
	f, err := os.Open(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	cfg, _, err := image.DecodeConfig(f)
	if err != nil {
		t.Fatal(err)
	}
	return cfg
}

func withAlt(in api.PostInput, alt string) api.PostInput {
	for i := range in.Texts {
		in.Texts[i].CoverAlt = &alt
	}
	return in
}

func TestCoverUploadCreatesVariantsWithoutMetadata(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	p := b.createPost(draftInput("Mit Titelbild"))

	got := b.mustUploadCover(p.Id, "../../böse name.jpg", jpegWithExif(t, 2000, 1000))
	if got.Cover.Width != 2000 || got.Cover.Height != 1000 || !strings.Contains(got.Cover.Srcset, "-1600.jpg 1600w") {
		t.Fatalf("Titelbild: %+v", got.Cover)
	}
	_, ext, files := coverFiles(t, srv, mediaDirOf(srv), got)
	if ext != "jpg" {
		t.Errorf("Endung %s, erwartet jpg", ext)
	}
	want := []image.Point{{480, 240}, {960, 480}, {1600, 800}, {1200, 630}}
	for i, f := range files {
		cfg := decodeFile(t, f)
		if cfg.Width != want[i].X || cfg.Height != want[i].Y {
			t.Errorf("%s: %d × %d, erwartet %v", filepath.Base(f), cfg.Width, cfg.Height, want[i])
		}
		data, _ := os.ReadFile(f)
		if bytes.Contains(data, []byte("Exif")) || bytes.Contains(data, []byte("GPSLatitude")) {
			t.Errorf("%s enthält noch Metadaten", filepath.Base(f))
		}
	}
	// Nur das Medienverzeichnis enthält Dateien, und zwar genau die vier Varianten.
	entries, _ := os.ReadDir(mediaDirOf(srv))
	if len(entries) != 4 {
		t.Errorf("%d Dateien im Medienverzeichnis, erwartet 4", len(entries))
	}
	// Ausgeliefert unter /media/…
	resp, body := newBrowser(t, srv).do(http.MethodGet, got.Cover.Src, nil)
	wantStatus(t, resp, body, http.StatusOK)
}

func TestCoverFormats(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)

	cases := []struct {
		name, file string
		data       []byte
		ext        string
		width      int
	}{
		{"PNG mit Transparenz bleibt PNG", "grafik.png", pngBytes(t, 800, 400, true), "png", 800},
		{"PNG ohne Transparenz wird JPEG", "foto.png", pngBytes(t, 300, 200, false), "jpg", 300},
		{"WebP (Testpixel mit Transparenz)", "bild.webp", tinyWebP, "png", 1},
		{"Endung zählt nicht", "eigentlich-jpeg.txt", jpegBytes(t, 100, 50), "jpg", 100},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			p := b.createPost(draftInput(c.name))
			got := b.mustUploadCover(p.Id, c.file, c.data)
			_, ext, files := coverFiles(t, srv, mediaDirOf(srv), got)
			if ext != c.ext {
				t.Errorf("Endung %s, erwartet %s", ext, c.ext)
			}
			// Kleine Bilder werden nicht vergrößert.
			if cfg := decodeFile(t, files[2]); cfg.Width != c.width {
				t.Errorf("Variante 1600 hat Breite %d, erwartet %d", cfg.Width, c.width)
			}
		})
	}
}

func TestCoverRejectsInvalidFiles(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	p := b.createPost(draftInput("Ungültige Dateien"))

	var gifBuf bytes.Buffer
	gif.Encode(&gifBuf, testImage(10, 10, false), nil)
	big := make([]byte, 5<<20+1)
	copy(big, jpegBytes(t, 10, 10))
	corrupt := append([]byte{}, jpegBytes(t, 200, 100)[:40]...)

	for _, c := range []struct {
		name, file string
		data       []byte
		msg        string
	}{
		{"Text mit Bildendung", "bild.png", []byte("kein Bild, nur Text"), "Dateityp"},
		{"GIF", "animation.gif", gifBuf.Bytes(), "Dateityp"},
		{"PDF", "dokument.jpg", []byte("%PDF-1.7\n%âãÏÓ\n"), "Dateityp"},
		{"zu groß", "riesig.jpg", big, "5 MB"},
		{"beschädigt", "kaputt.jpg", corrupt, "beschädigt"},
		{"leer", "leer.jpg", nil, "Bilddatei"},
	} {
		t.Run(c.name, func(t *testing.T) {
			resp, body := b.uploadCover(p.Id, c.file, c.data)
			wantStatus(t, resp, body, http.StatusUnprocessableEntity)
			if !strings.Contains(body, c.msg) {
				t.Errorf("Meldung ohne %q: %s", c.msg, body)
			}
		})
	}
	resp, body := b.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	if decode[api.EditorPost](t, body).Cover != nil {
		t.Error("abgelehnte Datei als Titelbild gespeichert")
	}
	if entries, _ := os.ReadDir(mediaDirOf(srv)); len(entries) != 0 {
		t.Errorf("abgelehnte Dateien gespeichert: %d", len(entries))
	}
	resp, body = b.uploadCover(999999, "bild.jpg", jpegBytes(t, 10, 10))
	wantStatus(t, resp, body, http.StatusNotFound)
}

func TestCoverNeedsAltTextBeforePublishing(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	public := func(path string) (*http.Response, string) { return newBrowser(t, srv).do(http.MethodGet, path, nil) }

	in := draftInput("Bild braucht Text", "ai-audit")
	in.Texts = append(in.Texts, api.PostText{Lang: "en", Title: "Image needs text", Summary: "Short", BodyMarkdown: "Text."})
	p := b.createPost(in)
	b.mustUploadCover(p.Id, "bild.jpg", jpegBytes(t, 1200, 800))

	resp, body := b.do(http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/publish", p.Id), nil)
	wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Alternativtext") {
		t.Errorf("Meldung ohne Alternativtext: %s", body)
	}

	// Nur Deutsch beschriftet: Englisch fehlt noch.
	de := "Diagramm mit steigender Linie"
	in.Texts[0].CoverAlt = &de
	saved, _ := b.savePost(p.Id, in, http.StatusOK)
	if saved.Texts[0].CoverAlt == nil || *saved.Texts[0].CoverAlt != de || saved.Texts[1].CoverAlt != nil {
		t.Fatalf("Alternativtexte: %+v", saved.Texts)
	}
	resp, body = b.do(http.MethodPost, fmt.Sprintf("/api/admin/posts/%d/publish", p.Id), nil)
	wantStatus(t, resp, body, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Englisch") {
		t.Errorf("Meldung nennt die Fassung nicht: %s", body)
	}

	en := "Chart with a rising line"
	in.Texts[1].CoverAlt = &en
	b.savePost(p.Id, in, http.StatusOK)
	b.action(p.Id, "publish", http.StatusOK)

	// Öffentlich: Titelbild mit Alternativtext je Sprache, Maße für den Platzhalter und Open-Graph-Bild.
	for lang, alt := range map[string]string{"de": de, "en": en} {
		resp, body := public("/api/posts/" + p.Slug + "?lang=" + lang)
		wantStatus(t, resp, body, http.StatusOK)
		cover := decode[api.Post](t, body).Cover
		if cover == nil || cover.Alt != alt || cover.Width != 1200 || cover.Height != 800 {
			t.Errorf("%s: Titelbild %+v", lang, cover)
		}
	}
	resp, html := public("/de/blog/" + p.Slug)
	wantStatus(t, resp, html, http.StatusOK)
	if !regexp.MustCompile(`og:image" content="https://example\.test/media/[0-9a-f]{32}-og\.jpg"`).MatchString(html) {
		t.Errorf("og:image fehlt:\n%s", html)
	}

	// Ein veröffentlichter Beitrag mit Titelbild lässt sich ohne Alternativtext nicht speichern.
	empty := ""
	in.Texts[1].CoverAlt = &empty
	_, body = b.savePost(p.Id, in, http.StatusUnprocessableEntity)
	if !strings.Contains(body, "Alternativtext") {
		t.Errorf("Meldung: %s", body)
	}
}

func TestPostWithoutCoverIsUnchanged(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	p := b.createPost(draftInput("Ohne Bild", "ai-audit"))
	b.action(p.Id, "publish", http.StatusOK)
	resp, body := newBrowser(t, srv).do(http.MethodGet, "/api/posts/"+p.Slug, nil)
	wantStatus(t, resp, body, http.StatusOK)
	if strings.Contains(body, `"cover"`) {
		t.Errorf("Beitrag ohne Titelbild liefert cover: %s", body)
	}
	_, html := newBrowser(t, srv).do(http.MethodGet, "/de/blog/"+p.Slug, nil)
	if strings.Contains(html, "/media/") {
		t.Errorf("Meta-Tags verweisen ohne Titelbild auf /media/")
	}
}

// Ein neu hochgeladenes Bild an einem veröffentlichten Beitrag erscheint erst mit Alternativtext.
func TestNewCoverOnPublishedPostWaitsForAltText(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	in := draftInput("Schon online")
	p := b.createPost(in)
	b.action(p.Id, "publish", http.StatusOK)
	b.mustUploadCover(p.Id, "bild.jpg", jpegBytes(t, 640, 480))

	public := func() *api.Image {
		resp, body := newBrowser(t, srv).do(http.MethodGet, "/api/posts/"+p.Slug, nil)
		wantStatus(t, resp, body, http.StatusOK)
		return decode[api.Post](t, body).Cover
	}
	if c := public(); c != nil {
		t.Fatalf("Bild ohne Alternativtext öffentlich: %+v", c)
	}
	b.savePost(p.Id, withAlt(in, "Foto eines Büros"), http.StatusOK)
	if c := public(); c == nil || c.Alt != "Foto eines Büros" {
		t.Fatalf("Bild mit Alternativtext: %+v", c)
	}
}

func TestCoverReplaceAndRemove(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	dir := mediaDirOf(srv)
	in := withAlt(draftInput("Ersetzen und entfernen"), "Erstes Bild")
	p := b.createPost(in)
	first := b.mustUploadCover(p.Id, "eins.jpg", jpegBytes(t, 800, 600))
	b.savePost(p.Id, in, http.StatusOK)
	_, _, oldFiles := coverFiles(t, srv, dir, first)

	// Ersetzen: neues Bild, Alternativtext bleibt, alte Dateien sind weg.
	second := b.mustUploadCover(p.Id, "zwei.png", pngBytes(t, 400, 400, true))
	_, ext, newFiles := coverFiles(t, srv, dir, second)
	if second.Cover.Src == first.Cover.Src || ext != "png" {
		t.Fatalf("nicht ersetzt: %s", second.Cover.Src)
	}
	if second.Texts[0].CoverAlt == nil || *second.Texts[0].CoverAlt != "Erstes Bild" {
		t.Errorf("Alternativtext beim Ersetzen verloren: %+v", second.Texts[0])
	}
	for _, f := range oldFiles {
		if _, err := os.Stat(f); !os.IsNotExist(err) {
			t.Errorf("alte Datei noch vorhanden: %s", filepath.Base(f))
		}
	}
	for _, f := range newFiles {
		if _, err := os.Stat(f); err != nil {
			t.Errorf("neue Datei fehlt: %s", filepath.Base(f))
		}
	}

	// Entfernen: kein Titelbild, keine Dateien, Veröffentlichen ohne Alternativtext wieder möglich.
	resp, body := b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d/cover", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	got := decode[api.EditorPost](t, body)
	if got.Cover != nil || got.Texts[0].CoverAlt != nil {
		t.Fatalf("nach dem Entfernen: %+v", got)
	}
	if entries, _ := os.ReadDir(dir); len(entries) != 0 {
		t.Errorf("%d Dateien übrig", len(entries))
	}
	b.savePost(p.Id, draftInput("Ersetzen und entfernen"), http.StatusOK)
	b.action(p.Id, "publish", http.StatusOK)

	resp, body = b.do(http.MethodDelete, "/api/admin/posts/999999/cover", nil)
	wantStatus(t, resp, body, http.StatusNotFound)
}

// Zusammenspiel mit Ticket #24: Ein gelöschter Beitrag hinterlässt kein Titelbild.
func TestDeletePostRemovesCover(t *testing.T) {
	srv, db := newServerWithAccounts(t)
	b := newBrowser(t, srv)
	b.mustLogin(editorEmail)
	p := b.createPost(withAlt(draftInput("Mit Bild gelöscht"), "Ein Bild"))
	got := b.mustUploadCover(p.Id, "bild.jpg", jpegBytes(t, 300, 200))
	resp, body := b.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusNoContent)
	if entries, _ := os.ReadDir(mediaDirOf(srv)); len(entries) != 0 {
		t.Errorf("%d Bilddateien übrig", len(entries))
	}
	for _, table := range []string{"media", "media_translations"} {
		var n int
		if err := db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&n); err != nil {
			t.Fatal(err)
		}
		if n != 0 {
			t.Errorf("%s: %d Zeilen übrig", table, n)
		}
	}
	resp, body = newBrowser(t, srv).do(http.MethodGet, got.Cover.Src, nil)
	wantStatus(t, resp, body, http.StatusNotFound)
}

func TestCoverRequiresEditorSessionAndCSRF(t *testing.T) {
	srv, _ := newServerWithAccounts(t)
	editor := newBrowser(t, srv)
	editor.mustLogin(editorEmail)
	p := editor.createPost(draftInput("Geschütztes Bild"))
	editor.mustUploadCover(p.Id, "bild.jpg", jpegBytes(t, 100, 100))

	anon := newBrowser(t, srv)
	resp, body := anon.uploadCover(p.Id, "bild.jpg", jpegBytes(t, 100, 100))
	wantStatus(t, resp, body, http.StatusUnauthorized)
	resp, body = anon.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d/cover", p.Id), nil)
	wantStatus(t, resp, body, http.StatusUnauthorized)

	token := editor.csrf
	editor.csrf = ""
	resp, body = editor.uploadCover(p.Id, "bild.jpg", jpegBytes(t, 100, 100))
	wantStatus(t, resp, body, http.StatusForbidden)
	resp, body = editor.do(http.MethodDelete, fmt.Sprintf("/api/admin/posts/%d/cover", p.Id), nil)
	wantStatus(t, resp, body, http.StatusForbidden)
	editor.csrf = token

	if entries, _ := os.ReadDir(mediaDirOf(srv)); len(entries) != 4 {
		t.Errorf("%d Dateien, erwartet 4 (nur der erlaubte Upload)", len(entries))
	}
	resp, body = editor.do(http.MethodGet, fmt.Sprintf("/api/admin/posts/%d", p.Id), nil)
	wantStatus(t, resp, body, http.StatusOK)
	if decode[api.EditorPost](t, body).Cover == nil {
		t.Error("Titelbild ohne Berechtigung entfernt")
	}
}
