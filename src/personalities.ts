export const PERSONALITY_IDS = [
  "chill",
  "dramatic",
  "judgmental",
  "sleepy",
  "chaotic",
] as const;

export type Personality = (typeof PERSONALITY_IDS)[number];

export type Eye = "open" | "lidded" | "wide" | "squint" | "wild";

export interface Persona {
  id: Personality;
  label: string;
  lag: number;
  idleMs: number;
  hop: number;
  stretch: number;
  jitter: number;
  speedGate: number;
  eye: Eye;
  mutters: string[];
  saveMutter: string;
  tabMutter: string;
}

export const PERSONAS: Record<Personality, Persona> = {
  chill: {
    id: "chill",
    label: "chill",
    lag: 0.07,
    idleMs: 4800,
    hop: 9,
    stretch: 1.28,
    jitter: 0,
    speedGate: 28,
    eye: "open",
    mutters: ["mm.", "soft.", "ok.", "…"],
    saveMutter: "kept.",
    tabMutter: "busy room.",
  },
  dramatic: {
    id: "dramatic",
    label: "dramatic",
    lag: 0.17,
    idleMs: 2600,
    hop: 18,
    stretch: 1.72,
    jitter: 0.4,
    speedGate: 18,
    eye: "wide",
    mutters: ["BEHOLD", "the abyss!", "I suffer", "alas."],
    saveMutter: "immortalized!",
    tabMutter: "TOO MANY CURTAINS",
  },
  judgmental: {
    id: "judgmental",
    label: "judgmental",
    lag: 0.034,
    idleMs: 6200,
    hop: 5,
    stretch: 1.12,
    jitter: 0,
    speedGate: 36,
    eye: "squint",
    mutters: ["hm.", "really.", "no.", "sure."],
    saveMutter: "finally.",
    tabMutter: "hoarding.",
  },
  sleepy: {
    id: "sleepy",
    label: "sleepy",
    lag: 0.022,
    idleMs: 1700,
    hop: 4,
    stretch: 1.06,
    jitter: 0,
    speedGate: 48,
    eye: "lidded",
    mutters: ["z", "nnh", "five more min", "mrr."],
    saveMutter: "nnh. ok.",
    tabMutter: "lights… off…",
  },
  chaotic: {
    id: "chaotic",
    label: "chaotic",
    lag: 0.24,
    idleMs: 9000,
    hop: 16,
    stretch: 1.55,
    jitter: 3.2,
    speedGate: 12,
    eye: "wild",
    mutters: ["!", "??", "whee", "oops", "splort"],
    saveMutter: "CAUGHT IT",
    tabMutter: "tabs tabs tabs",
  },
};

export const FACES: Record<Personality, string> = {
  chill: "·ᴗ·",
  dramatic: "☉▃☉",
  judgmental: "ಠ_ಠ",
  sleepy: "-_-",
  chaotic: "※◉※",
};

export function isPersonality(value: string): value is Personality {
  return (PERSONALITY_IDS as readonly string[]).includes(value);
}
