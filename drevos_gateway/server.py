"""Authenticated LAN API, serialized serial access, and bounded commands."""
import argparse
import hmac
import json
import logging
import os
from pathlib import Path
import re
import signal
import struct
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import serial
from . import __version__
from .controls import apply_command, read_controls, SWITCHES, NUMBERS
from .protocol import read_bytes

LOG = logging.getLogger(__name__)
PROFILE = "drevos_fx3u_v1"


class Gateway:
    def __init__(self, config, serial_factory=serial.Serial):
        token = config.get("token", "")
        if not isinstance(token, str) or len(token) < 32:
            raise ValueError("Generate a token of at least 32 characters")
        if config.get("profile") != PROFILE:
            raise ValueError("Unsupported PLC profile")
        if not re.fullmatch(r"[a-zA-Z0-9_-]{8,64}", config.get("id", "")):
            raise ValueError("Invalid stable gateway ID")
        self.config = config
        self.factory = serial_factory
        self.lock = threading.Lock()
        self.port = None
        self.cached = None
        self.cached_at = 0
        self.shutting_down = False

    def info(self):
        return {"id": self.config["id"], "name": self.config.get("name", "Drevos"),
                "version": __version__, "api_version": 1, "profile": PROFILE,
                "controls_enabled": self.config.get("allow_control") is True}

    def _read(self):
        try:
            if self.port is None:
                self.port = self.factory(self.config["serial_port"], 38400, bytesize=7,
                                         parity="E", stopbits=1, timeout=1,
                                         write_timeout=1, exclusive=True)
            chamber, core = struct.unpack("<2h", read_bytes(self.port, 0x126E, 4))
            values = read_controls(self.port)
            if not 0 <= values["rauch_soll"] <= 100:
                raise ValueError("Invalid smoke reading")
            values.update(kammertemperatur=chamber / 10, kerntemperatur=core / 10,
                          raucheinstellung=values["rauch_soll"], available=True)
            values["controls_available"] = bool(self.config.get("allow_control") is True
                                               and not values["automatik"]
                                               and not values["fahrenheit"])
            values.pop("M15", None)
            self.cached, self.cached_at = values, time.monotonic()
            return values.copy()
        except (OSError, ValueError, RuntimeError, serial.SerialException):
            if self.port is not None:
                self.port.close()
                self.port = None
            self.cached = {"available": False, "controls_available": False}
            self.cached_at = time.monotonic()
            return self.cached.copy()

    def state(self):
        with self.lock:
            if self.shutting_down:
                return {"available": False, "controls_available": False}
            if self.cached is not None and time.monotonic() - self.cached_at < 1:
                return self.cached.copy()
            return self._read()

    def command(self, name, value):
        if name not in {*SWITCHES, *NUMBERS, "timer_reset", "shutdown"}:
            raise ValueError("Unknown command")
        # All commands share this single actor/lock. They are never queued or retried.
        with self.lock:
            if self.shutting_down:
                raise PermissionError("Gateway shutting down")
            state = self._read()
            if not state["available"]:
                raise ConnectionError("PLC unavailable")
            if not state["controls_available"]:
                raise PermissionError("Controls disabled or automatic/Fahrenheit mode active")
            if name == "shutdown":
                if value != "SHUTDOWN":
                    raise ValueError("Invalid shutdown payload")
                if state["heizung_freigabe"] or state["rauch_freigabe"] or state["timer_laeuft"]:
                    raise PermissionError("Stop heat, smoke and timer before shutting down the Pi")
                Path("/run/drevos-native/shutdown.request").touch(exist_ok=False)
                self.shutting_down = True
                return {"available": False, "controls_available": False}
            if not isinstance(value, str) or len(value) > 16:
                raise ValueError("Invalid command value")
            try:
                apply_command(self.port, name, value)
                # Re-read instead of exposing optimistic control states.
                self.cached = None
                return self._read()
            except (OSError, RuntimeError, serial.SerialException):
                if self.port is not None:
                    self.port.close()
                    self.port = None
                self.cached = None
                raise ConnectionError("Command outcome uncertain; refresh state before retrying") from None

    def close(self):
        with self.lock:
            if self.port is not None:
                self.port.close()
                self.port = None


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 8

    def __init__(self, address, gateway):
        self.gateway = gateway
        super().__init__(address, Handler)

    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(5)
        return connection, address


class Handler(BaseHTTPRequestHandler):
    server_version = "DrevosGateway/" + __version__

    def log_message(self, fmt, *args):
        # Do not log URLs, headers, tokens or command bodies.
        pass

    def reply(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        expected = "Bearer " + self.server.gateway.config["token"]
        if not hmac.compare_digest(self.headers.get("Authorization", "").encode("utf-8"), expected.encode("utf-8")):
            self.reply(401, {"error": "unauthorized"})
            return False
        if self.headers.get("Origin"):
            self.reply(403, {"error": "browser_origin_not_allowed"})
            return False
        return True

    def do_GET(self):
        if not self.authorized():
            return
        gateway = self.server.gateway
        if self.path == "/api/v1/info":
            self.reply(200, gateway.info())
        elif self.path == "/api/v1/state":
            self.reply(200, gateway.state())
        else:
            self.reply(404, {"error": "not_found"})

    def do_POST(self):
        if not self.authorized():
            return
        if self.path != "/api/v1/command":
            self.reply(404, {"error": "not_found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 256 or self.headers.get_content_type() != "application/json":
                raise ValueError("Invalid body")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or set(payload) != {"name", "value"}:
                raise ValueError("Invalid payload")
            result = self.server.gateway.command(payload["name"], payload["value"])
            self.reply(200, result)
        except PermissionError as error:
            self.reply(409, {"error": str(error)})
        except (ValueError, TypeError, KeyError, TimeoutError):
            self.reply(400, {"error": "invalid_command"})
        except (ConnectionError, OSError):
            self.reply(503, {"error": "PLC unavailable or command outcome uncertain"})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="/etc/drevos/gateway.json")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    config_path = Path(args.config)
    if os.name == "posix" and config_path.stat().st_mode & 0o077:
        raise SystemExit("Gateway configuration must be readable only by its owner (chmod 600)")
    config = json.loads(config_path.read_text(encoding="utf-8"))
    gateway = Gateway(config)
    server = Server((config.get("bind", "127.0.0.1"), int(config.get("port", 8756))), gateway)

    def stop(*_):
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    LOG.info("Drevos API %s started; profile %s; writes %s", __version__, PROFILE,
             config.get("allow_control") is True)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        gateway.close()


if __name__ == "__main__":
    main()

