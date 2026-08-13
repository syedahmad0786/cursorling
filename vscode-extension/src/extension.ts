import * as vscode from "vscode";

const VIEW_ID = "cursorling.familiar";
const PERSONALITIES = [
  "chill",
  "dramatic",
  "judgmental",
  "sleepy",
  "chaotic",
] as const;

type Personality = (typeof PERSONALITIES)[number];

const FACES: Record<Personality, string> = {
  chill: "·ᴗ·",
  dramatic: "☉▃☉",
  judgmental: "ಠ_ಠ",
  sleepy: "-_-",
  chaotic: "※◉※",
};

export function activate(context: vscode.ExtensionContext): void {
  const provider = new FamiliarView(context.extensionUri);
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    80,
  );
  status.command = "cursorling.cycle";
  paintStatus(status, readPersona());
  status.show();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider),
    status,
    vscode.commands.registerCommand("cursorling.cycle", () =>
      cycle(status, provider),
    ),
    vscode.workspace.onDidChangeTextDocument(() => provider.poke("type")),
    vscode.workspace.onDidSaveTextDocument(() => provider.poke("save")),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration("cursorling.personality")) return;
      const persona = readPersona();
      paintStatus(status, persona);
      provider.setPersonality(persona);
    }),
  );
}

export function deactivate(): void {}

function readPersona(): Personality {
  const value = vscode.workspace
    .getConfiguration("cursorling")
    .get<string>("personality", "chill");
  return (PERSONALITIES as readonly string[]).includes(value)
    ? (value as Personality)
    : "chill";
}

function paintStatus(
  item: vscode.StatusBarItem,
  persona: Personality,
): void {
  item.text = `Cursorling ${FACES[persona]}`;
  item.tooltip = `Cursorling is ${persona}. Click to cycle.`;
}

async function cycle(
  status: vscode.StatusBarItem,
  provider: FamiliarView,
): Promise<void> {
  const current = readPersona();
  const next =
    PERSONALITIES[(PERSONALITIES.indexOf(current) + 1) % PERSONALITIES.length];
  await vscode.workspace
    .getConfiguration("cursorling")
    .update("personality", next, vscode.ConfigurationTarget.Global);
  paintStatus(status, next);
  provider.setPersonality(next);
}

function nonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

class FamiliarView implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private lastType = 0;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    const media = vscode.Uri.joinPath(this.extensionUri, "media");
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [media],
    };
    webviewView.webview.html = this.html(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((msg: { type?: string; value?: string }) => {
      if (msg.type === "personality" && msg.value) {
        void vscode.workspace
          .getConfiguration("cursorling")
          .update("personality", msg.value, vscode.ConfigurationTarget.Global);
      }
    });
    this.setPersonality(readPersona());
  }

  poke(kind: "type" | "save"): void {
    if (kind === "type") {
      const now = Date.now();
      if (now - this.lastType < 140) return;
      this.lastType = now;
    }
    void this.view?.webview.postMessage({ type: kind });
  }

  setPersonality(value: Personality): void {
    void this.view?.webview.postMessage({ type: "personality", value });
  }

  private html(webview: vscode.Webview): string {
    const token = nonce();
    const css = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "webview.css"),
    );
    const engine = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "cursorling.js"),
    );
    const boot = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "webview.js"),
    );
    return page(webview.cspSource, token, css, engine, boot);
  }
}

function page(
  csp: string,
  token: string,
  css: vscode.Uri,
  engine: vscode.Uri,
  boot: vscode.Uri,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${csp}; script-src 'nonce-${token}';" />
  <link rel="stylesheet" href="${css}" />
</head>
<body>
  <p class="kicker">FT–001</p>
  <h1>Cursorling</h1>
  <div id="stage"></div>
  <nav id="personas"></nav>
  <p class="hint">Type in the editor. Save, and it notices.</p>
  <script nonce="${token}" src="${engine}"></script>
  <script nonce="${token}" src="${boot}"></script>
</body>
</html>`;
}
