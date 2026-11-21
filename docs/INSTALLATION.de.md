# Einfach starten – Pi und Home-Assistant-Integration installieren

[English](INSTALLATION.en.md) · [Welcher Pi und welches Kabel?](HARDWARE.md) · [HA und App zusammen verwenden](HA-UND-APP.de.md)

Diese Anleitung verbindet einen Drevos-Ofen über einen Raspberry Pi mit einem bereits eingerichteten Home Assistant. Die Pi-Software wird auf **Raspberry Pi OS** installiert; die Pi-Befehle gehören nicht in das Terminal eines anderen HA-Rechners mit Home Assistant OS.

**Die Drevos-App funktioniert auf deinem Pi schon?** Dann Pi und Speicherkarte weiterverwenden und direkt [App → Home Assistant](HA-UND-APP.de.md#b-die-app-funktioniert-schon-home-assistant-soll-dazukommen) lesen. **HA funktioniert schon und du möchtest die App dazu?** Hier geht es zu [Home Assistant → App](HA-UND-APP.de.md#a-home-assistant-funktioniert-schon-die-app-soll-dazukommen). Ein zweiter Pi ist für diese beiden Zugänge nicht erforderlich.

## 1 Was du brauchst

| Teil | Was genau? |
|---|---|
| Home Assistant | Bereits installiert, mit Administratorzugang; für diese Integration ab Version 2026.3. |
| Ofen | Die Steuerung muss zum geprüften Profil `drevos_fx3u_v1` passen. Die Marke Drevos allein bestätigt das nicht. |
| Pi | **Pi 3 B+ ist der geprüfte Referenzaufbau.** Pi 3 B, Pi 4 B und Zero 2 W sind ebenfalls softwareseitig vorgesehen. |
| Netzteil und Speicher | Zum Pi passendes Netzteil, microSD-Karte (für diese Anleitung 16 GB oder größer), Kartenleser und Gehäuse. |
| Datenkabel | Im Referenzaufbau **DTECH USB auf RS232 DB9, FTDI, 1,2 m** – [Produktlink](https://www.amazon.de/dp/B08L4ZR5ZX). Anschluss und elektrische Schnittstelle müssen zur Steuerung passen. |
| Zero 2 W zusätzlich | Micro-USB-OTG-Adapter auf USB-A-Buchse am Datenanschluss, Stromversorgung am getrennten Stromanschluss. |
| Netzwerk | Pi und HA im selben vertrauenswürdigen Heimnetz, per LAN oder WLAN. |
| Einrichtung | Windows-PC oder Mac zum Anmelden am Pi; Browser für Home Assistant. |

Die [Materialliste](HARDWARE.md) erklärt Netzteile und Unterschiede der Pi-Modelle. Es wird dieselbe Gateway-Software verwendet. Ein vorhandener Pi-Gateway kann von HA und App gemeinsam benutzt werden. Die reine HA-Verbindung läuft lokal; ein Vermittlungsdienst ist dafür nicht nötig.

## 2 Nur einen neuen Pi vorbereiten

**Am PC oder Mac:**

1. [Raspberry Pi Imager](https://www.raspberrypi.com/software/) installieren und öffnen.
2. Dein Pi-Modell, **Raspberry Pi OS Lite (64-bit)** und die richtige microSD-Karte wählen.
3. Vor dem Schreiben Gerätename `drevos-pi`, Benutzername `ofenadmin`, ein eigenes Passwort und dein Heimnetz eintragen. SSH aktivieren und Anmeldung mit dem eigenen Passwort wählen.
4. Die richtige Speicherkarte beschreiben; deren bisheriger Inhalt wird dabei gelöscht.
5. Karte in den Pi stecken, Netzwerk und Netzteil anschließen und den ersten Start einige Minuten abwarten.

[Offizielle bebilderte Pi-Einrichtung](https://www.raspberrypi.com/documentation/computers/getting-started.html). Einen bereits eingerichteten Pi nicht neu beschreiben.

## 3 Vom PC am Pi anmelden

Unter Windows **Terminal/PowerShell**, am Mac **Terminal** öffnen:

```sh
ssh ofenadmin@drevos-pi.local
```

Die Angaben passen zum neuen Pi aus Schritt 2. Bei einem bestehenden Pi seinen vorhandenen Benutzernamen verwenden. Die erste Vertrauensabfrage nur für deinen Pi bestätigen und das eigene Pi-Passwort eingeben. Dass beim Passwort keine Zeichen erscheinen, ist normal.

Die Eingabezeile nennt danach deinen Pi. **Die folgenden Befehle werden auf dem Pi in diesem angemeldeten Fenster eingegeben.** Jeden Befehl einzeln ausführen; bei einer Fehlermeldung erst deren Ursache klären.

## 4 Pi-Programm installieren

Den passenden Datenadapter mit dem vorgesehenen Anschluss der Ofensteuerung verbinden. Pi und Steuerung einschalten; Heizung und Rauch sind dafür nicht nötig. Nur ein Dienst darf die serielle Verbindung benutzen. Eine bestehende App-/HA-Anlage über die [Wechselanleitung](HA-UND-APP.de.md) erweitern.

**Auf dem Pi:**

```sh
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip ca-certificates nano
cd ~
git clone https://github.com/eignerth2010-byte/drevos-home-assistant.git
cd ~/drevos-home-assistant
sudo sh scripts/install-gateway.sh
```

Die Zeilen der Reihe nach ausführen. Besteht der Projektordner schon, ihn behalten und nicht löschen. Der Installer erzeugt einen eigenen Dienst und eine private Konfiguration. Er startet die serielle Verbindung noch nicht; die Bedienung ist zunächst gesperrt.

## 5 Adapter und lokale Adresse einstellen

**Auf dem Pi:**

```sh
ls -l /dev/serial/by-id/
```

Es sollte ein Eintrag für das Datenkabel erscheinen. Bei genau einem Adapter übernimmt der Installer den Pfad automatisch. Ohne Eintrag Kabel/USB-Anschluss prüfen; bei mehreren Adaptern den zum Ofen gehörenden Eintrag eindeutig bestimmen.

```sh
hostname -I
```

Notiere die **IPv4-Adresse des Pi im Heimnetz**. Beispiel: Zeigt dein Pi `192.168.1.50`, wird genau diese Adresse verwendet. Die Beispieladresse gilt nicht automatisch für dein Netzwerk. Bei mehreren Adressen den zum Heimnetz gehörenden Eintrag mit der Geräteliste im Router abgleichen. Im Router dem Pi nach Möglichkeit immer dieselbe Adresse zuweisen.

```sh
sudo nano /etc/drevos/gateway.json
```

Diese Punkte prüfen; die übrigen Felder erhalten:

| Feld | Was eintragen oder beibehalten? |
|---|---|
| `serial_port` | Der passende vollständige Adapterpfad aus `/dev/serial/by-id/`. Ein Eintrag mit `CHOOSE_YOUR_VERIFIED_ADAPTER` muss ersetzt werden. |
| `profile` | Für den geprüften Aufbau `drevos_fx3u_v1`. Dieser Name ersetzt keine Prüfung anderer Steuerungen. |
| `bind` | **Die gerade ermittelte LAN-Adresse deines Pi**, damit HA auf einem anderen Rechner ihn erreicht. `127.0.0.1` wäre nur auf dem Pi selbst erreichbar. |
| `port` | `8756` beibehalten. |
| `allow_control` | Anfangs `false` lassen; zunächst nur lesen. |
| `id` und `token` | Die erzeugten Werte beibehalten. Der Wert von `token` wird später privat in HA eingegeben. |

Mit **Strg+O**, **Enter**, **Strg+X** speichern und schließen. Den privaten Schlüssel nicht in Chat, Screenshots oder GitHub kopieren. Die lokale HTTP-Verbindung überträgt ihn ohne Transportverschlüsselung; sie gehört in dein vertrauenswürdiges Heimnetz. Keine Router-Portfreigabe einrichten.

Bei bereits laufender App darf die Adresse nicht nur hier geändert werden: [App-Verbindung mit anpassen](HA-UND-APP.de.md#b-die-app-funktioniert-schon-home-assistant-soll-dazukommen).

## 6 Pi-Dienst starten

Auf einem neuen Pi:

```sh
sudo systemctl enable --now drevos-gateway.service drevos-native-poweroff.path
systemctl is-active drevos-gateway.service
```

**Erwartet:** `active`. Der Dienst startet künftig automatisch. Bei `failed` oder `inactive` erst den Fehler klären.

## 7 Erweiterung in Home Assistant installieren

**Im Browser in Home Assistant**, nicht im Pi-Terminal:

### Wenn HACS oder ein passender Community-Store vorhanden ist

Das Repository `https://github.com/eignerth2010-byte/drevos-home-assistant` als benutzerdefinierte **Integration** hinzufügen, herunterladen und Home Assistant neu starten. Die vom Store gezeigten Hinweise selbst lesen und bestätigen. [Ausführliche Store-Anleitung](../README.de.md#über-den-community-store).

### Ohne Community-Store manuell

1. Das [Projekt als ZIP herunterladen](https://github.com/eignerth2010-byte/drevos-home-assistant/archive/refs/heads/main.zip) und am PC entpacken.
2. Den Konfigurationsordner deiner HA-Installation öffnen – den Ordner, der auch `configuration.yaml` enthält. Dazu deinen eingerichteten Dateizugriff, etwa eine Dateifreigabe, verwenden.
3. Darin bei Bedarf `custom_components` anlegen.
4. Den **gesamten Ordner `drevos` aus `custom_components` des Downloads** hineinkopieren, einschließlich `translations` und `www`.
5. Home Assistant neu starten.

Das Ergebnis muss unter anderem `custom_components/drevos/manifest.json` im HA-Konfigurationsordner enthalten. Nicht den ganzen GitHub-Projektordner als Integration kopieren. Bei fehlendem Dateizugriff zuerst diesen für deine HA-Installationsart einrichten; der Pi-Projektordner ist nicht der HA-Konfigurationsordner.

## 8 Ofen in HA hinzufügen

1. **Einstellungen → Geräte & Dienste → Integration hinzufügen** öffnen.
2. Nach **Drevos Smoker** suchen.
3. Als Adresse `http://drevos-pi.local:8756` eintragen. Falls der Gerätename nicht gefunden wird, die eigene LAN-Adresse aus Schritt 5 mit `http://` und `:8756` verwenden.
4. Den **Wert von `token` aus `/etc/drevos/gateway.json`** privat in das Schlüsselfeld eingeben. Die Datei dazu am Pi lokal öffnen. Der App-QR-Code ist ein anderer Zugang und gehört nicht in dieses Feld.
5. Einen Bereich auswählen, zum Beispiel Terrasse, und abschließen.

**Erfolg erkennen:** Das neue Drevos-Gerät liefert die echten Kammer- und Kerntemperaturen. Werte mit dem Ofendisplay vergleichen.

## 9 Ofenkarte ins Dashboard legen

Im gewünschten Dashboard **Bearbeiten → Karte hinzufügen → Drevos Smoker** wählen, Titel/Sprache einstellen und speichern. Bei genau einem Ofen wird er automatisch ausgewählt. Nach der ersten Installation den Browser gegebenenfalls vollständig neu laden.

Falls die Karte fehlt, stehen [Ressourcenpfad und manueller Karteneditor](../README.de.md#5-komplette-ofenkarte-hinzufügen) in der technischen Anleitung.

## 10 Bedienung nach bestätigtem Registerprofil freigeben

Neue Anlagen lesen zunächst nur. Erst wenn Werte und **Schreibadressen der tatsächlichen Steuerung** zum geprüften Profil passen, in derselben Pi-Konfiguration `"allow_control": false` auf `"allow_control": true` ändern und speichern:

```sh
sudo systemctl restart drevos-gateway.service
```

Die Freigabe selbst startet weder Heizung noch Zündung. Bei Automatikbetrieb oder Verbindungsproblemen bleiben weitere Sperren aktiv. Die Ofensicherheit wird von der vorhandenen Steuerung gewährleistet; ein Netzwerkfehler schaltet den Ofen nicht aus.

## Wenn etwas nicht funktioniert

| Problem | Was prüfen? |
|---|---|
| Pi-Name nicht gefunden | Gleiches Heimnetz, tatsächlicher Gerätename und Router-Geräteliste. |
| HA erreicht den Pi nicht | Gateway `active`, `bind` auf die richtige Pi-LAN-Adresse gesetzt, richtige Adresse/Port in HA und Netzwerkzugriff zwischen den Geräten. |
| „Ungültiger Schlüssel“ | `token` der Gateway-Datei verwenden; keine Anführungszeichen mitkopieren und nicht den App-Kopplungscode verwenden. |
| Keine plausiblen Temperaturen | Ofensteuerung eingeschaltet, passendes Kabel, richtiger Adapterpfad und bestätigtes Profil. |
| App geht nach HA-Erweiterung nicht mehr | `gateway_url` des App-Dienstes muss die neue lokale Gateway-Adresse erreichen; siehe [HA und App](HA-UND-APP.de.md). |
| Bedienelemente gesperrt | `allow_control`, Automatikmodus und Verbindungszustand prüfen. |

Für Updates und Rückkehr zur vorherigen Installation: [technische Anleitung](../README.de.md). Für App-Erweiterung und parallelen Betrieb: [Was brauche ich zusätzlich?](HA-UND-APP.de.md).

## Infos und spätere Updates

Ab HA-Integration **0.1.3** findest du in der Drevos-Karte **Info**: Ersteller Thomas Eigner, Versionsnummer, freiwilliger Spendenbutton, Anleitung und Support. **Was ist neu?** erklärt die Änderungen. Updates über **Einstellungen → Marketplace** installieren, danach HA neu starten und das Dashboard neu öffnen. Für dieses Kartenupdate bleibt das vorhandene Pi-Gateway 0.1.1 bestehen. [Update-Anleitung](UPDATES.md).
