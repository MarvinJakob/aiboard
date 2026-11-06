package main

import (
	"bufio"
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"os"
	"strings"

	"golang.org/x/term"

	"ki-web/backend/internal/service"
	"ki-web/backend/internal/store"
)

// userCommand richtet Konten über die Kommandozeile ein. Das erste Admin-Konto entsteht so bei der
// Inbetriebnahme (ARCHITECTURE.md, Abschnitt 4). Weitere Konten verwaltet ein Admin im Redaktionsfrontend.
//
//	server user create --email admin@example.de --role admin
func userCommand(cfg config, args []string, log *slog.Logger) error {
	if len(args) == 0 || args[0] != "create" {
		return errors.New("aufruf: server user create --email ADRESSE [--role admin|editor]")
	}
	fs := flag.NewFlagSet("user create", flag.ContinueOnError)
	email := fs.String("email", "", "E-Mail-Adresse des Kontos")
	roleFlag := fs.String("role", string(service.RoleAdmin), "Rolle: admin oder editor")
	if err := fs.Parse(args[1:]); err != nil {
		return err
	}
	role, ok := service.ParseRole(*roleFlag)
	if !ok {
		return fmt.Errorf("unbekannte rolle %q (erlaubt: admin, editor)", *roleFlag)
	}
	if strings.TrimSpace(*email) == "" {
		return errors.New("--email fehlt")
	}
	password, err := readPassword(os.Stdin, os.Stderr)
	if err != nil {
		return err
	}

	ctx := context.Background()
	db, err := store.Open(cfg.databasePath)
	if err != nil {
		return err
	}
	defer db.Close()
	if err := store.Migrate(ctx, db, false, log); err != nil {
		return err
	}
	u, err := service.NewAccounts(db).CreateUser(ctx, *email, password, role)
	var verr *service.ValidationError
	switch {
	case errors.Is(err, service.ErrEmailTaken):
		return fmt.Errorf("es gibt bereits ein konto mit der e-mail-adresse %s", service.NormalizeEmail(*email))
	case errors.As(err, &verr):
		return errors.New(verr.Msg)
	case err != nil:
		return err
	}
	log.Info("konto angelegt", "id", u.ID, "email", u.Email, "rolle", u.Role)
	return nil
}

// readPassword liest das Passwort aus USER_PASSWORD, sonst verdeckt vom Terminal oder als erste Zeile
// der Standardeingabe.
func readPassword(in *os.File, out io.Writer) (string, error) {
	if pw := os.Getenv("USER_PASSWORD"); pw != "" {
		return pw, nil
	}
	if term.IsTerminal(int(in.Fd())) {
		fmt.Fprint(out, "Passwort: ")
		first, err := term.ReadPassword(int(in.Fd()))
		fmt.Fprintln(out)
		if err != nil {
			return "", err
		}
		fmt.Fprint(out, "Passwort wiederholen: ")
		second, err := term.ReadPassword(int(in.Fd()))
		fmt.Fprintln(out)
		if err != nil {
			return "", err
		}
		if string(first) != string(second) {
			return "", errors.New("die passwörter stimmen nicht überein")
		}
		return string(first), nil
	}
	line, err := bufio.NewReader(in).ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}
	return strings.TrimRight(line, "\r\n"), nil
}
