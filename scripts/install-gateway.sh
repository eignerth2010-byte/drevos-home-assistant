#!/bin/sh
# License: Thomas Eigner Free Use License 1.0; see ../drevos_gateway/LICENSE.
# Run a reviewed local checkout: sudo sh scripts/install-gateway.sh
set -eu
test "$(id -u)" -eq 0 || { echo 'Run with sudo.' >&2; exit 1; }
SOURCE=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
test -f "$SOURCE/pyproject.toml" || exit 1
command -v python3 >/dev/null || { echo 'Install python3 and python3-venv first.'; exit 1; }
python3 -c 'import sys; assert sys.version_info >= (3,11), "Python 3.11+ required"'
id drevos >/dev/null 2>&1 || useradd --system --home-dir /opt/drevos --groups dialout --shell /usr/sbin/nologin drevos
install -d -m 755 /opt/drevos /opt/drevos/source
install -d -m 700 -o drevos -g drevos /etc/drevos
cp -R "$SOURCE/drevos_gateway" /opt/drevos/source/
cp "$SOURCE/pyproject.toml" /opt/drevos/source/
python3 -m venv /opt/drevos/.venv
/opt/drevos/.venv/bin/pip install /opt/drevos/source
if ! test -f /etc/drevos/gateway.json; then
  /opt/drevos/.venv/bin/python - <<'PY'
import glob, json, os, secrets
ports=glob.glob('/dev/serial/by-id/*')
config={'id':secrets.token_hex(12),'name':'Drevos Smoker','profile':'drevos_fx3u_v1',
        'token':secrets.token_urlsafe(48),'serial_port':ports[0] if len(ports)==1 else '/dev/serial/by-id/CHOOSE_YOUR_VERIFIED_ADAPTER',
        'bind':'127.0.0.1','port':8756,'allow_control':False}
fd=os.open('/etc/drevos/gateway.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as file: json.dump(config,file,indent=2);file.write('\n')
PY
fi
chown drevos:drevos /etc/drevos/gateway.json
chmod 600 /etc/drevos/gateway.json
install -m 644 "$SOURCE/systemd/drevos-gateway.service" /etc/systemd/system/drevos-gateway.service
install -m 644 "$SOURCE/systemd/drevos-native-poweroff.path" /etc/systemd/system/drevos-native-poweroff.path
install -m 644 "$SOURCE/systemd/drevos-native-poweroff.service" /etc/systemd/system/drevos-native-poweroff.service
systemctl daemon-reload
echo 'Installed without starting or enabling the serial service.'
echo 'Review /etc/drevos/gateway.json locally. Keep its token private.'
echo 'Confirm the serial adapter, LAN bind address and PLC profile; controls default to disabled.'
echo 'Stop any other service using the serial port before starting this gateway.'
echo 'Then: sudo systemctl enable --now drevos-gateway.service drevos-native-poweroff.path'
