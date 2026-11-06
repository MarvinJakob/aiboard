// Package audit enthält die Inhalte des KI-Audits (Anforderungen 8 bis 10): Einführung, Dimensionen,
// Reifegrade und Prüffragen. Fachliche Grundlage ist content/KI Audit.docx. Die Inhalte liegen
// versioniert in content.json und werden in das Binary eingebettet
// (docs/adr/0009-audit-inhalte-als-datei-im-repository.md).
package audit

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"

	"ki-web/backend/internal/service"
)

// TopicSlug ist das Thema, unter dem die Audit-Übersicht und die Dimensionsseiten erscheinen.
const TopicSlug = "ai-audit"

// LevelCount ist die Zahl der Reifegrade je Dimension (Einfach, Strukturiert, Intelligent).
// Dazu kommt Reifegrad 0 „Nicht angewendet“ ohne eigene Prüffragen.
const LevelCount = 3

//go:embed content.json
var contentJSON []byte

// Category ordnet eine Dimension ein.
type Category string

const (
	Organizational Category = "organizational"
	Business       Category = "business"
	Technical      Category = "technical"
)

func (c Category) valid() bool {
	return c == Organizational || c == Business || c == Technical
}

// LevelInfo beschreibt einen Reifegrad allgemein, unabhängig von der Dimension.
type LevelInfo struct {
	Level int
	Name  string
	Motto string
}

// Overview ist der Einstieg in das Audit auf der Themenseite.
type Overview struct {
	Lang         service.Lang
	Translations []service.Lang
	Intro        []string
	Levels       []LevelInfo // Reifegrade 1 bis 3
	Dimensions   []DimensionSummary
}

// DimensionSummary ist die Kurzform einer Dimension für die Übersicht.
type DimensionSummary struct {
	Slug     string
	Lang     service.Lang
	Title    string
	Summary  string
	Category Category
}

// Question ist eine Prüffrage. Bedingte Fragen gelten nur, wenn ihre Voraussetzung vorliegt
// (z. B. „Bei Agenten: …“), und dürfen mit „Trifft nicht zu“ beantwortet werden.
type Question struct {
	ID          string
	Text        string
	Conditional bool
}

// Level ist ein Reifegrad einer Dimension. Reifegrad 0 hat keine Prüffragen.
type Level struct {
	Level       int
	Name        string
	Description string
	Questions   []Question
}

// Dimension ist eine Audit-Dimension mit allen Inhalten ihrer Seite.
type Dimension struct {
	DimensionSummary
	Translations []service.Lang
	Intro        []string
	Benefits     []string
	NotApplied   Level
	Levels       []Level // Reifegrade 1 bis 3
}

// ---------------------------------------------------------------------------
// Format von content.json
// ---------------------------------------------------------------------------

type fileFormat struct {
	Overview   map[service.Lang]overviewText `json:"overview"`
	Dimensions []dimensionEntry              `json:"dimensions"`
}

type overviewText struct {
	Intro  []string        `json:"intro"`
	Levels []levelInfoText `json:"levels"` // Reifegrade 0 bis 3
}

type levelInfoText struct {
	Name  string `json:"name"`
	Motto string `json:"motto"`
}

type dimensionEntry struct {
	Slug     string                         `json:"slug"`
	Category Category                       `json:"category"`
	Released bool                           `json:"released"` // fachlich freigegeben und öffentlich sichtbar
	Texts    map[service.Lang]dimensionText `json:"texts"`
}

type dimensionText struct {
	Title      string      `json:"title"`
	Summary    string      `json:"summary"`
	Intro      []string    `json:"intro"`
	Benefits   []string    `json:"benefits"`
	NotApplied string      `json:"notApplied"`
	Levels     []levelText `json:"levels"` // Reifegrade 1 bis 3
}

type levelText struct {
	Description string         `json:"description"`
	Questions   []questionText `json:"questions"`
}

type questionText struct {
	Text        string `json:"text"`
	Conditional bool   `json:"conditional,omitempty"`
}

// ---------------------------------------------------------------------------
// Katalog
// ---------------------------------------------------------------------------

// Catalog hält die geprüften Audit-Inhalte. Nicht freigegebene Dimensionen sind nicht sichtbar.
type Catalog struct {
	overview   map[service.Lang]overviewText
	dimensions []dimensionEntry // nur freigegebene, in Dateireihenfolge
}

// Load liest die eingebetteten Inhalte.
func Load() (*Catalog, error) { return Parse(contentJSON) }

// Parse liest und prüft Audit-Inhalte. Fehlerhafte Inhalte führen zu einem Fehler beim Start,
// nicht zu einer kaputten Seite.
func Parse(data []byte) (*Catalog, error) {
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields()
	var f fileFormat
	if err := dec.Decode(&f); err != nil {
		return nil, fmt.Errorf("audit-inhalte lesen: %w", err)
	}
	if err := validate(f); err != nil {
		return nil, fmt.Errorf("audit-inhalte prüfen: %w", err)
	}
	c := &Catalog{overview: f.Overview}
	for _, d := range f.Dimensions {
		if d.Released {
			c.dimensions = append(c.dimensions, d)
		}
	}
	return c, nil
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

func validate(f fileFormat) error {
	var errs []error
	fail := func(format string, args ...any) { errs = append(errs, fmt.Errorf(format, args...)) }

	if _, ok := f.Overview[service.DE]; !ok {
		fail("übersicht: deutsche Fassung fehlt")
	}
	for l, o := range f.Overview {
		if _, ok := service.ParseLang(string(l)); !ok {
			fail("übersicht: unbekannte Sprache %q", l)
		}
		if len(o.Intro) == 0 || hasEmpty(o.Intro) {
			fail("übersicht (%s): Einführung fehlt oder enthält leere Absätze", l)
		}
		if len(o.Levels) != LevelCount+1 {
			fail("übersicht (%s): %d Reifegrade statt %d (0 bis %d)", l, len(o.Levels), LevelCount+1, LevelCount)
		}
		for i, lv := range o.Levels {
			if lv.Name == "" || lv.Motto == "" {
				fail("übersicht (%s): Reifegrad %d ohne Name oder Leitsatz", l, i)
			}
		}
	}

	seen := map[string]bool{}
	for i, d := range f.Dimensions {
		where := fmt.Sprintf("dimension %d (%s)", i+1, d.Slug)
		if !slugPattern.MatchString(d.Slug) {
			fail("%s: ungültiger Slug", where)
		}
		if seen[d.Slug] {
			fail("%s: Slug doppelt", where)
		}
		seen[d.Slug] = true
		if !d.Category.valid() {
			fail("%s: unbekannte Kategorie %q", where, d.Category)
		}
		de, ok := d.Texts[service.DE]
		if !ok {
			fail("%s: deutsche Fassung fehlt", where)
		}
		for l, t := range d.Texts {
			w := fmt.Sprintf("%s (%s)", where, l)
			if _, ok := f.Overview[l]; !ok {
				fail("%s: Übersicht fehlt in dieser Sprache", w)
			}
			if t.Title == "" || t.Summary == "" || t.NotApplied == "" {
				fail("%s: Titel, Kurzbeschreibung oder Text für Reifegrad 0 fehlt", w)
			}
			if len(t.Intro) == 0 || hasEmpty(t.Intro) {
				fail("%s: Einführung fehlt oder enthält leere Absätze", w)
			}
			// Anforderung 9: mindestens zwei konkrete Vorteile
			if len(t.Benefits) < 2 || hasEmpty(t.Benefits) {
				fail("%s: mindestens zwei Vorteile nötig", w)
			}
			if len(t.Levels) != LevelCount {
				fail("%s: %d Reifegrade statt %d", w, len(t.Levels), LevelCount)
				continue
			}
			for n, lv := range t.Levels {
				if lv.Description == "" {
					fail("%s: Reifegrad %d ohne Beschreibung", w, n+1)
				}
				if len(lv.Questions) == 0 {
					fail("%s: Reifegrad %d ohne Prüffragen", w, n+1)
				}
				for q, qt := range lv.Questions {
					if qt.Text == "" {
						fail("%s: Frage %d.%d ohne Text", w, n+1, q+1)
					}
				}
			}
			// Übersetzungen müssen dieselben Fragen haben, sonst passen die Antworten nicht zusammen.
			if ok && l != service.DE && !sameQuestions(de, t) {
				fail("%s: Prüffragen weichen in Anzahl oder Bedingung von der deutschen Fassung ab", w)
			}
		}
	}
	return errors.Join(errs...)
}

func hasEmpty(ss []string) bool {
	for _, s := range ss {
		if s == "" {
			return true
		}
	}
	return false
}

func sameQuestions(a, b dimensionText) bool {
	if len(a.Levels) != len(b.Levels) {
		return false
	}
	for i := range a.Levels {
		qa, qb := a.Levels[i].Questions, b.Levels[i].Questions
		if len(qa) != len(qb) {
			return false
		}
		for j := range qa {
			if qa[j].Conditional != qb[j].Conditional {
				return false
			}
		}
	}
	return true
}

// Overview liefert die Audit-Übersicht in der gewünschten Sprache (sonst Deutsch).
func (c *Catalog) Overview(lang service.Lang) Overview {
	o, l, _ := pick(c.overview, lang)
	out := Overview{Lang: l, Translations: langsOf(c.overview), Intro: o.Intro}
	for i := 1; i < len(o.Levels); i++ {
		out.Levels = append(out.Levels, LevelInfo{Level: i, Name: o.Levels[i].Name, Motto: o.Levels[i].Motto})
	}
	for _, d := range c.dimensions {
		out.Dimensions = append(out.Dimensions, summary(d, lang))
	}
	return out
}

// Slugs liefert die freigegebenen Dimensionen in fester Reihenfolge.
func (c *Catalog) Slugs() []string {
	out := make([]string, 0, len(c.dimensions))
	for _, d := range c.dimensions {
		out = append(out, d.Slug)
	}
	return out
}

// Dimension liefert eine freigegebene Dimension. Unbekannte und nicht freigegebene Dimensionen
// liefern service.ErrNotFound.
func (c *Catalog) Dimension(slug string, lang service.Lang) (Dimension, error) {
	for _, d := range c.dimensions {
		if d.Slug != slug {
			continue
		}
		t, l, _ := pick(d.Texts, lang)
		names, _, _ := pick(c.overview, l)
		out := Dimension{
			DimensionSummary: summary(d, lang),
			Translations:     langsOf(d.Texts),
			Intro:            t.Intro,
			Benefits:         t.Benefits,
			NotApplied:       Level{Level: 0, Name: names.Levels[0].Name, Description: t.NotApplied},
		}
		for i, lt := range t.Levels {
			lv := Level{Level: i + 1, Name: names.Levels[i+1].Name, Description: lt.Description}
			for j, q := range lt.Questions {
				lv.Questions = append(lv.Questions, Question{
					ID: fmt.Sprintf("%d.%d", i+1, j+1), Text: q.Text, Conditional: q.Conditional,
				})
			}
			out.Levels = append(out.Levels, lv)
		}
		return out, nil
	}
	return Dimension{}, service.ErrNotFound
}

func summary(d dimensionEntry, lang service.Lang) DimensionSummary {
	t, l, _ := pick(d.Texts, lang)
	return DimensionSummary{Slug: d.Slug, Lang: l, Title: t.Title, Summary: t.Summary, Category: d.Category}
}

// pick wählt die gewünschte Sprache, sonst Deutsch, sonst jede weitere (wie bei Themen und Beiträgen).
func pick[T any](m map[service.Lang]T, want service.Lang) (T, service.Lang, bool) {
	for _, l := range append([]service.Lang{want}, service.Langs...) {
		if v, ok := m[l]; ok {
			return v, l, true
		}
	}
	var zero T
	return zero, "", false
}

func langsOf[T any](m map[service.Lang]T) []service.Lang {
	out := make([]service.Lang, 0, len(m))
	for _, l := range service.Langs {
		if _, ok := m[l]; ok {
			out = append(out, l)
		}
	}
	return out
}
