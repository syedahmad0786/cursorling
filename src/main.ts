import "./style.css";
import { Cursorling } from "./creature";
import {
  PERSONALITY_IDS,
  isPersonality,
  type Personality,
} from "./personalities";

const KEY = "cursorling:persona";
const stage = document.querySelector<HTMLElement>("#stage");
if (!stage) throw new Error("missing #stage");

const saved = localStorage.getItem(KEY) ?? "chill";
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
  mark(id);
}

function mark(id: string): void {
  document.querySelectorAll("[data-persona]").forEach((el) => {
    el.classList.toggle("on", el.getAttribute("data-persona") === id);
  });
}
