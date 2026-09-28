#!/bin/bash
# Usage: ./render.sh <name> [width] [height]
cd "$(dirname "$0")"
W=${2:-1440}; H=${3:-2400}
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --virtual-time-budget=15000 --window-size=$W,$H \
  --screenshot="$PWD/png/$1.png" "file://$PWD/src/$1.html" 2>/dev/null
# Trim trailing blank rows (same colour as the bottom row)
python3 - "$PWD/png/$1.png" <<'PY'
import sys
from PIL import Image
p=sys.argv[1]; im=Image.open(p).convert('RGB'); w,h=im.size; px=im.load()
bg=px[w//2,h-1]; y=h-1
while y>0 and all(px[x,y]==bg for x in range(0,w,8)): y-=1
im.crop((0,0,w,min(h,y+2))).save(p)
PY
