package media

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp" // registriert den WebP-Decoder
)

// Grenzen für hochgeladene Bilder (Ticket #25, ARCHITECTURE.md, Abschnitt 7).
const (
	MaxUploadBytes = 5 << 20    // 5 MB
	maxPixels      = 40_000_000 // schützt vor Bildern, die beim Dekodieren den Speicher sprengen
	ogWidth        = 1200
	ogHeight       = 630
	jpegQuality    = 82
)

// UploadError beschreibt ein abgelehntes Bild in verständlichen Worten.
type UploadError struct{ Msg string }

func (e *UploadError) Error() string { return e.Msg }

func reject(msg string) error { return &UploadError{Msg: msg} }

// Stored beschreibt ein gespeichertes Bild. Die Dateien liegen unter Store.Dir als
// <Key>-480.<ext>, <Key>-960.<ext>, <Key>-1600.<ext> und <Key>-og.<ext>.
type Stored struct {
	Key           string
	MimeType      string // image/jpeg oder image/png
	Width, Height int    // Maße des Originals, bestimmen das Seitenverhältnis
}

// Store legt Bilder im Medienverzeichnis ab. Nur das Backend schreibt dorthin; Caddy liest.
type Store struct{ Dir string }

func NewStore(dir string) *Store { return &Store{Dir: dir} }

var allowed = map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true}

// Save prüft ein hochgeladenes Bild, kodiert es neu (ohne Metadaten wie EXIF und GPS) und schreibt
// die Varianten. Der Dateityp wird am Inhalt erkannt, nicht an Dateiname oder Content-Type.
func (s *Store) Save(r io.Reader) (Stored, error) {
	data, err := io.ReadAll(io.LimitReader(r, MaxUploadBytes+1))
	if err != nil {
		return Stored{}, reject("Die Datei konnte nicht gelesen werden. Bitte erneut versuchen.")
	}
	switch {
	case len(data) == 0:
		return Stored{}, reject("Bitte eine Bilddatei auswählen.")
	case len(data) > MaxUploadBytes:
		return Stored{}, reject("Die Datei ist größer als 5 MB. Bitte ein kleineres Bild wählen.")
	case !allowed[http.DetectContentType(data)]:
		return Stored{}, reject("Dieser Dateityp wird nicht unterstützt. Erlaubt sind JPEG, PNG und WebP.")
	}
	cfg, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return Stored{}, reject("Das Bild ist beschädigt oder unvollständig und konnte nicht gelesen werden.")
	}
	if cfg.Width <= 0 || cfg.Height <= 0 || cfg.Width*cfg.Height > maxPixels {
		return Stored{}, reject("Das Bild ist zu groß. Erlaubt sind höchstens 40 Megapixel.")
	}
	src, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return Stored{}, reject("Das Bild ist beschädigt oder unvollständig und konnte nicht gelesen werden.")
	}

	// Fotos als JPEG, Grafiken mit Transparenz als PNG.
	mime := "image/jpeg"
	if !opaque(src) {
		mime = "image/png"
	}
	key, err := newKey()
	if err != nil {
		return Stored{}, err
	}
	if err := os.MkdirAll(s.Dir, 0o755); err != nil {
		return Stored{}, err
	}
	out := Stored{Key: key, MimeType: mime, Width: src.Bounds().Dx(), Height: src.Bounds().Dy()}

	var written []string
	fail := func(err error) (Stored, error) {
		for _, f := range written {
			_ = os.Remove(f)
		}
		return Stored{}, err
	}
	for _, w := range Widths {
		path, err := s.write(key, mime, fmt.Sprint(w), scaleToWidth(src, w))
		if err != nil {
			return fail(err)
		}
		written = append(written, path)
	}
	path, err := s.write(key, mime, "og", cropFill(src, ogWidth, ogHeight))
	if err != nil {
		return fail(err)
	}
	written = append(written, path)
	return out, nil
}

// Remove löscht alle Varianten eines Bildes. Fehlende Dateien sind kein Fehler.
func (s *Store) Remove(key, mimeType string) error {
	var errs []error
	for _, v := range variants() {
		err := os.Remove(s.path(key, mimeType, v))
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			errs = append(errs, err)
		}
	}
	return errors.Join(errs...)
}

func variants() []string {
	out := make([]string, 0, len(Widths)+1)
	for _, w := range Widths {
		out = append(out, fmt.Sprint(w))
	}
	return append(out, "og")
}

func (s *Store) path(key, mimeType, variant string) string {
	return filepath.Join(s.Dir, fmt.Sprintf("%s-%s.%s", key, variant, Ext(mimeType)))
}

// write schreibt eine Variante zuerst in eine temporäre Datei und benennt sie dann um,
// damit Caddy nie eine halb geschriebene Datei ausliefert.
func (s *Store) write(key, mime, variant string, img image.Image) (string, error) {
	final := s.path(key, mime, variant)
	tmp, err := os.CreateTemp(s.Dir, ".upload-*")
	if err != nil {
		return "", err
	}
	if mime == "image/png" {
		err = png.Encode(tmp, img)
	} else {
		err = jpeg.Encode(tmp, img, &jpeg.Options{Quality: jpegQuality})
	}
	if cerr := tmp.Close(); err == nil {
		err = cerr
	}
	if err == nil {
		err = os.Rename(tmp.Name(), final)
	}
	if err != nil {
		_ = os.Remove(tmp.Name())
		return "", err
	}
	return final, nil
}

// scaleToWidth verkleinert auf die Zielbreite und behält das Seitenverhältnis. Kleinere Bilder werden
// nicht vergrößert; die Variante hat dann die Originalbreite.
func scaleToWidth(src image.Image, width int) image.Image {
	b := src.Bounds()
	if b.Dx() <= width {
		width = b.Dx()
	}
	height := max(1, (b.Dy()*width+b.Dx()/2)/b.Dx())
	dst := image.NewNRGBA(image.Rect(0, 0, width, height))
	draw.CatmullRom.Scale(dst, dst.Bounds(), src, b, draw.Src, nil)
	return dst
}

// cropFill füllt w × h vollständig und schneidet überstehende Ränder mittig ab (Link-Vorschau).
func cropFill(src image.Image, w, h int) image.Image {
	b := src.Bounds()
	crop := b
	if b.Dx()*h > b.Dy()*w { // breiter als das Ziel: links und rechts abschneiden
		cw := b.Dy() * w / h
		crop.Min.X = b.Min.X + (b.Dx()-cw)/2
		crop.Max.X = crop.Min.X + cw
	} else { // höher als das Ziel: oben und unten abschneiden
		ch := b.Dx() * h / w
		crop.Min.Y = b.Min.Y + (b.Dy()-ch)/2
		crop.Max.Y = crop.Min.Y + ch
	}
	dst := image.NewNRGBA(image.Rect(0, 0, w, h))
	draw.CatmullRom.Scale(dst, dst.Bounds(), src, crop, draw.Src, nil)
	return dst
}

// opaque meldet, ob ein Bild keine (teil-)transparenten Pixel hat.
func opaque(img image.Image) bool {
	if o, ok := img.(interface{ Opaque() bool }); ok {
		return o.Opaque()
	}
	return true
}

func newKey() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
