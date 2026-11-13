# Verified profile: drevos_fx3u_v1

Deutsch: Dieses Profil beschreibt die hier geprüfte SPS-Anwendung, nicht alle Drevos-Öfen oder alle FX3U-Steuerungen. Schreibzugriff ist nach der Installation standardmäßig deaktiviert. Andere Programme müssen separat überprüft werden. Das ursprüngliche SPS-Projekt wird nicht mitgeliefert.

English: This profile describes one verified PLC application, not every Drevos oven or FX3U controller. New installations default to read-only access. Other programs require separate verification. The original PLC project is not distributed.

| Address | Meaning | Scaling / write boundary |
|---|---|---|
| D311 | Chamber actual temperature | Read only; raw / 10 °C |
| D312 | Core actual temperature | Read only; raw / 10 °C |
| D500 | Chamber PID target | 0–120 °C; raw ×10 in verified Celsius mode |
| D504 | Core completion threshold | 0–115 °C; raw ×10; zero disables this criterion |
| D505 | Smoke level | 0–100% |
| D506/D507 | Elapsed seconds, unsigned DWORD | Read; reset may write only zero to this fixed DWORD |
| D508 | Timer duration | 1–9999 minutes exposed in HA |
| D509 | Elapsed minutes | Read only |
| D999 | Display unit mode | Read only; positive value blocks manual HA writes |
| M2 | Process clock request | Start / pause; pause requires heat/smoke off |
| M4 | Manual convection request | Does not force physical Y004 output |
| M5 | Fan request | Confirmed against original HMI |
| M6 | Heating enable | Positive valid chamber target required |
| M7 | Smoke and timed ignition enable | Positive smoke target required; uses existing PLC sequence |
| M101 | Automatic program active | Read only; blocks manual writes |

M15 is an unused oven-light HMI function in the checked installation and is not exposed or written. Convection may run automatically for heating/cooling independently of its manual request. The timer and core criterion are combined by the PLC's existing completion logic. Timer expiry ends the manual process and resets request bits and elapsed time. The original HMI may restore its default timer duration.

Serial protocol: FX-style programming-port frames, 38400 baud, 7E1. Every read uses a fixed address/count allowlist, validates framing and checksum, and has bounded timeouts. Commands target only the listed HMI request bits and setpoints. No PLC program upload, operating-mode change, generic address-write endpoint, or raw Y-output force is provided. All accepted writes are verified by readback; an uncertain command is not blindly retried.

The public gateway opens the serial port exclusively. MQTT and native gateways must never run simultaneously against the same port. HTTP commands are authenticated, not retained or replayed after reconnect, and serialized. A disconnected HA does not stop the oven.
