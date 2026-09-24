# Intelligence · WoW Forever

Static site shell for the **Intelligence** guild (adult, high-IQ raiding on WoW Forever).

Short identity: **WoWForever · Intelligence**  
Future publish candidates: `wowf-intel` (GitHub Pages / Netlify) or similar — **not published yet**.

## Preview locally

From this directory:

```bash
cd /workspace/intelligence-site
python3 -m http.server 8080
```

Then open [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

Or open any HTML file directly via `file://` (the Raid Loot Demo is pure client-side JS and works either way).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — guild pitch, site capabilities, CTAs |
| `loot.html` | Loot system + FAQ (anti-micro-upgrade principle) |
| `demo.html` | Interactive raid loot assign demo |
| `points.html` | Points dashboard mock |
| `schedule.html` | Raid schedule placeholder |

Shared: `css/styles.css`, `js/nav.js`, `js/demo.js`.

## Stack

- Static HTML / CSS / JS
- Optional Google Fonts (Inter); system fonts fall back fine offline
- No backend, no paid CDN required

## Notes

- Demo item names and weights are **placeholders**, labeled as demo — not copyrighted WoW item text.
- Live points, calendar, addon sync, and hosting come later.
