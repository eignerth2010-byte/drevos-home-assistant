# Home Assistant und Drevos-App – was brauche ich zusätzlich?

[English](HA-UND-APP.en.md) · [Einfache HA-Installation](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.de.md) · [Einfache App-Installation](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.de.md)

**Pi und Datenkabel werden gemeinsam weiterverwendet.** Die HA-Integration und die eigenständige App benutzen denselben lokalen Gateway. Nur dieser öffnet die serielle Verbindung zur Ofensteuerung. Der aktuelle gemeinsame Gateway-Stand in beiden Projekten ist **0.1.1**.

Wenn HA und App bereits funktionieren, ist kein Umstieg nötig. Die folgenden Schritte sind für eine fehlende zusätzliche Verbindung gedacht. Sie ändern nicht das SPS-Programm.

## Welcher Fall trifft zu?

| Das funktioniert schon | Das kommt dazu | Was bleibt bestehen? |
|---|---|---|
| Native Drevos-Integration in HA | App-Verbindungsdienst auf demselben Pi, Handy-/Web-App und einmalige QR-Kopplung | Pi, Kabel, Gateway, HA-Integration, Karte und bestehende Einstellungen |
| Eigenständige Drevos-App | Home Assistant, Drevos-Integration und lokaler Netzwerkzugriff auf denselben Gateway | Pi, Kabel, Gateway, App-Dienst und vorhandene Handy-Kopplung |
| HA und App | Nur ein weiteres Handy koppeln oder eine weitere Dashboard-Karte hinzufügen | Bestehende Installation und Schlüssel |
| Frühere MQTT-Lösung | Zuerst auf den gemeinsamen nativen Gateway umstellen, dann App ergänzen | Hardware; MQTT-Automationen müssen gesondert auf neue Entitäten umgestellt werden |

## A Home Assistant funktioniert schon die App soll dazukommen

Gemeint ist die **native Drevos-Integration** dieses Projekts mit `drevos-gateway.service`, nicht nur ein MQTT-Broker oder alte MQTT-Sensoren.

### Was zusätzlich benötigt wird

Internet am vorhandenen Pi, die Web-App oder native Handy-App und der zusätzliche Dienst `drevos-cloud.service`. Die gemeinsame öffentliche Dienstadresse ist bereits im App-Projekt enthalten. Nutzer brauchen weder einen eigenen Cloudflare-Zugang noch einen zweiten Pi oder ein weiteres Datenkabel.

### Schritte

1. Den Pi nicht neu installieren. Vorhandene private Konfigurationen lokal sichern; `id`, `token`, Adapterpfad, LAN-Adresse und Freigaben erhalten.
2. Am bestehenden Pi mit dem vorhandenen SSH-Benutzer anmelden. Prüfen:

```sh
systemctl is-active drevos-gateway.service
/opt/drevos/.venv/bin/python -c "from drevos_gateway import __version__; print(__version__)"
```

Erwartet: `active` und beim aktuellen Stand `0.1.1`. Bei einem älteren Gateway aktualisiert der App-Installer bei Bedarf dessen Programm; die private Gateway-Konfiguration bleibt erhalten. Ein Dienstneustart unterbricht die Anzeigen kurz, die SPS läuft eigenständig weiter.

3. Falls der App-Projektordner noch fehlt, **auf dem Pi** herunterladen:

```sh
cd ~
git clone https://github.com/eignerth2010-byte/drevos-app.git
cd ~/drevos-app
```

Existiert der Ordner bereits, ihn weiterverwenden und nur `cd ~/drevos-app` eingeben. Bei einem veralteten Checkout vor der Installation regulär aktualisieren; keine lokalen Dateien erzwungen überschreiben.

4. **Nur den zusätzlichen Verbindungsdienst installieren:**

```sh
sudo sh scripts/install-cloud.sh
```

Nicht zusätzlich eine frische Gateway-Konfiguration erzeugen oder den vorhandenen Gateway auf `127.0.0.1` zurückstellen. Der Installer liest die vorhandene `bind`-Adresse und den Gateway-Schlüssel und legt daraus seinen privaten lokalen Zugang an. Ein eigenes Relay oder ein Server-Platzhalter wird nicht benötigt.

5. Beide Dienste prüfen:

```sh
systemctl is-active drevos-gateway.service drevos-cloud.service
```

Erwartet: zweimal `active`.

6. [Web-App/Handy-App installieren](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.de.md#7-drevos-auf-dem-handy-installieren) und [QR-Kopplung durchführen](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/INSTALLATION.de.md#8-handy-und-ofen-koppeln). Die bereits laufende HA-Integration bleibt eingerichtet.
7. In HA und App die echten Temperaturen vergleichen. Danach die App einmal mit mobilen Daten prüfen. Für den Fernzugriff brauchen Pi und Handy Internet; der lokale HA-Zugang bleibt davon unabhängig.

## B Die App funktioniert schon Home Assistant soll dazukommen

### Was zusätzlich benötigt wird

Eine laufende [Home-Assistant-Installation](https://www.home-assistant.io/installation/) mit Administratorzugang und die [Drevos-Integration](https://github.com/eignerth2010-byte/drevos-home-assistant). HA kann auf einem vorhandenen geeigneten Rechner/NAS oder einem eigenen HA-Gerät laufen. Den funktionierenden Gateway-Pi mit Raspberry Pi OS behalten; seine Speicherkarte nicht mit Home Assistant OS überschreiben.

### Warum eine lokale Adresse angepasst werden kann

Eine neue reine App-Installation bindet den Gateway standardmäßig an **`127.0.0.1:8756`**. Damit erreicht ihn der App-Dienst auf demselben Pi, HA auf einem anderen Rechner aber nicht. Für gemeinsamen Betrieb muss der Gateway im vertrauenswürdigen Heimnetz erreichbar sein. **Wird `bind` geändert, muss auch `gateway_url` des bereits eingerichteten App-Dienstes zur neuen Adresse passen.** Sonst würde die App ihre lokale Verbindung verlieren.

### Schritte

1. Am Pi anmelden. Die beiden privaten Dateien vor der ersten Umstellung lokal sichern:

```sh
sudo cp -a /etc/drevos/gateway.json /etc/drevos/gateway.json.vor-ha
sudo cp -a /etc/drevos-cloud/config.json /etc/drevos-cloud/config.json.vor-ha
```

Diese Sicherungen bleiben privat auf dem Pi. Vorhandene Sicherungen vor erneutem Kopieren erhalten.

2. **Die LAN-Adresse des Pi anzeigen:**

```sh
hostname -I
```

Die zum Heimnetz gehörende IPv4-Adresse verwenden. Steht dort beispielsweise `192.168.1.50`, lautet die lokale Gateway-Adresse `http://192.168.1.50:8756`. Das ist nur ein Beispiel; deine tatsächliche Adresse aus der Ausgabe einsetzen. Bei mehreren Adressen die Router-Geräteliste prüfen. Eine feste DHCP-Zuweisung im Router vermeidet spätere Adresswechsel.

3. Gateway-Einstellungen lokal öffnen:

```sh
sudo nano /etc/drevos/gateway.json
```

Wenn `bind` noch `127.0.0.1` enthält, ausschließlich dessen Wert durch die eigene Pi-LAN-Adresse ersetzen. `id`, `token`, `profile`, Adapterpfad, `port` und `allow_control` beibehalten. Ist der Gateway bereits unter einer geeigneten LAN-Adresse erreichbar, diese behalten. Speichern mit **Strg+O**, **Enter**, **Strg+X**.

4. **Im bestehenden App-Dienst dieselbe lokale Adresse eintragen:**

```sh
sudo nano /etc/drevos-cloud/config.json
```

Nur `gateway_url` auf die erreichbare lokale Gateway-Adresse ändern. Im Beispiel wäre das `http://192.168.1.50:8756`. `relay`, `room`, `key`, `auth`, `gateway_token` und `gateway_id` unverändert lassen. **Die private Kopplung nicht neu erzeugen und `pairing.json` nicht löschen.** Speichern und schließen.

Wichtig: Hier wird die **lokale Adresse** geändert, nicht die öffentliche Dienstadresse. `gateway_token` bleibt der bereits passende Gateway-Schlüssel.

5. Dienste nacheinander neu starten und prüfen:

```sh
sudo systemctl restart drevos-gateway.service
sudo systemctl restart drevos-cloud.service
systemctl is-active drevos-gateway.service drevos-cloud.service
```

Erwartet: zweimal `active`. In der bereits gekoppelten App aktualisieren. Da die App-Kopplungsschlüssel gleich geblieben sind, ist normalerweise kein neues Koppeln nötig.

6. In HA die Erweiterung installieren und einrichten: [ab Schritt 7 der einfachen HA-Anleitung](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.de.md#7-erweiterung-in-home-assistant-installieren). Als URL den Pi im Heimnetz mit Port `8756` angeben, als Schlüssel den privaten `token` aus `/etc/drevos/gateway.json`.
7. [Ofenkarte hinzufügen](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/docs/INSTALLATION.de.md#9-ofenkarte-ins-dashboard-legen) und Werte in beiden Oberflächen prüfen. Anschließend die App auch mit mobilen Daten kontrollieren.

Die lokale HTTP-Schnittstelle gehört in ein vertrauenswürdiges Heimnetz; sie verschlüsselt den Gateway-Schlüssel nicht auf dem Transportweg. Keine Router-Portfreigabe für `8756` oder die Kopplungsseite `8765` einrichten.

## C Was wenn etwas anders ist?

| Situation | Was tun? |
|---|---|
| HA zeigt nur alte MQTT-Sensoren | Zuerst die [Umstellung auf den nativen Gateway](https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/README.de.md#7-bestehende-mqtt-anlage-umstellen) durchführen. Der alte MQTT-Leser und der neue Gateway dürfen die Schnittstelle nicht gleichzeitig öffnen. Den gemeinsamen Broker für andere Geräte behalten. |
| Nur HA vorhanden und kein Internet gewünscht | Beim lokalen HA-Betrieb bleiben. Die eigenständige App verwendet für ihren einfachen Fernzugriff den gemeinsamen Internetdienst. |
| App fällt direkt nach Änderung von `bind` aus | `gateway_url` in `/etc/drevos-cloud/config.json` mit der tatsächlichen lokalen Gateway-Adresse abgleichen, dann App-Dienst neu starten. Nicht neue Kopplungsschlüssel erzeugen. |
| Pi bekommt eine andere IP-Adresse | `bind`, die lokale App-`gateway_url` und die in HA verwendete Adresse prüfen. Eine unveränderte funktionierende Namens-/Proxy-Adresse kann weiterverwendet werden. |
| HA verlangt einen Schlüssel | Gateway-`token` verwenden. Der QR-Code enthält einen getrennten App-Zugang; beide sind nicht austauschbar. |
| App ist gekoppelt und ein weiteres Handy soll dazu | Die fünfminütige Pi-Kopplungsseite erneut öffnen und nur das neue Handy koppeln. |
| HA und App zeigen unterschiedliche Werte | In beiden aktualisieren und Verbindungsstatus prüfen; es ist derselbe Ofen mit gemeinsamen Sollwerten. Keine getrennten Heizprogramme erwarten. |
| Gleichzeitige Bedienung | Änderungen betreffen dieselbe SPS. Befehle gezielt über eine Oberfläche ausführen und den rückgelesenen Zustand abwarten; ein belegter Gateway kann weitere Befehle ablehnen. |
| Pi wird über eine Oberfläche heruntergefahren | Beide Zugänge verlieren den Pi. Die App kann ihn nicht wieder einschalten; Pi-Abschaltung trennt nicht die Ofen-Stromversorgung. |
| HTTPS-Proxy oder besondere Netzwerkkonfiguration vorhanden | Den bestehenden funktionierenden und authentifizierten lokalen Zugang beibehalten. Die einfachen LAN-Beispiele nicht ungeprüft über die eigene Konfiguration schreiben. |

Beide Oberflächen verwenden dieselben Freigaben und dieselbe reale Ofensteuerung. Eine getrennte Hardwareinstallation, ein zusätzlicher serieller Leser oder eine Änderung des SPS-Programms sind für den gemeinsamen Betrieb nicht vorgesehen.
