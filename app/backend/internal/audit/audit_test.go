package audit

import (
	"errors"
	"strings"
	"testing"

	"ki-web/backend/internal/service"
)

// Die acht Dimensionen aus content/KI Audit.docx, Kapitel 5.
var wantSlugs = []string{
	"strategie-und-wirtschaftlichkeit",
	"ressourcenplanung-und-kompetenzen",
	"betrieb",
	"governance-und-compliance",
	"agenten-und-prozesse",
	"technologie-und-infrastruktur",
	"daten-und-wissen",
	"sicherheit-und-zuverlaessigkeit",
}

func TestEmbeddedContentIsValid(t *testing.T) {
	c, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if got := strings.Join(c.Slugs(), ","); got != strings.Join(wantSlugs, ",") {
		t.Fatalf("dimensionen = %s", got)
	}
	for _, slug := range c.Slugs() {
		d, err := c.Dimension(slug, service.DE)
		if err != nil {
			t.Fatal(err)
		}
		if len(d.Benefits) < 2 {
			t.Errorf("%s: %d Vorteile", slug, len(d.Benefits))
		}
		names := []string{}
		for _, lv := range d.Levels {
			names = append(names, lv.Name)
		}
		if got := strings.Join(names, ","); got != "Einfach,Strukturiert,Intelligent" {
			t.Errorf("%s: reifegrade = %s", slug, got)
		}
	}
}

func TestStrategyDimensionFromMockup(t *testing.T) {
	c, _ := Load()
	d, err := c.Dimension("strategie-und-wirtschaftlichkeit", service.DE)
	if err != nil {
		t.Fatal(err)
	}
	if d.Title != "Strategie und Wirtschaftlichkeit" || d.Category != Organizational {
		t.Fatalf("dimension = %+v", d.DimensionSummary)
	}
	counts := []int{len(d.Levels[0].Questions), len(d.Levels[1].Questions), len(d.Levels[2].Questions)}
	if counts[0] != 3 || counts[1] != 7 || counts[2] != 5 {
		t.Fatalf("fragen je reifegrad = %v", counts)
	}
	if q := d.Levels[1].Questions[2]; q.ID != "2.3" {
		t.Fatalf("frage-id = %s", q.ID)
	}
}

func TestLanguageFallback(t *testing.T) {
	c, _ := Load()
	d, err := c.Dimension("betrieb", service.EN)
	if err != nil {
		t.Fatal(err)
	}
	if d.Lang != service.DE || len(d.Translations) != 1 {
		t.Fatalf("lang = %s, translations = %v", d.Lang, d.Translations)
	}
	o := c.Overview(service.EN)
	if o.Lang != service.DE || len(o.Levels) != 3 || len(o.Dimensions) != len(wantSlugs) {
		t.Fatalf("übersicht = %+v", o)
	}
}

func TestUnknownDimension(t *testing.T) {
	c, _ := Load()
	if _, err := c.Dimension("gibt-es-nicht", service.DE); !errors.Is(err, service.ErrNotFound) {
		t.Fatalf("err = %v", err)
	}
}

const minimal = `{
  "overview": {"de": {"intro": ["Intro"], "guidance": ["Anleitung"], "classification": ["Einordnung"], "levels": [
    {"name": "N", "motto": "m"}, {"name": "E", "motto": "m"}, {"name": "S", "motto": "m"}, {"name": "I", "motto": "m"}]}},
  "dimensions": [
    {"slug": "frei", "category": "technical", "released": true, "texts": {"de": %s}},
    {"slug": "entwurf", "category": "technical", "released": false, "texts": {"de": %s}}
  ]
}`

const validText = `{"title": "T", "summary": "S", "intro": ["I"], "benefits": ["a", "b"], "notApplied": "n",
  "levels": [{"description": "d", "questions": [{"text": "q"}]}, {"description": "d", "questions": [{"text": "q"}]},
             {"description": "d", "questions": [{"text": "q", "conditional": true}]}]}`

func TestUnreleasedDimensionIsHidden(t *testing.T) {
	c, err := Parse([]byte(strings.ReplaceAll(strings.Replace(minimal, "%s", validText, 1), "%s", validText)))
	if err != nil {
		t.Fatal(err)
	}
	if got := c.Slugs(); len(got) != 1 || got[0] != "frei" {
		t.Fatalf("slugs = %v", got)
	}
	if _, err := c.Dimension("entwurf", service.DE); !errors.Is(err, service.ErrNotFound) {
		t.Fatalf("entwurf sichtbar: %v", err)
	}
	if n := len(c.Overview(service.DE).Dimensions); n != 1 {
		t.Fatalf("übersicht zeigt %d dimensionen", n)
	}
}

func TestInvalidContentIsRejected(t *testing.T) {
	oneBenefit := strings.Replace(validText, `["a", "b"]`, `["a"]`, 1)
	twoLevels := `{"title": "T", "summary": "S", "intro": ["I"], "benefits": ["a", "b"], "notApplied": "n",
	  "levels": [{"description": "d", "questions": [{"text": "q"}]}, {"description": "d", "questions": [{"text": "q"}]}]}`
	noQuestions := strings.Replace(validText, `[{"text": "q"}]`, `[]`, 1)
	for name, text := range map[string]string{"ein Vorteil": oneBenefit, "zwei Reifegrade": twoLevels, "ohne Fragen": noQuestions} {
		data := strings.Replace(strings.Replace(minimal, "%s", text, 1), "%s", validText, 1)
		if _, err := Parse([]byte(data)); err == nil {
			t.Errorf("%s: kein Fehler", name)
		}
	}
	if _, err := Parse([]byte(`{"overview": {}, "dimensions": [], "extra": 1}`)); err == nil {
		t.Error("unbekanntes Feld: kein Fehler")
	}
	// Ticket #113: Die Auswertung liegt neben den Dimensionsseiten und darf keinen Slug verdecken.
	reserved := strings.Replace(strings.ReplaceAll(minimal, "%s", validText), `"slug": "frei"`, `"slug": "`+ResultSlug+`"`, 1)
	if _, err := Parse([]byte(reserved)); err == nil {
		t.Error("reservierter Slug: kein Fehler")
	}
}
