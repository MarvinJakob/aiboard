package auth

import (
	"strings"
	"testing"
	"time"
)

func TestHashAndVerify(t *testing.T) {
	h, err := HashPassword("geheimes-passwort")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(h, "$argon2id$v=19$") || strings.Contains(h, "geheimes") {
		t.Fatalf("unerwarteter Hash %q", h)
	}
	if !VerifyPassword(h, "geheimes-passwort") {
		t.Error("richtiges Passwort abgelehnt")
	}
	for _, wrong := range []string{"", "geheimes-passwor", "Geheimes-passwort"} {
		if VerifyPassword(h, wrong) {
			t.Errorf("falsches Passwort %q akzeptiert", wrong)
		}
	}
	h2, _ := HashPassword("geheimes-passwort")
	if h == h2 {
		t.Error("gleicher Hash trotz zufälligem Salt")
	}
	for _, bad := range []string{"", "klartext", "$argon2id$v=19$m=1,t=1,p=1$$"} {
		if VerifyPassword(bad, "x") {
			t.Errorf("ungültiger Hash %q akzeptiert", bad)
		}
	}
}

func TestTokens(t *testing.T) {
	a, _ := NewToken()
	b, _ := NewToken()
	if a == b || len(a) < 40 {
		t.Fatalf("Tokens %q %q", a, b)
	}
	if HashToken(a) == a || len(HashToken(a)) != 64 {
		t.Error("HashToken")
	}
	if !EqualTokens(a, a) || EqualTokens(a, b) || EqualTokens("", "") {
		t.Error("EqualTokens")
	}
}

func TestLimiter(t *testing.T) {
	now := time.Date(2026, 11, 6, 10, 0, 0, 0, time.UTC)
	l := NewLimiter(3, time.Minute)
	l.now = func() time.Time { return now }
	for range 3 {
		if !l.Allowed("1.2.3.4") {
			t.Fatal("zu früh gesperrt")
		}
		l.Fail("1.2.3.4")
	}
	if l.Allowed("1.2.3.4") {
		t.Fatal("nicht gesperrt")
	}
	if !l.Allowed("5.6.7.8") {
		t.Fatal("andere IP gesperrt")
	}
	now = now.Add(time.Minute)
	if !l.Allowed("1.2.3.4") {
		t.Fatal("nach Ablauf des Fensters weiter gesperrt")
	}
	l.Fail("1.2.3.4")
	l.Reset("1.2.3.4")
	if !l.Allowed("1.2.3.4") {
		t.Fatal("Reset wirkt nicht")
	}
}
