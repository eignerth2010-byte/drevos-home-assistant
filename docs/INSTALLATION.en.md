# Easy setup – install the Pi and Home Assistant integration

[Deutsch](INSTALLATION.de.md) · [Pi and cable requirements](HARDWARE.md) · [Use HA and the app together](HA-UND-APP.en.md)

This guide connects a verified Drevos controller to an existing Home Assistant through a Raspberry Pi. Run the Pi commands on **Raspberry Pi OS**, not on a different Home Assistant OS computer.

**Already using the app?** Keep the existing Pi/SD card and follow [App → Home Assistant](HA-UND-APP.en.md#b-the-app-works-add-home-assistant). **Already using HA?** Follow [Home Assistant → App](HA-UND-APP.en.md#a-home-assistant-works-add-the-app). A second Pi is not required for these two clients.

## 1 Requirements

- Existing Home Assistant 2026.3+ with administrator access.
- A controller matching the verified `drevos_fx3u_v1` profile.
- **Pi 3 B+ is the physically tested reference.** Pi 3 B, 4 B and Zero 2 W are additional software targets using the same program.
- Suitable power supply, enclosure, microSD card (16 GB or larger for this guide) and setup card reader.
- Reference cable: **DTECH USB to RS232 DB9, FTDI, 1.2 m** – [exact listing](https://www.amazon.de/dp/B08L4ZR5ZX). Check the controller's connector, interface and pinout.
- Zero 2 W additionally needs a Micro-USB OTG to USB-A female adapter in the data port, separate from power.
- Pi and HA on the same trusted home network; a setup computer with SSH and an HA browser.

See the [hardware guide](HARDWARE.md) for supplies and model differences. HA's connection is local and does not need a relay.

## 2 Prepare a new Pi only

On your computer, install [Raspberry Pi Imager](https://www.raspberrypi.com/software/). Select your Pi, **Raspberry Pi OS Lite (64-bit)** and the correct microSD card. Set hostname `drevos-pi`, username `ofenadmin`, your own password and home network. Enable SSH with password authentication. Writing erases the selected card. Insert it into the Pi, connect network/power and wait for first boot. [Official setup illustrations](https://www.raspberrypi.com/documentation/computers/getting-started.html).

Keep an already configured Pi's SD card unchanged.

## 3 Sign in to the Pi

In Windows Terminal/PowerShell or Mac Terminal:

```sh
ssh ofenadmin@drevos-pi.local
```

Use the existing username for an existing Pi. Verify the initial host prompt belongs to your Pi before accepting it. Enter your own password; invisible password typing is normal. The prompt then names your Pi. **Run the following commands in this signed-in Pi window**, one line at a time; resolve errors before continuing.

## 4 Install the gateway

Attach the verified data cable and power the Pi/controller. Heating and smoke need not be started. Only one service may open the serial port; extend an existing app/HA installation using the [combined-use guide](HA-UND-APP.en.md).

```sh
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip ca-certificates nano
cd ~
git clone https://github.com/eignerth2010-byte/drevos-home-assistant.git
cd ~/drevos-home-assistant
sudo sh scripts/install-gateway.sh
```

Keep an existing project folder. The installer creates private configuration but does not start serial access; controls default to disabled.

## 5 Configure the adapter and local address

```sh
ls -l /dev/serial/by-id/
hostname -I
sudo nano /etc/drevos/gateway.json
```

The first command should list the serial adapter; one adapter is selected automatically during installation. If none appears, check the cable; if several appear, identify the oven's adapter. From `hostname -I`, note the Pi's **home-network IPv4 address**, checking the router if multiple addresses appear. A router DHCP reservation keeps it stable.

In the private settings, preserve `id`, `token` and unrelated fields. Check:

| Field | Value |
|---|---|
| `serial_port` | Correct full `/dev/serial/by-id/` adapter path; replace a `CHOOSE_YOUR_VERIFIED_ADAPTER` placeholder. |
| `profile` | `drevos_fx3u_v1` for verified hardware; the label does not verify a different controller. |
| `bind` | The Pi's actual home-network IPv4 address. `127.0.0.1` is reachable only on the Pi itself. |
| `port` | Keep `8756`. |
| `allow_control` | Keep `false` initially for readings only. |
| `id`, `token` | Preserve generated values; enter the token privately in HA later. |

Save with **Ctrl+O**, **Enter**, **Ctrl+X**. Do not publish the file or key. Local HTTP does not encrypt the token, so use a trusted LAN and no router port forwarding. If the app already works, also update its local endpoint as described in [App → HA](HA-UND-APP.en.md#b-the-app-works-add-home-assistant).

## 6 Start the Pi service

```sh
sudo systemctl enable --now drevos-gateway.service drevos-native-poweroff.path
systemctl is-active drevos-gateway.service
```

Expect `active`; the service now starts on boot. Resolve `failed`/`inactive` before proceeding.

## 7 Install the integration manually in Home Assistant

The current resale restriction does not meet the shared Marketplace/HACS
catalog license requirement. Use manual installation for current versions.
[License and earlier MIT versions](LICENSING.md).

1. Download the [project ZIP](https://github.com/eignerth2010-byte/drevos-home-assistant/archive/refs/heads/main.zip) and extract it on your PC.
2. Open the Home Assistant configuration directory containing `configuration.yaml`, using your existing file access or share.
3. Create `custom_components` there if needed.
4. Copy the complete `drevos` folder from the download's `custom_components`, including `translations`, `www`, `brand` and `LICENSE`. For an update, replace the complete existing `custom_components/drevos` folder.
5. Restart Home Assistant, then reload the dashboard browser.

The resulting path must include `custom_components/drevos/manifest.json` inside
the HA configuration directory. Do not copy the entire GitHub project folder.
The Raspberry Pi project directory is not the HA configuration directory.

## 8 Add the oven in HA

Open **Settings → Devices & services → Add integration → Drevos Smoker**. Enter `http://drevos-pi.local:8756` or the Pi's actual LAN address with `http://` and `:8756`. Enter the private **`token` value from `/etc/drevos/gateway.json`**, then choose an area. The app's QR code is a different credential and does not belong in this field.

Expect live chamber/core temperatures; compare them with the display.

## 9 Add the dashboard card

In the dashboard choose **Edit → Add card → Drevos Smoker**, set title/language and save. A single oven is selected automatically. Reload the browser after first installation if necessary. If the card is missing, use the [resource/manual-editor instructions](../README.en.md#5-add-the-complete-smoker-card).

## 10 Enable controls only after profile verification

New installations read only. After confirming readings **and the actual controller's write-register mapping**, change only `"allow_control": false` to `"allow_control": true` in the same private Pi configuration, save, then:

```sh
sudo systemctl restart drevos-gateway.service
```

This permission does not itself start heating/ignition. Automatic mode and connection guards still apply. Network loss does not stop the oven's independent PLC.

## Troubleshooting

| Problem | Check |
|---|---|
| Pi hostname not found | Same home network, actual hostname and router device list. |
| HA cannot connect | Gateway active, `bind` matches the Pi LAN address, correct URL/port and network access. |
| Invalid key | Gateway `token`, without quote characters; not the app QR pairing. |
| Missing/implausible temperatures | Controller power, correct cable/adapter path and verified profile. |
| App stops after adding HA | Update the agent's `gateway_url` alongside `bind`; see [combined use](HA-UND-APP.en.md). |
| Controls disabled | `allow_control`, automatic mode and connection. |

See [technical maintenance instructions](../README.en.md) for updates/rollback and [HA plus app](HA-UND-APP.en.md) for extending either existing installation.

## Info and later updates

From HA integration **0.1.3**, select **Info** in the Drevos card for creator Thomas Eigner, version, optional support, setup guide and discussions. **What’s new?** explains changes. For updates, replace the complete `custom_components/drevos` folder from the new package, restart HA and reopen the dashboard. This card update retains the existing Pi gateway 0.1.1. [Update guide](UPDATES.md).
