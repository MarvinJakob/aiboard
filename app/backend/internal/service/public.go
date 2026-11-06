// Package service enthält die Fachlogik: Sichtbarkeit von Beiträgen und Sprachauswahl.
package service

import (
	"context"
	"database/sql"
	"errors"
	"math"
	"strings"
	"time"
	"unicode"

	"ki-web/backend/internal/media"
	"ki-web/backend/internal/store"
)

// Lang ist eine unterstützte Sprache.
type Lang string

const (
	DE Lang = "de"
	EN Lang = "en"
)

// Langs sind alle unterstützten Sprachen. Deutsch ist die Standardsprache (x-default).
var Langs = []Lang{DE, EN}

// ParseLang prüft eine Sprachangabe.
func ParseLang(s string) (Lang, bool) {
	for _, l := range Langs {
		if string(l) == s {
			return l, true
		}
	}
	return "", false
}

// ErrNotFound bedeutet: existiert nicht oder ist nicht öffentlich.
var ErrNotFound = errors.New("nicht gefunden")

// FeaturedLimit ist die Höchstzahl der Beiträge im Karussell der Startseite.
const FeaturedLimit = 3

type TopicRef struct {
	Slug  string
	Lang  Lang
	Title string
	Label string
}

type Topic struct {
	TopicRef
	Summary      string
	Intro        string
	PostCount    int
	Translations []Lang
}

type TopicDetail struct {
	Topic
	Posts []PostSummary
}

type Image struct {
	Src, Srcset   string
	OGImage       string
	Width, Height int
	Alt           string
	AltLang       Lang
}

type PostSummary struct {
	ID           int64
	Slug         string
	Lang         Lang
	Title        string
	Summary      string
	PublishedAt  time.Time
	UpdatedAt    time.Time
	Featured     bool
	Topics       []TopicRef
	Translations []Lang
	Cover        *Image
}

type Post struct {
	PostSummary
	BodyMarkdown   string
	ReadingMinutes int
}

// Public liefert die Inhalte der öffentlichen Webseite. Alle Methoden berücksichtigen nur
// veröffentlichte Beiträge (Anforderung 4).
type Public struct {
	q store.Querier
}

func NewPublic(q store.Querier) *Public { return &Public{q: q} }

// Health prüft die Datenbank.
func (s *Public) Health(ctx context.Context) error {
	_, err := s.q.Ping(ctx)
	return err
}

// Topics liefert alle Themen in fester Reihenfolge.
func (s *Public) Topics(ctx context.Context, lang Lang) ([]Topic, error) {
	idx, err := s.topicIndex(ctx)
	if err != nil {
		return nil, err
	}
	counts, err := s.q.CountPublishedPostsByTopic(ctx)
	if err != nil {
		return nil, err
	}
	byTopic := map[int64]int{}
	for _, c := range counts {
		byTopic[c.TopicID] = int(c.PostCount)
	}
	out := make([]Topic, 0, len(idx.order))
	for _, id := range idx.order {
		t := idx.topic(id, lang)
		t.PostCount = byTopic[id]
		out = append(out, t)
	}
	return out, nil
}

// Topic liefert ein Thema mit seinen veröffentlichten Beiträgen, neueste zuerst.
func (s *Public) Topic(ctx context.Context, slug string, lang Lang) (TopicDetail, error) {
	row, err := s.q.GetTopicBySlug(ctx, slug)
	if errors.Is(err, sql.ErrNoRows) {
		return TopicDetail{}, ErrNotFound
	}
	if err != nil {
		return TopicDetail{}, err
	}
	idx, err := s.topicIndex(ctx)
	if err != nil {
		return TopicDetail{}, err
	}
	rows, err := s.q.ListPublishedPostsByTopic(ctx, row.ID)
	if err != nil {
		return TopicDetail{}, err
	}
	posts, err := s.summaries(ctx, rows, lang, idx)
	if err != nil {
		return TopicDetail{}, err
	}
	t := idx.topic(row.ID, lang)
	t.PostCount = len(posts)
	return TopicDetail{Topic: t, Posts: posts}, nil
}

// Posts liefert alle veröffentlichten Beiträge, neueste zuerst.
func (s *Public) Posts(ctx context.Context, lang Lang) ([]PostSummary, error) {
	idx, err := s.topicIndex(ctx)
	if err != nil {
		return nil, err
	}
	rows, err := s.q.ListPublishedPosts(ctx)
	if err != nil {
		return nil, err
	}
	return s.summaries(ctx, rows, lang, idx)
}

// FeaturedPosts liefert die Beiträge für das Karussell (Anforderung 1): An erster Stelle steht
// der zuletzt veröffentlichte Beitrag, danach die neuesten weiteren hervorgehobenen Beiträge.
func (s *Public) FeaturedPosts(ctx context.Context, lang Lang) ([]PostSummary, error) {
	all, err := s.Posts(ctx, lang)
	if err != nil || len(all) == 0 {
		return all, err
	}
	out := []PostSummary{all[0]}
	for _, p := range all[1:] {
		if len(out) == FeaturedLimit {
			break
		}
		if p.Featured {
			out = append(out, p)
		}
	}
	return out, nil
}

// Post liefert einen veröffentlichten Beitrag. Für Entwürfe gilt ErrNotFound.
func (s *Public) Post(ctx context.Context, slug string, lang Lang) (Post, error) {
	row, err := s.q.GetPublishedPostBySlug(ctx, slug)
	if errors.Is(err, sql.ErrNoRows) {
		return Post{}, ErrNotFound
	}
	if err != nil {
		return Post{}, err
	}
	idx, err := s.topicIndex(ctx)
	if err != nil {
		return Post{}, err
	}
	sums, err := s.summaries(ctx, []store.Post{row}, lang, idx)
	if err != nil {
		return Post{}, err
	}
	if len(sums) == 0 {
		return Post{}, ErrNotFound
	}
	trs, err := s.q.ListPostTranslations(ctx, row.ID)
	if err != nil {
		return Post{}, err
	}
	byLang := map[Lang]store.PostTranslation{}
	for _, tr := range trs {
		byLang[Lang(tr.Lang)] = tr
	}
	tr, _, _ := pick(byLang, lang)
	return Post{
		PostSummary:    sums[0],
		BodyMarkdown:   tr.BodyMarkdown,
		ReadingMinutes: ReadingMinutes(tr.BodyMarkdown),
	}, nil
}

// ReadingMinutes schätzt die Lesezeit bei 200 Wörtern pro Minute, mindestens eine Minute.
func ReadingMinutes(text string) int {
	words := len(strings.FieldsFunc(text, func(r rune) bool { return unicode.IsSpace(r) }))
	return max(1, int(math.Ceil(float64(words)/200)))
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

// pick wählt die Übersetzung in der gewünschten Sprache. Fehlt sie, folgt Deutsch, dann jede
// weitere Sprache. Die tatsächlich gewählte Sprache wird mitgeliefert (Anforderung 7).
func pick[T any](m map[Lang]T, want Lang) (T, Lang, bool) {
	for _, l := range append([]Lang{want}, Langs...) {
		if v, ok := m[l]; ok {
			return v, l, true
		}
	}
	var zero T
	return zero, "", false
}

func langsOf[T any](m map[Lang]T) []Lang {
	out := make([]Lang, 0, len(m))
	for _, l := range Langs {
		if _, ok := m[l]; ok {
			out = append(out, l)
		}
	}
	return out
}

type topicIndex struct {
	order []int64
	slug  map[int64]string
	trans map[int64]map[Lang]store.TopicTranslation
}

func (s *Public) topicIndex(ctx context.Context) (topicIndex, error) {
	topics, err := s.q.ListTopics(ctx)
	if err != nil {
		return topicIndex{}, err
	}
	trs, err := s.q.ListTopicTranslations(ctx)
	if err != nil {
		return topicIndex{}, err
	}
	idx := topicIndex{slug: map[int64]string{}, trans: map[int64]map[Lang]store.TopicTranslation{}}
	for _, t := range topics {
		idx.order = append(idx.order, t.ID)
		idx.slug[t.ID] = t.Slug
		idx.trans[t.ID] = map[Lang]store.TopicTranslation{}
	}
	for _, tr := range trs {
		if m, ok := idx.trans[tr.TopicID]; ok {
			m[Lang(tr.Lang)] = tr
		}
	}
	return idx, nil
}

func (idx topicIndex) ref(id int64, lang Lang) TopicRef {
	tr, l, _ := pick(idx.trans[id], lang)
	return TopicRef{Slug: idx.slug[id], Lang: l, Title: tr.Title, Label: tr.Label}
}

func (idx topicIndex) topic(id int64, lang Lang) Topic {
	tr, _, _ := pick(idx.trans[id], lang)
	return Topic{
		TopicRef:     idx.ref(id, lang),
		Summary:      tr.Summary,
		Intro:        tr.Intro,
		Translations: langsOf(idx.trans[id]),
	}
}

// summaries ergänzt Beitragszeilen um Übersetzung, Themen und Titelbild.
func (s *Public) summaries(ctx context.Context, rows []store.Post, lang Lang, idx topicIndex) ([]PostSummary, error) {
	if len(rows) == 0 {
		return []PostSummary{}, nil
	}
	ids := make([]int64, 0, len(rows))
	var mediaIDs []int64
	for _, r := range rows {
		ids = append(ids, r.ID)
		if r.CoverMediaID.Valid {
			mediaIDs = append(mediaIDs, r.CoverMediaID.Int64)
		}
	}

	trs, err := s.q.ListPostTranslationSummaries(ctx, ids)
	if err != nil {
		return nil, err
	}
	trans := map[int64]map[Lang]store.ListPostTranslationSummariesRow{}
	for _, tr := range trs {
		if trans[tr.PostID] == nil {
			trans[tr.PostID] = map[Lang]store.ListPostTranslationSummariesRow{}
		}
		trans[tr.PostID][Lang(tr.Lang)] = tr
	}

	links, err := s.q.ListPostTopics(ctx, ids)
	if err != nil {
		return nil, err
	}
	topics := map[int64][]TopicRef{}
	for _, l := range links {
		topics[l.PostID] = append(topics[l.PostID], idx.ref(l.TopicID, lang))
	}

	images, err := s.images(ctx, mediaIDs)
	if err != nil {
		return nil, err
	}

	out := make([]PostSummary, 0, len(rows))
	for _, r := range rows {
		tr, l, ok := pick(trans[r.ID], lang)
		if !ok || !r.PublishedAt.Valid {
			continue // ohne Text oder Datum nicht darstellbar
		}
		ps := PostSummary{
			ID:           r.ID,
			Slug:         r.Slug,
			Lang:         l,
			Title:        tr.Title,
			Summary:      tr.Summary,
			PublishedAt:  parseTime(r.PublishedAt.String),
			UpdatedAt:    parseTime(r.UpdatedAt),
			Featured:     r.Featured,
			Topics:       topics[r.ID],
			Translations: langsOf(trans[r.ID]),
		}
		if ps.Topics == nil {
			ps.Topics = []TopicRef{}
		}
		if r.CoverMediaID.Valid {
			if img, ok := images[r.CoverMediaID.Int64]; ok {
				// Alternativtext in der Sprache des Beitrags, sonst Rückfall
				img := img(l)
				ps.Cover = &img
			}
		}
		out = append(out, ps)
	}
	return out, nil
}

// images liefert je Bild eine Funktion, die das Bild mit Alternativtext in einer Sprache baut.
func (s *Public) images(ctx context.Context, ids []int64) (map[int64]func(Lang) Image, error) {
	out := map[int64]func(Lang) Image{}
	if len(ids) == 0 {
		return out, nil
	}
	rows, err := s.q.ListMedia(ctx, ids)
	if err != nil {
		return nil, err
	}
	trs, err := s.q.ListMediaTranslations(ctx, ids)
	if err != nil {
		return nil, err
	}
	alts := map[int64]map[Lang]string{}
	for _, tr := range trs {
		if alts[tr.MediaID] == nil {
			alts[tr.MediaID] = map[Lang]string{}
		}
		alts[tr.MediaID][Lang(tr.Lang)] = tr.AltText
	}
	for _, m := range rows {
		out[m.ID] = func(l Lang) Image {
			alt, altLang, _ := pick(alts[m.ID], l)
			return Image{
				Src:     media.URL(m.StorageKey, m.MimeType, "960"),
				Srcset:  media.Srcset(m.StorageKey, m.MimeType),
				OGImage: media.URL(m.StorageKey, m.MimeType, "og"),
				Width:   int(m.Width),
				Height:  int(m.Height),
				Alt:     alt,
				AltLang: altLang,
			}
		}
	}
	return out, nil
}

func parseTime(s string) time.Time {
	for _, layout := range []string{time.RFC3339Nano, "2006-01-02 15:04:05", "2006-01-02"} {
		if t, err := time.Parse(layout, s); err == nil {
			return t.UTC()
		}
	}
	return time.Time{}
}
