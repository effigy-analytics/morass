---
name: verify
description: Drive a morass change at its real surface — the packed npm package rendered in headless Chromium — instead of only jsdom tests.
---

# Verifying morass changes

Morass is a pure library (no demo app; `npm run dev` has no index.html to
serve). Its surface is the package boundary: consume the packed tarball
from a scratch consumer and drive it in a real browser.

## Recipe that works

1. `npm pack --pack-destination <scratch>` at the repo root (run
   `npm run build` first if dist is stale — pack ships `dist/`).
2. Scratch consumer: `npm init -y && npm i <tarball> react react-dom
esbuild playwright-core`.
3. Small `main.tsx` importing from `@effigy-analytics/morass` (+
   `@effigy-analytics/morass/styles.css`), rendering the components under
   test. Bundle: `npx esbuild main.tsx --bundle --outfile=bundle.js
--loader:.css=css --jsx=automatic` and a bare `index.html` loading
   `bundle.js`/`bundle.css`. `file://` URLs work — no server needed.
4. Drive with playwright-core; the system chromium lives at
   `~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`
   (note: `chrome-linux64`, not `chrome-linux`).

## Gotchas

- `page.click("text=A")`-style substring locators mis-target on pages
  with short labels — use role/aria-label selectors
  (`[aria-label='...'] [role=tab]`).
- Keyboard focus assertions: log `document.activeElement`'s aria-label,
  not tagName, or the evidence is ambiguous.
- `validateTheme`/data exports verify fine in plain Node against the
  installed package — that half needs no browser.
