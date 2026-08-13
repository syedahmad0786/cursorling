const api = globalThis.chrome ?? globalThis.browser;
const tabsBtn = document.getElementById("tabs");
const statusEl = document.getElementById("tab-status");

function apply(data) {
  const id = data.personality || "chill";
  document.querySelectorAll("[data-persona]").forEach((btn) => {
    btn.classList.toggle("on", btn.getAttribute("data-persona") === id);
  });
}

const got = api.storage.local.get(["personality"]);
if (got && typeof got.then === "function") got.then(apply);
else api.storage.local.get(["personality"], apply);

document.querySelectorAll("[data-persona]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const personality = btn.getAttribute("data-persona");
    api.storage.local.set({ personality });
    apply({ personality });
  });
});

async function tabsGranted() {
  try {
    return await api.permissions.contains({ permissions: ["tabs"] });
  } catch {
    return false;
  }
}

function paintTabs(on) {
  tabsBtn.textContent = on ? "Watching tabs" : "Watch tab count";
  tabsBtn.classList.toggle("on", on);
  statusEl.textContent = on
    ? "It will reel if you open a crowd of tabs."
    : "Optional. Many tabs make it dizzy.";
}

tabsGranted().then(paintTabs);

tabsBtn.addEventListener("click", async () => {
  if (await tabsGranted()) {
    paintTabs(true);
    return;
  }
  const ok = await api.permissions.request({ permissions: ["tabs"] });
  paintTabs(ok);
});
