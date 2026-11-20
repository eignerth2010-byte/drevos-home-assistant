# Drevos Smoker for Home Assistant

[Deutsch: vollständige Anleitung](README.de.md) · [English: complete guide](README.en.md)

Native, local Home Assistant integration for **one verified Drevos FX3U controller profile**, with a Raspberry Pi serial gateway and a bundled smoker-style dashboard card. No MQTT broker, cloud service or paid license is required.

**Community project, version 0.1.0. Not an official Drevos or Mitsubishi product.** Compatibility is defined by the register profile, not by the Drevos badge on an oven. Other controllers must be checked before enabling writes.

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


## Native mobile app (preview)

The [iOS and Android app](mobile/README.md) uses the existing HA integration without Pi changes. [Deutsch](mobile/README.de.md) · [English](mobile/README.en.md). GitHub Actions can build an Android preview APK and compile an unsigned iPhone app; iPhone installation requires separate Apple signing.
