# Drevos Smoker for Home Assistant

[Deutsch: vollständige Anleitung](README.de.md) · [English: complete guide](README.en.md)

Native, local Home Assistant integration for **one verified Drevos FX3U controller profile**, with a Raspberry Pi serial gateway and a bundled smoker-style dashboard card. No MQTT broker, cloud service or paid license is required.

**Community project, version 0.1.2. Not an official Drevos or Mitsubishi product.** Compatibility is defined by the register profile, not by the Drevos badge on an oven. Other controllers must be checked before enabling writes.

## What is included

- Chamber and core temperature, smoke level, setpoints and timer readings.
- Separate controls for heating, smoke with the PLC's automatic ignition sequence, convection and fan.
- Timer duration, start/pause, reset and guarded Raspberry Pi shutdown.
- A complete, responsive card with German/English text and a stainless-steel cabinet design.
- GUI setup, reconfiguration, authentication recovery and redacted diagnostics.
- Raspberry Pi gateway, systemd installer, tests, examples and MIT license.

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
- [Validation and limits](docs/VALIDATION.md).
- [Publishing and maintaining on GitHub, DE/EN](docs/GITHUB.md).
- [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Third-party notices](THIRD_PARTY.md) · [MIT license](LICENSE).

The original PLC project, its export, photographs, credentials and installation-specific configuration are deliberately not distributed. The integration never changes the PLC program and never forces a raw Y output.


## Separate standalone app

The current [standalone Android/iOS app](https://github.com/eignerth2010-byte/drevos-app) is maintained in its own repository and works independently of Home Assistant. This repository contains only the HA integration, its dashboard card and local Pi gateway. Both connections can use gateway 0.1.1; only that gateway opens the PLC serial port. This HA update does not require reinstalling an existing gateway 0.1.1.

Die [eigenständige Android-/iOS-App](https://github.com/eignerth2010-byte/drevos-app) hat ein eigenes Repository. Dieses Projekt enthält ausschließlich die HA-Integration, ihre Dashboard-Karte und das lokale Pi-Gateway.

## Unterstützen / Support

Wenn dir dieses Projekt hilft, kannst du die Weiterentwicklung mit einer freiwilligen Spende über PayPal unterstützen. Vielen Dank!

If this project helps you, you can support its continued development with a voluntary donation via PayPal. Thank you!

[![PayPal – Spenden / Donate](https://img.shields.io/badge/Donate-PayPal-0070BA?logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)

QR-Code scannen / Scan the QR code:

[![PayPal – Spenden-QR-Code / Donation QR code](docs/assets/paypal-donate-qr.png)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)
