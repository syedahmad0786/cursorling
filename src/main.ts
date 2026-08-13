import "./style.css";
import { Cursorling } from "./creature";
import {
  PERSONALITY_IDS,
  PERSONAS,
  isPersonality,
  type Personality,
} from "./personalities";

type ThemePack = {
  id: string;
  label: string;
  ink?: string;
  cream?: string;
  wood?: string;
  brass?: string;
  mute?: string;
  mutters?: Partial<Record<Personality, string[]>>;
};

const KEY = "cursorling:persona";
const THEME_KEY = "cursorling:theme";
const stage = document.querySelector<HTMLElement>("#stage");
if (!stage) throw new Error("missing #stage");

const queryPersona = new URLSearchParams(location.search).get("persona");
const saved = queryPersona ?? localStorage.getItem(KEY) ?? "chill";
const start: Personality = isPersonality(saved) ? saved : "chill";
const pet = new Cursorling(stage, { personality: start });
pet.follow(window);
mark(start);

for (const id of PERSONALITY_IDS) {
  const btn = document.querySelector(`[data-persona="${id}"]`);
  btn?.addEventListener("click", () => pick(id));
}

function pick(id: Personality): void {
  pet.setPersonality(id);
  localStorage.setItem(KEY, id);
  const url = new URL(location.href);
  url.searchParams.set("persona", id);
  history.replaceState({}, "", url);
  mark(id);
}

function mark(id: string): void {
  document.querySelectorAll("[data-persona]").forEach((el) => {
    el.classList.toggle("on", el.getAttribute("data-persona") === id);
  });
}

document.querySelector("#snapshot")?.addEventListener("click", () => {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1080;
  const g = c.getContext("2d");
  if (!g) return;
  g.fillStyle = "#1a0e0a";
  g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = "#f4ebd8";
  g.font = "600 28px sans-serif";
  g.fillText("CURSORLING SAID THIS", 80, 160);
  g.font = "italic 64px Georgia";
  const line = pet.lastLine();
  g.fillText(`“${line}”`, 80, 480);
  g.font = "28px sans-serif";
  g.fillStyle = "#c4a574";
  g.fillText(`${pet.personalityId()} · my coding buddy is judging me`, 80, 900);
  g.fillText("FT–001  ·  a Fun Toy", 80, 980);
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cursorling-${pet.personalityId()}.png`;
    a.click();
  });
});

async function loadThemes(): Promise<void> {
  const ids = ["sumi", "neon", "postcard", "agent"];
  const nav = document.querySelector("#themes");
  for (const id of ids) {
    try {
      const res = await fetch(`./themes/${id}.json`);
      if (!res.ok) continue;
      const pack = (await res.json()) as ThemePack;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = pack.label;
      btn.dataset.theme = pack.id;
      btn.addEventListener("click", () => applyTheme(pack));
      nav?.append(btn);
    } catch {
      /* optional pack */
    }
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && savedTheme !== "sumi") {
    const res = await fetch(`./themes/${savedTheme}.json`);
    if (res.ok) applyTheme((await res.json()) as ThemePack);
  }
}

function applyTheme(pack: ThemePack): void {
  const root = document.documentElement.style;
  if (pack.ink) root.setProperty("--ink", pack.ink);
  if (pack.cream) root.setProperty("--cream", pack.cream);
  if (pack.wood) root.setProperty("--wood", pack.wood);
  if (pack.brass) root.setProperty("--brass", pack.brass);
  if (pack.mute) root.setProperty("--mute", pack.mute);
  if (pack.mutters) {
    for (const id of PERSONALITY_IDS) {
      const extra = pack.mutters[id];
      if (extra?.length) PERSONAS[id].mutters = extra;
    }
    pet.setPersonality(pet.personalityId());
  }
  localStorage.setItem(THEME_KEY, pack.id);
  document.querySelectorAll("[data-theme]").forEach((el) => {
    el.classList.toggle("on", el.getAttribute("data-theme") === pack.id);
  });
}

void loadThemes();
