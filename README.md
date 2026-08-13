# Cursorling

A tiny ink-blot familiar that lives near your mouse. Personalities: chill, dramatic, judgmental, sleepy, chaotic.

Live demo (no install): https://cursorling.vercel.app  
Repo: https://github.com/syedahmad0786/cursorling

## Browser extension (Chrome / Edge / Brave / Firefox)

1. Chrome: open `chrome://extensions`, enable Developer mode, **Load unpacked**, pick the `extension/` folder.
2. Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `extension/manifest.json`.

The pet follows the pointer on web pages. The popup switches personality. Tab count is optional (`tabs` permission).

## Theme packs

JSON files in `public/themes/` (`sumi`, `neon`, `postcard`, plus community pack `agent`). Fork and add a pack: id, colors, optional mutter overrides.

## Screenshot

The demo has **Cursorling said this** — a 1080 PNG for posting “my coding buddy is judging me.” Share `?persona=judgmental`.

## Cursor / VS Code

There is no stable Cursor-agent API. The sidebar treats save-storms and burst typing as “agent weather” and mutters about it. That is a best-effort tell, not a real agent hook.

The familiar lives in the sidebar and notices typing and saves. It cannot overlay the editor chrome (the browser demo is the mouse-follow showcase).

```bash
cd vscode-extension
npm install
npm run package
```

In Cursor: Extensions → **Install from VSIX** → the generated `.vsix`. The familiar lives in the sidebar and notices typing and saves. It cannot overlay the editor chrome (the browser demo is the mouse-follow showcase).

## Web demo

```bash
npm install
npm run dev
```

MIT © 2026 Ahmad Bukhari
