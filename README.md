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

Or open any HTML file directly via `file://` (the Raid Loot Demo is pure client-side JS and works either way). Interest works offline via localStorage when Supabase config is empty.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — guild pitch, site capabilities, CTAs |
| `loot.html` | Loot system + FAQ (anti-micro-upgrade principle) |
| `demo.html` | Interactive raid loot assign demo |
| `points.html` | Points dashboard mock |
| `schedule.html` | Raid schedule placeholder |
| `interest.html` | Live interest / starter roster signup (name + class) |

Shared: `css/styles.css`, `js/nav.js`, `js/demo.js`, `js/interest.js`, `js/supabase-config.js`.

## Interest + Supabase

The Interest tab can run in two modes:

1. **Local preview** (default) — leave `js/supabase-config.js` empty. Submissions stay in `localStorage` under `intel-interest-local` and are labeled *local preview (not shared)*.
2. **Live** — create a Supabase project, run `supabase/interest_signups.sql` in the SQL editor, then set:

```js
window.INTEL_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_PUBLIC_KEY'
};
```

Required config fields: **`url`**, **`anonKey`** (anon key is public-by-design; RLS in the SQL file gates reads/writes). Enable Realtime for `interest_signups` (the SQL adds it to `supabase_realtime`).

## Stack

- Static HTML / CSS / JS
- Optional Google Fonts (Inter, JetBrains Mono); system fonts fall back fine offline
- Optional Supabase (CDN JS + RLS) for live Interest roster — no npm required

## Notes

- Demo item names and weights are **placeholders**, labeled as demo — not copyrighted WoW item text.
- Live points, calendar, addon sync, and hosting come later.
- Interest is a soft signal only (not a full application); officers moderate spam server-side via `is_hidden`.
