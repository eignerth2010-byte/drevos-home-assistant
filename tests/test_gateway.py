"""Gateway behavior with an isolated, synthetic PLC and loopback HTTP server."""
import http.client
import json
import threading
import unittest
from unittest.mock import patch, Mock
from drevos_gateway import server
from drevos_gateway.protocol import read_bytes, checksum

CONFIG = {"token": "test_only_" + "x" * 40, "profile": server.PROFILE,
          "id": "fixture_gateway_01", "serial_port": "FAKE", "allow_control": True}


class GatewayTests(unittest.TestCase):
    def setUp(self):
        self.gateway = server.Gateway(CONFIG.copy())
        self.base = {"available": True, "controls_available": True, "heizung_freigabe": False,
                     "rauch_freigabe": False, "timer_laeuft": False}

    def test_token_profile_and_identity_are_required(self):
        for change in [{"token": ""}, {"profile": "unknown"}, {"id": "../bad"}]:
            with self.assertRaises(ValueError): server.Gateway({**CONFIG, **change})

    def test_public_info_never_exposes_credentials_or_serial_path(self):
        value=json.dumps(self.gateway.info())
        self.assertNotIn(CONFIG["token"],value)
        self.assertNotIn("FAKE",value)

    def test_readonly_automatic_and_offline_block_commands(self):
        for state, exception in [({**self.base,"controls_available":False},PermissionError),
                                  ({"available":False},ConnectionError)]:
            with patch.object(self.gateway,"_read",return_value=state),patch.object(server,"apply_command") as apply:
                with self.assertRaises(exception): self.gateway.command("heizelement","ON")
                apply.assert_not_called()

    def test_command_is_verified_and_not_retried_after_uncertain_outcome(self):
        self.gateway.port=Mock()
        with patch.object(self.gateway,"_read",return_value=self.base),patch.object(server,"apply_command",side_effect=RuntimeError) as apply:
            with self.assertRaises(ConnectionError): self.gateway.command("luefter","ON")
            self.assertEqual(apply.call_count,1)
            self.assertIsNone(self.gateway.port)

    def test_shutdown_requires_heat_smoke_and_timer_off(self):
        for key in ("heizung_freigabe","rauch_freigabe","timer_laeuft"):
            with patch.object(self.gateway,"_read",return_value={**self.base,key:True}),patch.object(server.Path,"touch") as touch:
                with self.assertRaises(PermissionError): self.gateway.command("shutdown","SHUTDOWN")
                touch.assert_not_called()

    def test_shutdown_uses_only_fixed_request_file(self):
        with patch.object(self.gateway,"_read",return_value=self.base),patch.object(server.Path,"touch") as touch:
            result=self.gateway.command("shutdown","SHUTDOWN")
            touch.assert_called_once_with(exist_ok=False)
            self.assertFalse(result["available"])
            with self.assertRaises(PermissionError): self.gateway.command("shutdown","SHUTDOWN")

    def test_unknown_or_long_payload_does_not_write(self):
        with patch.object(self.gateway,"_read",return_value=self.base),patch.object(server,"apply_command") as apply:
            for key,value in [("Y003","ON"),("luefter","X"*17)]:
                with self.assertRaises(ValueError): self.gateway.command(key,value)
            apply.assert_not_called()

    def test_serial_checksum_and_allowlist(self):
        port=Mock();port.write.side_effect=lambda frame:len(frame)
        with self.assertRaises(ValueError):read_bytes(port,0x9999,4)
        port.write.assert_not_called()
        body=b"7C002E00\x03";port.read.return_value=b"\x02"+body+checksum(body)
        self.assertEqual(read_bytes(port,0x126E,4),b"\x7c\x00\x2e\x00")
        port.read.return_value=b"\x02"+body+b"00"
        with self.assertRaises(RuntimeError):read_bytes(port,0x126E,4)

    def test_read_error_closes_port_and_never_returns_stale_values(self):
        self.gateway.port=Mock()
        self.gateway.cached={**self.base,"kammertemperatur":99}
        with patch.object(server,"read_bytes",side_effect=RuntimeError):
            self.assertEqual(self.gateway._read(),{"available":False,"controls_available":False})
            self.assertIsNone(self.gateway.port)


class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.gateway=server.Gateway(CONFIG.copy())
        self.http=server.Server(("127.0.0.1",0),self.gateway)
        self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start()

    def tearDown(self):
        self.http.shutdown();self.http.server_close();self.thread.join()

    def request(self,method,path,body=None,**headers):
        connection=http.client.HTTPConnection("127.0.0.1",self.http.server_port,timeout=3)
        connection.request(method,path,body=body,headers=headers)
        response=connection.getresponse();result=(response.status,json.loads(response.read()))
        connection.close();return result

    def test_auth_browser_origin_and_unknown_route(self):
        self.assertEqual(self.request("GET","/api/v1/info")[0],401)
        headers={"Authorization":"Bearer "+CONFIG["token"]}
        self.assertEqual(self.request("GET","/api/v1/info",**headers)[0],200)
        self.assertEqual(self.request("GET","/api/v1/info",Origin="https://untrusted.invalid",**headers)[0],403)
        self.assertEqual(self.request("GET","/api/v1/unknown",**headers)[0],404)

    def test_bad_payloads_do_not_reach_plc(self):
        with patch.object(self.gateway,"command") as command:
            for body in ["{}","[]",'{"name":"luefter","value":"ON","extra":true}',"x"*257]:
                status,_=self.request("POST","/api/v1/command",body,Authorization="Bearer "+CONFIG["token"],**{"Content-Type":"application/json"})
                self.assertEqual(status,400)
            command.assert_not_called()

    def test_command_failure_has_no_credential_and_no_retry(self):
        with patch.object(self.gateway,"command",side_effect=ConnectionError) as command:
            status,body=self.request("POST","/api/v1/command",json.dumps({"name":"luefter","value":"ON"}),Authorization="Bearer "+CONFIG["token"],**{"Content-Type":"application/json"})
            self.assertEqual(status,503);self.assertEqual(command.call_count,1)
            self.assertNotIn(CONFIG["token"],json.dumps(body))
