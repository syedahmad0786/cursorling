(() => {
  try {
    if (window.top !== window) return;
  } catch {
    return;
  }
  if (document.getElementById("cursorling-root")) return;
  if (!globalThis.Cursorling) return;

  const root = document.createElement("div");
  root.id = "cursorling-root";
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    all: "initial",
    display: "block",
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "2147483646",
  });
  const shadow = root.attachShadow({ mode: "open" });
  const stage = document.createElement("div");
  shadow.append(stage);
  document.documentElement.append(root);

  const pet = globalThis.Cursorling.mount(stage, { personality: "chill" });
  pet.follow(window);

  const api = globalThis.chrome ?? globalThis.browser;
  if (!api?.storage?.local) return;

  function apply(data) {
    if (data.personality) pet.setPersonality(data.personality);
    if (typeof data.tabCount === "number") pet.setTabCount(data.tabCount);
  }

  const got = api.storage.local.get(["personality", "tabCount"]);
  if (got && typeof got.then === "function") got.then(apply);
  else api.storage.local.get(["personality", "tabCount"], apply);

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.personality) pet.setPersonality(changes.personality.newValue);
    if (changes.tabCount) pet.setTabCount(changes.tabCount.newValue);
  });
})();
