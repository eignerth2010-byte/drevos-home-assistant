# Drevos Smoker â€“ deutsche Anleitung

**Lizenz ab 21.11.2026:** Private und betriebsinterne Nutzung kostenlos; Verkauf und kommerzielle Weitergabe nur mit vorheriger schriftlicher Freigabe von **Thomas Eigner**. [Bedingungen, frÃ¼here MIT-Fassungen und Kontakt](docs/LICENSING.md).

**[Einfache Schritt-fÃ¼r-Schritt-Installation fÃ¼r Pi und HA](docs/INSTALLATION.de.md)** Â· **[HA schon da oder App schon da â€“ was zusÃ¤tzlich nÃ¶tig ist](docs/HA-UND-APP.de.md)**

[English](README.en.md) Â· [ProjektÃ¼bersicht](README.md)

Diese Integration verbindet Home Assistant direkt Ã¼ber das Heimnetz mit einem Raspberry Pi am Drevos-RÃ¤ucherofen. Der Pi spricht mit der vorhandenen SPS.

Das Projekt unterstÃ¼tzt das geprÃ¼fte Profil `drevos_fx3u_v1`. Es ist eine unabhÃ¤ngige Community-Integration. Gleiche Marke bedeutet nicht automatisch gleiche Steuerung. Die SPS muss zum [Registerprofil](docs/REGISTER_PROFILE.md) passen. Die vorhandenen Temperaturbegrenzer, Schutzfunktionen und BedienmÃ¶glichkeiten des Ofens bleiben erforderlich.

## 1. Das wird benÃ¶tigt

- Home Assistant ab 2026.3, mit Zugriff auf den Konfigurationsordner oder einem geeigneten Community-Store. Getestete Versionen stehen in [VALIDATION.md](docs/VALIDATION.md).
- Raspberry Pi 3 B, 3 B+, 4 B oder Zero 2 W als **separates Gateway**. Home Assistant darf auf einem anderen Rechner laufen.
- Raspberry Pi OS Lite, Python 3.11 oder neuer, microSD-Karte und zum Modell passendes Netzteil.
- Ethernet oder stabiles WLAN zwischen Pi und Home Assistant. Eine feste DHCP-Zuweisung ist hilfreich.
- Der zur SPS passende USB-Programmieradapter und die bereits geprÃ¼fte Verbindung zum Ofen. Ein FT232R-Chip allein sagt nichts darÃ¼ber aus, ob Pegel und Beschaltung zur SPS passen. Nicht durch einen beliebigen TTL-Adapter oder direkte GPIO-Verkabelung ersetzen.
- Am Zero 2 W: passender USB-OTG-Adapter fÃ¼r den Programmieradapter.
- SSH-Zugang zum Pi und Administratorzugang zu Home Assistant.

Details zu den Pi-Modellen: [HARDWARE.md](docs/HARDWARE.md). Ein anderes Programm pro Modell ist nicht nÃ¶tig. Physisch getestet wurde der Pi 3 B+.

## 2. Raspberry Pi vorbereiten

Raspberry Pi OS mit Raspberry Pi Imager installieren, Netzwerk, Hostnamen und SSH-Zugang einrichten und den Pi starten. SSH-SchlÃ¼ssel sind fÃ¼r die tÃ¤gliche Verwaltung geeignet. Den geprÃ¼ften SPS-Adapter verbinden.

```sh
sudo apt update
sudo apt install python3 python3-venv git
ls -l /dev/serial/by-id/
git clone https://github.com/eignerth2010-byte/drevos-home-assistant.git
cd drevos-home-assistant
sudo sh scripts/install-gateway.sh
```

Der Installer legt einen eigenen Dienstbenutzer, eine Python-Umgebung und eine private Konfigurationsdatei an. **Er startet das Gateway noch nicht.** Ein individueller ZugangsschlÃ¼ssel wird lokal erzeugt und nicht im Installationsprotokoll ausgegeben.

## 3. Gateway einstellen

**App bereits eingerichtet?** Vor einer Ã„nderung von `bind` die [Anleitung fÃ¼r App â†’ HA](docs/HA-UND-APP.de.md#b-die-app-funktioniert-schon-home-assistant-soll-dazukommen) verwenden. Dort wird auch `gateway_url` des vorhandenen App-Dienstes angepasst, damit die App weiter funktioniert.

Die Datei ausschlieÃŸlich lokal Ã¶ffnen:

```sh
sudoedit /etc/drevos/gateway.json
```

Die Felder bedeuten:

| Feld | Einstellung |
|---|---|
| `id` | Einmal erzeugte GerÃ¤tekennung beibehalten. Ein Wechsel erzeugt ein neues GerÃ¤t in HA. |
| `name` | GewÃ¼nschter GerÃ¤tename, beispielsweise Drevos RÃ¤ucherofen. |
| `profile` | `drevos_fx3u_v1`; andere SPS-Programme sind damit nicht automatisch kompatibel. |
| `token` | Privater, individuell erzeugter ZugangsschlÃ¼ssel. Nur in der HA-Einrichtung verwenden. |
| `serial_port` | Den eindeutig zugeordneten Pfad aus `/dev/serial/by-id/` verwenden. |
| `bind` | ZunÃ¤chst `127.0.0.1`; fÃ¼r HA auf einem anderen Rechner auf die **eigene LAN-IP des Pi** Ã¤ndern. |
| `port` | Standard `8756`. |
| `allow_control` | Anfangs `false`; erst nach PrÃ¼fung des Registers und Vergleich der Werte am Originaldisplay auf `true` setzen. |

FÃ¼r diese lokale HTTP-Schnittstelle ist ein vertrauenswÃ¼rdiges Heimnetz erforderlich. Der SchlÃ¼ssel wird Ã¼ber HTTP nicht verschlÃ¼sselt. Keine Portfreigabe ins Internet einrichten. FÃ¼r unzuverlÃ¤ssige Netze einen HTTPS-Reverse-Proxy mit einem von HA vertrauenswÃ¼rdigen Zertifikat verwenden; die Integration prÃ¼ft HTTPS-Zertifikate und folgt keinen Weiterleitungen.

Der SchlÃ¼ssel bleibt in `/etc/drevos/gateway.json`, lesbar nur fÃ¼r den Dienstbenutzer. HA speichert ihn in seiner geschÃ¼tzten Integrationskonfiguration. Der SchlÃ¼ssel gehÃ¶rt weder in Dashboard-Karten noch in GitHub-Dateien.

**Vor dem Start darf kein anderes Programm dieselbe serielle Schnittstelle geÃ¶ffnet haben.** AnschlieÃŸend den gemeinsamen Gateway starten:

```sh
sudo systemctl enable --now drevos-gateway.service drevos-native-poweroff.path
sudo systemctl status drevos-gateway.service --no-pager
```

Keine Ã„nderungen an der SPS-Software sind erforderlich. Die Baudrate ist im geprÃ¼ften Profil fest 38400, 7 Datenbits, gerade ParitÃ¤t, 1 Stoppbit.

## 4. Integration in Home Assistant installieren

### Ãœber den Community-Store

Bei HA mit Marketplace: **Einstellungen â†’ Marketplace**, dort dieses Repository als Integration Ã¼ber den Repository-Link hinzufÃ¼gen, herunterladen und HA neu starten. Bei Ã¤lteren Installationen mit HACS: Repository `eignerth2010-byte/drevos-home-assistant` als benutzerdefiniertes Repository der Kategorie **Integration** hinzufÃ¼gen, herunterladen und neu starten. Die Integration ist dadurch nicht automatisch in den offiziellen Katalog aufgenommen. Die jeweils angebotenen Hinweise des Stores selbst lesen und bestÃ¤tigen.

### Manuell

Den Ordner `custom_components/drevos` aus diesem Repository in den Konfigurationsordner von HA kopieren. Das Ergebnis muss so aussehen:

```text
<HA-Konfigurationsordner>/custom_components/drevos/manifest.json
<HA-Konfigurationsordner>/custom_components/drevos/config_flow.py
<HA-Konfigurationsordner>/custom_components/drevos/www/drevos-smoker-card.js
```

Den ganzen Ordner einschlieÃŸlich Ãœbersetzungen und `www` Ã¼bernehmen. AnschlieÃŸend Home Assistant neu starten.

### Einrichten

1. **Einstellungen â†’ GerÃ¤te & Dienste â†’ Integration hinzufÃ¼gen** Ã¶ffnen.
2. Nach **Drevos Smoker** suchen.
3. Die lokale Gateway-Adresse eingeben, zum Beispiel `http://drevos-pi.local:8756` oder die eigene Pi-IP mit Port.
4. Den privaten `token` aus der lokalen Gateway-Konfiguration eingeben.
5. Das neue GerÃ¤t dem gewÃ¼nschten Bereich, beispielsweise Terrasse, zuordnen.

Bei neuer IP oder geÃ¤ndertem SchlÃ¼ssel: im MenÃ¼ des Integrationseintrags **Neu konfigurieren** wÃ¤hlen. Bei einem ungÃ¼ltigen SchlÃ¼ssel bietet HA eine erneute Anmeldung an. Die GerÃ¤tekennung auf dem Pi dabei beibehalten.

## 5. Komplette Ofenkarte hinzufÃ¼gen

In einem Dashboard **Bearbeiten â†’ Karte hinzufÃ¼gen â†’ Drevos Smoker** auswÃ¤hlen. Titel, Sprache und gegebenenfalls das GerÃ¤t im Karteneditor einstellen. Bei genau einem eingerichteten Drevos-GerÃ¤t wird es automatisch ausgewÃ¤hlt.

Alternativ im manuellen Karteneditor:

```yaml
type: custom:drevos-smoker-card
title: Drevos RÃ¤ucherofen
language: de
```

Die Karte enthÃ¤lt Isttemperaturen, Sollwerte, RauchstÃ¤rke, beide LÃ¼fter, Heizung, Rauch/ZÃ¼ndung, Timer und Pi-Abschaltung. Sie lÃ¤dt keine Schriften, Bilder oder Bibliotheken aus dem Internet und enthÃ¤lt keinen Gateway-SchlÃ¼ssel. Bei fehlender Verbindung werden Messwerte und Bedienung nicht als aktuell dargestellt.

Die Integration registriert die Kartenressource bei einem Dashboard im Speichermodus automatisch. Falls die Karte nach der Erstinstallation fehlt, den Browser vollstÃ¤ndig neu laden. Falls nÃ¶tig unter Dashboard-Ressourcen eine **JavaScript-Modul**-Ressource eintragen:

```text
/drevos_static/drevos-smoker-card.js?v=0.1.3
```

Bei YAML-Ressourcenverwaltung diesen Pfad in der vorhandenen Ressourcenliste eintragen; eine automatische Ã„nderung dieser Liste erfolgt nicht. Keine doppelte Ressource hinzufÃ¼gen. Die neue Versionsnummer im URL-Parameter sorgt nach Updates fÃ¼r frischen Code.

## 6. Bedienung

| Funktion | Verhalten |
|---|---|
| Kammer Soll | 0â€“120 Â°C, ganze Grad. Ein positiver Sollwert schaltet die Heizung noch nicht ein. 0 beendet die Heizungsfreigabe. |
| Kernziel | 0â€“115 Â°C. 0 deaktiviert dieses Beendigungskriterium. Ein erreichtes positives Kernziel kann den Durchgang beenden. |
| Rauch Soll | 0â€“100 %. Positiver Wert allein startet keinen Rauch. 0 beendet den Rauchbetrieb. |
| Heizelement | Separate Freigabe der vorhandenen SPS-Regelung; gÃ¼ltiger Kammer-Sollwert erforderlich. |
| Rauch / ZÃ¼ndung | Freigabe der vorhandenen Rauch- und ZÃ¼ndungssequenz; RauchstÃ¤rke grÃ¶ÃŸer 0 erforderlich. Kein direktes Erzwingen eines ZÃ¼ndausgangs. |
| Konvektion / LÃ¼fter | Die bestÃ¤tigten manuellen SPS-Anforderungen. Die SPS kann Konvektion zusÃ¤tzlich fÃ¼r Heizung oder AbkÃ¼hlung verwenden. |
| Timerdauer | 1â€“9999 Minuten. |
| Timer Start | Startet den ZeitzÃ¤hler, schaltet Heizung und Rauch nicht ein. |
| Timer Pause | Nur bei ausgeschalteter Heizung und ausgeschaltetem Rauch zulÃ¤ssig. |
| Timer zurÃ¼cksetzen | Nur pausiert und ohne Heizungs-/Rauchfreigabe. Setzt die verstrichene Zeit auf 0. |
| Pi herunterfahren | Nur bei gestopptem Timer und ausgeschalteter Heizung/Rauchfreigabe. Schaltet den Ofen nicht aus. Zum Wiederstart muss der Pi erneut mit Strom gestartet werden. |

Sollwerte im Eingabefeld Ã¤ndern und **Ãœbernehmen** drÃ¼cken. Die Karte trennt die noch bearbeitete Eingabe vom rÃ¼ckgelesenen SPS-Wert. Heizung und Rauch werden in der Karte vor dem Einschalten ausdrÃ¼cklich bestÃ¤tigt.

Zeitangaben sind **Stunden:Minuten:Sekunden**. Der Timer liegt in der SPS, lÃ¤uft unabhÃ¤ngig vom geÃ¶ffneten Dashboard und endet nach der bestehenden SPS-Logik. Bei Ablauf werden Anforderungsbits und verstrichene Zeit zurÃ¼ckgesetzt; die vorhandene HMI kann anschlieÃŸend ihren Standardwert wieder anzeigen. In der geprÃ¼ften Anlage betrÃ¤gt dieser 9000 Minuten, also 150 Stunden. Das bedeutet bei ausgeschaltetem Timer nicht, dass ein Durchgang lÃ¤uft.

Bei aktivem Automatikprogramm und im unbestÃ¤tigten Fahrenheit-Modus sind manuelle Schreibzugriffe gesperrt. Die Ofensteuerung lÃ¤uft bei Netzwerkverlust eigenstÃ¤ndig weiter: **â€žnicht verfÃ¼gbarâ€œ ist keine Abschaltung des Ofens.**


## Info, Versionsnummer und Ã„nderungen

In der Drevos-Karte **Info** wÃ¤hlen. Dort stehen Thomas Eigner als Ersteller, die HA-Integrationsversion, Spendenbutton, Installationsanleitung, Support und Mitwirkende. Die Versionsnummer steht zusÃ¤tzlich unten an der Karte. **Was ist neu?** erscheint nach einem Update einmal pro Browserprofil und lÃ¤sst sich in Info wieder Ã¶ffnen. Details: [Infos und Updates](docs/UPDATES.md).

## 7. Aktualisieren

HA-Version **0.1.3** ergÃ¤nzt die Karte um **Ofen / Info**, deinen Erstellerhinweis, einen freiwilligen PayPal-Spendenbutton, sichtbare Versionsnummer und **Was ist neu?**. Auch die in HA angezeigte Einrichtungsbeschreibung und diese Anleitungen sind aktualisiert. Die frÃ¼here Version 0.1.2 hat den alten Mobile-Prototyp entfernt. Die eigenstÃ¤ndige App wird ausschlieÃŸlich im separaten [App-Repository](https://github.com/eignerth2010-byte/drevos-app) gepflegt. Das Pi-Gateway bleibt auf 0.1.1.

Version **0.1.1** enthÃ¤lt das mit der eigenstÃ¤ndigen App gemeinsame Gateway 0.1.1. Gleichzeitige HA-Bedienbefehle und Schreibzugriffe auf eine belegte serielle Verbindung werden abgelehnt und nicht vorgemerkt. Fehlermeldungen gibt es auf Deutsch und Englisch. Bestehende EntitÃ¤ten und Dashboard-Konfigurationen bleiben erhalten. Ist Gateway 0.1.1 durch die App bereits installiert, genÃ¼gt dieses HA-Update; der Pi braucht dafÃ¼r keine erneute Installation.

Die aktuelle [eigenstÃ¤ndige Android-/iOS-App](https://github.com/eignerth2010-byte/drevos-app) benÃ¶tigt kein Home Assistant. Beide Anbindungen verwenden denselben lokalen Gateway-Dienst; kein zweiter Dienst darf den SPS-Port Ã¶ffnen.

FÃ¼r **0.1.3** die HA-Integration im **Marketplace** (vor HA 2026.11: HACS) aktualisieren, HA neu starten und das Dashboard neu Ã¶ffnen. Das bestehende Pi-Gateway 0.1.1 benÃ¶tigt dafÃ¼r keine Ã„nderung. Die HA- und App-Versionsnummern laufen getrennt.

Vor einem Update die private Pi-Konfiguration und HA-Konfiguration sichern. Ã–ffentliche Releases enthalten keine persÃ¶nlichen Einstellungen.

Die folgenden Pi-Befehle gelten fÃ¼r eine gesonderte Aktualisierung des Gateways:

```sh
cd drevos-home-assistant
git pull --ff-only
sudo systemctl stop drevos-gateway.service
sudo sh scripts/install-gateway.sh
sudo systemctl start drevos-gateway.service
```

Eine vorhandene `/etc/drevos/gateway.json` wird vom Installer beibehalten. Die HA-Dateien Ã¼ber den Store aktualisieren oder `custom_components/drevos` ersetzen, anschlieÃŸend HA neu starten. Nach einer Kartenaktualisierung Browser neu laden. FÃ¼r eine RÃ¼ckkehr der HA-Integration die vorherige Version im Store installieren und HA neu starten. Bei gemeinsamer Nutzung mit der eigenstÃ¤ndigen App das Gateway 0.1.1 beibehalten. Private Konfigurationen nicht Ã¼berschreiben.

## 8. Fehler finden

```sh
sudo systemctl status drevos-gateway.service --no-pager
sudo journalctl -u drevos-gateway.service -n 50 --no-pager
ls -l /dev/serial/by-id/
```

- **Gateway nicht erreichbar:** Pi eingeschaltet, Netzwerk, LAN-Bind-Adresse und Port prÃ¼fen. `127.0.0.1` ist nur vom Pi selbst erreichbar.
- **UngÃ¼ltige Anmeldung:** privaten SchlÃ¼ssel lokal vergleichen, nicht verÃ¶ffentlichen; HA neu konfigurieren.
- **Temperaturen nicht verfÃ¼gbar:** SPS eingeschaltet, richtiger Adapter, Portzugriff und kein zweiter serieller Dienst prÃ¼fen.
- **Bedienung gesperrt:** `allow_control`, Automatikprogramm, Celsius-Modus und gÃ¼ltige Sollwerte prÃ¼fen.
- **Timer lÃ¤sst sich nicht pausieren:** zuerst Heizung und Rauch Ã¼ber die normalen Bedienelemente beenden.
- **Karte unbekannt:** Integrationsordner vollstÃ¤ndig, HA neu gestartet, Ressource registriert und Browser neu geladen?

HA-Diagnosedaten enthalten bewusst keine Gateway-Adresse und keinen ZugangsschlÃ¼ssel. Vor dem Hochladen von Protokollen oder Screenshots trotzdem persÃ¶nliche Angaben prÃ¼fen. Ein unklar beantworteter Schreibbefehl wird nicht automatisch wiederholt; zuerst aktuellen Zustand am Display oder in HA prÃ¼fen.

## 9. Entfernen und Entwicklung

ZunÃ¤chst laufenden Ofenbetrieb ordnungsgemÃ¤ÃŸ beenden. Integration in **GerÃ¤te & Dienste** entfernen, zugehÃ¶rige Karten und ungenutzte Dashboard-Ressource entfernen, `custom_components/drevos` lÃ¶schen und HA neu starten. Auf dem Pi den Gateway-Dienst und den zugehÃ¶rigen Poweroff-WÃ¤chter nur deaktivieren, wenn die eigenstÃ¤ndige App oder andere Clients sie nicht weiter benÃ¶tigen. Die private Konfiguration bis zur bestÃ¤tigten RÃ¼ckkehr zu einer anderen Anbindung aufbewahren.

```sh
sudo systemctl disable --now drevos-gateway.service drevos-native-poweroff.path
```

Tests, GitHub-VerÃ¶ffentlichung, Releases und BeitrÃ¤ge: [GITHUB.md](docs/GITHUB.md) und [CONTRIBUTING.md](CONTRIBUTING.md). Private und betriebsinterne Nutzung sind nach der [aktuellen Lizenz](LICENSE) kostenlos; Verkauf und kommerzielle Weitergabe erfordern vorherige schriftliche Freigabe. Der tatsÃ¤chliche PrÃ¼fstand und offene Grenzen stehen in [VALIDATION.md](docs/VALIDATION.md).


## Vorschau

![Drevos â€“ Beispielansicht](docs/assets/drevos-ha-card-demo.jpg)

Originale Drevos-Karte fÃ¼r Home Assistant â€“ isolierte Vorschau mit Beispielwerten.

![HA-Integration 0.1.3 â€“ Info & UnterstÃ¼tzen](docs/assets/drevos-ha-info.jpg)

## Mitwirkende

Erstellt von **Thomas Eigner**, mit KI-UnterstÃ¼tzung durch **ChatGPT (OpenAI)** bei Entwicklung, Tests und Dokumentation. [Alle Mitwirkenden](CONTRIBUTORS.md).

## Projekt unterstÃ¼tzen

Wenn dir dieses Projekt hilft, kannst du die Weiterentwicklung mit einer freiwilligen Spende Ã¼ber PayPal unterstÃ¼tzen. Vielen Dank!

[![Ãœber PayPal spenden](https://img.shields.io/badge/Donate-PayPal-0070BA?logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)

Alternativ kannst du den QR-Code scannen:

[![PayPal-Spenden-QR-Code](docs/assets/paypal-donate-qr.png)](https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C)
