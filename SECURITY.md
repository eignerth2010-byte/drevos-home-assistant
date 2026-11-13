# Security / Sicherheit

This gateway controls real equipment. Report a suspected control bypass privately through GitHub's private vulnerability reporting if enabled. Otherwise contact the repository owner without disclosing credentials or an exploit in a public issue. Never include gateway tokens, private configuration or network addresses in a public report.

The initial release is an experimental community project. Use the fixed, verified profile only. New installs are loopback-only and read-only. HTTP requires a trusted LAN; use a trusted HTTPS reverse proxy if that is unsuitable. No Internet port forwarding. The Pi is a gateway, not an independent thermal safety device. Network loss does not stop the PLC. Unknown command outcomes require a fresh state check, not a blind retry.

Deutsch: Sicherheitsprobleme möglichst privat melden. Keine Zugangsschlüssel, private Konfiguration oder Netzwerkadressen veröffentlichen. Das Gateway ersetzt keine Temperaturbegrenzung oder vorhandene Ofensicherheit. Das feste Steuerungsprofil ist vor Schreibfreigabe zu prüfen. Netzwerkverlust schaltet den Ofen nicht ab.
