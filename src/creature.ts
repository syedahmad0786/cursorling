import {
  isPersonality,
  PERSONAS,
  type Persona,
  type Personality,
} from "./personalities";
import { createBlot } from "./svg";

export type PokeKind = "click" | "type" | "save" | "idle";

export interface CursorlingOptions {
  personality?: Personality;
}

const YAWN_MS = 1400;
const HOP_MS = 440;
const STRETCH_MS = 340;
const TAB_UNEVEN = 10;
const TAB_MANY = 18;

export class Cursorling {
  private readonly root: HTMLDivElement;
  private readonly mutterEl: HTMLSpanElement;
  private readonly pupils: NodeListOf<SVGElement>;
  private persona: Persona = PERSONAS.chill;
  private x = 40;
  private y = 40;
  private px = 40;
  private py = 40;
  private last = { x: 40, y: 40 };
  private nextIdle = Number.POSITIVE_INFINITY;
  private tabCount = 0;
  private raf = 0;
  private yawnUntil = 0;
  private hopUntil = 0;
  private stretchUntil = 0;
  private mutterUntil = 0;
  private typeCount = 0;
  private reduced = false;
  private readonly unbind: Array<() => void> = [];

  constructor(host: HTMLElement, opts: CursorlingOptions = {}) {
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.root = document.createElement("div");
    this.root.className = "cursorling";
    const blot = createBlot();
    this.mutterEl = document.createElement("span");
    this.mutterEl.className = "cursorling-mutter";
    this.root.append(blot, this.mutterEl);
    host.append(this.root);
    this.pupils = blot.querySelectorAll(".pupil");
    this.setPersonality(opts.personality ?? "chill");
    this.raf = requestAnimationFrame(this.tick);
  }

  setPersonality(id: string): void {
    const next = isPersonality(id) ? id : "chill";
    this.persona = PERSONAS[next];
    this.root.dataset.persona = next;
    this.root.dataset.eye = this.persona.eye;
    this.root.style.setProperty("--hop", `${this.persona.hop}px`);
    this.root.style.setProperty("--stretch", String(this.persona.stretch));
    this.armIdle(performance.now());
    this.say(pick(this.persona.mutters));
  }

  setTabCount(n: number): void {
    this.tabCount = Math.max(0, n | 0);
    const many = this.tabCount >= TAB_MANY;
    this.root.dataset.tabs = many
      ? "many"
      : this.tabCount >= TAB_UNEVEN
        ? "uneven"
        : "ok";
    if (many) this.say(this.persona.tabMutter);
  }

  follow(target: Window): void {
    const move = (event: MouseEvent) => this.point(event.clientX, event.clientY);
    const click = () => this.poke("click");
    const type = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      this.poke("type");
    };
    target.addEventListener("mousemove", move, { passive: true });
    target.addEventListener("mousedown", click);
    target.addEventListener("keydown", type);
    this.unbind.push(() => {
      target.removeEventListener("mousemove", move);
      target.removeEventListener("mousedown", click);
      target.removeEventListener("keydown", type);
    });
  }

  poke(kind: PokeKind): void {
    const now = performance.now();
    if (kind === "click" || kind === "type") {
      this.hopUntil = now + HOP_MS;
      this.armIdle(now);
      if (kind === "click") this.say(pick(this.persona.mutters));
      if (kind === "type") {
        this.typeCount += 1;
        if (this.typeCount % 14 === 0) this.say(pick(this.persona.mutters));
      }
    }
    if (kind === "save") {
      this.stretchUntil = now + STRETCH_MS + 90;
      this.say(this.persona.saveMutter);
    }
    if (kind === "idle") this.yawnUntil = now + YAWN_MS;
  }

  lastLine(): string {
    return this.mutterEl.textContent || this.persona.mutters[0] || "hm.";
  }

  personalityId(): Personality {
    return this.persona.id;
  }

  weather(kind: "burst" | "storm"): void {
    const lines =
      kind === "storm"
        ? {
            chill: "saving a lot.",
            dramatic: "THE ARCHIVES TREMBLE",
            judgmental: "calm down.",
            sleepy: "nnh. again?",
            chaotic: "SAVE SAVE SAVE",
          }
        : {
            chill: "fast hands.",
            dramatic: "a tempest of glyphs!",
            judgmental: "slow down. think.",
            sleepy: "too loud",
            chaotic: "CLICKY CLACKY",
          };
    this.say(lines[this.persona.id]);
    this.hopUntil = performance.now() + HOP_MS + 200;
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.unbind.forEach((fn) => fn());
    this.root.remove();
  }

  private point(x: number, y: number): void {
    const speed = Math.hypot(x - this.last.x, y - this.last.y);
    this.last = { x, y };
    this.px = x;
    this.py = y;
    const now = performance.now();
    this.armIdle(now);
    if (speed > this.persona.speedGate) this.stretchUntil = now + STRETCH_MS;
  }

  private tick = (now: number): void => {
    this.raf = requestAnimationFrame(this.tick);
    this.integrate();
    this.look();
    this.flags(now);
  };

  private integrate(): void {
    const extra = this.tabCount >= TAB_MANY ? 2.4 : 0;
    const j = this.persona.jitter + extra;
    const lag = this.reduced ? 1 : this.persona.lag;
    this.x += (this.px + 20 + (Math.random() - 0.5) * j - this.x) * lag;
    this.y += (this.py + 24 + (Math.random() - 0.5) * j - this.y) * lag;
    this.root.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  private look(): void {
    const angle = Math.atan2(this.py - this.y, this.px - this.x);
    const depth = this.persona.eye === "squint" ? 0.55 : 1.15;
    const ox = Math.cos(angle) * depth;
    const oy = Math.sin(angle) * depth;
    this.pupils.forEach((pupil) => {
      pupil.setAttribute("transform", `translate(${ox} ${oy})`);
    });
  }

  private flags(now: number): void {
    if (now >= this.nextIdle) {
      this.yawnUntil = now + YAWN_MS;
      this.nextIdle = now + YAWN_MS + this.persona.idleMs;
      this.say(this.persona.eye === "lidded" ? "nnh" : "…");
    }
    this.root.classList.toggle("is-yawn", now < this.yawnUntil);
    this.root.classList.toggle("is-hop", now < this.hopUntil);
    this.root.classList.toggle("is-stretch", now < this.stretchUntil);
    this.root.classList.toggle("is-quiet", now > this.mutterUntil);
  }

  private armIdle(now: number): void {
    this.nextIdle = now + this.persona.idleMs;
  }

  private say(text: string): void {
    this.mutterEl.textContent = text;
    this.mutterUntil = performance.now() + 1500;
    this.root.classList.remove("is-quiet");
  }
}

function pick(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] ?? "";
}
