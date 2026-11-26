# Rezepte verwenden und eigene Rezepte einreichen

## Ein Rezept am Ofen verwenden

1. App oder Web-App öffnen und deinen Ofen wählen.
2. **Rezepte** öffnen, ein Produkt suchen und das Rezept antippen.
3. Zutaten, Zubereitung und die **Hinweise zur Vorlage** lesen.
4. Genau eine Phase auswählen: **Trocknung**, **Räuchern 1** oder **Räuchern 2**.
5. Heizung, Rauch und Timer ausschalten. Vor einer neuen zeitgesteuerten Phase auf der Timer-Seite **Zurücksetzen** drücken.
6. **Werte dieser Phase an den Ofen übertragen** drücken. Erst nach bestätigter Rückmeldung weiterarbeiten.
7. Heizung, Rauch/Zündung, benötigte Lüfter und Timer über ihre vorhandenen Bedienelemente selbst starten.
8. Nach der Phase den Ofenzustand prüfen und die gewünschte Pause einhalten. Die nächste Phase wieder selbst auswählen und vorbereiten.

Die Auswahl füllt die Werte vor. Erst die Schaltfläche zum Übertragen sendet sie an den Ofen. Dabei werden ausschließlich die Zahlenwerte der gewählten Phase übertragen. Keine Heizung, Zündung, Lüfter oder Uhr werden automatisch gestartet; es gibt keine automatische Folgephase und keinen geplanten Fernstart. Für eigene abweichende Werte die Phasenauswahl aufheben und die normale Bedienung verwenden.

**0 Minuten in der Vorlage** werden nicht in einen Timer von einer Minute umgewandelt. Die bisherige Timerdauer bleibt unverändert, und der Timerstart bleibt für diese ausgewählte Phase gesperrt. Konvektion und Lüfter sind in den fotografierten Rezeptfeldern nicht angegeben und werden nicht aus dem Produkt erraten. Rauch 0 % während der Trocknung stammt aus der vorhandenen SPS-Programmlogik, da das Rezeptdisplay dort kein Rauchfeld zeigt.

Die Übertragung verlangt einen verbundenen Ofen im manuellen Betrieb. Bei einem Abbruch können einzelne Werte bereits angekommen sein. Es erfolgt kein automatischer Wiederholungsversuch und kein Start. Vor dem Fortfahren die Werte prüfen und die Übertragung bei Bedarf selbst erneut auslösen.

## Woher kommen die 40 Rezepte?

Die Sammlung wurde aus 121 Fotos des Drevos-Ofendisplays übertragen. **Drevos-Originalrezept** bezeichnet diese Herkunft. Es bedeutet keine Freigabe durch den Hersteller oder eine Prüfung der Lebensmittelsicherheit. Die Originaltexte bleiben auf Deutsch; die Bedienoberfläche gibt es auf Deutsch und Englisch.

Widersprüche zwischen Beschreibung, Rezeptnamen und gespeicherten Einstellungen stehen beim jeweiligen Rezept. Leere Phasen mit ausschließlich Nullen werden nicht angeboten. Bei **Rippen, Methode 2** zeigte das Display 185 °C Kammer und 155 °C Kern. Thomas Eigner vermutet einen Tippfehler und nannte **85/55 °C**. Diese Werte sind ausdrücklich als vermutete Nutzerkorrektur gekennzeichnet; der ursprüngliche Zahlenbeleg bleibt im Katalog erhalten. Das ist keine bestätigte Herstellerkorrektur.

Die Produktbilder wurden aus den Displayfotos mit KI aufbereitet. Sie sind als solche gekennzeichnet und keine unveränderten Herstellerdateien.

## Eigene Rezepte speichern

Unter **Rezepte → Eigene Rezepte speichern oder einreichen** öffnet sich [das Formular](https://drevos-smoker-control.thankfulchick1.chatgpt.site/recipe-submit.html?lang=de).

Rezeptnamen, Zutaten, Zubereitung, Hinweise, bis zu drei Phasen und ein Produktfoto eintragen. **Rezept und Foto auf diesem Gerät speichern** legt einen persönlichen Entwurf in diesem Browser an. Eine Einsendung ist dafür nicht nötig. Es sind höchstens 25 Entwürfe, 8 MB je Foto und insgesamt 50 MB Fotos möglich.

**Meine Rezepte** öffnet gespeicherte Entwürfe wieder. Sie werden nicht automatisch zwischen App, HA, Geräten oder Browsern synchronisiert. Das Löschen der Website-Daten entfernt auch die Entwürfe. Diese persönlichen Entwürfe sind noch keine auswählbaren Ofenprogramme; die bestätigte Phasenübernahme ist für die veröffentlichte Sammlung vorgesehen.

## Ein Rezept zur Aufnahme vorschlagen

Dasselbe Formular enthält Produktfoto, Zutaten, Zubereitung und für jede Phase Minuten, Kammer- und Kerntemperatur, Rauchstärke sowie optional Konvektion und Lüfter. Quelle nennen, bei Bedarf einen öffentlichen Spitznamen und eine private Rückfrageadresse ergänzen. Die Freigabe für Rezept und Bild selbst bestätigen und **Rezept zur Prüfung senden** drücken.

Der Versand erfolgt über **FormSubmit** an **eigner.th2010@gmail.com**. Es werden keine Ofenschlüssel, Kopplungscodes oder HA-Zugangsdaten benötigt. Bitte solche Daten auch nicht in Freitextfelder eintragen. Thomas prüft Einsendungen vor einer möglichen Veröffentlichung. Nutzerbeiträge werden als **Community-Rezept** gekennzeichnet; ein angekreuztes Quellenfeld macht sie nicht automatisch zu Originalrezepten.

### Einmalige Einrichtung durch Thomas

FormSubmit verlangt bei der ersten Einsendung eine Bestätigung der Empfängeradresse per E-Mail. Den Aktivierungslink im eigenen Postfach bestätigen, bevor andere echte Rezepte einreichen. Bei einer noch nicht aktivierten Adresse gehen Fotoanhänge der ersten Einsendung nicht mit: nach der Aktivierung das Testrezept samt Foto erneut senden und den Empfang prüfen. Der Versanddienst ist kein eigenes dauerhaftes Rezeptarchiv.

## Home Assistant und vorhandener Raspberry Pi

Die HA-Integration bietet dieselbe Sammlung in **Drevos → Rezepte** und in der Dashboard-Karte an. Ein bereits eingerichteter gemeinsamer Pi benötigt für die Rezeptsammlung kein neues Programm. App/Web-App und HA behalten ihre getrennten Verbindungen. Die HA-Aktualisierung selbst installieren; anschließend HA neu starten und die Browserseite neu laden.
