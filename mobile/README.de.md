# Drevos-App – deutsche Anleitung

Die App bedient deinen Drevos über die bereits eingerichtete **native Drevos-Integration in Home Assistant**. Der Raspberry Pi bleibt unverändert. Die App greift nicht auf die serielle Verbindung zu. Home Assistant und der Pi müssen erreichbar sein; für Fernzugriff wird der vorhandene sichere HA-Zugang oder ein VPN verwendet.

## Was du brauchst

- Einen Ofen mit dem geprüften Drevos-Profil und die funktionierende Pi-/HA-Anbindung aus diesem Repository. Die App unterstützt dieselben Funktionen und Grenzen wie die Integration.
- Home Assistant mit aktivierten Drevos-Entitäten und einem Benutzer mit Bedienberechtigung. Die App wurde mit Zuständen aus HA 2026.11.1 geprüft.
- Android 7+ oder iPhone/iPad mit iOS/iPadOS 16.4+. Der erzeugte Android-Testbuild ist für ARM-Geräte; reale Gerätetests stehen noch aus.
- Für die Anmeldung die **Home-Assistant-Adresse**, zum Beispiel die eigene HTTPS-Adresse. Zugangsdaten werden nur im Anmeldefenster von Home Assistant eingegeben.

## Android-Build ohne lokale Entwicklungsumgebung

1. Auf GitHub dieses Repository öffnen, **Actions → Drevos Mobile → Run workflow** wählen.
2. Den Build starten. Wenn kein iPhone-Build gebraucht wird, `build_ios` ausschalten.
3. Nach erfolgreichem Abschluss unter **Artifacts** `Drevos-Android-preview-APK` herunterladen und entpacken.
4. Die APK auf das Android-Handy übertragen, öffnen und die Installation für diese Datei zulassen. Es handelt sich um einen Testbuild, nicht um eine Play-Store-Veröffentlichung.
5. Die App enthält ihr Programm bereits; ein laufender Entwicklungsserver ist nicht erforderlich. APKs aus unterschiedlichen Testläufen können unterschiedliche Testsignaturen haben. Falls ein Update wegen der Signatur abgelehnt wird, zuerst abmelden, die alte Test-App entfernen und neu installieren. Für dauerhafte Updates einen eigenen, gleichbleibenden Release-Schlüssel verwenden.

GitHub speichert die Build-Artefakte 14 Tage. Standard-Buildrechner sind für öffentliche Repositories laut [GitHub](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) kostenlos. Bei privaten Repositories gelten andere Kontingente. Es werden keine kostenpflichtigen Dienste oder Abos automatisch eingerichtet.

## iPhone bei macOS 13 Ventura

Ventura kann das für dieses Projekt erforderliche Xcode 26.4+ nicht ausführen. Du musst die VM deshalb für den Build nicht weiter einrichten.

Der GitHub-Workflow kann die iPhone-App auf einem aktuellen gehosteten Mac **kompilieren**. Das Artefakt `Drevos-iPhone-UNSIGNED-needs-Apple-signing` enthält eine **unsignierte** `.ipa`. Diese Datei allein lässt sich nicht auf einem iPhone installieren. Der Workflow verwendet keine Apple-Anmeldung und erzeugt kein Zertifikat oder Geräteprofil.

Für eine tatsächlich installierbare App wird danach eine passende Apple-Signierung benötigt. Ein vorgesehener Weg ist ein signierter interner iOS-Build über Expo/EAS mit einem Apple-Developer-Konto und registriertem iPhone. Alternativ kann ein geeigneter aktueller Mac mit Xcode für eine persönliche Geräteinstallation verwendet werden. Die Bedingungen und mögliche Gebühren des jeweiligen Apple-Kontos bzw. Build-Dienstes bitte vor der Auswahl prüfen. Es wird nichts gekauft oder im App Store veröffentlicht.

### Signierter Build über EAS – erst nach Einrichtung des eigenen Kontos

Im Ordner `mobile`:

```sh
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

`eas init` verknüpft das Projekt mit deinem eigenen Konto. Die Bundle-ID `at.eignerth.drevos` muss zum verwendeten Apple-Team passen; für eine eigene Veröffentlichung gegebenenfalls vor dem ersten Build ändern. Apple-Anmeldung, Gerätefreigaben, Verträge und Zertifikate ausschließlich selbst im jeweiligen Anbieterfenster durchführen. Keine Passwörter, Signierschlüssel oder Zertifikate ins Repository kopieren.

Für Play Store/App Store stehen zusätzlich die `production`-Profile in `eas.json` bereit. Store-Einträge, Datenschutzangaben, Screenshots, Signierung und Prüfung sind eigenständige Veröffentlichungsschritte.

## Lokaler Build mit geeigneter Umgebung

Voraussetzungen: Node.js 24 LTS und `npm`, Internet für Abhängigkeiten; für Android JDK 17 und Android Studio/SDK, für iOS ein mit Xcode 26.4+ kompatibles macOS und CocoaPods. Siehe [Expo](https://docs.expo.dev/versions/v58.0.0/) und [Apple](https://developer.apple.com/xcode/system-requirements/).

Android: `android-vorbereiten.ps1` starten oder im Terminal `npm ci` und `npx expo prebuild --platform android --no-install` ausführen. Den erzeugten Ordner `android` in Android Studio öffnen. Ein eigener Release-Schlüssel wird über **Generate Signed Bundle / APK** eingerichtet und privat aufbewahrt.

iOS: Auf dem geeigneten Mac im Terminal des App-Ordners:

```sh
chmod +x macOS-vorbereiten.command
./macOS-vorbereiten.command
```

Das Skript installiert die festgeschriebenen Abhängigkeiten, prüft den Quellcode, erzeugt das Xcode-Projekt und öffnet `ios/Drevos.xcworkspace`. In Xcode unter **Signing & Capabilities** das eigene Team wählen, ein verbundenes iPhone auswählen und **Run** starten. Xcode-Lizenz, Apple-Anmeldung und Gerätefreigaben selbst bestätigen. Die Skripte enthalten keine Apple- oder HA-Zugangsdaten.

## Anmeldung und Bedienung

1. App öffnen, HA-Adresse eingeben und **Mit Home Assistant anmelden** wählen. Bei lokalem HTTP die Adresse mit `.local` verwenden; bei iOS hängt die Erreichbarkeit außerdem von der lokalen Netzwerkfreigabe und den Plattformregeln ab. HTTPS mit gültigem Zertifikat ist der bevorzugte Zugang.
2. Im HA-Fenster anmelden und zur App zurückkehren. Bei mehreren Öfen ausdrücklich einen auswählen. Die Zuordnung verwendet die Gateway-Kennung und die Funktionsattribute, nicht die deutschen Entitätsnamen.
3. Unter **Ofen** Werte ablesen. Sollwerte eingeben und ausdrücklich **Übernehmen** drücken. Ein positiver Sollwert startet weder Heizung noch Rauch. Das separate Einschalten von Heizelement oder Rauch zeigt eine Bestätigung; Rauch startet auch die Zündung der Ofensteuerung.
4. Unter **Timer** Dauer in Minuten einstellen und übernehmen. Die Anzeigen kommen vom Ofen, nicht von einer Uhr im Handy. Pause/Reset und Pi-Abschaltung sind bei aktiver Heizung oder aktivem Rauch gesperrt. Reset und Abschaltung verlangen außerdem einen pausierten Timer.
5. Unter **Verbindung** Ofen und Sprache wählen, aktualisieren, Pi herunterfahren oder abmelden. Herunterfahren schaltet den Pi aus; er lässt sich aus der App nicht wieder einschalten.

Bei Verbindungsverlust werden Werte als nicht verfügbar dargestellt und Bedienelemente gesperrt. Bei Rückkehr aus dem Hintergrund werden zuerst neue Werte geladen. Die App wiederholt keine unbestätigten Schreibbefehle. Nach einer Fehlermeldung den tatsächlichen Zustand prüfen. Das Ofenprogramm läuft auch bei geschlossenem Handy weiter; die App ist kein Not-Aus. Automatikbetrieb und nicht unterstützte Temperatureinheiten sperren die manuelle Bedienung wie in der Integration.

**Demo:** „App ansehen · Demo“ verwendet ausschließlich Beispieldaten. Es gibt dabei keine Verbindung zu HA oder zum Pi. Die Browser-Vorschau ist nur eine Demo und ersetzt keinen Gerätetest.

## Datenschutz, Abmelden und Fehler

Das HA-Passwort wird nicht von der App gespeichert. Der erneuerbare Anmeldenachweis liegt im geschützten Gerätespeicher; kurzlebige Zugriffsnachweise bleiben im Arbeitsspeicher. Bei der Anmeldung ruft HA eine öffentliche statische Rücksprungdeklaration auf GitHub ab. Dabei werden keine Ofenwerte oder Zugangsdaten an GitHub geschickt. Es gibt keine eingebauten Analyse- oder Werbedienste.

Abmelden löscht die lokale Anmeldung und versucht, sie in HA zu widerrufen. Falls HA dabei nicht erreichbar ist, den App-Anmeldenachweis zusätzlich im HA-Profil unter Sicherheit widerrufen. Bei HTTPS-Fehlern das Zertifikat korrigieren; die App umgeht keine Zertifikatsprüfung. Lokales HTTP ist im Heimnetz unverschlüsselt und darf nicht durch eine öffentliche Portfreigabe ersetzt werden.

Keine Entitäten: Integration und Benutzerberechtigung in HA prüfen. Ausgegraute Reset-/Herunterfahren-Taste: Heizung, Rauch und Timer müssen aus sein. Ein abgelaufener Zugang erfordert Abmelden und erneute Anmeldung. Support nur mit geschwärzten Angaben; niemals Passwörter, Token oder vollständige HA-Konfiguration veröffentlichen.

[Prüfstand und offene Gerätetests](VALIDATION.md) · [English](README.en.md)
