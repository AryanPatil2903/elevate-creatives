# AGENTS.md

Guidance for coding agents working on the ElevateLabs Creatives website.

## Project Overview

A static marketing website built with HTML, CSS and vanilla JavaScript.
Content lives in `js/config.js`, `js/main.js` renders it, and `js/fx.js` adds effects.

## Project Structure

```
index.html      # Page skeleton with empty containers
css/style.css   # All styling and theme tokens
js/config.js    # All editable content
js/main.js      # Renders the page from config
js/fx.js        # Particles, 3D globe, tilt, reveal (loads after main.js)
assets/         # Images and media
```

## Code Style

- Two spaces for indentation
- No frameworks or build tools unless the owner asks for them
- Never use `innerHTML` with config or user data; use `textContent` or DOM APIs
- Keep all copy in `config.js`, never hardcode text in `main.js`
- Colors and spacing come from CSS custom properties in `:root`
- Keep the site responsive down to 360px wide
- Effects must respect `prefers-reduced-motion`

## Markdown

- Tables must be space-padded so columns align in plain text.