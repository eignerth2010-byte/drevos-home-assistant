# Validation / Prüfstand

## 2026-11-25 – HA 0.1.5 integrated sidebar

- 48 Python tests and 24 Node card/panel tests pass locally; Python compile and JavaScript syntax checks pass.
- New lifecycle checks cover offline startup/retry, idempotent registration, resource retry after failure, multiple ovens, successful/failed unloading, removal of an offline entry, disabled entries and foreign-panel ownership.
- Panel tests verify explicit per-oven binding, retained input drafts, delayed HA context, accessible sidebar navigation and local, version-matched module imports.
- The real bundled panel and card were checked together in an isolated browser fixture: German and English initial contexts, Info and licensing text, unavailable readings/disabled controls during outage, preserved draft, two separate ovens and one simulated setpoint command affecting only its selected oven.
- Desktop and 390 × 844 mobile layouts were visually inspected; the mobile document had no horizontal overflow. The native `hass-toggle-menu` event opened the fixture sidebar. Browser error/warning logs were empty after the successful checks.
- Registration/removal signatures and the custom-panel config contract were checked against Home Assistant Core 2026.3.0 and 2026.11.3 source. The integration does not rely on the newer `async_panel_exists` helper.
- Screenshots use synthetic values. Version 0.1.5 was not installed into the user's live HA; the user performs installation. The mistakenly created standalone dashboard was backed up and removed through the HA API at the user's request. No live PLC command, Pi change or HA restart was performed for this release.
- The previously accepted catalog entry remains valid: [accepted Marketplace/HACS submission](https://github.com/hacs/default/pull/14660). New release checks are recorded on GitHub.

## 2026-11-21 – HA 0.1.4 community artwork and licensing

- 39 local Python tests and 16 card contract tests pass; compile checks pass.
- The isolated browser fixture shows the new temporary wordmark, HA 0.1.4,
  German text, Info, donation link and revised resale terms. The preview
  screenshots use synthetic values; no real PLC command was sent.
- Official hassfest passes after moving setup URLs into description
  placeholders: [verified validation run](https://github.com/eignerth2010-byte/drevos-home-assistant/actions/runs/44935092574).
- HACS validation runs with **no ignored checks**. The HA integration/card are
  MIT licensed; the external Pi gateway has separate resale restrictions and
  is not installed by Marketplace/HACS. Catalog acceptance requires passing
  checks and maintainer review; submission does not claim acceptance.
- The square cabinet icons are 256 and 512 pixels, rendered from the original
  community cabinet SVG. The temporary wordmark replaces the manufacturer logo
  in current source, card and preview images. This does not itself grant rights
  in the manufacturer name.
- Existing HA, Pi configuration, gateway 0.1.1 and PLC remain untouched. User
  installs the new HA files manually. No new energized hardware test is claimed.

Deutsch: 39 Python- und 16 Kartenprüfungen sowie hassfest bestehen. HA-Integration und Karte bleiben unter MIT. Nur Pi-Software und Apps haben
gesonderte Weitergabebedingungen. Keine Prüfung wurde deaktiviert.
Die Vorschau zeigt nur Beispielwerte. HA/Pi und Ofen wurden nicht verändert.


This document separates source/unit tests, isolated browser checks, live HA behavior and energized hardware. Planned support is not the same as a physical test.

## Release 0.1.3 — 21 November 2026

- Python syntax/JSON validation and 39 existing Python tests pass. Sixteen card contract tests pass, including seven new tests for Info navigation, command isolation, release-note deferral, public-version-only acknowledgement, blocked storage, card removal and version consistency.
- Isolated browser checks with the actual card and synthetic HA states covered German/English Info, creator Thomas Eigner, the exact PayPal URL, release-note reopening and persisted acknowledgement after reload. A typed target draft survived Info/Oven switching. Info remained usable offline. The fixture recorded zero simulated service calls throughout these checks.
- Integration manifest, diagnostics/shared constant, card footer, Info and bundled notes all identify version 0.1.3. The initial HA setup description and documentation are updated in both languages. Existing entity keys, unique IDs, gateway code and PLC mapping are unchanged; the Pi gateway stays 0.1.1.
- This release does not establish new energized-hardware validation. Heating, ignition, fan switching, timer control and Pi shutdown are not triggered by the update checks.

## Release 0.1.2 — 20 November 2026

- Removed the superseded `mobile/` prototype and `.github/workflows/mobile.yml` from the HA repository. The standalone app and relay belong to [drevos-app](https://github.com/eignerth2010-byte/drevos-app); the HA source archive contains no mobile application or cloud service.
- Corrected UTF-8 text in the German translation and German/English README files. Entity keys, unique IDs, control logic and PLC mapping are unchanged from 0.1.1. The HA component version is 0.1.2; the Pi gateway stays 0.1.1.
- JSON parsing, local Markdown links and repository/package contents are checked during preparation. The existing command/client/card tests remain the functional validation for the unchanged control logic.
- Live 0.1.1 installation was confirmed in HA Core 2026.11.2: all 19 entity IDs and control states were preserved, actual readings were present and the Terrasse dashboard configuration was unchanged.

Das HA-Projekt und seine neue Veröffentlichung enthalten den früheren Mobile-Prototyp und dessen Build-Workflow nicht mehr. Die aktuelle eigenständige App wird ausschließlich im separaten App-Repository gepflegt. Umlaute und Anleitungen sind korrigiert. Für das vorhandene Pi-Gateway 0.1.1 ist keine Neuinstallation nötig.

## Release 0.1.1 — 20 November 2026

- 39 Python tests pass. The real asynchronous HA client was exercised against an isolated HTTP server: overlapping commands are rejected without a second POST, reads remain possible, and the command guard recovers after success, HTTP 409/503 and cancellation. Failed/cancelled commands are not retried, and untrusted response bodies do not appear in errors.
- 9 existing card contract tests pass. Card interactions and entity identities remain unchanged; the resource URL now carries version 0.1.1.
- The packaged gateway is identical to the 0.1.1 gateway used by the standalone app. A busy serial connection refuses a command immediately, without a deferred write. The concurrency test uses a synthetic PLC; it does not write to the actual oven.
- The running Pi already reports gateway 0.1.1. Before this HA update, the existing native integration was loaded in HA Core 2026.11.2 and all 19 entities were present, with actual temperatures, smoke and timer readings. An unused button's `unknown` state is normal.
- Diagnostic integration version comes from the shared version constant; action errors have German/English translations. Control platforms explicitly leave concurrency to the shared client, avoiding a platform command queue.
- The current standalone Android app is maintained in [drevos-app](https://github.com/eignerth2010-byte/drevos-app). Its user-confirmed remote reading test does not establish physical HA heating/ignition/shutdown validation.

No physical PLC control command is needed for this patch installation. Heating, ignition and actual Pi shutdown remain outside the update checks.

Die Version 0.1.1 umfasst 39 Python- und 9 Kartenprüfungen. Mehrfachbefehle werden abgelehnt und nicht gespeichert oder automatisch wiederholt. Das Pi-Gateway 0.1.1 ist bereits installiert; die HA-Integration wird über den Store aktualisiert und HA anschließend neu gestartet. Die bestehenden Entitäten und die Terrasse-Karte werden weiterverwendet. Heizungs-, Zündungs- und Abschaltbefehle werden beim Update nicht ausgelöst.

## Release 0.1.0 — 13 November 2026

| Evidence layer | Result |
|---|---|
| Local automated Python tests | 34 passed: fixed serial addresses/checksums, control bounds/interlocks/readback, no blind retry, authenticated loopback API and asynchronous client |
| Card contract tests | 9 passed, including duplicate submission, failure handling, unavailable entities, draft retention, multiple gateways and never-pressed HA buttons |
| GitHub Actions | Checks passed on Python 3.11 and 3.13, including Node checks and installer shell syntax; [verified source run](https://github.com/eignerth2010-byte/drevos-home-assistant/actions/runs/43501671684) |
| Pi installation | Installer executed successfully on Pi 3 B+, aarch64, Raspberry Pi OS, Python 3.13.5; native gateway and shutdown watcher enabled for boot |
| Live HA installation | Home Assistant OS, Core 2026.11.1 / Python 3.14.10: integration installed through Marketplace, GUI setup completed, 19 native entities created and configuration check valid |
| Live readbacks | Chamber/core temperature and smoke level received through the native gateway |
| Native HA commands | Chamber 5→0 °C, core 10→0 °C, smoke 1→0%; convection and fan on/off confirmed by PLC readback; heating/smoke enable stayed off |
| Native timer | Duration set to 1 minute; start, advancing elapsed/remaining readings, pause and reset confirmed; restored to initial 9000 minutes, stopped with elapsed zero |
| Expiry logic | One-minute automatic completion was previously verified through the same controller/control logic in the original MQTT installation; not repeated as a second native full-expiry test |
| Connection failure | Gateway temporarily stopped: temperature, smoke, timer and control entities became unavailable; readings recovered after restart |
| Dashboard | Bundled card and supplied logo rendered with actual HA readings, at default browser width and a simulated 390×844 viewport; no claim of physical iPhone testing |
| Frontend regression | Initial unknown button state wrongly disabled an unused shutdown button; failing regression reproduced, fixed, test passed, live button availability rechecked |
| Unchanged scope | Original PLC program and original successful read-test script retained; dashboard content outside the Drevos group preserved |

Browser fixture checks used synthetic data. Typed target drafts survived paced measurement updates, a failed simulated command retained its draft and showed an error, and cancelling a heating confirmation dispatched no simulated heating request. The fixture is not an energized hardware test or a full certification of every UI race. The final live dashboard was inspected without activating heat, ignition or Pi power-off.

The live HA-served card and the reviewed local source had matching SHA-256:
`61186c900767cf3b8a0372aae3ba732a8963c4cc5f5c94ff5d64eed6155f8a31`.
The published 51-file source checkout was compared with the release candidate;
no missing files or matches for the private gateway/MQTT credentials were found.

**Not physically tested:** energized heating, smoke ignition, actual Pi shutdown, other Pi models, 32-bit OS, other Drevos controllers, native iPhone input/background behavior. Heating/ignition request roles are derived from the supplied program and original-display/operator confirmation. Other boards are intended compatible configurations, not physical validation claims.

## Deutsch

Die native Integration wurde tatsächlich in HA 2026.11.1 eingerichtet. 19 Entitäten liefern Werte und die bestätigten manuellen Funktionen. Sollwerte, beide Lüfter sowie Timerdauer, Start, Pause und Zurücksetzen wurden über HA rückgelesen. Bei Verbindungsunterbrechung wurden die Entitäten nicht verfügbar und kehrten nach Wiederherstellung zurück. Der ursprüngliche Timerwert von 9000 Minuten und der ausgeschaltete Zustand wurden wiederhergestellt.

34 Python-Prüfungen und 9 Prüfungen der Kartenlogik bestehen; GitHub Actions bestätigt die unterstützten Python-Versionen. Die Karte wurde mit dem gelieferten Logo und Livewerten in normaler und schmaler Browseransicht geprüft. Dabei gefundene erste-Tastenbenutzung wurde korrigiert und als Regression abgesichert.

Heizung und Rauchzündung wurden bei diesen Prüfungen nicht eingeschaltet. Die tatsächliche Pi-Abschaltung wurde ebenfalls nicht ausgelöst. Physisch geprüft ist der Pi 3 B+; die übrigen aufgeführten Pi-Modelle und andere Ofensteuerungen sind nicht dadurch automatisch bestätigt. Eine Browseransicht in Handybreite ist kein Test auf einem echten iPhone.

## Recipe book – HA 0.2.0 (2026-11-26)

- The card and integration-owned sidebar include the same 40 photographed recipes as app 0.4.0, with source notes, restored photos and the suggested 85/55 °C user correction for Rippen, Methode 2. See RECIPES.de.md and RECIPES.en.md for the complete workflow.
- Local checks passed: 48 Python tests and 31 Node tests. New tests cover numeric-only phase preparation, unused/zero-time phases, actual readback, idle requirements, an old elapsed timer, partial failure, duplicate requests, disconnect, hidden-page interruption, gateway changes and an external target change before start.
- An isolated browser fixture loaded the actual local frontend modules. Choosing a phase dispatched no mock command. Explicit preparation dispatched exactly four number.set_value intents (85 °C chamber, 55 °C core, 100% smoke and 150 minutes). Heat, smoke, timer and both fans remained off. Offline mode disabled phase selection while keeping recipes readable. The fixture denied external connections and form submissions; no real HA session or PLC endpoint was used.
- The shared browser form saved and reopened a synthetic personal recipe and photo. Email delivery, owner activation of FormSubmit and physical 0.2.0 controls remain unverified. The original recipe badge describes provenance, not manufacturer endorsement or a food safety assessment.
- The owner installs HA updates themselves. This development and release preparation did not install, restart or reconfigure live HA or the Pi.

### Recipe release publication – 2026-11-26

- Recipe PR #3 was merged with head `914a70eb49fba3e59db4678ef6f916a73d33f9aa`; checks, hassfest and HACS passed. Release `v0.2.0` publishes the reviewed source archive, whose GitHub asset digest matches `aabf253d0a476448bc968059b9e4d6c4383bde7a973025cb9c998354282d4631`.
- The companion 0.4.0 web app and submission form are online. FormSubmit activation/actual attachment delivery and physical HA controls remain unverified. The owner installs the HA update personally; no live HA/Pi configuration or PLC command changed.
