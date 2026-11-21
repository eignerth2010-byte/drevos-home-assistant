# Home Assistant and Drevos app – what else do I need?

[Deutsch](HA-UND-APP.de.md) · [Easy HA setup](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.en.md) · [Easy app setup](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.en.md)

**Reuse the Pi and cable.** HA and the standalone app share one local gateway; only that gateway opens the PLC serial port. Both repositories currently contain gateway **0.1.1**. If both clients already work, no migration is needed. These additions do not change the PLC program.

## Which case applies?

| Existing setup | Add | Keep |
|---|---|---|
| Native HA Drevos integration | Pi app bridge, phone/web app and QR pairing | Pi, cable, gateway, HA integration/card and settings |
| Standalone app | Home Assistant, Drevos integration and LAN access to the gateway | Pi, cable, gateway, app service and phone pairing |
| HA and app | Pair another phone or add a dashboard card | Existing installation and keys |

## A Home Assistant works add the app

This means the **native integration** using the shared `drevos-gateway.service`.

You additionally need internet on the existing Pi, the web/native app and `drevos-cloud.service`. The shared public endpoint is included. End users need no Cloudflare account, second Pi or extra oven cable.

1. Keep the Pi installation and save private local backups. Preserve its ID, token, serial path, LAN binding and permissions.
2. Sign in to the existing Pi using its existing SSH account and check:

```sh
systemctl is-active drevos-gateway.service
/opt/drevos/.venv/bin/python -c "from drevos_gateway import __version__; print(__version__)"
```

Expect `active` and current version `0.1.1`. The app installer upgrades an older gateway program if necessary while preserving private configuration. Restarts briefly interrupt readings; the PLC continues independently.

3. If the app checkout is missing, download it **on the Pi**:

```sh
cd ~
git clone https://github.com/eignerth2010-byte/drevos-app.git
cd ~/drevos-app
```

If it exists, reuse it with `cd ~/drevos-app`; update an old checkout normally without forcing over local changes.

4. Install **only the additional bridge**:

```sh
sudo sh scripts/install-cloud.sh
```

Do not create a new gateway configuration or reset its existing LAN `bind` to `127.0.0.1`. The installer reads the existing binding/token to create its private local endpoint. No custom relay/account placeholder is needed.

5. Check both services:

```sh
systemctl is-active drevos-gateway.service drevos-cloud.service
```

Expect `active` twice. [Install the phone app](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.en.md#7-install-drevos-on-your-phone) and [pair using the temporary QR page](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.en.md#8-pair-your-phone-with-the-oven). Keep the existing HA integration.

6. Compare live readings in HA/app and test the app on mobile data. Pi and phone need internet for this remote path; local HA remains independent.

## B The app works add Home Assistant

You need a running [Home Assistant installation](https://www.home-assistant.io/installation/), administrator access and the [Drevos integration](https://github.com/eignerth2010-byte/drevos-home-assistant). HA may run on an appropriate existing computer/NAS or dedicated HA device. Keep Raspberry Pi OS on the working gateway; do not overwrite that SD card with Home Assistant OS.

A new app-only gateway listens on **`127.0.0.1:8756`**. The companion app service can reach it on the same Pi; a separate HA computer cannot. For combined use, make the gateway reachable on the trusted LAN. **Changing `bind` also requires the existing app service's `gateway_url` to match**, or the app loses its local connection.

1. Sign in to the Pi and save the private files before the first migration:

```sh
sudo cp -a /etc/drevos/gateway.json /etc/drevos/gateway.json.vor-ha
sudo cp -a /etc/drevos-cloud/config.json /etc/drevos-cloud/config.json.vor-ha
```

Keep these backups private; preserve previous backups before repeating the copy.

2. Display the Pi addresses:

```sh
hostname -I
```

Select its home-network IPv4 address, checking the router if several are listed. For example, **if** your Pi reports `192.168.1.50`, its endpoint is `http://192.168.1.50:8756`; use your actual address. A router DHCP reservation avoids changes.

3. Open the gateway configuration:

```sh
sudo nano /etc/drevos/gateway.json
```

If `bind` is still `127.0.0.1`, replace only that value with the Pi's actual LAN address. Keep its ID, token, profile, adapter path, port and `allow_control` unchanged. Keep an already suitable LAN binding. Save with **Ctrl+O**, **Enter**, **Ctrl+X**.

4. Update the existing app service's local endpoint:

```sh
sudo nano /etc/drevos-cloud/config.json
```

Change only `gateway_url` to that reachable **local** gateway URL (example above). Preserve `relay`, `room`, `key`, `auth`, `gateway_token` and `gateway_id`. Do not regenerate pairing or delete `pairing.json`. The public relay URL stays unchanged.

5. Restart sequentially and check:

```sh
sudo systemctl restart drevos-gateway.service
sudo systemctl restart drevos-cloud.service
systemctl is-active drevos-gateway.service drevos-cloud.service
```

Expect `active` twice. Refresh the already paired app. Preserving its pairing keys normally avoids re-pairing.

6. [Install the HA extension starting at step 7](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.en.md#7-install-the-ha-extension). Use the Pi LAN endpoint on port `8756` and the private gateway `token`, then [add the card](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.en.md#9-add-the-dashboard-card). Compare both clients and retest app access on mobile data.

Local HTTP does not transport-encrypt the gateway token. Use a trusted LAN and no router forwarding for gateway `8756` or pairing `8765`.

## C What if my situation is different?

| Situation | Action |
|---|---|
| Local HA without internet is wanted | Keep local HA. The standalone app's simple remote path uses the shared internet service. |
| App fails after changing `bind` | Match the agent's local `gateway_url` to the reachable gateway and restart the agent; do not generate new pairing keys. |
| Pi IP changes | Review `bind`, local app `gateway_url` and HA URL. An unchanged working hostname/proxy URL may remain in use. |
| HA asks for a key | Use the gateway token, not the separate app QR credential. |
| Add another phone | Reopen the five-minute pairing page and pair that phone only. |
| Values differ between clients | Refresh both and check connection state; targets belong to one shared oven. |
| Concurrent operation | Commands act on the same PLC. Use one interface deliberately and wait for read-back; a busy gateway may reject another command. |
| Pi shutdown from either client | Both lose access. The app cannot power the Pi back on; Pi shutdown does not disconnect oven mains. |
| Existing HTTPS proxy/special networking | Preserve the working authenticated local path; do not blindly overwrite it with the simple LAN example. |

Both clients share permissions and the physical oven. No extra serial reader, hardware installation or PLC program change is intended for combined use.
