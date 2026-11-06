package httpserver

import (
	"context"
	"errors"

	"ki-web/backend/internal/api"
	"ki-web/backend/internal/service"
)

// Handler für /api/admin/users (Anforderung 11). Nur Admin-Konten erreichen sie; das prüft guard vorab.

func toUserAPI(u service.User) api.User {
	return api.User{Id: u.ID, Email: u.Email, Role: api.Role(u.Role), Active: u.Active, CreatedAt: u.CreatedAt}
}

func (s *apiServer) AdminListUsers(ctx context.Context, _ api.AdminListUsersRequestObject) (api.AdminListUsersResponseObject, error) {
	users, err := s.accounts.Users(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]api.User, 0, len(users))
	for _, u := range users {
		out = append(out, toUserAPI(u))
	}
	return api.AdminListUsers200JSONResponse{Items: out}, nil
}

// AdminCreateUser legt ein Redaktionskonto mit Rolle editor an. Weitere Admin-Konten entstehen nur über
// `server user create` (ARCHITECTURE.md, Abschnitt 5).
func (s *apiServer) AdminCreateUser(ctx context.Context, req api.AdminCreateUserRequestObject) (api.AdminCreateUserResponseObject, error) {
	if req.Body == nil {
		return api.AdminCreateUser400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	u, err := s.accounts.CreateUser(ctx, req.Body.Email, req.Body.Password, service.RoleEditor)
	var verr *service.ValidationError
	switch {
	case errors.Is(err, service.ErrEmailTaken):
		return api.AdminCreateUser409JSONResponse{ConflictJSONResponse: api.ConflictJSONResponse{
			Message: "Für diese E-Mail-Adresse gibt es bereits ein Konto. Ein deaktiviertes Konto lässt sich in der Liste reaktivieren.",
		}}, nil
	case errors.As(err, &verr):
		return api.AdminCreateUser422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{Message: verr.Msg}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminCreateUser201JSONResponse(toUserAPI(u)), nil
}

func (s *apiServer) AdminUpdateUser(ctx context.Context, req api.AdminUpdateUserRequestObject) (api.AdminUpdateUserResponseObject, error) {
	if req.Body == nil {
		return api.AdminUpdateUser400JSONResponse{BadRequestJSONResponse: api.BadRequestJSONResponse{Message: msgNoBody}}, nil
	}
	actor, _ := identityFrom(ctx)
	u, err := s.accounts.SetActive(ctx, actor.UserID, req.Id, req.Body.Active)
	switch {
	case errors.Is(err, service.ErrNotFound):
		return api.AdminUpdateUser404JSONResponse{NotFoundJSONResponse: api.NotFoundJSONResponse{Message: "Konto nicht gefunden."}}, nil
	case errors.Is(err, service.ErrSelf):
		return api.AdminUpdateUser422JSONResponse{UnprocessableJSONResponse: api.UnprocessableJSONResponse{
			Message: "Das eigene Konto lässt sich nicht deaktivieren.",
		}}, nil
	case err != nil:
		return nil, err
	}
	return api.AdminUpdateUser200JSONResponse(toUserAPI(u)), nil
}
