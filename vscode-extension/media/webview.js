const vscode = acquireVsCodeApi();
const IDS = ["chill", "dramatic", "judgmental", "sleepy", "chaotic"];
const stage = document.getElementById("stage");
const nav = document.getElementById("personas");
const pet = globalThis.Cursorling.mount(stage, { personality: "chill" });
pet.follow(window);

for (const id of IDS) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = id;
  btn.dataset.persona = id;
  btn.addEventListener("click", () => {
    pet.setPersonality(id);
    mark(id);
    vscode.postMessage({ type: "personality", value: id });
  });
  nav.append(btn);
}

mark("chill");

window.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "personality" && msg.value) {
    pet.setPersonality(msg.value);
    mark(msg.value);
  }
  if (msg.type === "type") pet.poke("type");
  if (msg.type === "save") pet.poke("save");
  if (msg.type === "weather") pet.weather(msg.kind);
});

function mark(id) {
  nav.querySelectorAll("[data-persona]").forEach((btn) => {
    btn.classList.toggle("on", btn.getAttribute("data-persona") === id);
  });
}
