# Sunmade brand

Logo and brand assets for **Sunmade Luxury Shortlets & Suites**.

- **Icon:** teal tile with a white solid house (the S is cut out of it) and a gold roof.
- **Wordmark:** SUNMADE in Plus Jakarta Sans ExtraBold, with a custom crossbar-less "A" holding a gold triangle.
- **Colours:** teal `#10695B`, gold `#F8A42F`.

## Files

| Path | What |
| --- | --- |
| `logo/sunmade-icon.svg` | Primary icon (rounded tile). Also used as `src/app/icon.svg`. |
| `logo/sunmade-icon-square.svg` | Full-bleed square for iOS/Android, which round the corners themselves. |
| `logo/sunmade-mark.svg`, `logo/sunmade-mark-white.svg` | House + roof without the tile. |
| `logo/sunmade-icon-{192,512,1024}.png` | Icon PNGs. |
| `logo/sunmade-logo*.png` | Full logo, transparent, 4x: colour, white (dark backgrounds), on-teal, stacked. |
| `png/04-final-logo.png` | Final logo sheet. Earlier sheets (01–03) show how the design evolved. |

## Editing

The icon geometry lives in `src/brand.js` (`houseRoofGeometry`, proportions in `HR_FINAL`).
After changing it, regenerate the SVGs and the app's geometry file:

```bash
node design/brand/make-icons.js
```

This rewrites `logo/*.svg` and `src/shared/components/brand/geometry.ts`, which the
`<SunmadeLogo />` and `<SunmadeMark />` components use. Sheets in `src/*.html` render to
PNG with `./render.sh <name> [width] [height]` (needs Google Chrome).

The `logo/sunmade-logo*.png` files come from `src/05-logo-export.html`, which draws one
transparent lockup from `?o=<options>` (see `lockupTile` in `src/brand.js`), at 4x:

```bash
render() { SCALE=4 OUT=logo NAME=$1 QUERY="?o=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$2")" ./render.sh 05-logo-export 1200 700 transparent; }
render sunmade-logo '{"size":60}'
render sunmade-logo-white '{"size":60,"color":"#fff"}'
render sunmade-logo-on-teal '{"size":60,"color":"#fff","tile":"white"}'
render sunmade-logo-stacked '{"size":50,"layout":"v"}'
render sunmade-logo-stacked-white '{"size":50,"layout":"v","color":"#fff"}'
```

The API's email logo (`shortlet-api/src/modules/mail/assets/sunmade-logo.png`) is a copy of
`logo/sunmade-logo.png`.
