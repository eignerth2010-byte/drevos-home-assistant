# Hardware / Hardware requirements

[Einfache HA-Installation](INSTALLATION.de.md) · [Easy HA setup](INSTALLATION.en.md) · [HA und App gemeinsam](HA-UND-APP.de.md)

## Deutsch

Alle aufgeführten Pi-Modelle verwenden dieselbe Python-Software. Die Gateway-Software verwendet einen USB-Seriell-Port, keine modellabhängigen GPIO-Funktionen. 32- und 64-Bit-Linux sind vorgesehen, sofern Python 3.11+ und pySerial verfügbar sind. Die tatsächliche Prüfung erfolgte auf einem Pi 3 B+ mit 64-Bit-Raspberry-Pi-OS und Python 3.13.5. Andere Modelle sind technisch vorgesehen, aber hier nicht physisch geprüft.

| Modell | Netzwerk | Versorgung / Anschluss | Besonderheit |
|---|---|---|---|
| Pi 3 B | Ethernet, 2,4-GHz-WLAN | Geeignetes 5-V-/2,5-A-Micro-USB-Netzteil | Normale USB-A-Buchse für den SPS-Adapter |
| Pi 3 B+ | Ethernet, 2,4-/5-GHz-WLAN | Geeignetes 5-V-/2,5-A-Micro-USB-Netzteil | Physisch geprüfte Variante |
| Pi 4 B | Ethernet, 2,4-/5-GHz-WLAN | Geeignetes 5-V-/3-A-USB-C-Netzteil | Mehr Leistung als für das Gateway nötig; ausreichende Belüftung |
| Pi Zero 2 W | 2,4-GHz-WLAN; Ethernet nur über zusätzlichen Adapter | Geeignetes 5-V-/2,5-A-Micro-USB-Netzteil | USB-OTG-Adapter am Datenanschluss nötig; Stromanschluss ist separat |

Die Angaben sind praktische Netzteilempfehlungen einschließlich Peripherie, keine Aussage über den konstanten Stromverbrauch. Home Assistant selbst ist keine Aufgabe dieses kleinen Pi-Gateways. Auf dem Zero 2 W wird eine schlanke Installation ohne Desktop empfohlen.

Zusätzlich: microSD-Karte, Gehäuse passend zu Montageort und Belüftung, zuverlässige Netzwerkverbindung und **elektrisch passender SPS-Programmieradapter**. Die geprüfte Verbindung meldet sich als FTDI FT232R; daraus lässt sich die notwendige elektrische Schnittstelle eines anderen Ofens nicht ableiten. Keine Anleitung für Netzspannungsverdrahtung oder nicht bestätigte Pinbelegungen ist enthalten. Die Elektronik darf nicht durch Ofenhitze oder Feuchtigkeit belastet werden.

### Konkretes Kabel des Referenzaufbaus

Der Projektbetreiber hat **DTECH USB auf RS232 DB9, FTDI-Chipsatz, 1,2 m, 9-poliger Stecker** als verwendetes Kabel angegeben: [Amazon ASIN B08L4ZR5ZX](https://www.amazon.de/dp/B08L4ZR5ZX). Die USB-Abfrage am vorhandenen Pi zeigt einen FTDI-Adapter (`0403:6001`). Der Anschluss und die elektrische Schnittstelle einer anderen Ofensteuerung müssen vor dem Kauf geprüft werden; ein gleicher USB-Chip oder 9-poliger Stecker allein reicht nicht.

## English

Every listed board runs the same Python software. It uses a USB serial port, not model-specific GPIO. Both 32-bit and 64-bit Linux are intended where Python 3.11+ and pySerial are available. Physical validation is on a **Pi 3 B+, 64-bit Raspberry Pi OS, Python 3.13.5**; other boards have not been physically tested here.

| Board | Network | Recommended supply / connection | Difference |
|---|---|---|---|
| Pi 3 B | Ethernet, 2.4 GHz Wi-Fi | Suitable 5 V / 2.5 A Micro USB supply | USB-A programming cable connection |
| Pi 3 B+ | Ethernet, 2.4 / 5 GHz Wi-Fi | Suitable 5 V / 2.5 A Micro USB supply | Physically validated board |
| Pi 4 B | Ethernet, 2.4 / 5 GHz Wi-Fi | Suitable 5 V / 3 A USB-C supply | More computing capacity than required; provide ventilation |
| Pi Zero 2 W | 2.4 GHz Wi-Fi; Ethernet needs an extra adapter | Suitable 5 V / 2.5 A Micro USB supply | Requires USB OTG adapter on the data port; power port is separate |

Supply recommendations include peripheral headroom; they are not measured constant consumption. Run HA separately; a slim OS without a desktop is suitable for a Zero 2 W gateway.

Also provide a microSD card, suitable enclosure, reliable networking and an electrically compatible PLC programming cable. The verified cable enumerates as FTDI FT232R; this does not establish the electrical interface for another oven. No mains wiring or unverified pinout instructions are supplied. Keep electronics away from oven heat and moisture.

### Reference cable

The owner identified **DTECH USB to RS232 DB9, FTDI, 1.2 m, 9-pin male, ASIN B08L4ZR5ZX** as the installed cable: [product listing](https://www.amazon.de/dp/B08L4ZR5ZX). The live Pi enumerates FTDI `0403:6001`. Check the actual oven connector, interface and pinout before buying; this identifies the reference setup, not universal compatibility.

## Official references / Offizielle Quellen

- [Raspberry Pi getting started and power supplies](https://www.raspberrypi.com/documentation/computers/getting-started.html)
- [Raspberry Pi computer hardware](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [Zero models](https://www.raspberrypi.com/documentation/computers/zero.html)
