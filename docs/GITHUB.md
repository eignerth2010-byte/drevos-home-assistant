# GitHub: verÃ¶ffentlichen und pflegen / publish and maintain

## Deutsch

Das Ã¶ffentliche Projekt liegt unter `eignerth2010-byte/drevos-home-assistant`. Eine persÃ¶nliche Installation verwendet denselben geprÃ¼ften Code mit einer separaten privaten Konfiguration. Keine getrennten Code-Forks mit unterschiedlichen SicherheitsprÃ¼fungen pflegen.

### Repository und ErstverÃ¶ffentlichung

1. Auf GitHub anmelden und ein neues Repository namens `drevos-home-assistant` im eigenen Konto anlegen.
2. Als Beschreibung beispielsweise verwenden: **Local Home Assistant integration for a verified Drevos smoker controller, with Raspberry Pi gateway and a complete dashboard card. German and English documentation.**
3. Sichtbarkeit **Public**, Standardbranch `main`. Die aktuelle LICENSE-Datei und docs/LICENSING.md aus diesem Projekt beilegen; private und betriebsinterne Nutzung ist kostenlos; Verkauf und kommerzielle Weitergabe erfordern vorherige schriftliche Freigabe.
4. Nur den bereinigten Projektordner hochladen. `/etc/drevos/gateway.json`, ZugangsschlÃ¼ssel, `.env`, private Konfiguration, Logs, Fotos und das ursprÃ¼ngliche SPS-Projekt gehÃ¶ren nicht hinein.
5. Ã„nderungen lokal mit den untenstehenden Tests prÃ¼fen. Auf GitHub mÃ¼ssen die **Checks** zum verÃ¶ffentlichten Commit ausgewertet werden.
6. Unter **Releases â†’ Draft a new release** einen Versions-Tag wie `v0.1.0`, Titel und Ã„nderungsbeschreibung anlegen. Hinweise auf experimentellen Stand und tatsÃ¤chlich getestete Hardware einschlieÃŸen. Keine Behauptung allgemeiner Drevos-KompatibilitÃ¤t.
7. Die Installationsanleitungen in `README.de.md` und `README.en.md` bei Ã„nderungen gemeinsam pflegen. Neue Releases erfordern auch aktualisierte Versionsnummern und Karten-URL.

Git Ã¼ber die Kommandozeile, nachdem das Repository angelegt wurde:

```sh
git init -b main
git add .
git diff --cached --stat
git diff --cached
git commit -m "Add Drevos native integration and Raspberry Pi gateway"
git remote add origin https://github.com/eignerth2010-byte/drevos-home-assistant.git
git push -u origin main
```

GitHub mit normaler Anmeldung, SSH-SchlÃ¼ssel oder dem Anmeldemanager verwenden. Niemals einen Token in die Remote-URL einbauen. Ein bereits initialisiertes Repository zuerst klonen; nicht mit einem erzwungenen Push Ã¼berschreiben.

### Entwicklung und PrÃ¼fungen

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e . pytest pytest-asyncio aiohttp
python -m pytest -q
python -m compileall -q custom_components drevos_gateway
node --check custom_components/drevos/www/drevos-smoker-card.js
node --test tests/card.test.cjs
sh -n scripts/install-gateway.sh
```

Die Tests verwenden nachgebildete SPS-Verbindungen und eine lokale HTTP-Testverbindung. Sie benÃ¶tigen keinen Ofen und keine echten SchlÃ¼ssel. Eine lokale NetzwerkbeschrÃ¤nkung kann den HTTP-Test blockieren; das ist dann kein Nachweis eines Softwarefehlers. Integrations- und Hardwaretests gesondert in `docs/VALIDATION.md` dokumentieren.

BeitrÃ¤ge Ã¼ber einen eigenen Branch und Pull Request prÃ¼fen. Hardwarebefehle nicht allein fÃ¼r CI ausfÃ¼hren. FÃ¼r weitere Ofenmodelle ein neues, ausdrÃ¼cklich geprÃ¼ftes Profil entwickeln und unbekannte Register nicht durch Ausprobieren beschreiben.

FÃ¼r Releases die Version in `pyproject.toml`, `drevos_gateway/__init__.py`, `custom_components/drevos/manifest.json`, `custom_components/drevos/const.py`, Diagnoseangabe und den dokumentierten Ressourcen-URLs anpassen. Release auf genau dem geprÃ¼ften Commit erstellen. Optionale ZIP-Pakete dÃ¼rfen nur explizit ausgewÃ¤hlte Projektdateien enthalten; keine gesamte private Arbeitsumgebung komprimieren.

### Installation anderer Nutzer und Support

Andere Nutzer folgen der deutschen oder englischen Anleitung. Das Repository kann als benutzerdefinierte Integration Ã¼ber den passenden Store oder manuell installiert werden; eine Aufnahme in den offiziellen Katalog ist ein eigener Vorgang. FÃ¼r Fehlerberichte Versionsnummer, Pi-Modell, OS/Python-Version, Profil, genaue Schritte und bereinigte Diagnosedaten angeben. Geheimnisse nicht posten. Keine Garantie anbieten, dass ein anderer Ofen durch dieselbe Software sicher bedienbar wird.

## English

The public project is `eignerth2010-byte/drevos-home-assistant`. Personal installations use the same reviewed source with separate private configuration; avoid diverging forks of the safety logic.

### Create and publish

1. Sign in to GitHub and create a repository named `drevos-home-assistant` in your account.
2. Suggested description: **Local Home Assistant integration for a verified Drevos smoker controller, with Raspberry Pi gateway and a complete dashboard card. German and English documentation.**
3. Choose **Public**, branch `main`, and include this project's current LICENSE and docs/LICENSING.md; resale and commercial redistribution require prior written permission.
4. Upload only the sanitized project. Exclude gateway tokens, `.env`, personal configuration, logs, photos and the original PLC project.
5. Run the tests and inspect GitHub **Checks** for the published commit.
6. Under **Releases â†’ Draft a new release**, create a version tag such as `v0.1.0`, add release notes and state the experimental status and hardware actually tested. Do not claim universal Drevos compatibility.
7. Maintain the German and English guides together, updating versions and resource URLs for each release.

The Git commands above demonstrate a first upload to a newly created repository. Use normal GitHub authentication, SSH or a credential manager; never put a token in the remote URL. Clone an already initialized repository rather than overwriting it with a force push.

### Develop, validate and release

Run the commands above in a virtual environment. Unit tests use synthetic PLC connections and a loopback HTTP server; no real oven or credentials are required. Network restrictions can block loopback tests and should be reported as environment limitations. Record live HA and hardware validation separately in `docs/VALIDATION.md`.

Use branches and pull requests. CI must not energize hardware. Additional oven models need explicit verified profiles, not exploratory writes to unknown registers.

For releases, update the version in `pyproject.toml`, `drevos_gateway/__init__.py`, integration `manifest.json`, `const.py`, diagnostics and documented resource URLs. Release the tested commit. Build ZIP packages from an explicit file allowlist, excluding private workspaces and configuration.

Users can install through a suitable community store as a custom integration or manually. Official catalog inclusion is separate. Issue reports should include versions, Pi model, OS/Python, profile, reproduction steps and redacted diagnostics. Never post credentials or promise compatibility with an unverified oven.
