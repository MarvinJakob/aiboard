// Package auth enthält Passwort-Hashing, Sitzungs-Tokens und die Begrenzung von Anmeldeversuchen
// (ARCHITECTURE.md, Abschnitt 4, Sicherheit).
package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/argon2"
)

// Parameter für Argon2id nach der Empfehlung der OWASP (19 MiB, 2 Durchläufe, 1 Thread) mit etwas mehr Speicher.
const (
	argonTime    uint32 = 2
	argonMemory  uint32 = 64 * 1024
	argonThreads uint8  = 1
	argonKeyLen  uint32 = 32
	saltLen             = 16
)

// CookieName ist der Name des Sitzungscookies der Redaktion.
const CookieName = "ki_session"

// MinPasswordLength ist die Mindestlänge für Passwörter.
const MinPasswordLength = 10

var b64 = base64.RawStdEncoding

// HashPassword erzeugt einen Argon2id-Hash im üblichen PHC-Format
// ($argon2id$v=19$m=…,t=…,p=…$salt$hash).
func HashPassword(password string) (string, error) {
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	key := argon2.IDKey([]byte(password), salt, argonTime, argonMemory, argonThreads, argonKeyLen)
	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argonMemory, argonTime, argonThreads, b64.EncodeToString(salt), b64.EncodeToString(key)), nil
}

var errBadHash = errors.New("ungültiger passwort-hash")

// VerifyPassword vergleicht ein Passwort in konstanter Zeit mit einem Hash aus HashPassword.
func VerifyPassword(encoded, password string) bool {
	ok, err := verify(encoded, password)
	return err == nil && ok
}

func verify(encoded, password string) (bool, error) {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false, errBadHash
	}
	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return false, errBadHash
	}
	var (
		memory, iterations uint32
		threads            uint8
	)
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &threads); err != nil {
		return false, errBadHash
	}
	salt, err := b64.DecodeString(parts[4])
	if err != nil {
		return false, errBadHash
	}
	want, err := b64.DecodeString(parts[5])
	if err != nil || len(want) == 0 {
		return false, errBadHash
	}
	got := argon2.IDKey([]byte(password), salt, iterations, memory, threads, uint32(len(want)))
	return subtle.ConstantTimeCompare(got, want) == 1, nil
}

// dummyHash wird geprüft, wenn es zu einer E-Mail-Adresse kein Konto gibt. So dauert die Antwort
// gleich lang, und die Antwortzeit verrät nicht, ob ein Konto existiert.
var dummyHash, _ = HashPassword("kein-konto-vorhanden")

// SpendTime prüft ein Passwort gegen einen Platzhalter-Hash.
func SpendTime(password string) { _ = VerifyPassword(dummyHash, password) }

// NewToken erzeugt einen zufälligen Wert mit 256 Bit für Sitzungs-Cookies und CSRF-Tokens.
func NewToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// HashToken liefert den SHA-256-Hash eines Tokens. Die Datenbank speichert nur diesen Hash.
func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

// EqualTokens vergleicht zwei Tokens in konstanter Zeit.
func EqualTokens(a, b string) bool {
	return a != "" && subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

// Limiter begrenzt fehlgeschlagene Anmeldeversuche je Schlüssel (IP-Adresse) in einem Zeitfenster.
// Die Zähler liegen nur im Arbeitsspeicher (ARCHITECTURE.md, Abschnitt 11).
type Limiter struct {
	mu     sync.Mutex
	max    int
	window time.Duration
	now    func() time.Time
	hits   map[string]*window
}

type window struct {
	start time.Time
	count int
}

// NewLimiter erlaubt max Fehlversuche je Zeitfenster.
func NewLimiter(max int, w time.Duration) *Limiter {
	return &Limiter{max: max, window: w, now: time.Now, hits: map[string]*window{}}
}

// Allowed meldet, ob für key noch ein Versuch erlaubt ist.
func (l *Limiter) Allowed(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	w, ok := l.hits[key]
	if !ok {
		return true
	}
	if l.now().Sub(w.start) >= l.window {
		delete(l.hits, key)
		return true
	}
	return w.count < l.max
}

// Fail zählt einen Fehlversuch.
func (l *Limiter) Fail(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := l.now()
	w, ok := l.hits[key]
	if !ok || now.Sub(w.start) >= l.window {
		w = &window{start: now}
		l.hits[key] = w
	}
	w.count++
	// Alte Einträge gelegentlich entfernen, damit der Speicher nicht wächst.
	if len(l.hits) > 10_000 {
		for k, v := range l.hits {
			if now.Sub(v.start) >= l.window {
				delete(l.hits, k)
			}
		}
	}
}

// Reset setzt den Zähler nach einer erfolgreichen Anmeldung zurück.
func (l *Limiter) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.hits, key)
}
