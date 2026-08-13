(() => {
  const PERSONAS = {
    chill: {
      lag: 0.07, idleMs: 4800, hop: 9, stretch: 1.28, jitter: 0, speedGate: 28,
      eye: "open", mutters: ["mm.", "soft.", "ok.", "…"], saveMutter: "kept.",
      tabMutter: "busy room.",
    },
    dramatic: {
      lag: 0.17, idleMs: 2600, hop: 18, stretch: 1.72, jitter: 0.4, speedGate: 18,
      eye: "wide", mutters: ["BEHOLD", "the abyss!", "I suffer", "alas."],
      saveMutter: "immortalized!", tabMutter: "TOO MANY CURTAINS",
    },
    judgmental: {
      lag: 0.034, idleMs: 6200, hop: 5, stretch: 1.12, jitter: 0, speedGate: 36,
      eye: "squint", mutters: ["hm.", "really.", "no.", "sure."],
      saveMutter: "finally.", tabMutter: "hoarding.",
    },
    sleepy: {
      lag: 0.022, idleMs: 1700, hop: 4, stretch: 1.06, jitter: 0, speedGate: 48,
      eye: "lidded", mutters: ["z", "nnh", "five more min", "mrr."],
      saveMutter: "nnh. ok.", tabMutter: "lights… off…",
    },
    chaotic: {
      lag: 0.24, idleMs: 9000, hop: 16, stretch: 1.55, jitter: 3.2, speedGate: 12,
      eye: "wild", mutters: ["!", "??", "whee", "oops", "splort"],
      saveMutter: "CAUGHT IT", tabMutter: "tabs tabs tabs",
    },
  };

  const INK =
    "M16 2.5C23.5 2.5 29.5 8 29.2 15C29 20 26.5 23.5 23.5 25.5C25.8 29.5 25.2 34 23.2 38.5L21.4 35.2C20.8 31 20.2 28.2 19.6 26.5C19.2 29.8 18.4 34.5 17.2 39.5H15.5C14.8 34.8 14.2 30 13.6 26.8C12.2 30.5 10.5 34.2 8.8 37.2L7.5 35C9.2 31.2 10.8 27.8 12.2 25.2C8.2 23.2 4.8 19 5.2 13.5C5.6 7 10 2.5 16 2.5Z";
  const SPLAT = "M6.5 17C3.2 18.2 2.2 21.5 4.4 23C6.8 22.2 7.6 19.5 6.5 17Z";
  const NS = "http://www.w3.org/2000/svg";
  const YAWN_MS = 1400;
  const HOP_MS = 440;
  const STRETCH_MS = 340;

  const STYLE = `
.cursorling{position:fixed;top:0;left:0;width:40px;height:54px;pointer-events:none;z-index:2147483647;will-change:transform}
.cursorling-svg{display:block;overflow:visible}
.ink{fill:#140f0c}
.eye{fill:#f4ebd8}
.pupil{fill:#140f0c}
.lid{fill:#140f0c;transform-box:fill-box;transform-origin:center top;transform:scaleY(.1)}
.mouth{fill:#f4ebd8;opacity:0}
.carrier,.body{transform-box:view-box;transform-origin:16px 18px}
.splat{transform-origin:6px 18px;animation:cl-drip 2.8s ease-in-out infinite}
[data-eye="lidded"] .lid{transform:scaleY(.58)}
[data-eye="squint"] .lid{transform:scaleY(.72)}
[data-eye="wide"] .eye{transform-box:fill-box;transform-origin:center;transform:scale(1.16)}
.is-yawn .lid{transform:scaleY(.94)}
.is-yawn .mouth{opacity:1}
.is-hop .body{animation:cl-hop 440ms cubic-bezier(.2,1.45,.28,1)}
.is-stretch:not(.is-hop) .body{animation:cl-stretch 340ms ease}
.is-yawn:not(.is-hop):not(.is-stretch) .body{animation:cl-yawn 1.4s ease}
[data-tabs="uneven"] .carrier{animation:cl-uneasy 1.6s ease-in-out infinite}
[data-tabs="many"] .carrier{animation:cl-dizzy 1.05s ease-in-out infinite}
.cursorling-mutter{display:block;margin-top:2px;font:9px/1.2 ui-monospace,monospace;color:#f4ebd8;text-shadow:0 1px 2px #000;white-space:nowrap;opacity:1;transition:opacity .28s}
.is-quiet .cursorling-mutter{opacity:0}
@keyframes cl-hop{0%,100%{transform:translateY(0)}38%{transform:translateY(calc(-1 * var(--hop,10px)))}}
@keyframes cl-stretch{0%,100%{transform:scale(1)}42%{transform:scaleX(var(--stretch,1.4)) scaleY(.86)}}
@keyframes cl-yawn{0%,100%{transform:scale(1)}40%{transform:scaleY(.72) scaleX(1.08)}}
@keyframes cl-drip{50%{transform:translateY(1.6px)}}
@keyframes cl-uneasy{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes cl-dizzy{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
@media (prefers-reduced-motion:reduce){.splat,.carrier,.body{animation:none!important}}
`;

  function svgEl(name, attrs) {
    const el = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function eye(cx, cy) {
    const g = svgEl("g", { class: "eye-wrap" });
    g.append(
      svgEl("ellipse", { class: "eye", cx: String(cx), cy: String(cy), rx: "3.1", ry: "3.5" }),
      svgEl("rect", {
        class: "lid", x: String(cx - 3.2), y: String(cy - 3.6),
        width: "6.4", height: "4.2", rx: "1.2",
      }),
      svgEl("circle", { class: "pupil", cx: String(cx), cy: String(cy + 0.35), r: "1.35" }),
    );
    return g;
  }

  function createBlot() {
    const svg = svgEl("svg", {
      viewBox: "0 0 32 40", width: "32", height: "40",
      class: "cursorling-svg", "aria-hidden": "true",
    });
    const carrier = svgEl("g", { class: "carrier" });
    const body = svgEl("g", { class: "body" });
    const face = svgEl("g", { class: "face" });
    face.append(
      eye(12.4, 14.6),
      eye(20.2, 14.6),
      svgEl("ellipse", { class: "mouth", cx: "16.2", cy: "20.5", rx: "2.2", ry: "1.4" }),
    );
    body.append(
      svgEl("path", { d: INK, class: "ink" }),
      svgEl("path", { d: SPLAT, class: "ink splat" }),
      face,
    );
    carrier.append(body);
    svg.append(carrier);
    return svg;
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)] || "";
  }

  function mount(host, options = {}) {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!host.querySelector("[data-cursorling-style]")) {
      const style = document.createElement("style");
      style.dataset.cursorlingStyle = "1";
      style.textContent = STYLE;
      host.prepend(style);
    }
    const root = document.createElement("div");
    root.className = "cursorling";
    const blot = createBlot();
    const mutterEl = document.createElement("span");
    mutterEl.className = "cursorling-mutter";
    root.append(blot, mutterEl);
    host.append(root);
    const pupils = blot.querySelectorAll(".pupil");
    const state = {
      persona: PERSONAS.chill,
      x: 40, y: 40, px: 40, py: 40, lastX: 40, lastY: 40,
      nextIdle: Number.POSITIVE_INFINITY, tabCount: 0,
      yawnUntil: 0, hopUntil: 0, stretchUntil: 0, mutterUntil: 0, raf: 0,
    };
    const unbind = [];

    function say(text) {
      mutterEl.textContent = text;
      state.mutterUntil = performance.now() + 1500;
      root.classList.remove("is-quiet");
    }

    function armIdle(now) {
      state.nextIdle = now + state.persona.idleMs;
    }

    function setPersonality(id) {
      const key = PERSONAS[id] ? id : "chill";
      state.persona = PERSONAS[key];
      root.dataset.persona = key;
      root.dataset.eye = state.persona.eye;
      root.style.setProperty("--hop", `${state.persona.hop}px`);
      root.style.setProperty("--stretch", String(state.persona.stretch));
      armIdle(performance.now());
      say(pick(state.persona.mutters));
    }

    function setTabCount(n) {
      state.tabCount = Math.max(0, n | 0);
      root.dataset.tabs = state.tabCount >= 18 ? "many" : state.tabCount >= 10 ? "uneven" : "ok";
      if (state.tabCount >= 18) say(state.persona.tabMutter);
    }

    function poke(kind) {
      const now = performance.now();
      if (kind === "click" || kind === "type") {
        state.hopUntil = now + HOP_MS;
        armIdle(now);
        if (kind === "click") say(pick(state.persona.mutters));
      }
      if (kind === "save") {
        state.stretchUntil = now + STRETCH_MS + 90;
        say(state.persona.saveMutter);
      }
      if (kind === "idle") state.yawnUntil = now + YAWN_MS;
    }

    function point(x, y) {
      const speed = Math.hypot(x - state.lastX, y - state.lastY);
      state.lastX = x;
      state.lastY = y;
      state.px = x;
      state.py = y;
      const now = performance.now();
      armIdle(now);
      if (speed > state.persona.speedGate) state.stretchUntil = now + STRETCH_MS;
    }

    function follow(target) {
      const move = (e) => point(e.clientX, e.clientY);
      const click = () => poke("click");
      const type = (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        poke("type");
      };
      target.addEventListener("mousemove", move, { passive: true });
      target.addEventListener("mousedown", click);
      target.addEventListener("keydown", type);
      unbind.push(() => {
        target.removeEventListener("mousemove", move);
        target.removeEventListener("mousedown", click);
        target.removeEventListener("keydown", type);
      });
    }

    function tick(now) {
      state.raf = requestAnimationFrame(tick);
      const extra = state.tabCount >= 18 ? 2.4 : 0;
      const j = state.persona.jitter + extra;
      const lag = reduced ? 1 : state.persona.lag;
      state.x += (state.px + 20 + (Math.random() - 0.5) * j - state.x) * lag;
      state.y += (state.py + 24 + (Math.random() - 0.5) * j - state.y) * lag;
      root.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      const angle = Math.atan2(state.py - state.y, state.px - state.x);
      const depth = state.persona.eye === "squint" ? 0.55 : 1.15;
      const ox = Math.cos(angle) * depth;
      const oy = Math.sin(angle) * depth;
      pupils.forEach((p) => p.setAttribute("transform", `translate(${ox} ${oy})`));
      if (now >= state.nextIdle) {
        state.yawnUntil = now + YAWN_MS;
        state.nextIdle = now + YAWN_MS + state.persona.idleMs;
        say(state.persona.eye === "lidded" ? "nnh" : "…");
      }
      root.classList.toggle("is-yawn", now < state.yawnUntil);
      root.classList.toggle("is-hop", now < state.hopUntil);
      root.classList.toggle("is-stretch", now < state.stretchUntil);
      root.classList.toggle("is-quiet", now > state.mutterUntil);
    }

    function destroy() {
      cancelAnimationFrame(state.raf);
      unbind.forEach((fn) => fn());
      root.remove();
    }

    setPersonality(options.personality || "chill");
    state.raf = requestAnimationFrame(tick);
    return { setPersonality, setTabCount, poke, follow, destroy };
  }

  globalThis.Cursorling = { mount, PERSONAS };
})();
