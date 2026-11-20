# Drevos Smoker â€“ deutsche Anleitung

[English](README.en.md) Â· [ProjektÃ¼bersicht](README.md)

Diese Integration verbindet Home Assistant direkt Ã¼ber das Heimnetz mit einem Raspberry Pi am Drevos-RÃ¤ucherofen. Der Pi spricht mit der vorhandenen SPS. MQTT wird fÃ¼r diese Integration nicht benÃ¶tigt.

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

**Vor dem Start jeden anderen Dienst stoppen, der dieselbe serielle Schnittstelle verwendet.** FÃ¼r eine bestehende Installation dieses Projekts mit MQTT:

```sh
sudo systemctl stop drevos-mqtt.service
sudo systemctl enable --now drevos-gateway.service drevos-native-poweroff.path
sudo systemctl status drevos-gateway.service --no-pager
```

Bei erfolgreichem Umstieg den alten Dienst deaktivieren:

```sh
sudo systemctl disable drevos-mqtt.service
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
/drevos_static/drevos-smoker-card.js?v=0.1.1
```

Bei YAML-Ressourcenverwaltung diesen Pfad in der vorhandenen Ressourcenliste eintragen; eine automatische Ã„nderung dieser Liste erfolgt nicht. Keine doppelte Ressource hinzufÃ¼gen. Die neue Versionsnummer im URL-Parameter sorgt nach Updates fÃ¼r frischen Code.

FÃ¼r einen vorÃ¼bergehenden Betrieb der Karte mit den frÃ¼heren MQTT-EntitÃ¤tsnamen kann `legacy_mqtt: true` gesetzt werden. Das ist nur eine Ãœbergangshilfe; die native Integration selbst benÃ¶tigt MQTT nicht.

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

## 7. Bestehende MQTT-Anlage umstellen

Die native Integration erzeugt eigene EntitÃ¤ten. Bestehende MQTT-EntitÃ¤ten nicht vorab lÃ¶schen: zunÃ¤chst Gateway umstellen, neue Integration einrichten, Werte vergleichen und die neue Karte verwenden. Andere Automationen und Dashboards danach gezielt auf die neuen EntitÃ¤ten umstellen. Alte MQTT-Discovery-EintrÃ¤ge kÃ¶nnen anschlieÃŸend entfernt werden; den gemeinsamen MQTT-Broker nicht deinstallieren, wenn andere GerÃ¤te ihn verwenden.

Sicherung der frÃ¼heren Dienstdateien und Konfiguration behalten. RÃ¼ckkehr:

```sh
sudo systemctl disable --now drevos-gateway.service
sudo systemctl enable --now drevos-mqtt.service
```

Nie beide Dienste gleichzeitig auf denselben SPS-Port zugreifen lassen. Die ursprÃ¼ngliche `drevos_lesetest.py` wird von dieser Installation nicht verÃ¤ndert.

## 8. Aktualisieren

Version **0.1.1** enthält das mit der eigenständigen App gemeinsame Gateway 0.1.1. Gleichzeitige HA-Bedienbefehle und Schreibzugriffe auf eine belegte serielle Verbindung werden abgelehnt und nicht vorgemerkt. Fehlermeldungen gibt es auf Deutsch und Englisch. Bestehende Entitäten und Dashboard-Konfigurationen bleiben erhalten. Ist Gateway 0.1.1 durch die App bereits installiert, genügt dieses HA-Update; der Pi braucht dafür keine erneute Installation.

Die aktuelle [eigenständige Android-/iOS-App](https://github.com/eignerth2010-byte/drevos-app) benötigt kein Home Assistant. Beide Anbindungen verwenden denselben lokalen Gateway-Dienst; kein zweiter Dienst darf den SPS-Port öffnen.

Vor einem Update die private Pi-Konfiguration und HA-Konfiguration sichern. Ã–ffentliche Releases enthalten keine persÃ¶nlichen Einstellungen.

```sh
cd drevos-home-assistant
git pull --ff-only
sudo systemctl stop drevos-gateway.service
sudo sh scripts/install-gateway.sh
sudo systemctl start drevos-gateway.service
```

Eine vorhandene `/etc/drevos/gateway.json` wird vom Installer beibehalten. Die HA-Dateien Ã¼ber den Store aktualisieren oder `custom_components/drevos` ersetzen, anschlieÃŸend HA neu starten. Nach einer Kartenaktualisierung Browser neu laden. FÃ¼r eine RÃ¼ckkehr zuerst den vorherigen Git-Tag auschecken und dieselben Installationsschritte ausfÃ¼hren; private Konfiguration sichern und bei geÃ¤nderter Dateistruktur die Release-Hinweise beachten.

## 9. Fehler finden

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

## 10. Entfernen und Entwicklung

ZunÃ¤chst laufenden Ofenbetrieb ordnungsgemÃ¤ÃŸ beenden. Integration in **GerÃ¤te & Dienste** entfernen, zugehÃ¶rige Karten und ungenutzte Dashboard-Ressource entfernen, `custom_components/drevos` lÃ¶schen und HA neu starten. Auf dem Pi den Gateway-Dienst und den zugehÃ¶rigen Poweroff-WÃ¤chter deaktivieren. Die private Konfiguration bis zur bestÃ¤tigten RÃ¼ckkehr zu einer anderen Anbindung aufbewahren.

```sh
sudo systemctl disable --now drevos-gateway.service drevos-native-poweroff.path
```

Tests, GitHub-VerÃ¶ffentlichung, Releases und BeitrÃ¤ge: [GITHUB.md](docs/GITHUB.md) und [CONTRIBUTING.md](CONTRIBUTING.md). Die [MIT-Lizenz](LICENSE) verursacht keine LizenzgebÃ¼hren. Der tatsÃ¤chliche PrÃ¼fstand und offene Grenzen stehen in [VALIDATION.md](docs/VALIDATION.md).


