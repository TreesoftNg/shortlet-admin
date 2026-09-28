#!/bin/bash
# Usage: ./render.sh <name> [width] [height] [transparent]
# Env: OUT (dir, default png), NAME (output name), SCALE (device scale), QUERY (?query)
cd "$(dirname "$0")"
W=${2:-1440}; H=${3:-2400}; OUT=${OUT:-png}
BG=""; [ "$4" = "transparent" ] && BG="--default-background-color=00000000"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars $BG \
  --force-device-scale-factor=${SCALE:-1} --virtual-time-budget=15000 --window-size=$W,$H \
  --screenshot="$PWD/$OUT/${NAME:-$1}.png" "file://$PWD/src/$1.html${QUERY}" 2>/dev/null
python3 - "$PWD/$OUT/${NAME:-$1}.png" "$4" <<'PY'
import sys
from PIL import Image
p, mode = sys.argv[1], sys.argv[2]
im = Image.open(p)
if mode == 'transparent':
    im = im.convert('RGBA'); bb = im.getbbox(); im.crop(bb).save(p); sys.exit()
im = im.convert('RGB'); w, h = im.size; px = im.load()
bg = px[w//2, h-1]; y = h-1
while y > 0 and all(px[x, y] == bg for x in range(0, w, 8)): y -= 1
im.crop((0, 0, w, min(h, y+2))).save(p)
PY
