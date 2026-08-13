const api = globalThis.chrome;

let watching = false;

async function hasTabs() {
  try {
    return await api.permissions.contains({ permissions: ["tabs"] });
  } catch {
    return false;
  }
}

async function publish() {
  if (!(await hasTabs())) return;
  const tabs = await api.tabs.query({});
  await api.storage.local.set({ tabCount: tabs.length });
}

function watch() {
  if (watching) return;
  watching = true;
  api.tabs.onCreated.addListener(publish);
  api.tabs.onRemoved.addListener(publish);
  api.tabs.onAttached.addListener(publish);
  api.tabs.onDetached.addListener(publish);
  publish();
}

hasTabs().then((ok) => {
  if (ok) watch();
});

api.permissions.onAdded.addListener((perms) => {
  if (perms.permissions?.includes("tabs")) watch();
});

api.runtime.onInstalled.addListener(() => {
  hasTabs().then((ok) => {
    if (ok) watch();
  });
});
