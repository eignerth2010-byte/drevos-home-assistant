import unittest
import struct
from unittest.mock import patch
from drevos_gateway import controls

class Port:
    def __init__(self,ack=b'\x06'): self.frames=[]; self.ack=ack
    def reset_input_buffer(self): pass
    def write(self,frame): self.frames.append(frame); return len(frame)
    def read(self,count): return self.ack

class ControlTests(unittest.TestCase):
    def state(self,**changes):
        result={'automatik':False,'fahrenheit':False,'konvektion':False,'luefter':False,
                'heizung_freigabe':False,'rauch_freigabe':False,
                'kammertemperatur_soll_raw':0,'kerntemperatur_ziel_raw':0,'rauch_soll':0,
                'timer_dauer':9000,'timer_laeuft':False,'timer_verstrichen_s':0}
        result.update(changes)
        return result

    def test_only_confirmed_hmi_bits_can_be_addressed(self):
        for name in ['M15','Y004','heizung','rauch','unknown']:
            port=Port()
            with self.assertRaises(ValueError): controls.set_fan(port,name,True)
            self.assertEqual(port.frames,[])

    def test_automatic_program_prevents_any_write(self):
        port=Port()
        with patch.object(controls,'read_controls',return_value={'automatik':True}):
            with self.assertRaises(PermissionError): controls.set_fan(port,'konvektion',True)
        self.assertEqual(port.frames,[])

    def test_atomic_bit_frames_and_readback(self):
        for name,value,frame in [('konvektion',True,b'\x0270408\x0306'),
                                  ('konvektion',False,b'\x0280408\x0307'),
                                  ('luefter',True,b'\x0270508\x0307'),
                                  ('luefter',False,b'\x0280508\x0308')]:
            port=Port()
            before={'automatik':False,name:not value}
            after={'automatik':False,name:value}
            with patch.object(controls,'read_controls',side_effect=[before,after]),patch.object(controls.time,'sleep'):
                self.assertEqual(controls.set_fan(port,name,value),after)
            self.assertEqual(port.frames,[frame])

    def test_lost_ack_does_not_cause_duplicate_write(self):
        port=Port(ack=b'')
        with patch.object(controls,'read_controls',side_effect=[{'automatik':False,'luefter':False},{'automatik':False,'luefter':True}]),patch.object(controls.time,'sleep'):
            controls.set_fan(port,'luefter',True)
        self.assertEqual(len(port.frames),1)

    def test_failed_readback_is_not_reported_as_success(self):
        port=Port()
        with patch.object(controls,'read_controls',return_value={'automatik':False,'luefter':False}),patch.object(controls.time,'sleep'):
            with self.assertRaises(RuntimeError): controls.set_fan(port,'luefter',True)
        self.assertEqual(len(port.frames),1)

    def test_unknown_addresses_and_invalid_numbers_cannot_write(self):
        port=Port()
        for register,raw in [(501,100),(500,1201),(504,1151),(505,101),(500,-1),(500,101)]:
            with self.assertRaises(ValueError): controls._write_word(port,register,raw)
        for bit in [0,15,101,8000]:
            with self.assertRaises(ValueError): controls._write_bit(port,bit,True)
        self.assertEqual(port.frames,[])

    def test_nonfinite_fractional_or_outside_targets_are_rejected(self):
        for payload in ['NaN','Infinity','-1','121','2.5','ON','1;poweroff']:
            with self.assertRaises(ValueError): controls.parse_number('kammertemperatur_soll',payload)
        self.assertEqual(controls.parse_number('kammertemperatur_soll','120'),120)
        self.assertEqual(controls.parse_number('kerntemperatur_ziel','115'),115)
        with self.assertRaises(ValueError): controls.parse_number('kerntemperatur_ziel','116')

    def test_positive_setpoints_do_not_start_heat_or_smoke(self):
        cases=[('kammertemperatur_soll',30,'kammertemperatur_soll_raw',300,b'\x02113E8022C01\x034D'),
               ('kerntemperatur_ziel',80,'kerntemperatur_ziel_raw',800,b'\x02113F0022003\x0335'),
               ('rauch_soll',40,'rauch_soll',40,b'\x02113F2022800\x033C')]
        for name,value,key,raw,frame in cases:
            port=Port()
            with patch.object(controls,'read_controls',side_effect=[self.state(),self.state(**{key:raw})]),patch.object(controls.time,'sleep'):
                controls.set_number(port,name,value)
            self.assertEqual(port.frames,[frame])

    def test_heating_and_smoke_start_require_positive_valid_targets(self):
        for name in ['heizelement','rauchbetrieb']:
            port=Port()
            with patch.object(controls,'read_controls',return_value=self.state()):
                with self.assertRaises(PermissionError): controls.set_switch(port,name,True)
            self.assertEqual(port.frames,[])

    def test_fahrenheit_mode_prevents_writes(self):
        port=Port()
        with patch.object(controls,'read_controls',return_value=self.state(fahrenheit=True)):
            with self.assertRaises(PermissionError): controls.set_number(port,'kammertemperatur_soll',30)
        self.assertEqual(port.frames,[])

    def test_zero_chamber_target_disables_heat_before_clearing_setpoint(self):
        port=Port()
        before=self.state(heizung_freigabe=True,kammertemperatur_soll_raw=300)
        stopped=self.state(kammertemperatur_soll_raw=300)
        with patch.object(controls,'read_controls',side_effect=[before,before,stopped,self.state()]),patch.object(controls.time,'sleep'):
            controls.set_number(port,'kammertemperatur_soll',0)
        self.assertEqual(port.frames,[b'\x0280608\x0309',b'\x02113E8020000\x0337'])

    def test_zero_smoke_level_disables_smoke_before_clearing_setpoint(self):
        port=Port()
        before=self.state(rauch_freigabe=True,rauch_soll=40)
        stopped=self.state(rauch_soll=40)
        with patch.object(controls,'read_controls',side_effect=[before,before,stopped,self.state()]),patch.object(controls.time,'sleep'):
            controls.set_number(port,'rauch_soll',0)
        self.assertEqual(port.frames,[b'\x0280708\x030A',b'\x02113F2020000\x0332'])

    def test_timer_decode_and_human_readable_remaining_time(self):
        m=bytearray(14); m[0]=4
        responses=[struct.pack('<6h',50,126,0,0,0,0),struct.pack('<h',0),struct.pack('<Ihh',75,3,1),bytes(m),b'\x00']
        with patch.object(controls,'read_bytes',side_effect=responses): state=controls.read_controls(None)
        self.assertEqual(state['timer_dauer'],3)
        self.assertEqual(state['timer_laufzeit'],'00:01:15')
        self.assertEqual(state['timer_restzeit'],'00:01:45')
        self.assertTrue(state['timer_laeuft'])

    def test_timer_duration_bounds(self):
        self.assertEqual(controls.parse_number('timer_dauer','9999'),9999)
        for value in ['0','10000','-1','1.5']:
            with self.assertRaises(ValueError): controls.parse_number('timer_dauer',value)

    def test_timer_cannot_be_paused_while_heat_or_smoke_is_active(self):
        for key in ['heizung_freigabe','rauch_freigabe']:
            port=Port()
            with patch.object(controls,'read_controls',return_value=self.state(timer_laeuft=True,**{key:True})):
                with self.assertRaises(PermissionError): controls.set_switch(port,'timer_lauf',False)
            self.assertEqual(port.frames,[])

    def test_timer_reset_requires_paused_nonenergized_state(self):
        for key in ['timer_laeuft','heizung_freigabe','rauch_freigabe']:
            port=Port()
            with patch.object(controls,'read_controls',return_value=self.state(**{key:True})):
                with self.assertRaises(PermissionError): controls.reset_timer(port)
            self.assertEqual(port.frames,[])

    def test_timer_start_writes_only_M2(self):
        port=Port()
        before=self.state(timer_dauer=1)
        after=self.state(timer_dauer=1,timer_laeuft=True)
        with patch.object(controls,'read_controls',side_effect=[before,after]),patch.object(controls.time,'sleep'):
            controls.set_switch(port,'timer_lauf',True)
        self.assertEqual(port.frames,[b'\x0270208\x0304'])

    def test_expired_timer_requires_reset_before_resume(self):
        port=Port()
        with patch.object(controls,'read_controls',return_value=self.state(timer_dauer=1,timer_verstrichen_s=60)):
            with self.assertRaises(PermissionError): controls.set_switch(port,'timer_lauf',True)
        self.assertEqual(port.frames,[])

if __name__=='__main__': unittest.main(verbosity=2)

