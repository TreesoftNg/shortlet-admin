#!/bin/bash
# Expand admin templates (shared sidebar) and render every screen to png/
cd "$(dirname "$0")"
python3 - <<'PY'
import glob, re
side = open('src/_side.html').read()
for t in glob.glob('src/*.tpl.html'):
    s = open(t).read()
    key = re.search(r'<!--SIDE:(\w+)-->', s).group(1)
    sb = side
    for k in ('dash', 'book', 'cal'):
        sb = sb.replace(f'%{k}%', 'on' if k == key else '')
    open(t.replace('.tpl', ''), 'w').write(s.replace(f'<!--SIDE:{key}-->', sb))
PY
for f in src/[0-9]*.html; do
  n=$(basename "$f" .html); [[ $n == *.tpl ]] && continue
  case $n in 0[1-7]*) H=4000;; 08*) H=1100;; *) H=1200;; esac
  ./render.sh "$n" 1440 $H & 
done
wait
