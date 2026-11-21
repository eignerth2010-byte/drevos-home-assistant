# Drevos Smoker for Home Assistant

**Lizenz ab 21.11.2026:** Private und betriebsinterne Nutzung kostenlos; Verkauf und kommerzielle Weitergabe nur mit vorheriger schriftlicher Freigabe von **Thomas Eigner**. [Bedingungen, frÃ¼here MIT-Fassungen und Kontakt](docs/LICENSING.md).

**License from 2026-11-21:** Free for private and internal business use; resale and commercial redistribution require **Thomas Eigner's prior written permission**. [Terms, earlier MIT versions and contact](docs/LICENSING.md).

**[Einfach starten â€“ Pi und HA installieren](docs/INSTALLATION.de.md)** Â· **[Easy Pi and HA setup](docs/INSTALLATION.en.md)**

**Schon HA oder die App eingerichtet? [Was brauche ich zusÃ¤tzlich?](docs/HA-UND-APP.de.md)** Â· [HA + app, English](docs/HA-UND-APP.en.md)

[Deutsch: vollstÃ¤ndige Anleitung](README.de.md) Â· [English: complete guide](README.en.md)

Native, local Home Assistant integration for **one verified Drevos FX3U controller profile**, with a Raspberry Pi serial gateway and a bundled smoker-style dashboard card. The HA connection runs locally without a cloud service; private personal use is free.

**Community project, version 0.1.3. Not an official Drevos or Mitsubishi product.** Compatibility is defined by the register profile, not by the Drevos badge on an oven. Other controllers must be checked before enabling writes.

## What is included

- Chamber and core temperature, smoke level, setpoints and timer readings.
- Separate controls for heating, smoke with the PLC's automatic ignition sequence, convection and fan.
- Timer duration, start/pause, reset and guarded Raspberry Pi shutdown.
- A complete, responsive card with German/English text and a stainless-steel cabinet design.
- Info/support tab with creator Thomas Eigner, optional PayPal support, visible version and once-per-version release notes.
- GUI setup, reconfiguration, authentication recovery and redacted diagnostics.
- Raspberry Pi gateway, systemd installer, tests, examples and the project license.

## Requirements at a glance

Home Assistant **2026.3+** (live validation is performed on the installed release; see [validation](docs/VALIDATION.md)), a separate Raspberry Pi 3 B / 3 B+ / 4 B / Zero 2 W with Raspberry Pi OS and Python 3.11+, a suitable power supply and microSD, network access, and an **electrically compatible PLC programming cable**. A USB chip name alone does not establish compatibility. The Zero 2 W also needs a USB OTG adapter for the cable.

All four boards use **the same gateway program**; the hardware differences are in the [hardware guide](docs/HARDWARE.md). Only the 3 B+ is physically verified in this installation.

## Install

1. Follow [the German guide](README.de.md) or [the English guide](README.en.md) to install the Pi gateway.
2. Install `custom_components/drevos` in Home Assistant, restart HA, then add **Drevos Smoker** under Devices & services.
3. Enter the gateway URL and its locally generated private token.
4. Add **Drevos Smoker** from the dashboard card picker. The integration registers its bundled JavaScript resource in storage mode.

Do not put gateway tokens or personal configuration in an issue, repository or screenshot. The installer defaults to loopback-only, read-only operation. See the full guide before exposing it to your trusted LAN or enabling controls.

## Documentation

- [Deutsch](README.de.md) / [English](README.en.md): complete installation, usage, update, rollback and removal.
- [Hardware and Pi models](docs/HARDWARE.md).
- [Verified register profile](docs/REGISTER_PROFILE.md).
- [Card Info, versions and updates / Karteninfos und Updates](docs/UPDATES.md).
- [Validation and limits](docs/VALIDATION.md).
- [Publishing and maintaining on GitHub, DE/EN](docs/GITHUB.md).
- [Contributing](CONTRIBUTING.md) Â· [Security](SECURITY.md) Â· [Third-party notices](THIRD_PARTY.md) Â· [Free-use license](LICENSE).

The original PLC project, its export, photographs, credentials and installation-specific configuration are deliberately not distributed. The integration never changes the PLC program and never forces a raw Y output.


## Separate standalone app

The current [standalone Android/iOS and Web App](https://github.com/eignerth2010-byte/drevos-app) is maintained in its own repository and works independently of Home Assistant. This repository contains only the HA integration, its dashboard card and local Pi gateway. Both connections can use gateway 0.1.1; only that gateway opens the PLC serial port. This HA update does not require reinstalling an existing gateway 0.1.1. Follow [the combined-use guide](docs/HA-UND-APP.en.md) when adding either client; LAN binding and the app bridge's local URL must agree.

Die [eigenstÃ¤ndige Android-/iOS- und Web-App](https://github.com/eignerth2010-byte/drevos-app) hat ein eigenes Repository. Dieses Projekt enthÃ¤lt ausschlieÃŸlich die HA-Integration, ihre Dashboard-Karte und das lokale Pi-Gateway.

## Vorschau / Preview

![Drevos â€“ Beispielansicht / Sample interface](docs/assets/drevos-ha-card-demo.jpg)

Originale Drevos-Karte fÃ¼r Home Assistant â€“ isolierte Vorschau mit Beispielwerten. / Original Drevos card for Home Assistant â€“ isolated preview with sample values.

![HA-Integration 0.1.3 â€“ Info & UnterstÃ¼tzen / Info & Support](docs/assets/drevos-ha-info.jpg)

## Mitwirkende / Contributors

**Thomas Eigner** â€“ Ersteller / creator. **ChatGPT (OpenAI)** â€“ KI-UnterstÃ¼tzung bei Entwicklung, Tests und Dokumentation / AI assistance with development, software checks and documentation. [Details](CONTRIBUTORS.md).

## UnterstÃ¼tzen / Support

Wenn dir dieses Projekt hilft, kannst du die Weiterentwicklung mit einer freiwilligen Spende Ã¼ber PayPal unterstÃ¼tzen. Vielen Dank!

If this project helps you, you can support its continued development with a voluntary donation via PayPal. Thank you!

[![PayPal â€“ Spenden / Donate](https://img.shields.io/badge/Donate-PayPal-0070BA?logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)

QR-Code scannen / Scan the QR code:

[![PayPal â€“ Spenden-QR-Code / Donation QR code](docs/assets/paypal-donate-qr.png)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)
