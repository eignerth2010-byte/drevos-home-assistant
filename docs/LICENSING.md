# Lizenzen / Licenses

## Deutsch

**Alle Funktionen bleiben kostenlos nutzbar.** Die Lizenzen sind nach
Programmteilen getrennt:

| Bestandteil | Lizenz und Weitergabe |
|---|---|
| HA-Integration einschließlich Karte, Einrichtungsdialog, Übersetzungen und eigener Projektgrafiken unter `custom_components/drevos/` | [MIT](../custom_components/drevos/LICENSE). Auch gewerbliche Nutzung und Weitergabe sind nach MIT ohne zusätzliche Freigabe erlaubt. |
| Raspberry-Pi-Gateway unter `drevos_gateway/`, Pi-Dienste unter `systemd/` und `scripts/install-gateway.sh` | [Thomas Eigner Free Use License 1.0](../drevos_gateway/LICENSE). Private und betriebsinterne Nutzung kostenlos; Verkauf, kommerzielle Weitergabe oder Bündelung mit angebotenen Produkten/Diensten nur mit vorheriger ausdrücklicher schriftlicher Freigabe von Thomas Eigner. |
| Übrige eigene Dateien dieses Repositorys, sofern nicht gesondert gekennzeichnet | [MIT](../LICENSE). |
| Eigenständige Android-/iOS- und Web-App, Cloud-Agent und Relay | Separates [App-Projekt mit eigener Lizenz](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/LICENSING.md). |

Ein Hersteller darf die Pi-Software oder Apps beispielsweise nicht ohne
schriftliche Freigabe mit angebotenen Öfen vertreiben oder als Bestandteil
seines kommerziellen Angebots vermarkten. Die reine Nutzung für den eigenen
Ofen, auch in einem Betrieb, bleibt kostenlos. Die MIT-Freigabe der HA-Integration
verleiht keine zusätzlichen Rechte an Pi-Software, Apps oder Herstellerzeichen.
Freiwillige Spenden ersetzen keine gewerbliche Freigabe für die geschützten Teile.
Anfragen über die [Diskussionen](https://github.com/eignerth2010-byte/drevos-home-assistant/discussions);
private Daten nicht öffentlich posten.

Die unter MIT veröffentlichte HA-Integration kann für den Marketplace-/HACS-
Katalog beantragt werden. Der Katalog installiert nur `custom_components/drevos`;
die getrennt lizenzierte Pi-Software wird dadurch nicht mitinstalliert.
Eine Aufnahme hängt von den Prüfungen und der Entscheidung der Maintainer ab.

### Frühere Fassungen und Fremdrechte

Bereits unter MIT veröffentlichte Pi-/App-Fassungen und deren unveränderte
Bestandteile behalten ihre bisherigen Rechte, einschließlich gewerblicher
Nutzung und Weiterverkauf. Bestehende Releases und Tags werden nicht
nachträglich neu lizenziert. Letzter HA-Repository-Stand vor dem Lizenzwechsel:
[`c08ec4cc2e10`](https://github.com/eignerth2010-byte/drevos-home-assistant/tree/c08ec4cc2e108faa7a5dd83ef871fafc0364cf7e).
Die ursprüngliche MIT-Lizenz bleibt in der Repository-Historie und als
Standardlizenz oben erhalten. Fremdbibliotheken behalten ihre eigenen Lizenzen;
Name und Markenrechte des Herstellers bleiben unberührt. Der vorläufige
Projekt-Schriftzug behauptet keine Herstellerfreigabe.

## English

**All features remain free to use.** `custom_components/drevos/`, including the
HA integration, dashboard card and original community artwork, is **MIT licensed**.
Commercial use and redistribution of that HA component are allowed under MIT
without additional permission. Other original repository files default to MIT
unless separately identified.

The separately licensed Pi gateway (`drevos_gateway/`), Pi service units
(`systemd/`) and `scripts/install-gateway.sh` use the
[Thomas Eigner Free Use License 1.0](../drevos_gateway/LICENSE). Private and internal
business use are free. Resale, commercial redistribution, bundling/preinstallation
or promotion as a feature of commercially offered products/services require
Thomas Eigner's prior, express written permission, even without a separate
software price. This covers modified or renamed versions too.

Standalone apps, cloud agent and relay are maintained under the separate
[app project terms](https://github.com/eignerth2010-byte/drevos-app/blob/main/docs/LICENSING.md).
The MIT license for the HA component grants no extra rights in those parts or
manufacturer marks. Third-party licenses are unaffected. Previously published
MIT versions retain their rights, including commercial use and resale.

Catalog submission concerns the MIT HA component only; Marketplace/HACS installs
`custom_components/drevos`, not the separately licensed external Pi gateway.
Acceptance still requires successful checks and maintainer review.
