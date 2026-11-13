# Validation / Prüfstand

This document separates source/unit tests, isolated browser checks, live HA behavior and energized hardware. Planned support is not the same as a physical test.

## Current development checkpoint

- Original MQTT installation: actual chamber/core readings, setpoint write/readback with heat/smoke off, convection/fan on/off, timer duration/start/pause/reset and one-minute completion verified previously.
- Native gateway: fixed-address protocol and control tests plus authenticated loopback API tests are being run for release 0.1.0. Final counts and deployment evidence are recorded before publication.
- Native integration and bundled card: live installation and isolated frontend checks are pending at this checkpoint. Do not interpret source review as live verification.
- Heating and smoke ignition were **not energized** during installation tests. Their request-bit roles come from the checked PLC program and operator/display confirmation.
- Physical Pi: 3 B+, 64-bit Raspberry Pi OS, Python 3.13.5. Pi 3 B, 4 B, Zero 2 W and 32-bit OS are intended compatible configurations, not physically verified here.
- No general claim of compatibility with other Drevos ovens or altered PLC programs.

Deutsch: Die tatsächlichen Prüfungen werden vor Veröffentlichung ergänzt. Ein bestandener Softwaretest bestätigt keine physische Zündung oder Eignung für eine andere SPS. Der automatische Timer liegt in der SPS und wurde in der bestehenden Anbindung mit einem Ein-Minuten-Durchgang geprüft.
