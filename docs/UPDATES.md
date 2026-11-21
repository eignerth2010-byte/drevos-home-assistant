# Infos, Versionen und Updates / Info, versions and updates

## 0.1.4 – Projektgrafiken und Lizenz / Project artwork and license

Eigener vorläufiger Schriftzug statt Herstellerlogo und quadratisches Ofensymbol.
Private und betriebsinterne Nutzung bleiben kostenlos; Verkauf und kommerzielle
Weitergabe benötigen vorherige schriftliche Freigabe von Thomas Eigner.
[Vollständige Bedingungen und frühere MIT-Rechte](LICENSING.md).
Die Ofensteuerung und das Pi-Gateway 0.1.1 bleiben unverändert. HA selbst nach
Installation neu starten und die Karte neu laden; kein Pi-Update nötig.

Temporary community wordmark and square cabinet icon. Private and internal
business use remain free; resale and commercial redistribution need prior
written permission. Earlier MIT versions keep their terms. No gateway or PLC
behavior changed; restart HA and reload the card after updating HA files.

## Deutsch

Ab HA-Integration **0.1.3** hat die Drevos-Karte zwei Bereiche: **Ofen** für die bisherige Bedienung und **Info** für Projektinformationen. In Info stehen **Thomas Eigner** als Ersteller, die Versionsnummer, ein freiwilliger PayPal-Spendenbutton sowie Links zu Installation, GitHub, Diskussionen und Mitwirkenden. Der Spendenbutton öffnet PayPal in einem neuen Browser-Tab. Alle Funktionen bleiben kostenlos. Der Info-Bereich funktioniert auch, wenn der Ofen gerade nicht erreichbar ist.

Die Versionsnummer steht zusätzlich unten an der Karte. Sie bezeichnet die **HA-Integration/Karte**, nicht die Firmware der Ofensteuerung, das Pi-Gateway oder die eigenständige Handy-App. Diese Programme haben getrennte Versionsnummern. Das vorhandene Pi-Gateway bleibt bei diesem Update auf **0.1.1**.

### Aktualisieren

1. Unter **Einstellungen → Marketplace** die installierte **Drevos Smoker**-Integration öffnen und die neue Version installieren. Vor HA 2026.11 heißt der Community-Store **HACS**.
2. Home Assistant neu starten, wenn es das Update verlangt.
3. Das Dashboard neu öffnen bzw. die Seite neu laden. Die bestehende Drevos-Karte und ihre Entitäten werden weiterverwendet.

Eine zusätzliche Neuinstallation am Pi ist für 0.1.3 nicht nötig. Die Integration registriert ihre gebündelte Karte im Ressourcen-Speichermodus mit der aktualisierten Versionsadresse. Bei manuell gepflegten YAML-Ressourcen die bestehende Adresse auf `/drevos_static/drevos-smoker-card.js?v=0.1.3` aktualisieren, ohne einen zweiten Ressourceneintrag anzulegen.

### Was ist neu?

Beim ersten Anzeigen einer noch nicht bestätigten Version öffnet sich **Was ist neu?**. **Alles klar** bzw. das Schließen des Dialogs merkt sich die Version in diesem Browserprofil. Im Info-Bereich kann die Übersicht erneut geöffnet werden. Während eines Kartenbefehls, einer Ofenbestätigung oder einer noch bearbeiteten Sollwerteingabe wird der automatische Hinweis zurückgestellt. Ein Wechsel zwischen Ofen und Info verwirft keinen Sollwertentwurf.

Gespeichert wird ausschließlich die zuletzt bestätigte öffentliche Versionsnummer. Es werden keine Zugangsschlüssel, Ofenwerte oder Konfigurationen dafür gespeichert oder übertragen. Wenn der Browser die Speicherung blockiert oder seine Website-Daten gelöscht werden, kann der Hinweis beim nächsten Öffnen erneut erscheinen.

Updates werden über den vorhandenen Marketplace-/HACS-Mechanismus angeboten. Die Karte lädt keinen eigenen Programmcode von GitHub nach und installiert keine Updates selbst. Die eigenständige Android-App hat einen eigenen Updateprüfer; die Web-App lädt ihre aktuelle Oberfläche beim nächsten Öffnen.

## English

HA integration **0.1.3** adds **Oven / Info** sections. Info shows creator **Thomas Eigner**, the integration version, optional PayPal support and links to installation, GitHub, discussions and contributors. PayPal opens in a new browser tab; donations do not unlock features. Info is available while the oven is offline.

The footer also shows the **HA integration/card version**. PLC firmware, Pi gateway and native/mobile apps are versioned separately. The Pi gateway remains **0.1.1** for this update.

Update **Drevos Smoker** in **Settings → Marketplace** (HACS before HA 2026.11), restart HA when required, then reopen/reload the dashboard. Existing entities and card configuration are retained. No Pi reinstall is needed for 0.1.3. Storage-mode resources are registered with a versioned URL; for manually maintained YAML resources, update the existing URL to `/drevos_static/drevos-smoker-card.js?v=0.1.3` instead of adding a duplicate.

**What’s new?** opens for an unacknowledged version. **Got it**, or closing the dialog, records that version in the browser profile. Reopen the notes from Info. Automatic notes defer while a card command, oven confirmation or target draft is active. Switching tabs preserves target drafts.

Only the public acknowledged version is stored. No credentials, oven readings or configuration are stored or transmitted for this feature. Blocking/clearing browser storage can make the notes reappear later. Marketplace/HACS handles integration updates; the card does not download executable code or install updates itself. The standalone Android updater and Web App update behavior are separate.
