# Sanctuary

Clickable prototype: the landing page and every screen of the app.

## Run it
Open `index.html` through any static server (the pages fetch their own source, so `file://` will not work):

    npx serve .        # or: python3 -m http.server

## Push to GitHub
    git init
    git add .
    git commit -m "Sanctuary prototype"
    git branch -M main
    git remote add origin https://github.com/YOUR-NAME/sanctuary.git
    git push -u origin main

Then Settings → Pages → Deploy from branch → `main` / root. The site appears at `https://YOUR-NAME.github.io/sanctuary/` within a minute or two. `.nojekyll` is included so GitHub serves every file as-is.

## Pages
| File | Screen |
| --- | --- |
| index.html | Landing page |
| login.html | Log in, invite code, request access |
| invitations.html | Your two keys |
| onboarding.html | First steps: welcome, name, sky, connections, decks |
| first-reading.html | First reading of what came in |
| app.html | Home, decks, cards, altar, settings |
| inner-chamber.html | The Seer |
| rituals.html | Book of Rituals |
| teach.html | Teach Sanctuary |
| preview.html | Self-contained 1440 × 900 preview for embedding on another site (no other files needed) |

## Structure
- `support.js` — the small runtime every page loads. Each page is one HTML file: markup with `{{ }}` holes, plus a `<script data-dc-script>` class that supplies the values.
- `guide-tips.js`, `garden-model.js`, `image-slot.js` — helpers loaded by app.html and rituals.html.
- `shared/sanctuary-core.js` — reference copy of the shared data (decks, palette, storage keys). Not loaded at runtime.
- `assets/` — only the images the pages use. Scenes and deck art are JPEG at 1600px / 640px; transparent images (gems, pouch, logo) are resized PNG (`-sm.png`). `assets/garden/` still feeds the deck progress line in app.html.

State is kept in the browser's localStorage (keys start with `sanctuary-`). Nothing is sent anywhere.

## Known before handoff
- app.html is about 550 KB and carries unused values; a rebuild in a standard framework is the clean fix.
- Fonts load from Google Fonts, so the pages need a connection.
