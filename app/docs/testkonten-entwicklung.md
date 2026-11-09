# Testkonten der bereitgestellten Entwicklungsumgebung (#55)

Eingerichtet und geprüft am 2026-11-09 auf <https://78-47-14-178.sslip.io>.
Bereitgestellter Commit: `585a10c9a537c222485f7920fffa4ed6be314af8`.

| Konto | Status | Rolle |
|---|---|---|
| `test1@aiboard.de` | aktiv, genau einmal vorhanden | `editor` |
| `test2@aiboard.de` | aktiv, genau einmal vorhanden | `editor` |
| `test3@aiboard.de` | aktiv, genau einmal vorhanden | `editor` |

Die Konten haben keine Administratorrechte. `editor` erlaubt neben der Anmeldung auch die bestehenden Redaktionsfunktionen; eine reine Leserrolle existiert derzeit nicht. Die Benutzerverwaltung bleibt gesperrt (`403`).

## Vertrauliche Übergabe

Die drei Zugangsdaten liegen ausschließlich in `.token/testaccounts-55.json` im lokalen Projektstamm des Betreibers. Der gesamte Ordner `.token/` ist durch `.gitignore` ausgeschlossen. Die Datei enthält Entwicklungsadresse, Rolle, Erstellungsdatum und die drei Kombinationen aus E-Mail-Adresse und Passwort. Sie wird weder committed noch an GitHub angehängt.

Jedes Passwort wurde lokal mit Node.js `crypto.randomBytes(24)` erzeugt und als Base64url ohne Padding gespeichert: 32 zufällige Zeichen aus 192 Zufallsbits. Alle drei Werte sind verschieden. Die Übergabe an `server user create` erfolgte über die Standardeingabe einer verschlüsselten SSH-Verbindung und `docker compose exec -T`; Passwörter standen weder in Kommandozeilenargumenten noch in Umgebungsvariablen.

## Anlage und Wiederholung

Vor der Anlage wurde die Datenbank lesend auf die drei E-Mail-Adressen geprüft; es gab noch keines der Konten. Anschließend wurde für jedes Konto der bestehende Befehl verwendet:

```bash
cd /opt/ki-web
docker compose exec -it backend /server user create --email test1@aiboard.de --role editor
```

Für weitere Konten die Adresse ersetzen und das Passwort verdeckt eingeben. `--role editor` immer ausdrücklich angeben, da die CLI sonst `admin` verwendet. Bei vorhandenen Konten nicht erneut anlegen und keine Kennwörter stillschweigend ersetzen. Die bestehende Kontoverwaltung beziehungsweise ein Admin-Konto dient zur Prüfung des Kontostatus. Es wurden keine Migrationen oder Seed-Daten für die Testkonten angelegt; `DEV_SEED` bleibt im Betrieb aus.

## Erfolgreiche Prüfungen

- Datenbank vor und nach Backend-Neustart: jede Adresse genau einmal, aktiv, Rolle `editor`.
- Alle drei Anmeldungen: `200`, geschützte Profilseite und Inhalts-API erreichbar; Benutzerverwaltungs-API liefert `403`.
- Für jedes Konto wird ein falsches Passwort mit `401` abgewiesen. Die Prüfsitzungen wurden nach dem Test abgemeldet.
- Nach `docker compose restart backend` und erfolgreichem Healthcheck wurden alle drei Anmelde-, Rollen- und Negativprüfungen wiederholt und bestanden.
- Die Datenbank enthält drei unterschiedliche Argon2id-Hashes, keine Klartextpasswörter in den Passwortfeldern. Das vorhandene Hashing der Anwendung wurde unverändert genutzt.
- Die aktuellen Backend-/Caddy-Containerprotokolle und das Caddy-Zugriffsprotokoll wurden auf die erzeugten Passwörter geprüft: keine Treffer. Die Prüfausgabe enthält nur Ergebnisse und Kontoadressen.
- `git check-ignore .token/testaccounts-55.json` bestätigt den Ausschluss; unter `.token/` sind keine Dateien versioniert.

Die Anwendung wurde für dieses Ticket nicht verändert. Der vorhandene CLI-Befehl und die bereitgestellten Authentifizierungs- und Rollenprüfungen wurden direkt genutzt und getestet. Ein Containerneustart erhält die Konten im persistenten SQLite-Volume `ki-web_app_db`.

Nachweis und Review: [Ticket #55](https://github.com/MarvinJakob/aiboard/issues/55). Der Zugangsschutz gehört zu [Ticket #54](https://github.com/MarvinJakob/aiboard/issues/54).
