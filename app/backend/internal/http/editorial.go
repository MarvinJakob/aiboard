package httpserver

import (
	"context"
	"errors"
	"io"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/media"
	"ki-web/backend/internal/service"
)

// Handler für /api/admin/posts (Anforderung 5). Sitzung, Rolle und CSRF-Token prüft guard vorab.

const (
	msgPostNotFound = "Beitrag nicht gefunden."
	msgSlugTaken    = "Dieses URL-Kürzel nutzt bereits ein anderer Beitrag. Bitte ein anderes wählen."
	msgNoBody       = "Ungültige Anfrage."
)

func (s *apiServer) AdminListPosts(ctx context.Context, _ api.AdminListPostsRequestObject) (api.AdminListPostsResponseObject, error) {
	posts, err := s.editorial.Posts(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]api.EditorPostSummary, 0, len(posts))
	for _, p := range posts {
		out = append(out, api.EditorPostSummary{
			Id: p.ID, Slug: p.Slug, Status: api.PostStatus(p.Status), Title: p.Title, Featured: p.Featured,
			Topics: p.Topics, Translations: toLangs(p.Translations), PublishedAt: p.PublishedAt, ScheduledAt: p.ScheduledAt,
			UpdatedAt: p.UpdatedAt,
		})
	}
	return api.AdminListPosts200JSONResponse{Items: out}, nil
}

func (s *apiServer) AdminCreatePost(ctx context.Context, req api.AdminCreatePostRequestObject) (api.AdminCreatePostResponseObject, error) {
	if req.Body == nil {
		return api.AdminCreatePost400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	p, err := s.editorial.Create(ctx, fromPostInput(*req.Body))
	var verr *service.ValidationError
	switch {
	case errors.As(err, &verr):
		return api.AdminCreatePost422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: verr.Msg}}, nil
	case errors.Is(err, service.ErrSlugTaken):
		return api.AdminCreatePost409JSONResponse{ConflictJSONResponse: api.ConflictJSONResponse{Message: msgSlugTaken}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminCreatePost201JSONResponse(toEditorPost(p)), nil
}

func (s *apiServer) AdminGetPost(ctx context.Context, req api.AdminGetPostRequestObject) (api.AdminGetPostResponseObject, error) {
	p, err := s.editorial.Post(ctx, req.Id)
	if errors.Is(err, service.ErrNotFound) {
		return api.AdminGetPost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	}
	if err != nil {
		return nil, err
	}
	return api.AdminGetPost200JSONResponse(toEditorPost(p)), nil
}

func (s *apiServer) AdminUpdatePost(ctx context.Context, req api.AdminUpdatePostRequestObject) (api.AdminUpdatePostResponseObject, error) {
	if req.Body == nil {
		return api.AdminUpdatePost400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	p, err := s.editorial.Update(ctx, req.Id, fromPostInput(*req.Body))
	var verr *service.ValidationError
	switch {
	case errors.Is(err, service.ErrNotFound):
		return api.AdminUpdatePost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	case errors.As(err, &verr):
		return api.AdminUpdatePost422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: verr.Msg}}, nil
	case errors.Is(err, service.ErrSlugTaken):
		return api.AdminUpdatePost409JSONResponse{ConflictJSONResponse: api.ConflictJSONResponse{Message: msgSlugTaken}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminUpdatePost200JSONResponse(toEditorPost(p)), nil
}

func (s *apiServer) AdminPublishPost(ctx context.Context, req api.AdminPublishPostRequestObject) (api.AdminPublishPostResponseObject, error) {
	p, err := s.editorial.Publish(ctx, req.Id)
	var verr *service.ValidationError
	switch {
	case errors.Is(err, service.ErrNotFound):
		return api.AdminPublishPost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	case errors.As(err, &verr):
		return api.AdminPublishPost422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: verr.Msg}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminPublishPost200JSONResponse(toEditorPost(p)), nil
}

func (s *apiServer) AdminUnpublishPost(ctx context.Context, req api.AdminUnpublishPostRequestObject) (api.AdminUnpublishPostResponseObject, error) {
	p, err := s.editorial.Unpublish(ctx, req.Id)
	if errors.Is(err, service.ErrNotFound) {
		return api.AdminUnpublishPost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	}
	if err != nil {
		return nil, err
	}
	return api.AdminUnpublishPost200JSONResponse(toEditorPost(p)), nil
}

// AdminSchedulePost plant die automatische Veröffentlichung (Ticket #23).
func (s *apiServer) AdminSchedulePost(ctx context.Context, req api.AdminSchedulePostRequestObject) (api.AdminSchedulePostResponseObject, error) {
	if req.Body == nil {
		return api.AdminSchedulePost400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	p, err := s.editorial.Schedule(ctx, req.Id, req.Body.PublishAt)
	var verr *service.ValidationError
	switch {
	case errors.Is(err, service.ErrNotFound):
		return api.AdminSchedulePost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	case errors.As(err, &verr):
		return api.AdminSchedulePost422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: verr.Msg}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminSchedulePost200JSONResponse(toEditorPost(p)), nil
}

// AdminUnschedulePost entfernt den geplanten Zeitpunkt.
func (s *apiServer) AdminUnschedulePost(ctx context.Context, req api.AdminUnschedulePostRequestObject) (api.AdminUnschedulePostResponseObject, error) {
	p, err := s.editorial.Unschedule(ctx, req.Id)
	if errors.Is(err, service.ErrNotFound) {
		return api.AdminUnschedulePost404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	}
	if err != nil {
		return nil, err
	}
	return api.AdminUnschedulePost200JSONResponse(toEditorPost(p)), nil
}

func fromPostInput(in api.PostInput) service.PostInput {
	out := service.PostInput{Featured: in.Featured, Topics: in.Topics}
	if in.Slug != nil {
		out.Slug = *in.Slug
	}
	for _, t := range in.Texts {
		pt := service.PostText{Lang: service.Lang(t.Lang), Title: t.Title, Summary: t.Summary, BodyMarkdown: t.BodyMarkdown}
		if t.CoverAlt != nil {
			pt.CoverAlt = *t.CoverAlt
		}
		out.Texts = append(out.Texts, pt)
	}
	return out
}

func toEditorPost(p service.EditorPost) api.EditorPost {
	texts := make([]api.PostText, 0, len(p.Texts))
	for _, t := range p.Texts {
		pt := api.PostText{Lang: api.Lang(t.Lang), Title: t.Title, Summary: t.Summary, BodyMarkdown: t.BodyMarkdown}
		if t.CoverAlt != "" {
			pt.CoverAlt = &t.CoverAlt
		}
		texts = append(texts, pt)
	}
	out := api.EditorPost{
		Id: p.ID, Slug: p.Slug, Status: api.PostStatus(p.Status), Featured: p.Featured,
		Topics: p.Topics, Texts: texts, PublishedAt: p.PublishedAt, ScheduledAt: p.ScheduledAt, UpdatedAt: p.UpdatedAt,
	}
	if c := p.Cover; c != nil {
		alt := ""
		for _, t := range p.Texts {
			if t.CoverAlt != "" {
				alt = t.CoverAlt
				break
			}
		}
		out.Cover = &api.Image{
			Src: media.URL(c.Key, c.MimeType, "960"), Srcset: media.Srcset(c.Key, c.MimeType),
			Width: c.Width, Height: c.Height, Alt: alt,
		}
	}
	return out
}

// Titelbild (Ticket #25). Sitzung, Rolle und CSRF-Token prüft guard vorab.

const msgNoMedia = "Bild-Upload ist auf diesem Server nicht eingerichtet."

// AdminSetPostCover nimmt ein Bild aus dem Feld „file“ entgegen, speichert die Varianten und macht
// es zum Titelbild. Bei einem Fehler nach dem Speichern werden die neuen Dateien wieder gelöscht.
func (s *apiServer) AdminSetPostCover(ctx context.Context, req api.AdminSetPostCoverRequestObject) (api.AdminSetPostCoverResponseObject, error) {
	if s.media == nil {
		return nil, errors.New(msgNoMedia)
	}
	if _, err := s.editorial.Post(ctx, req.Id); errors.Is(err, service.ErrNotFound) {
		return api.AdminSetPostCover404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	} else if err != nil {
		return nil, err
	}
	if req.Body == nil {
		return api.AdminSetPostCover400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	var stored media.Stored
	found := false
	for {
		part, err := req.Body.NextPart()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return api.AdminSetPostCover400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
		}
		if part.FormName() != "file" {
			continue
		}
		found = true
		stored, err = s.media.Save(part)
		var uerr *media.UploadError
		if errors.As(err, &uerr) {
			return api.AdminSetPostCover422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: uerr.Msg}}, nil
		}
		if err != nil {
			return nil, err
		}
		break
	}
	if !found {
		return api.AdminSetPostCover422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: "Bitte eine Bilddatei auswählen."}}, nil
	}
	p, old, err := s.editorial.SetCover(ctx, req.Id, stored)
	if err != nil {
		s.removeMedia(stored.Key, stored.MimeType)
		if errors.Is(err, service.ErrNotFound) {
			return api.AdminSetPostCover404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
		}
		return nil, err
	}
	if old != nil {
		s.removeMedia(old.Key, old.MimeType)
	}
	return api.AdminSetPostCover200JSONResponse(toEditorPost(p)), nil
}

// AdminDeletePostCover entfernt das Titelbild samt Dateien.
func (s *apiServer) AdminDeletePostCover(ctx context.Context, req api.AdminDeletePostCoverRequestObject) (api.AdminDeletePostCoverResponseObject, error) {
	p, old, err := s.editorial.RemoveCover(ctx, req.Id)
	if errors.Is(err, service.ErrNotFound) {
		return api.AdminDeletePostCover404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: msgPostNotFound}}, nil
	}
	if err != nil {
		return nil, err
	}
	if old != nil {
		s.removeMedia(old.Key, old.MimeType)
	}
	return api.AdminDeletePostCover200JSONResponse(toEditorPost(p)), nil
}

func (s *apiServer) removeMedia(key, mimeType string) {
	if s.media == nil {
		return
	}
	if err := s.media.Remove(key, mimeType); err != nil {
		s.log.Warn("bilddateien löschen", "schlüssel", key, "fehler", err)
	}
}
