package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"ki-web/backend/internal/auth"
	"ki-web/backend/internal/store"
)

// Role ist die Rolle eines Redaktionskontos (ARCHITECTURE.md, Abschnitt 4).
type Role string

const (
	RoleEditor Role = "editor"
	RoleAdmin  Role = "admin"
)

// ParseRole prüft eine Rollenangabe.
func ParseRole(s string) (Role, bool) {
	switch Role(s) {
	case RoleEditor, RoleAdmin:
		return Role(s), true
	}
	return "", false
}

// CanEdit meldet, ob die Rolle Beiträge verwalten darf. Admin-Konten dürfen das ebenfalls.
func (r Role) CanEdit() bool { return r == RoleEditor || r == RoleAdmin }

// CanManageUsers meldet, ob die Rolle die Benutzerverwaltung nutzen darf.
func (r Role) CanManageUsers() bool { return r == RoleAdmin }

// SessionTTL ist die Gültigkeit einer Sitzung ab der Anmeldung.
const SessionTTL = 12 * time.Hour

var (
	// ErrInvalidCredentials gilt für unbekannte E-Mail-Adressen, falsche Passwörter und deaktivierte
	// Konten gleichermaßen, damit die Antwort nicht verrät, welche Konten es gibt.
	ErrInvalidCredentials = errors.New("anmeldedaten ungültig")
	// ErrUnauthenticated bedeutet: keine, abgelaufene oder entzogene Sitzung.
	ErrUnauthenticated = errors.New("nicht angemeldet")
	// ErrEmailTaken bedeutet: Es gibt bereits ein Konto mit dieser E-Mail-Adresse.
	ErrEmailTaken = errors.New("e-mail-adresse bereits vergeben")
	// ErrSelf bedeutet: Das eigene Konto lässt sich nicht deaktivieren.
	ErrSelf = errors.New("eigenes konto")
)

// ValidationError beschreibt eine ungültige Eingabe in verständlichen Worten.
type ValidationError struct{ Msg string }

func (e *ValidationError) Error() string { return e.Msg }

func invalid(format string, args ...any) error {
	return &ValidationError{Msg: fmt.Sprintf(format, args...)}
}

// User ist ein Redaktionskonto ohne Passwort-Hash.
type User struct {
	ID        int64
	Email     string
	Role      Role
	Active    bool
	CreatedAt time.Time
}

// Identity ist die angemeldete Person einer gültigen Sitzung.
type Identity struct {
	UserID    int64
	Email     string
	Role      Role
	CSRFToken string
	SessionID string // Hash des Cookie-Werts
}

// Session ist eine neu angelegte Sitzung. Token ist der Wert für das Cookie.
type Session struct {
	Token     string
	ExpiresAt time.Time
	Identity  Identity
}

// Accounts verwaltet Konten und Sitzungen der Redaktion.
type Accounts struct {
	db  *sql.DB
	q   *store.Queries
	now func() time.Time
}

func NewAccounts(db *sql.DB) *Accounts {
	return &Accounts{db: db, q: store.New(db), now: time.Now}
}

func formatTime(t time.Time) string { return t.UTC().Format(time.RFC3339) }

// NormalizeEmail entfernt Leerzeichen und schreibt die Adresse klein.
func NormalizeEmail(s string) string { return strings.ToLower(strings.TrimSpace(s)) }

func validateEmail(email string) error {
	addr, err := mail.ParseAddress(email)
	if err != nil || addr.Address != email || !strings.Contains(email[strings.LastIndex(email, "@")+1:], ".") {
		return invalid("Bitte eine gültige E-Mail-Adresse angeben.")
	}
	return nil
}

func validatePassword(pw string) error {
	if len([]rune(pw)) < auth.MinPasswordLength {
		return invalid("Das Passwort muss mindestens %d Zeichen lang sein.", auth.MinPasswordLength)
	}
	if len(pw) > 1024 {
		return invalid("Das Passwort ist zu lang.")
	}
	return nil
}

// CreateUser legt ein aktives Konto an.
func (a *Accounts) CreateUser(ctx context.Context, email, password string, role Role) (User, error) {
	email = NormalizeEmail(email)
	if err := validateEmail(email); err != nil {
		return User{}, err
	}
	if err := validatePassword(password); err != nil {
		return User{}, err
	}
	if _, ok := ParseRole(string(role)); !ok {
		return User{}, invalid("Unbekannte Rolle.")
	}
	if _, err := a.q.GetUserByEmail(ctx, email); err == nil {
		return User{}, ErrEmailTaken
	} else if !errors.Is(err, sql.ErrNoRows) {
		return User{}, err
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return User{}, err
	}
	id, err := a.q.CreateUser(ctx, store.CreateUserParams{
		Email: email, PasswordHash: hash, Role: string(role), CreatedAt: formatTime(a.now()),
	})
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return User{}, ErrEmailTaken
		}
		return User{}, err
	}
	row, err := a.q.GetUserByID(ctx, id)
	if err != nil {
		return User{}, err
	}
	return toUser(row), nil
}

func toUser(r store.User) User {
	return User{ID: r.ID, Email: r.Email, Role: Role(r.Role), Active: r.Active, CreatedAt: parseTime(r.CreatedAt)}
}

// Login prüft E-Mail-Adresse und Passwort und legt eine neue Sitzung an.
func (a *Accounts) Login(ctx context.Context, email, password string) (Session, error) {
	row, err := a.q.GetUserByEmail(ctx, NormalizeEmail(email))
	if errors.Is(err, sql.ErrNoRows) {
		auth.SpendTime(password)
		return Session{}, ErrInvalidCredentials
	}
	if err != nil {
		return Session{}, err
	}
	if !auth.VerifyPassword(row.PasswordHash, password) || !row.Active {
		return Session{}, ErrInvalidCredentials
	}
	token, err := auth.NewToken()
	if err != nil {
		return Session{}, err
	}
	csrf, err := auth.NewToken()
	if err != nil {
		return Session{}, err
	}
	now := a.now()
	expires := now.Add(SessionTTL)
	id := auth.HashToken(token)
	if err := a.q.CreateSession(ctx, store.CreateSessionParams{
		ID: id, UserID: row.ID, CsrfToken: csrf, ExpiresAt: formatTime(expires), CreatedAt: formatTime(now),
	}); err != nil {
		return Session{}, err
	}
	return Session{
		Token:     token,
		ExpiresAt: expires,
		Identity:  Identity{UserID: row.ID, Email: row.Email, Role: Role(row.Role), CSRFToken: csrf, SessionID: id},
	}, nil
}

// Authenticate liefert die Person zu einem Sitzungs-Cookie. Abgelaufene Sitzungen und Sitzungen
// deaktivierter Konten sind ungültig. Rolle und Kontostatus werden bei jedem Aufruf neu gelesen.
func (a *Accounts) Authenticate(ctx context.Context, token string) (Identity, error) {
	if token == "" {
		return Identity{}, ErrUnauthenticated
	}
	id := auth.HashToken(token)
	row, err := a.q.GetSession(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return Identity{}, ErrUnauthenticated
	}
	if err != nil {
		return Identity{}, err
	}
	if !row.Active || !a.now().Before(parseTime(row.ExpiresAt)) {
		_ = a.q.DeleteSession(ctx, id)
		return Identity{}, ErrUnauthenticated
	}
	return Identity{UserID: row.UserID, Email: row.Email, Role: Role(row.Role), CSRFToken: row.CsrfToken, SessionID: id}, nil
}

// Logout löscht die Sitzung serverseitig.
func (a *Accounts) Logout(ctx context.Context, sessionID string) error {
	return a.q.DeleteSession(ctx, sessionID)
}

// CleanupSessions löscht abgelaufene Sitzungen und liefert ihre Anzahl.
func (a *Accounts) CleanupSessions(ctx context.Context) (int64, error) {
	return a.q.DeleteExpiredSessions(ctx, formatTime(a.now()))
}

// Users liefert alle Konten, sortiert nach E-Mail-Adresse.
func (a *Accounts) Users(ctx context.Context) ([]User, error) {
	rows, err := a.q.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]User, 0, len(rows))
	for _, r := range rows {
		out = append(out, toUser(r))
	}
	return out, nil
}

// SetActive deaktiviert oder reaktiviert ein Konto. Beim Deaktivieren werden in derselben Transaktion
// alle Sitzungen des Kontos gelöscht (Anforderung 11). Das eigene Konto lässt sich nicht deaktivieren.
func (a *Accounts) SetActive(ctx context.Context, actorID, userID int64, active bool) (User, error) {
	if !active && actorID == userID {
		return User{}, ErrSelf
	}
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return User{}, err
	}
	defer tx.Rollback()
	q := a.q.WithTx(tx)
	n, err := q.SetUserActive(ctx, store.SetUserActiveParams{Active: active, ID: userID})
	if err != nil {
		return User{}, err
	}
	if n == 0 {
		return User{}, ErrNotFound
	}
	if !active {
		if err := q.DeleteUserSessions(ctx, userID); err != nil {
			return User{}, err
		}
	}
	row, err := q.GetUserByID(ctx, userID)
	if err != nil {
		return User{}, err
	}
	if err := tx.Commit(); err != nil {
		return User{}, err
	}
	return toUser(row), nil
}
