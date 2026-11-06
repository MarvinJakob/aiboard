package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"ki-web/backend/internal/store"
)

// Status eines Beitrags. Nur veröffentlichte Beiträge sind öffentlich sichtbar (Anforderung 4).
type Status string

const (
	StatusDraft     Status = "draft"
	StatusPublished Status = "published"
)

// Grenzen für Eingaben der Redaktion.
const (
	maxSlugLen    = 120
	maxTitleLen   = 200
	maxSummaryLen = 600
	maxBodyLen    = 200_000
)

// ErrSlugTaken bedeutet: Ein anderer Beitrag nutzt das URL-Kürzel bereits.
var ErrSlugTaken = errors.New("url-kürzel bereits vergeben")

// PostText ist die Fassung eines Beitrags in einer Sprache.
type PostText struct {
	Lang         Lang
	Title        string
	Summary      string
	BodyMarkdown string
}

func (t PostText) blank() bool {
	return strings.TrimSpace(t.Title) == "" && strings.TrimSpace(t.Summary) == "" && strings.TrimSpace(t.BodyMarkdown) == ""
}

func (t PostText) complete() bool {
	return strings.TrimSpace(t.Title) != "" && strings.TrimSpace(t.Summary) != "" && strings.TrimSpace(t.BodyMarkdown) != ""
}

// PostInput sind die Angaben, die die Redaktion speichert.
type PostInput struct {
	Slug     string // leer: wird aus dem Titel erzeugt
	Featured bool
	Topics   []string // Slugs der Themen
	Texts    []PostText
}

// EditorPost ist ein Beitrag mit allen Fassungen, wie ihn die Redaktion bearbeitet.
type EditorPost struct {
	ID          int64
	Slug        string
	Status      Status
	Featured    bool
	Topics      []string
	Texts       []PostText
	PublishedAt *time.Time
	ScheduledAt *time.Time // geplante Veröffentlichung (Ticket #23), nur bei Entwürfen
	UpdatedAt   time.Time
}

// EditorPostSummary ist eine Zeile der Beitragsliste der Redaktion.
type EditorPostSummary struct {
	ID           int64
	Slug         string
	Status       Status
	Title        string
	Featured     bool
	Topics       []string
	Translations []Lang
	PublishedAt  *time.Time
	ScheduledAt  *time.Time
	UpdatedAt    time.Time
}

// Editorial verwaltet Beiträge für die Redaktion (Anforderung 5). Anders als Public sieht es auch Entwürfe.
type Editorial struct {
	db  *sql.DB
	q   *store.Queries
	now func() time.Time
}

func NewEditorial(db *sql.DB) *Editorial {
	return &Editorial{db: db, q: store.New(db), now: time.Now}
}

// Posts liefert alle Beiträge, zuletzt geänderte zuerst.
func (e *Editorial) Posts(ctx context.Context) ([]EditorPostSummary, error) {
	rows, err := e.q.ListAllPosts(ctx)
	if err != nil || len(rows) == 0 {
		return []EditorPostSummary{}, err
	}
	ids := make([]int64, 0, len(rows))
	for _, r := range rows {
		ids = append(ids, r.ID)
	}
	trs, err := e.q.ListPostTranslationSummaries(ctx, ids)
	if err != nil {
		return nil, err
	}
	titles := map[int64]map[Lang]string{}
	for _, tr := range trs {
		if titles[tr.PostID] == nil {
			titles[tr.PostID] = map[Lang]string{}
		}
		titles[tr.PostID][Lang(tr.Lang)] = tr.Title
	}
	topics, err := e.topicSlugs(ctx, ids)
	if err != nil {
		return nil, err
	}
	out := make([]EditorPostSummary, 0, len(rows))
	for _, r := range rows {
		title, _, _ := pick(titles[r.ID], DE)
		out = append(out, EditorPostSummary{
			ID: r.ID, Slug: r.Slug, Status: Status(r.Status), Title: title, Featured: r.Featured,
			Topics: orEmpty(topics[r.ID]), Translations: langsOf(titles[r.ID]),
			PublishedAt: optTime(r.PublishedAt), ScheduledAt: optTime(r.ScheduledAt), UpdatedAt: parseTime(r.UpdatedAt),
		})
	}
	return out, nil
}

// Post liefert einen Beitrag mit allen Fassungen, auch als Entwurf.
func (e *Editorial) Post(ctx context.Context, id int64) (EditorPost, error) {
	return e.load(ctx, e.q, id)
}

func (e *Editorial) load(ctx context.Context, q *store.Queries, id int64) (EditorPost, error) {
	row, err := q.GetPostByID(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return EditorPost{}, ErrNotFound
	}
	if err != nil {
		return EditorPost{}, err
	}
	trs, err := q.ListPostTranslations(ctx, id)
	if err != nil {
		return EditorPost{}, err
	}
	texts := make([]PostText, 0, len(trs))
	for _, l := range Langs { // feste Reihenfolge: de, en
		for _, tr := range trs {
			if Lang(tr.Lang) == l {
				texts = append(texts, PostText{Lang: l, Title: tr.Title, Summary: tr.Summary, BodyMarkdown: tr.BodyMarkdown})
			}
		}
	}
	topics, err := (&Editorial{q: q}).topicSlugs(ctx, []int64{id})
	if err != nil {
		return EditorPost{}, err
	}
	return EditorPost{
		ID: row.ID, Slug: row.Slug, Status: Status(row.Status), Featured: row.Featured,
		Topics: orEmpty(topics[id]), Texts: texts,
		PublishedAt: optTime(row.PublishedAt), ScheduledAt: optTime(row.ScheduledAt), UpdatedAt: parseTime(row.UpdatedAt),
	}, nil
}

// topicSlugs liefert je Beitrag die Slugs der zugeordneten Themen in der Reihenfolge der Themen.
func (e *Editorial) topicSlugs(ctx context.Context, ids []int64) (map[int64][]string, error) {
	topics, err := e.q.ListTopics(ctx)
	if err != nil {
		return nil, err
	}
	slug := map[int64]string{}
	for _, t := range topics {
		slug[t.ID] = t.Slug
	}
	links, err := e.q.ListPostTopics(ctx, ids)
	if err != nil {
		return nil, err
	}
	out := map[int64][]string{}
	for _, l := range links {
		out[l.PostID] = append(out[l.PostID], slug[l.TopicID])
	}
	return out, nil
}

// Create legt einen neuen Entwurf an.
func (e *Editorial) Create(ctx context.Context, in PostInput) (EditorPost, error) {
	return e.write(ctx, 0, in)
}

// Update speichert Texte, Themen und Einstellungen eines Beitrags. Ein veröffentlichter Beitrag bleibt
// veröffentlicht; die öffentliche Seite zeigt sofort die neue Fassung (Anforderung 5). Er muss dafür
// weiterhin vollständig sein.
func (e *Editorial) Update(ctx context.Context, id int64, in PostInput) (EditorPost, error) {
	return e.write(ctx, id, in)
}

func (e *Editorial) write(ctx context.Context, id int64, in PostInput) (EditorPost, error) {
	texts, err := normalizeTexts(in.Texts)
	if err != nil {
		return EditorPost{}, err
	}
	tx, err := e.db.BeginTx(ctx, nil)
	if err != nil {
		return EditorPost{}, err
	}
	defer tx.Rollback()
	q := e.q.WithTx(tx)

	if id != 0 {
		cur, err := q.GetPostByID(ctx, id)
		if errors.Is(err, sql.ErrNoRows) {
			return EditorPost{}, ErrNotFound
		}
		if err != nil {
			return EditorPost{}, err
		}
		if Status(cur.Status) == StatusPublished {
			if err := publishable(texts); err != nil {
				return EditorPost{}, err
			}
		}
		// Ein geplanter Beitrag muss vollständig bleiben, sonst könnte er nicht erscheinen (Ticket #23).
		if cur.ScheduledAt.Valid {
			var verr *ValidationError
			if err := publishable(texts); errors.As(err, &verr) {
				return EditorPost{}, invalid("Der Beitrag ist zur Veröffentlichung geplant. %s Entfernen Sie sonst zuerst den Zeitpunkt.", verr.Msg)
			}
		}
	}

	topicIDs, err := resolveTopics(ctx, q, in.Topics)
	if err != nil {
		return EditorPost{}, err
	}
	slug, err := e.chooseSlug(ctx, q, id, in.Slug, texts)
	if err != nil {
		return EditorPost{}, err
	}

	now := formatTime(e.now())
	if id == 0 {
		id, err = q.CreatePost(ctx, store.CreatePostParams{Slug: slug, Featured: in.Featured, UpdatedAt: now})
	} else {
		_, err = q.UpdatePost(ctx, store.UpdatePostParams{Slug: slug, Featured: in.Featured, UpdatedAt: now, ID: id})
	}
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return EditorPost{}, ErrSlugTaken
		}
		return EditorPost{}, err
	}
	if err := q.DeletePostTranslations(ctx, id); err != nil {
		return EditorPost{}, err
	}
	for _, t := range texts {
		if err := q.InsertPostTranslation(ctx, store.InsertPostTranslationParams{
			PostID: id, Lang: string(t.Lang), Title: t.Title, Summary: t.Summary, BodyMarkdown: t.BodyMarkdown,
		}); err != nil {
			return EditorPost{}, err
		}
	}
	if err := q.DeletePostTopics(ctx, id); err != nil {
		return EditorPost{}, err
	}
	for _, tid := range topicIDs {
		if err := q.InsertPostTopic(ctx, store.InsertPostTopicParams{PostID: id, TopicID: tid}); err != nil {
			return EditorPost{}, err
		}
	}
	p, err := e.load(ctx, q, id)
	if err != nil {
		return EditorPost{}, err
	}
	return p, tx.Commit()
}

// Publish veröffentlicht einen Beitrag. Titel, Kurztext und Beitragstext müssen in jeder vorhandenen
// Sprache gefüllt sein (Anforderung 5). Das erste Veröffentlichungsdatum bleibt erhalten.
func (e *Editorial) Publish(ctx context.Context, id int64) (EditorPost, error) {
	p, err := e.Post(ctx, id)
	if err != nil {
		return EditorPost{}, err
	}
	if err := publishable(p.Texts); err != nil {
		return EditorPost{}, err
	}
	now := formatTime(e.now())
	if _, err := e.q.PublishPost(ctx, store.PublishPostParams{
		PublishedAt: sql.NullString{String: now, Valid: true}, UpdatedAt: now, ID: id,
	}); err != nil {
		return EditorPost{}, err
	}
	return e.Post(ctx, id)
}

// Unpublish nimmt die Veröffentlichung zurück. Der Beitrag ist danach wieder ein Entwurf und
// öffentlich nicht mehr erreichbar (Anforderung 5).
func (e *Editorial) Unpublish(ctx context.Context, id int64) (EditorPost, error) {
	n, err := e.q.UnpublishPost(ctx, store.UnpublishPostParams{UpdatedAt: formatTime(e.now()), ID: id})
	if err != nil {
		return EditorPost{}, err
	}
	if n == 0 {
		return EditorPost{}, ErrNotFound
	}
	return e.Post(ctx, id)
}

// Schedule plant die automatische Veröffentlichung eines Beitrags „In Arbeit“ (Ticket #23). Der Zeitpunkt
// muss in der Zukunft liegen, und der Beitrag braucht wie beim Veröffentlichen Titel, Kurztext und
// Beitragstext in jeder vorhandenen Sprache. Ein vorhandener Zeitpunkt wird ersetzt.
func (e *Editorial) Schedule(ctx context.Context, id int64, at time.Time) (EditorPost, error) {
	p, err := e.Post(ctx, id)
	if err != nil {
		return EditorPost{}, err
	}
	if p.Status == StatusPublished {
		return EditorPost{}, invalid("Der Beitrag ist bereits veröffentlicht. Ein Zeitpunkt ist nur für Beiträge „In Arbeit“ möglich.")
	}
	at = at.UTC().Truncate(time.Second)
	if !at.After(e.now()) {
		return EditorPost{}, invalid("Der Zeitpunkt liegt in der Vergangenheit. Bitte wählen Sie einen Zeitpunkt in der Zukunft.")
	}
	if err := publishable(p.Texts); err != nil {
		return EditorPost{}, err
	}
	n, err := e.q.SchedulePost(ctx, store.SchedulePostParams{
		ScheduledAt: sql.NullString{String: formatTime(at), Valid: true}, UpdatedAt: formatTime(e.now()), ID: id,
	})
	if err != nil {
		return EditorPost{}, err
	}
	if n == 0 { // inzwischen veröffentlicht
		return EditorPost{}, invalid("Der Beitrag ist bereits veröffentlicht. Ein Zeitpunkt ist nur für Beiträge „In Arbeit“ möglich.")
	}
	return e.Post(ctx, id)
}

// Unschedule entfernt den geplanten Zeitpunkt. Der Beitrag bleibt „In Arbeit“.
func (e *Editorial) Unschedule(ctx context.Context, id int64) (EditorPost, error) {
	n, err := e.q.UnschedulePost(ctx, store.UnschedulePostParams{UpdatedAt: formatTime(e.now()), ID: id})
	if err != nil {
		return EditorPost{}, err
	}
	if n == 0 {
		return EditorPost{}, ErrNotFound
	}
	return e.Post(ctx, id)
}

// PublishDue veröffentlicht alle Beiträge, deren geplanter Zeitpunkt erreicht ist, und liefert ihre IDs.
// Als Veröffentlichungsdatum gilt der geplante Zeitpunkt. Ist ein Beitrag wider Erwarten unvollständig,
// verliert er nur seinen Zeitpunkt und bleibt „In Arbeit“.
func (e *Editorial) PublishDue(ctx context.Context) (published, skipped []int64, err error) {
	now := e.now()
	due, err := e.q.ListDuePosts(ctx, sql.NullString{String: formatTime(now), Valid: true})
	if err != nil {
		return nil, nil, err
	}
	for _, d := range due {
		p, err := e.Post(ctx, d.ID)
		if errors.Is(err, ErrNotFound) {
			continue
		}
		if err != nil {
			return published, skipped, err
		}
		if publishable(p.Texts) != nil {
			if _, err := e.q.UnschedulePost(ctx, store.UnschedulePostParams{UpdatedAt: formatTime(now), ID: d.ID}); err != nil {
				return published, skipped, err
			}
			skipped = append(skipped, d.ID)
			continue
		}
		n, err := e.q.PublishScheduledPost(ctx, store.PublishScheduledPostParams{UpdatedAt: formatTime(now), ID: d.ID})
		if err != nil {
			return published, skipped, err
		}
		if n > 0 {
			published = append(published, d.ID)
		}
	}
	return published, skipped, nil
}

// Delete löscht einen Beitrag endgültig mit allen Sprachfassungen und Themenzuordnungen (Ticket #24).
// Danach ist er öffentlich nicht mehr erreichbar und fehlt in der Sitemap.
func (e *Editorial) Delete(ctx context.Context, id int64) error {
	n, err := e.q.DeletePost(ctx, id)
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---------------------------------------------------------------------------
// Prüfungen
// ---------------------------------------------------------------------------

// normalizeTexts prüft Sprachen und Längen. Leere Fassungen werden nicht gespeichert.
// Zum Speichern reicht ein Titel in einer Sprache; vollständig muss ein Beitrag erst beim Veröffentlichen sein.
func normalizeTexts(in []PostText) ([]PostText, error) {
	seen := map[Lang]bool{}
	out := make([]PostText, 0, len(in))
	for _, t := range in {
		if _, ok := ParseLang(string(t.Lang)); !ok {
			return nil, invalid("Unbekannte Sprache %q.", t.Lang)
		}
		if seen[t.Lang] {
			return nil, invalid("Die Sprache %s ist doppelt angegeben.", t.Lang)
		}
		seen[t.Lang] = true
		t.Title = strings.TrimSpace(t.Title)
		t.Summary = strings.TrimSpace(t.Summary)
		t.BodyMarkdown = strings.TrimRight(t.BodyMarkdown, " \t\r\n")
		if t.blank() {
			continue
		}
		switch {
		case utf8.RuneCountInString(t.Title) > maxTitleLen:
			return nil, invalid("Der Titel (%s) darf höchstens %d Zeichen lang sein.", langName(t.Lang), maxTitleLen)
		case utf8.RuneCountInString(t.Summary) > maxSummaryLen:
			return nil, invalid("Der Kurztext (%s) darf höchstens %d Zeichen lang sein.", langName(t.Lang), maxSummaryLen)
		case len(t.BodyMarkdown) > maxBodyLen:
			return nil, invalid("Der Beitragstext (%s) ist zu lang.", langName(t.Lang))
		case t.Title == "":
			return nil, invalid("Bitte einen Titel (%s) angeben.", langName(t.Lang))
		}
		out = append(out, t)
	}
	if len(out) == 0 {
		return nil, invalid("Bitte mindestens einen Titel angeben.")
	}
	return out, nil
}

// publishable verlangt Titel, Kurztext und Beitragstext in jeder vorhandenen Sprache.
func publishable(texts []PostText) error {
	if len(texts) == 0 {
		return invalid("Zum Veröffentlichen braucht der Beitrag Titel, Kurztext und Beitragstext.")
	}
	for _, t := range texts {
		if !t.complete() {
			var missing []string
			if strings.TrimSpace(t.Title) == "" {
				missing = append(missing, "Titel")
			}
			if strings.TrimSpace(t.Summary) == "" {
				missing = append(missing, "Kurztext")
			}
			if strings.TrimSpace(t.BodyMarkdown) == "" {
				missing = append(missing, "Beitragstext")
			}
			return invalid("Zum Veröffentlichen fehlt in der Fassung %s: %s.", langName(t.Lang), strings.Join(missing, ", "))
		}
	}
	return nil
}

func langName(l Lang) string {
	if l == EN {
		return "Englisch"
	}
	return "Deutsch"
}

func resolveTopics(ctx context.Context, q *store.Queries, slugs []string) ([]int64, error) {
	seen := map[int64]bool{}
	out := make([]int64, 0, len(slugs))
	for _, s := range slugs {
		t, err := q.GetTopicBySlug(ctx, s)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, invalid("Unbekanntes Thema %q.", s)
		}
		if err != nil {
			return nil, err
		}
		if !seen[t.ID] {
			seen[t.ID] = true
			out = append(out, t.ID)
		}
	}
	return out, nil
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// chooseSlug prüft ein angegebenes URL-Kürzel oder erzeugt eines aus dem Titel. Ein erzeugtes Kürzel
// erhält bei Bedarf eine Nummer, ein angegebenes muss frei sein.
func (e *Editorial) chooseSlug(ctx context.Context, q *store.Queries, id int64, want string, texts []PostText) (string, error) {
	want = strings.TrimSpace(want)
	taken := func(s string) (bool, error) {
		other, err := q.GetPostIDBySlug(ctx, s)
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return err == nil && other != id, err
	}
	if want != "" {
		if len(want) > maxSlugLen || !slugPattern.MatchString(want) {
			return "", invalid("Das URL-Kürzel darf nur Kleinbuchstaben, Ziffern und einzelne Bindestriche enthalten.")
		}
		t, err := taken(want)
		if err != nil {
			return "", err
		}
		if t {
			return "", ErrSlugTaken
		}
		return want, nil
	}
	if id != 0 { // bestehender Beitrag ohne Angabe: Kürzel bleibt
		cur, err := q.GetPostByID(ctx, id)
		if err != nil {
			return "", err
		}
		return cur.Slug, nil
	}
	base := Slugify(texts[0].Title)
	if base == "" {
		base = "beitrag"
	}
	for i := 1; ; i++ {
		s := base
		if i > 1 {
			s = fmt.Sprintf("%s-%d", base, i)
		}
		t, err := taken(s)
		if err != nil {
			return "", err
		}
		if !t {
			return s, nil
		}
	}
}

var umlauts = strings.NewReplacer("ä", "ae", "ö", "oe", "ü", "ue", "Ä", "ae", "Ö", "oe", "Ü", "ue", "ß", "ss")

// Slugify erzeugt aus einem Titel ein URL-Kürzel, z. B. "Was KI kostet" -> "was-ki-kostet".
func Slugify(title string) string {
	s := strings.ToLower(umlauts.Replace(title))
	var b strings.Builder
	dash := false
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			dash = false
		case b.Len() > 0 && !dash:
			b.WriteByte('-')
			dash = true
		}
	}
	out := strings.TrimRight(b.String(), "-")
	if len(out) > 80 {
		out = strings.TrimRight(out[:80], "-")
	}
	return out
}

func optTime(s sql.NullString) *time.Time {
	if !s.Valid || s.String == "" {
		return nil
	}
	t := parseTime(s.String)
	return &t
}

func orEmpty(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}
