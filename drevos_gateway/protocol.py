"""Bounded serial reads for the confirmed Drevos register layout."""
import binascii

READS = frozenset({(0x126E, 4), (0x13E8, 12), (0x17CE, 2), (0x13F4, 8),
                   (0x0100, 14), (0x00A0, 1)})


def checksum(body):
    return f"{sum(body) & 255:02X}".encode("ascii")


def read_bytes(port, address, count):
    if (address, count) not in READS:
        raise ValueError("Read address not permitted")
    body = f"0{address:04X}{count:02X}".encode("ascii") + b"\x03"
    frame = b"\x02" + body + checksum(body)
    port.reset_input_buffer()
    if port.write(frame) != len(frame):
        raise RuntimeError("Incomplete serial request")
    response = port.read(count * 2 + 4)
    if (len(response) != count * 2 + 4 or response[:1] != b"\x02"
            or response[-3:-2] != b"\x03"):
        raise RuntimeError("Invalid serial response")
    if checksum(response[1:-2]) != response[-2:].upper():
        raise RuntimeError("Serial checksum mismatch")
    return binascii.unhexlify(response[1:-3])
