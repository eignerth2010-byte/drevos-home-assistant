"""Embed the unchanged supplied logo so the card needs no external image request."""
import base64
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
logo = root / "custom_components/drevos/brand/logo.png"
card = root / "custom_components/drevos/www/drevos-smoker-card.js"
data = "data:image/png;base64," + base64.b64encode(logo.read_bytes()).decode("ascii")
source = card.read_text(encoding="utf-8")
source, count = re.subn(r"const LOGO_DATA = '[^']*';", "const LOGO_DATA = '" + data + "';", source)
if count != 1:
    raise SystemExit("Expected exactly one logo constant")
card.write_text(source, encoding="utf-8")
print("Embedded the unchanged logo.")
