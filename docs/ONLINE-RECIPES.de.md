# Neue Rezepte ohne neues App-Update

Einmalig **App 0.5.0** beziehungsweise **HA-Integration 0.3.0** installieren. Die Web-App erhält diese Funktion beim nächsten vollständigen Öffnen. Ein bereits eingerichteter Pi benötigt keine Änderung.

Danach werden neue Rezepte zentral veröffentlicht. Beim Öffnen des Reiter **Rezepte** wird nach dem aktuellen Katalog gesucht; automatische Abfragen erfolgen höchstens alle 30 Minuten. Mit **Rezepte aktualisieren** kannst du jederzeit selbst nachsehen. Neue Rezepte brauchen weder eine neue APK noch eine neue iPhone-Signatur oder ein weiteres HA-Update. Verbesserungen an der App oder Steuerung können weiterhin ein Software-Update erfordern.

## So kommen neue Rezepte dazu

1. Schicke Thomas ein Rezept samt Produktfoto, Zutaten, Zubereitung und Ofenwerten. Dafür gibt es das Formular unter **Rezepte → Eigenes Rezept speichern / einreichen**.
2. Thomas prüft den Vorschlag und gibt ihn hier im Projekt zur Aufnahme weiter. Einsendungen werden nicht ungeprüft automatisch veröffentlicht.
3. Ich ergänze den gemeinsamen Katalog und das Bild. Herkunft und Änderungen werden beim Rezept angegeben. Eigene Beiträge heißen **Community-Rezept**; belegte Vorlagen vom Ofendisplay bleiben **Drevos-Originalrezept**.
4. Nutzer öffnen **Rezepte** oder drücken **Rezepte aktualisieren**. Der neue Eintrag erscheint in App, Web-App und HA.

Der Katalog und die Produktbilder sind öffentlich. Persönliche Entwürfe aus dem Formular bleiben auf deinem Gerät und werden erst durch eine ausdrücklich abgesendete Einsendung an Thomas übermittelt. Die E-Mail-Adresse muss bei FormSubmit einmalig aktiviert und ein Fotoanhang getestet werden.

## Wenn die Internetverbindung fehlt

Die 40 mitgelieferten Rezepte bleiben verfügbar. Ein erfolgreich geladener Katalog wird zusätzlich auf dem jeweiligen Gerät beziehungsweise Browser gespeichert. Seine Texte und Einstellungen lassen sich auch ohne Internet lesen. Neue Produktbilder können eine Internetverbindung benötigen; die Bildspeicher der Geräte werden nicht als dauerhaftes Offline-Archiv zugesichert.

Die Anzeige nennt den Stand des Katalogs und meldet, wenn das Nachladen nicht möglich war. Ein fehlerhafter oder nicht unterstützter Katalog ersetzt die letzte gültige Fassung nicht. Gelöschte App-/Browserdaten entfernen auch diesen öffentlichen Cache. Eine neue Installation startet dann wieder mit dem mitgelieferten Katalog.

## Ausgewählte Phasen bleiben unverändert

Das Laden neuer Rezepte verändert keine Ofenwerte. Eine bereits ausgewählte Phase behält ihre Zahlenwerte, auch wenn dasselbe Rezept inzwischen überarbeitet wurde. Für die neue Fassung die Phase erneut auswählen. Heizung, Rauch/Zündung, Lüfter und Timer weiterhin selbst bedienen. Es gibt keinen automatischen Start oder Phasenwechsel.

## Für die Veröffentlichung

Der gemeinsame Katalog liegt unter `mobile/public/recipes/catalog.json` im App-Repository; JPG-Bilder liegen daneben unter `images/`. Die Apps laden nur Daten von diesem festgelegten öffentlichen GitHub-Pfad, keine ausführbaren Erweiterungen. Für eine Rezept-Ergänzung Katalogdatum beziehungsweise Revision anpassen, Bild hinzufügen, Herkunft prüfen und im Ordner `mobile` **`npm run recipes:check`** ausführen. Anschließend die geprüften Dateien auf dem Hauptzweig veröffentlichen. Eine neue Versionsnummer oder ein neues App-Release ist dafür nicht nötig. Die CI prüft zusätzlich die bestehende Anwendung.

Das Datenformat bleibt `schemaVersion: 1`: höchstens 500 Rezepte, jeweils bis zu drei Phasen; Kammer 0–120 °C, Kernziel 0–115 °C, Rauch 0–100 %, Zeit 0–9999 Minuten. Unklare Werte vor Veröffentlichung klären und nicht erraten. Wird ein bestehendes Bild ersetzt, zusätzlich `imageRevision` ändern, damit Geräte die neue Bildfassung laden. Öffentliche GitHub-Zwischenspeicher können Änderungen kurz verzögert anzeigen.
