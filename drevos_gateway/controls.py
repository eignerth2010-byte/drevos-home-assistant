"""Drevos control access: only confirmed HMI request bits, never Y outputs."""
import struct
import time
from decimal import Decimal, InvalidOperation
from .protocol import read_bytes, checksum

FAN_BITS = {'konvektion': 4, 'luefter': 5}
SWITCHES = {
    'konvektion': (4, 'konvektion'), 'luefter': (5, 'luefter'),
    'heizelement': (6, 'heizung_freigabe'), 'rauchbetrieb': (7, 'rauch_freigabe'),
    'timer_lauf': (2, 'timer_laeuft'),
}
NUMBERS = {
    'kammertemperatur_soll': (500, 120, 10, 'kammertemperatur_soll_raw'),
    'kerntemperatur_ziel': (504, 115, 10, 'kerntemperatur_ziel_raw'),
    'rauch_soll': (505, 100, 1, 'rauch_soll'),
    'timer_dauer': (508, 9999, 1, 'timer_dauer'),
}
ACTION_COMMANDS={'timer_reset'}

def clock_text(seconds):
    seconds=max(0,int(seconds))
    return f'{seconds//3600:02d}:{seconds//60%60:02d}:{seconds%60:02d}'

def read_controls(port):
    words=struct.unpack('<6h',read_bytes(port,0x13E8,12))
    (unit,)=struct.unpack('<h',read_bytes(port,0x17CE,2))
    elapsed,duration,elapsed_minutes=struct.unpack('<Ihh',read_bytes(port,0x13F4,8))
    m=read_bytes(port,0x0100,14)
    y=read_bytes(port,0x00A0,1)[0]
    bit=lambda n: bool(m[n//8] & (1 << (n%8)))
    to_c=lambda raw: 0 if raw==0 else round((raw/10-32)*5/9,1) if unit>0 else raw/10
    return {'kammertemperatur_soll_raw':words[0], 'kerntemperatur_ziel_raw':words[4],
            'kammertemperatur_soll':to_c(words[0]), 'kerntemperatur_ziel':to_c(words[4]),
            'rauch_soll':words[5], 'fahrenheit':unit>0, 'automatik':bit(101),
            'konvektion':bit(4), 'luefter':bit(5), 'heizung_freigabe':bit(6),
            'rauch_freigabe':bit(7), 'M15':bit(15),
            'timer_dauer':duration, 'timer_laeuft':bit(2),
            'timer_verstrichen_s':elapsed, 'timer_rest_s':max(0,duration*60-elapsed),
            'timer_laufzeit':clock_text(elapsed), 'timer_restzeit':clock_text(duration*60-elapsed),
            'konvektion_ausgang':bool(y & (1<<4)), 'luefter_ausgang':bool(y & (1<<5))}

def set_fan(port, name, enabled):
    if name not in FAN_BITS or type(enabled) is not bool:
        raise ValueError('Only confirmed fan requests and boolean values are permitted')
    return set_switch(port,name,enabled)

def _write_bit(port, number, enabled):
    if number not in (2,4,5,6,7) or type(enabled) is not bool:
        raise ValueError('Only confirmed M2/M4/M5/M6/M7 request bits are permitted')
    body=(b'7' if enabled else b'8')+struct.pack('<H',0x0800+number).hex().upper().encode()+b'\x03'
    return _send(port,body)

def _write_word(port, register, raw):
    maximum={500:1200,504:1150,505:100,508:9999}.get(register)
    minimum=1 if register==508 else 0
    if maximum is None or type(raw) is not int or not minimum<=raw<=maximum or (register in (500,504) and raw%10):
        raise ValueError('Numeric register or value not permitted')
    body=f'1{0x1000+2*register:04X}02'.encode()+struct.pack('<h',raw).hex().upper().encode()+b'\x03'
    return _send(port,body)

def _send(port,body):
    frame=b'\x02'+body+checksum(body)
    port.reset_input_buffer()
    if port.write(frame)!=len(frame): raise RuntimeError('Incomplete control request')
    acknowledgement=port.read(1)
    time.sleep(0.05)
    if acknowledgement not in (b'\x06',b''):
        raise RuntimeError('Unexpected control acknowledgement')
    return acknowledgement

def _manual_state(port):
    state=read_controls(port)
    if state['automatik']:
        raise PermissionError('Automatic program active; manual control refused')
    if state.get('fahrenheit',False):
        raise PermissionError('Manual control requires verified Celsius mode')
    return state

def set_switch(port,name,enabled):
    if name not in SWITCHES or type(enabled) is not bool:
        raise ValueError('Unknown control or non-boolean switch value')
    before=_manual_state(port)
    bit,key=SWITCHES[name]
    if before[key] is enabled: return before
    if enabled and name=='heizelement' and not 0<before['kammertemperatur_soll_raw']<=1200:
        raise PermissionError('Set a valid chamber target before enabling heat')
    if enabled and name=='rauchbetrieb' and not 0<before['rauch_soll']<=100:
        raise PermissionError('Set a valid smoke level before starting smoke/ignition')
    if name=='timer_lauf':
        if not enabled and (before['heizung_freigabe'] or before['rauch_freigabe']):
            raise PermissionError('Turn heat and smoke off before pausing the timer')
        if enabled and (not 1<=before['timer_dauer']<=9999 or before['timer_verstrichen_s']>=before['timer_dauer']*60):
            raise PermissionError('Set a positive duration and reset an expired timer before starting')
    _write_bit(port,bit,enabled)
    after=read_controls(port)
    # If ACK is lost, inspect actual state before ever considering a retry.
    if after[key] is not enabled:
        raise RuntimeError('Control request was not confirmed by readback')
    return after

def parse_number(name,payload):
    if name not in NUMBERS: raise ValueError('Unknown numeric control')
    try: value=Decimal(payload)
    except (InvalidOperation,ValueError,TypeError): raise ValueError('Invalid numeric payload')
    minimum=1 if name=='timer_dauer' else 0
    if not value.is_finite() or value!=value.to_integral_value() or not minimum<=value<=NUMBERS[name][1]:
        raise ValueError('Target outside permitted whole-number range')
    return int(value)

def set_number(port,name,value):
    minimum=1 if name=='timer_dauer' else 0
    if name not in NUMBERS or type(value) is not int or not minimum<=value<=NUMBERS[name][1]:
        raise ValueError('Unknown control or invalid numeric target')
    register,maximum,scale,key=NUMBERS[name]
    before=_manual_state(port)
    # Zero explicitly stops the associated function before clearing its setpoint.
    if value==0 and name=='kammertemperatur_soll' and before['heizung_freigabe']:
        set_switch(port,'heizelement',False)
    if value==0 and name=='rauch_soll' and before['rauch_freigabe']:
        set_switch(port,'rauchbetrieb',False)
    if before[key]==value*scale: return read_controls(port)
    _write_word(port,register,value*scale)
    after=read_controls(port)
    if after[key]!=value*scale:
        raise RuntimeError('Setpoint was not confirmed by readback')
    return after

def reset_timer(port):
    before=_manual_state(port)
    if before['timer_laeuft'] or before['heizung_freigabe'] or before['rauch_freigabe']:
        raise PermissionError('Pause timer and turn heat/smoke off before resetting')
    if before['timer_verstrichen_s']==0: return before
    # Only zero the confirmed elapsed DWORD D506/D507; never write an arbitrary time value.
    _send(port,b'113F40400000000\x03')
    after=read_controls(port)
    if after['timer_verstrichen_s']!=0: raise RuntimeError('Timer reset not confirmed')
    return after

def apply_command(port,name,payload):
    if name=='timer_reset':
        if payload!='RESET': raise ValueError('Invalid timer reset payload')
        return reset_timer(port)
    if name in SWITCHES:
        if payload not in ('ON','OFF'): raise ValueError('Invalid switch payload')
        return set_switch(port,name,payload=='ON')
    if name in NUMBERS:
        return set_number(port,name,parse_number(name,payload))
    raise ValueError('Unknown command topic')

