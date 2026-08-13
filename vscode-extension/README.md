# Cursorling for VS Code / Cursor

Sidebar familiar plus a status-bar face. Same ink blot as the web demo.

## Package

```bash
npm install
npm run package
```

This compiles TypeScript and runs `npx @vscode/vsce package --no-dependencies`. You get `cursorling-1.0.0.vsix` in this folder.

## Install in Cursor

1. Command Palette (`Ctrl+Shift+P`)
2. **Extensions: Install from VSIX…**
3. Choose `cursorling-1.0.0.vsix`

Reload if Cursor asks. Open the **Cursorling** view in the activity bar. Click the status bar face to cycle chill / dramatic / judgmental / sleepy / chaotic.

Typing in any editor makes it hop. Saving makes it stretch.
