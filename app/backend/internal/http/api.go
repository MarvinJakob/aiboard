// Package httpserver enthält Handler, Routing und Middleware.
package httpserver

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/audit"
	"ki-web/backend/internal/auth"
	"ki-web/backend/internal/media"
	"ki-web/backend/internal/service"
)

// apiServer setzt das aus openapi.yaml erzeugte StrictServerInterface um.
type apiServer struct {
	svc           *service.Public
	audit         *audit.Catalog
	accounts      *service.Accounts
	editorial     *service.Editorial
	media         *media.Store
	limiter       *auth.Limiter
	secureCookies bool
	log           *slog.Logger
}

var _ api.StrictServerInterface = (*apiServer)(nil)

func langOf(p *api.Lang) service.Lang {
	if p == nil {
		return service.DE
	}
	return service.Lang(*p)
}

// validLang lehnt Sprachen ab, die nicht im Vertrag stehen.
func validLang(p *api.Lang) bool { return p == nil || p.Valid() }

const msgBadLang = "Unbekannte Sprache. Erlaubt sind de und en."

func (s *apiServer) GetHealth(ctx context.Context, _ api.GetHealthRequestObject) (api.GetHealthResponseObject, error) {
	if err := s.svc.Health(ctx); err != nil {
		s.log.Error("health: datenbank nicht erreichbar", "fehler", err)
		return api.GetHealth503JSONResponse{Status: "unavailable", Database: "unavailable"}, nil
	}
	return api.GetHealth200JSONResponse{Status: "ok", Database: "ok"}, nil
}

func (s *apiServer) ListTopics(ctx context.Context, req api.ListTopicsRequestObject) (api.ListTopicsResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.ListTopics400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	topics, err := s.svc.Topics(ctx, langOf(req.Params.Lang))
	if err != nil {
		return nil, err
	}
	out := make([]api.Topic, 0, len(topics))
	for _, t := range topics {
		out = append(out, toTopic(t))
	}
	return api.ListTopics200JSONResponse{Items: out}, nil
}

func (s *apiServer) GetTopic(ctx context.Context, req api.GetTopicRequestObject) (api.GetTopicResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.GetTopic400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	t, err := s.svc.Topic(ctx, req.Slug, langOf(req.Params.Lang))
	if errors.Is(err, service.ErrNotFound) {
		return api.GetTopic404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: "Thema nicht gefunden."}}, nil
	}
	if err != nil {
		return nil, err
	}
	base := toTopic(t.Topic)
	return api.GetTopic200JSONResponse{
		Slug: base.Slug, Lang: base.Lang, Title: base.Title, Label: base.Label,
		Summary: base.Summary, Intro: base.Intro, PostCount: base.PostCount,
		Translations: toLangs(t.Translations),
		Posts:        toSummaries(t.Posts),
	}, nil
}

func (s *apiServer) ListPosts(ctx context.Context, req api.ListPostsRequestObject) (api.ListPostsResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.ListPosts400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	lang := langOf(req.Params.Lang)
	var (
		posts []service.PostSummary
		err   error
	)
	if req.Params.Featured != nil && *req.Params.Featured {
		posts, err = s.svc.FeaturedPosts(ctx, lang)
	} else {
		posts, err = s.svc.Posts(ctx, lang)
	}
	if err != nil {
		return nil, err
	}
	return api.ListPosts200JSONResponse{Items: toSummaries(posts)}, nil
}

func (s *apiServer) GetPost(ctx context.Context, req api.GetPostRequestObject) (api.GetPostResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.GetPost400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	p, err := s.svc.Post(ctx, req.Slug, langOf(req.Params.Lang))
	if errors.Is(err, service.ErrNotFound) {
		// Entwürfe und unbekannte Beiträge sind nicht unterscheidbar (Anforderung 4).
		return api.GetPost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: "Beitrag nicht gefunden."}}, nil
	}
	if err != nil {
		return nil, err
	}
	sum := toSummary(p.PostSummary)
	return api.GetPost200JSONResponse{
		Slug: sum.Slug, Lang: sum.Lang, Title: sum.Title, Summary: sum.Summary,
		PublishedAt: sum.PublishedAt, Featured: sum.Featured, Topics: sum.Topics,
		Translations: sum.Translations, Cover: sum.Cover,
		BodyMarkdown: p.BodyMarkdown, ReadingMinutes: p.ReadingMinutes, UpdatedAt: p.UpdatedAt,
	}, nil
}

func (s *apiServer) GetAudit(_ context.Context, req api.GetAuditRequestObject) (api.GetAuditResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.GetAudit400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	o := s.audit.Overview(langOf(req.Params.Lang))
	levels := make([]api.AuditLevelInfo, 0, len(o.Levels))
	for _, l := range o.Levels {
		levels = append(levels, api.AuditLevelInfo{Level: l.Level, Name: l.Name, Motto: l.Motto})
	}
	dims := make([]api.AuditDimensionSummary, 0, len(o.Dimensions))
	for _, d := range o.Dimensions {
		dims = append(dims, api.AuditDimensionSummary{
			Slug: d.Slug, Lang: api.Lang(d.Lang), Title: d.Title, Summary: d.Summary, Category: api.AuditCategory(d.Category),
		})
	}
	return api.GetAudit200JSONResponse{
		Lang: api.Lang(o.Lang), Translations: toLangs(o.Translations), Intro: o.Intro, Levels: levels, Dimensions: dims,
	}, nil
}

func (s *apiServer) GetAuditDimension(_ context.Context, req api.GetAuditDimensionRequestObject) (api.GetAuditDimensionResponseObject, error) {
	if !validLang(req.Params.Lang) {
		return api.GetAuditDimension400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgBadLang}}, nil
	}
	d, err := s.audit.Dimension(req.Slug, langOf(req.Params.Lang))
	if errors.Is(err, service.ErrNotFound) {
		return api.GetAuditDimension404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: "Dimension nicht gefunden."}}, nil
	}
	if err != nil {
		return nil, err
	}
	levels := make([]api.AuditLevel, 0, len(d.Levels))
	for _, l := range d.Levels {
		levels = append(levels, toAuditLevel(l))
	}
	return api.GetAuditDimension200JSONResponse{
		Slug: d.Slug, Lang: api.Lang(d.Lang), Title: d.Title, Summary: d.Summary, Category: api.AuditCategory(d.Category),
		Translations: toLangs(d.Translations), Intro: d.Intro, Benefits: d.Benefits,
		NotApplied: toAuditLevel(d.NotApplied), Levels: levels,
	}, nil
}

// ---------------------------------------------------------------------------
// Abbildung Fachmodell -> API-Modell
// ---------------------------------------------------------------------------

func toAuditLevel(l audit.Level) api.AuditLevel {
	qs := make([]api.AuditQuestion, 0, len(l.Questions))
	for _, q := range l.Questions {
		qs = append(qs, api.AuditQuestion{Id: q.ID, Text: q.Text, Conditional: q.Conditional})
	}
	return api.AuditLevel{Level: l.Level, Name: l.Name, Description: l.Description, Questions: qs}
}

func toLangs(ls []service.Lang) []api.Lang {
	out := make([]api.Lang, 0, len(ls))
	for _, l := range ls {
		out = append(out, api.Lang(l))
	}
	return out
}

func toTopicRef(t service.TopicRef) api.TopicRef {
	return api.TopicRef{Slug: t.Slug, Lang: api.Lang(t.Lang), Title: t.Title, Label: t.Label}
}

func toTopic(t service.Topic) api.Topic {
	return api.Topic{
		Slug: t.Slug, Lang: api.Lang(t.Lang), Title: t.Title, Label: t.Label,
		Summary: t.Summary, Intro: t.Intro, PostCount: t.PostCount,
	}
}

func toSummary(p service.PostSummary) api.PostSummary {
	topics := make([]api.TopicRef, 0, len(p.Topics))
	for _, t := range p.Topics {
		topics = append(topics, toTopicRef(t))
	}
	out := api.PostSummary{
		Slug: p.Slug, Lang: api.Lang(p.Lang), Title: p.Title, Summary: p.Summary,
		PublishedAt: p.PublishedAt, Featured: p.Featured, Topics: topics,
		Translations: toLangs(p.Translations),
	}
	if p.Cover != nil {
		altLang := api.Lang(p.Cover.AltLang)
		out.Cover = &api.Image{
			Src: p.Cover.Src, Srcset: p.Cover.Srcset, Width: p.Cover.Width, Height: p.Cover.Height,
			Alt: p.Cover.Alt, AltLang: &altLang,
		}
	}
	return out
}

func toSummaries(ps []service.PostSummary) []api.PostSummary {
	out := make([]api.PostSummary, 0, len(ps))
	for _, p := range ps {
		out = append(out, toSummary(p))
	}
	return out
}

// registerAPI baut den API-Handler und registriert ihn am Router.
func registerAPI(mux *http.ServeMux, srv *apiServer, log *slog.Logger) {
	strict := api.NewStrictHandlerWithOptions(srv, nil, api.StrictHTTPServerOptions{
		RequestErrorHandlerFunc: func(w http.ResponseWriter, _ *http.Request, err error) {
			writeJSONError(w, http.StatusBadRequest, "Ungültige Anfrage.")
		},
		ResponseErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			log.Error("api-fehler", "pfad", r.URL.Path, "fehler", err)
			writeJSONError(w, http.StatusInternalServerError, "Interner Fehler.")
		},
	})
	api.HandlerWithOptions(strict, api.StdHTTPServerOptions{
		BaseRouter: mux,
		ErrorHandlerFunc: func(w http.ResponseWriter, _ *http.Request, err error) {
			writeJSONError(w, http.StatusBadRequest, "Ungültige Anfrage.")
		},
	})
	// Unbekannte API-Pfade liefern JSON statt der Webseite.
	for _, m := range []string{"GET", "POST", "PUT", "PATCH", "DELETE"} {
		mux.HandleFunc(m+" /api/", func(w http.ResponseWriter, _ *http.Request) {
			writeJSONError(w, http.StatusNotFound, "Unbekannter Endpunkt.")
		})
	}
}

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(`{"message":"` + msg + `"}`))
}
