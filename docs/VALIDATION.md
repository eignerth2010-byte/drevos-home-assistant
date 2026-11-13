# Validation / Prüfstand

This document separates source/unit tests, isolated browser checks, live HA behavior and energized hardware. Planned support is not the same as a physical test.

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
