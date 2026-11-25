# Drevos in der Seitenleiste / Drevos in the sidebar

## Deutsch

Ab **HA-Integration 0.1.5** bringt die Integration ihre eigene **Drevos**-Seite mit.
Nach Einrichtung bzw. Aktualisierung der Integration und dem HA-Neustart erscheint
**Drevos** automatisch in der linken Seitenleiste. Ein Klick öffnet die vollständige
Ofenbedienung mit **Ofen / Info**, Temperaturwerten, Sollwerten, Rauch, Lüftern,
Heizung und Timer. Ein eigenes Dashboard muss dafür nicht angelegt werden.

- Die Seite wird von der Integration registriert und lokal von Home Assistant geladen.
- Mehrere konfigurierte Öfen erhalten jeweils eine eigene, an ihre Gerätekennung gebundene Karte.
- Die Seite bleibt während eines vorübergehenden Verbindungsausfalls verfügbar. Nicht erreichbare Messwerte und Bedienelemente werden als nicht verfügbar dargestellt.
- Beim Entfernen des letzten Drevos-Ofens wird auch der Integrationseintrag entfernt.
- Vorhandene Dashboard-Karten bleiben nutzbar. Selbst angelegte Dashboards werden von der Integration weder übernommen noch gelöscht.
- Über die normale Seitenleistenbearbeitung in Home Assistant lässt sich der Eintrag ausblenden.

### Aktualisieren

1. **Drevos Smoker** unter **Einstellungen → Marketplace** aktualisieren (vor HA 2026.11: HACS).
2. Home Assistant neu starten und die Browserseite vollständig neu laden.
3. Links **Drevos** öffnen. Das vorhandene Pi-Gateway **0.1.1** wird weiterverwendet.

Bei manueller Installation den **gesamten** Ordner `custom_components/drevos`
ersetzen, einschließlich `frontend.py`, `manifest.json` und aller Dateien unter `www`.
Die neue Seitenleistenansicht liegt unter `/drevos`.

### Wenn der Eintrag fehlt oder doppelt erscheint

- Prüfen, ob tatsächlich **0.1.5 oder neuer** installiert ist und HA danach neu gestartet wurde.
- Browser neu laden und in der Seitenleistenbearbeitung nach einem ausgeblendeten Eintrag suchen.
- Bei einer unvollständig kopierten Installation den vollständigen Integrationsordner erneut übernehmen.
- Ein früher selbst angelegtes Drevos-Dashboard kann zusätzlich angezeigt werden. Dieses bei Bedarf unter **Einstellungen → Dashboards** entfernen; die bestehende Karte in einem anderen Dashboard darf weiterverwendet werden.
- Ist `/drevos` bereits von einem anderen Panel belegt, überschreibt die Integration dieses nicht und protokolliert den Konflikt. Den Konflikt vor einer erneuten Einrichtung klären.

## English

Starting with **HA integration 0.1.5**, the integration provides its own **Drevos**
sidebar page. After setup, or after updating and restarting HA, select **Drevos**
to open the complete **Oven / Info** interface. No separate dashboard is required.

- Home Assistant registers and serves the page locally as part of the integration.
- Multiple configured ovens each get a card explicitly bound to their own gateway identity.
- The page remains available during temporary connection failures; unreachable readings and controls are unavailable.
- Removing the last configured Drevos oven removes the integration panel.
- Existing dashboard cards still work. User-created dashboards are never adopted or deleted automatically.
- The entry can be hidden using Home Assistant's normal sidebar editor.

### Updating

Update **Drevos Smoker** in **Settings → Marketplace** (HACS before HA 2026.11),
restart HA, then fully reload the browser. Open **Drevos** in the sidebar.
Keep the existing Pi gateway **0.1.1**; no Pi update is required for this feature.

For manual installation replace the **complete** `custom_components/drevos`
folder, including `frontend.py`, `manifest.json` and every file in `www`.
The new page is available at `/drevos`.

If the entry is missing, confirm the installed integration is **0.1.5 or later**,
restart HA, reload the browser and check the sidebar editor for a hidden entry.
A previously created manual Drevos dashboard may produce a second sidebar item;
remove that dashboard in **Settings → Dashboards** if no longer needed.
If another panel already owns `/drevos`, it is left untouched and the conflict
is logged; resolve that conflict before trying again.
