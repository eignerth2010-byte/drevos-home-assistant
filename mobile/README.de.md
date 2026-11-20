> Dieser frühere HA-abhängige Prototyp wurde durch die [eigenständige Drevos-App](https://github.com/eignerth2010-byte/drevos-app) ersetzt. Die aktuelle App und Downloads findest du dort.

# Drevos-App Ã¢â‚¬â€œ deutsche Anleitung

Die App bedient deinen Drevos ÃƒÂ¼ber die bereits eingerichtete **native Drevos-Integration in Home Assistant**. Der Raspberry Pi bleibt unverÃƒÂ¤ndert. Die App greift nicht auf die serielle Verbindung zu. Home Assistant und der Pi mÃƒÂ¼ssen erreichbar sein; fÃƒÂ¼r Fernzugriff wird der vorhandene sichere HA-Zugang oder ein VPN verwendet.

## Was du brauchst

- Einen Ofen mit dem geprÃƒÂ¼ften Drevos-Profil und die funktionierende Pi-/HA-Anbindung aus diesem Repository. Die App unterstÃƒÂ¼tzt dieselben Funktionen und Grenzen wie die Integration.
- Home Assistant mit aktivierten Drevos-EntitÃƒÂ¤ten und einem Benutzer mit Bedienberechtigung. Die App wurde mit ZustÃƒÂ¤nden aus HA 2026.11.1 geprÃƒÂ¼ft.
- Android 7+ oder iPhone/iPad mit iOS/iPadOS 16.4+. Der erzeugte Android-Testbuild ist fÃƒÂ¼r ARM-GerÃƒÂ¤te; reale GerÃƒÂ¤tetests stehen noch aus.
- FÃƒÂ¼r die Anmeldung die **Home-Assistant-Adresse**, zum Beispiel die eigene HTTPS-Adresse. Zugangsdaten werden nur im Anmeldefenster von Home Assistant eingegeben.

## Android-Build ohne lokale Entwicklungsumgebung

1. Auf GitHub dieses Repository ÃƒÂ¶ffnen, **Actions Ã¢â€ â€™ Drevos Mobile Ã¢â€ â€™ Run workflow** wÃƒÂ¤hlen.
2. Den Build starten. Wenn kein iPhone-Build gebraucht wird, `build_ios` ausschalten.
3. Nach erfolgreichem Abschluss unter **Artifacts** `Drevos-Android-preview-APK` herunterladen und entpacken.
4. Die APK auf das Android-Handy ÃƒÂ¼bertragen, ÃƒÂ¶ffnen und die Installation fÃƒÂ¼r diese Datei zulassen. Es handelt sich um einen Testbuild, nicht um eine Play-Store-VerÃƒÂ¶ffentlichung.
5. Die App enthÃƒÂ¤lt ihr Programm bereits; ein laufender Entwicklungsserver ist nicht erforderlich. APKs aus unterschiedlichen TestlÃƒÂ¤ufen kÃƒÂ¶nnen unterschiedliche Testsignaturen haben. Falls ein Update wegen der Signatur abgelehnt wird, zuerst abmelden, die alte Test-App entfernen und neu installieren. FÃƒÂ¼r dauerhafte Updates einen eigenen, gleichbleibenden Release-SchlÃƒÂ¼ssel verwenden.

GitHub speichert die Build-Artefakte 14 Tage. Standard-Buildrechner sind fÃƒÂ¼r ÃƒÂ¶ffentliche Repositories laut [GitHub](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) kostenlos. Bei privaten Repositories gelten andere Kontingente. Es werden keine kostenpflichtigen Dienste oder Abos automatisch eingerichtet.

## iPhone bei macOS 13 Ventura

Ventura kann das fÃƒÂ¼r dieses Projekt erforderliche Xcode 26.4+ nicht ausfÃƒÂ¼hren. Du musst die VM deshalb fÃƒÂ¼r den Build nicht weiter einrichten.

Der GitHub-Workflow kann die iPhone-App auf einem aktuellen gehosteten Mac **kompilieren**. Das Artefakt `Drevos-iPhone-UNSIGNED-needs-Apple-signing` enthÃƒÂ¤lt eine **unsignierte** `.ipa`. Diese Datei allein lÃƒÂ¤sst sich nicht auf einem iPhone installieren. Der Workflow verwendet keine Apple-Anmeldung und erzeugt kein Zertifikat oder GerÃƒÂ¤teprofil.

FÃƒÂ¼r eine tatsÃƒÂ¤chlich installierbare App wird danach eine passende Apple-Signierung benÃƒÂ¶tigt. Ein vorgesehener Weg ist ein signierter interner iOS-Build ÃƒÂ¼ber Expo/EAS mit einem Apple-Developer-Konto und registriertem iPhone. Alternativ kann ein geeigneter aktueller Mac mit Xcode fÃƒÂ¼r eine persÃƒÂ¶nliche GerÃƒÂ¤teinstallation verwendet werden. Die Bedingungen und mÃƒÂ¶gliche GebÃƒÂ¼hren des jeweiligen Apple-Kontos bzw. Build-Dienstes bitte vor der Auswahl prÃƒÂ¼fen. Es wird nichts gekauft oder im App Store verÃƒÂ¶ffentlicht.

### Signierter Build ÃƒÂ¼ber EAS Ã¢â‚¬â€œ erst nach Einrichtung des eigenen Kontos

Im Ordner `mobile`:

```sh
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

`eas init` verknÃƒÂ¼pft das Projekt mit deinem eigenen Konto. Die Bundle-ID `at.eignerth.drevos` muss zum verwendeten Apple-Team passen; fÃƒÂ¼r eine eigene VerÃƒÂ¶ffentlichung gegebenenfalls vor dem ersten Build ÃƒÂ¤ndern. Apple-Anmeldung, GerÃƒÂ¤tefreigaben, VertrÃƒÂ¤ge und Zertifikate ausschlieÃƒÅ¸lich selbst im jeweiligen Anbieterfenster durchfÃƒÂ¼hren. Keine PasswÃƒÂ¶rter, SignierschlÃƒÂ¼ssel oder Zertifikate ins Repository kopieren.

FÃƒÂ¼r Play Store/App Store stehen zusÃƒÂ¤tzlich die `production`-Profile in `eas.json` bereit. Store-EintrÃƒÂ¤ge, Datenschutzangaben, Screenshots, Signierung und PrÃƒÂ¼fung sind eigenstÃƒÂ¤ndige VerÃƒÂ¶ffentlichungsschritte.

## Lokaler Build mit geeigneter Umgebung

Voraussetzungen: Node.js 24 LTS und `npm`, Internet fÃƒÂ¼r AbhÃƒÂ¤ngigkeiten; fÃƒÂ¼r Android JDK 17 und Android Studio/SDK, fÃƒÂ¼r iOS ein mit Xcode 26.4+ kompatibles macOS und CocoaPods. Siehe [Expo](https://docs.expo.dev/versions/v58.0.0/) und [Apple](https://developer.apple.com/xcode/system-requirements/).

Android: `android-vorbereiten.ps1` starten oder im Terminal `npm ci` und `npx expo prebuild --platform android --no-install` ausfÃƒÂ¼hren. Den erzeugten Ordner `android` in Android Studio ÃƒÂ¶ffnen. Ein eigener Release-SchlÃƒÂ¼ssel wird ÃƒÂ¼ber **Generate Signed Bundle / APK** eingerichtet und privat aufbewahrt.

iOS: Auf dem geeigneten Mac im Terminal des App-Ordners:

```sh
chmod +x macOS-vorbereiten.command
./macOS-vorbereiten.command
```

Das Skript installiert die festgeschriebenen AbhÃƒÂ¤ngigkeiten, prÃƒÂ¼ft den Quellcode, erzeugt das Xcode-Projekt und ÃƒÂ¶ffnet `ios/Drevos.xcworkspace`. In Xcode unter **Signing & Capabilities** das eigene Team wÃƒÂ¤hlen, ein verbundenes iPhone auswÃƒÂ¤hlen und **Run** starten. Xcode-Lizenz, Apple-Anmeldung und GerÃƒÂ¤tefreigaben selbst bestÃƒÂ¤tigen. Die Skripte enthalten keine Apple- oder HA-Zugangsdaten.

## Anmeldung und Bedienung

1. App ÃƒÂ¶ffnen, HA-Adresse eingeben und **Mit Home Assistant anmelden** wÃƒÂ¤hlen. Bei lokalem HTTP die Adresse mit `.local` verwenden; bei iOS hÃƒÂ¤ngt die Erreichbarkeit auÃƒÅ¸erdem von der lokalen Netzwerkfreigabe und den Plattformregeln ab. HTTPS mit gÃƒÂ¼ltigem Zertifikat ist der bevorzugte Zugang.
2. Im HA-Fenster anmelden und zur App zurÃƒÂ¼ckkehren. Bei mehreren Ãƒâ€“fen ausdrÃƒÂ¼cklich einen auswÃƒÂ¤hlen. Die Zuordnung verwendet die Gateway-Kennung und die Funktionsattribute, nicht die deutschen EntitÃƒÂ¤tsnamen.
3. Unter **Ofen** Werte ablesen. Sollwerte eingeben und ausdrÃƒÂ¼cklich **ÃƒÅ“bernehmen** drÃƒÂ¼cken. Ein positiver Sollwert startet weder Heizung noch Rauch. Das separate Einschalten von Heizelement oder Rauch zeigt eine BestÃƒÂ¤tigung; Rauch startet auch die ZÃƒÂ¼ndung der Ofensteuerung.
4. Unter **Timer** Dauer in Minuten einstellen und ÃƒÂ¼bernehmen. Die Anzeigen kommen vom Ofen, nicht von einer Uhr im Handy. Pause/Reset und Pi-Abschaltung sind bei aktiver Heizung oder aktivem Rauch gesperrt. Reset und Abschaltung verlangen auÃƒÅ¸erdem einen pausierten Timer.
5. Unter **Verbindung** Ofen und Sprache wÃƒÂ¤hlen, aktualisieren, Pi herunterfahren oder abmelden. Herunterfahren schaltet den Pi aus; er lÃƒÂ¤sst sich aus der App nicht wieder einschalten.

Bei Verbindungsverlust werden Werte als nicht verfÃƒÂ¼gbar dargestellt und Bedienelemente gesperrt. Bei RÃƒÂ¼ckkehr aus dem Hintergrund werden zuerst neue Werte geladen. Die App wiederholt keine unbestÃƒÂ¤tigten Schreibbefehle. Nach einer Fehlermeldung den tatsÃƒÂ¤chlichen Zustand prÃƒÂ¼fen. Das Ofenprogramm lÃƒÂ¤uft auch bei geschlossenem Handy weiter; die App ist kein Not-Aus. Automatikbetrieb und nicht unterstÃƒÂ¼tzte Temperatureinheiten sperren die manuelle Bedienung wie in der Integration.

**Demo:** Ã¢â‚¬Å¾App ansehen Ã‚Â· DemoÃ¢â‚¬Å“ verwendet ausschlieÃƒÅ¸lich Beispieldaten. Es gibt dabei keine Verbindung zu HA oder zum Pi. Die Browser-Vorschau ist nur eine Demo und ersetzt keinen GerÃƒÂ¤tetest.

## Datenschutz, Abmelden und Fehler

Das HA-Passwort wird nicht von der App gespeichert. Der erneuerbare Anmeldenachweis liegt im geschÃƒÂ¼tzten GerÃƒÂ¤tespeicher; kurzlebige Zugriffsnachweise bleiben im Arbeitsspeicher. Bei der Anmeldung ruft HA eine ÃƒÂ¶ffentliche statische RÃƒÂ¼cksprungdeklaration auf GitHub ab. Dabei werden keine Ofenwerte oder Zugangsdaten an GitHub geschickt. Es gibt keine eingebauten Analyse- oder Werbedienste.

Abmelden lÃƒÂ¶scht die lokale Anmeldung und versucht, sie in HA zu widerrufen. Falls HA dabei nicht erreichbar ist, den App-Anmeldenachweis zusÃƒÂ¤tzlich im HA-Profil unter Sicherheit widerrufen. Bei HTTPS-Fehlern das Zertifikat korrigieren; die App umgeht keine ZertifikatsprÃƒÂ¼fung. Lokales HTTP ist im Heimnetz unverschlÃƒÂ¼sselt und darf nicht durch eine ÃƒÂ¶ffentliche Portfreigabe ersetzt werden.

Keine EntitÃƒÂ¤ten: Integration und Benutzerberechtigung in HA prÃƒÂ¼fen. Ausgegraute Reset-/Herunterfahren-Taste: Heizung, Rauch und Timer mÃƒÂ¼ssen aus sein. Ein abgelaufener Zugang erfordert Abmelden und erneute Anmeldung. Support nur mit geschwÃƒÂ¤rzten Angaben; niemals PasswÃƒÂ¶rter, Token oder vollstÃƒÂ¤ndige HA-Konfiguration verÃƒÂ¶ffentlichen.

[PrÃƒÂ¼fstand und offene GerÃƒÂ¤tetests](VALIDATION.md) Ã‚Â· [English](README.en.md)

### PersÃ¶nliche iPhone-Installation Ã¼ber Windows

Eine weitere MÃ¶glichkeit ist [Sideloadly](https://sideloadly.io/): Die lokal vorliegende unsignierte IPA kann damit auf Windows mit einer normalen Apple-ID fÃ¼r das eigene iPhone signiert und installiert werden. Laut Anbieter ist keine kostenpflichtige Mitgliedschaft nÃ¶tig; die kostenlose Signierung gilt sieben Tage und muss erneuert werden. DafÃ¼r sind eine GerÃ¤teverbindung und die vom Anbieter genannten Apple-Komponenten erforderlich. Apple-ID, Passwort und BestÃ¤tigungscodes selbst ausschlieÃŸlich im jeweiligen Anmeldefenster eingeben, niemals im Chat. Diese Installationsvariante wurde hier noch nicht am iPhone getestet. Eine automatische Installation oder Ã„nderung vorhandener iTunes-/iCloud-Installationen erfolgt nicht.
