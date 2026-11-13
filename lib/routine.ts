// User routines + ready-made templates.

export type Slot = { id: string; ex: string; alts: string[]; sets: number; reps: string; rir?: string; rest: number };
export type Day = { id: string; name: string; focus?: string; color: string; slots: Slot[] };
export type Routine = { id: string; name: string; days: Day[]; plan: (string | null)[] }; // plan index = Date.getDay()

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const COLORS = ["#ff4d8d", "#22d3ee", "#a78bfa", "#fb923c", "#2dd4bf", "#facc15", "#60a5fa"];
export const EMPTY_PLAN: (string | null)[] = [null, null, null, null, null, null, null];

export const newId = () => Math.random().toString(36).slice(2, 10);
export const getRoutine = (s: { routines: Routine[]; activeRoutine: string }) =>
  s.routines.find((r) => r.id === s.activeRoutine) ?? s.routines[0];

// ---------- templates ----------
type TSlot = { id: string; options: string[]; sets: number; reps: string; rir: string; rest: number };
type TDay = { id: string; name: string; focus: string; color: string; slots: TSlot[] };
export type Template = { id: string; name: string; desc: string; days: TDay[]; plan: (string | null)[] };

const s = (id: string, options: string[], sets: number, reps: string, rir = "1–2", rest = 120): TSlot =>
  ({ id, options, sets, reps, rir, rest });

// Evidence-based picks: ~10–20 series/músculo/semana, 0–2 RIR, énfasis en posiciones estiradas.
const PUSH: TDay = {
  id: "push", name: "Empuje", focus: "Pecho · Hombro · Tríceps", color: "#ff4d8d",
  slots: [
    s("push-1", ["press-inclinado-mancuernas", "press-inclinado-smith", "press-banca", "press-maquina"], 3, "6–10", "1–2", 150),
    s("push-2", ["press-maquina", "press-banca", "fondos", "press-inclinado-smith"], 3, "8–12", "1"),
    s("push-3", ["press-militar-mancuernas", "press-hombro-maquina"], 2, "8–12", "1–2"),
    s("push-4", ["elevaciones-laterales-polea", "elevaciones-laterales-mancuerna", "elevaciones-laterales-maquina"], 4, "12–20", "0–1", 75),
    s("push-5", ["extension-triceps-overhead", "extension-triceps-mancuerna", "press-frances"], 3, "10–15", "0–1", 90),
    s("push-6", ["pushdown-polea", "fondos"], 2, "10–15", "0–1", 75),
    s("push-7", ["crunch-polea", "crunch-maquina", "crunch-declinado"], 3, "10–15", "0–1", 60),
  ],
};
const PULL: TDay = {
  id: "pull", name: "Tirón", focus: "Espalda · Bíceps · Deltoide post.", color: "#22d3ee",
  slots: [
    s("pull-1", ["jalon-pecho", "dominadas", "jalon-neutro"], 3, "8–12", "1–2", 150),
    s("pull-2", ["remo-pecho-apoyado", "remo-polea", "remo-barra"], 3, "8–12", "1"),
    s("pull-3", ["pullover-polea", "jalon-neutro"], 2, "12–15", "0–1", 90),
    s("pull-4", ["pajaros-maquina", "face-pull"], 3, "12–20", "0–1", 75),
    s("pull-5", ["curl-inclinado", "curl-bayesian", "curl-predicador"], 3, "8–12", "0–1", 90),
    s("pull-6", ["curl-martillo", "curl-barra"], 2, "10–15", "0–1", 75),
    s("pull-7", ["elevaciones-piernas", "rueda-abdominal"], 3, "10–15", "0–1", 60),
  ],
};
const LEGS: TDay = {
  id: "legs", name: "Pierna A", focus: "Cuádriceps · Isquios · Gemelos", color: "#a78bfa",
  slots: [
    s("legs-1", ["sentadilla", "hack-squat", "prensa"], 3, "5–8", "1–2", 180),
    s("legs-2", ["peso-muerto-rumano", "hip-thrust"], 3, "6–10", "1–2", 150),
    s("legs-3", ["extension-cuadriceps"], 3, "10–15", "0–1", 90),
    s("legs-4", ["curl-femoral-sentado", "curl-femoral-tumbado"], 3, "10–15", "0–1", 90),
    s("legs-5", ["gemelos-pie", "gemelos-prensa"], 4, "8–12", "0", 75),
    s("legs-6", ["rueda-abdominal", "crunch-polea"], 3, "8–12", "0–1", 60),
  ],
};
const UPPER: TDay = {
  id: "upper", name: "Torso", focus: "Fuerza en torso completo", color: "#fb923c",
  slots: [
    s("upper-1", ["press-banca", "press-maquina", "press-inclinado-smith"], 3, "5–8", "1–2", 180),
    s("upper-2", ["remo-barra", "remo-pecho-apoyado", "remo-polea"], 3, "6–10", "1–2", 150),
    s("upper-3", ["dominadas", "jalon-pecho", "jalon-neutro"], 3, "6–10", "1–2", 150),
    s("upper-4", ["aperturas-polea", "pec-deck"], 2, "12–15", "0–1", 75),
    s("upper-5", ["elevaciones-laterales-mancuerna", "elevaciones-laterales-polea", "elevaciones-laterales-maquina"], 3, "12–20", "0–1", 75),
    s("upper-6", ["curl-bayesian", "curl-inclinado", "curl-predicador"], 2, "10–15", "0–1", 60),
    s("upper-7", ["press-frances", "extension-triceps-overhead", "extension-triceps-mancuerna"], 2, "10–15", "0–1", 60),
  ],
};
const LOWER: TDay = {
  id: "lower", name: "Pierna B", focus: "Glúteo · Isquios · Cuádriceps", color: "#2dd4bf",
  slots: [
    s("lower-1", ["hack-squat", "prensa", "sentadilla"], 3, "8–12", "1–2", 150),
    s("lower-2", ["sentadilla-bulgara", "prensa"], 2, "8–12", "1–2", 120),
    s("lower-3", ["hip-thrust", "peso-muerto-rumano"], 3, "8–12", "1", 120),
    s("lower-4", ["curl-femoral-tumbado", "curl-femoral-sentado"], 3, "10–15", "0–1", 90),
    s("lower-5", ["gemelos-sentado", "gemelos-pie", "gemelos-prensa"], 3, "12–20", "0", 60),
    s("lower-6", ["crunch-maquina", "crunch-polea", "elevaciones-piernas"], 3, "10–15", "0–1", 60),
  ],
};
const FULL: TDay = {
  id: "full", name: "Full Body", focus: "Cuerpo completo", color: "#60a5fa",
  slots: [
    s("full-1", ["sentadilla", "hack-squat", "prensa"], 3, "6–10", "1–2", 150),
    s("full-2", ["press-banca", "press-inclinado-mancuernas", "press-maquina"], 3, "6–10", "1–2", 150),
    s("full-3", ["remo-pecho-apoyado", "remo-barra", "remo-polea"], 3, "8–12", "1"),
    s("full-4", ["peso-muerto-rumano", "hip-thrust"], 2, "8–12", "1–2", 120),
    s("full-5", ["jalon-pecho", "dominadas"], 2, "8–12", "1"),
    s("full-6", ["elevaciones-laterales-polea", "elevaciones-laterales-mancuerna"], 2, "12–20", "0–1", 60),
    s("full-7", ["crunch-polea", "elevaciones-piernas"], 2, "10–15", "0–1", 60),
  ],
};
const CHEST_BACK: TDay = {
  id: "chest-back", name: "Pecho y espalda", focus: "Pecho · Dorsal · Espalda alta", color: "#ff4d8d",
  slots: [
    s("cb-1", ["press-inclinado-mancuernas", "press-banca", "press-inclinado-smith"], 3, "6–10", "1–2", 150),
    s("cb-2", ["jalon-pecho", "dominadas"], 3, "8–12", "1–2", 150),
    s("cb-3", ["press-maquina", "fondos"], 3, "8–12", "1"),
    s("cb-4", ["remo-pecho-apoyado", "remo-polea", "remo-barra"], 3, "8–12", "1"),
    s("cb-5", ["aperturas-polea", "pec-deck"], 2, "12–15", "0–1", 75),
    s("cb-6", ["pullover-polea"], 2, "12–15", "0–1", 75),
  ],
};
const SHOULDERS_ARMS: TDay = {
  id: "shoulders-arms", name: "Hombro y brazo", focus: "Deltoides · Bíceps · Tríceps", color: "#fb923c",
  slots: [
    s("sa-1", ["press-militar-mancuernas", "press-hombro-maquina"], 3, "8–12", "1–2"),
    s("sa-2", ["elevaciones-laterales-polea", "elevaciones-laterales-mancuerna"], 4, "12–20", "0–1", 75),
    s("sa-3", ["pajaros-maquina", "face-pull"], 3, "12–20", "0–1", 75),
    s("sa-4", ["curl-inclinado", "curl-bayesian", "curl-predicador"], 3, "8–12", "0–1", 90),
    s("sa-5", ["extension-triceps-overhead", "press-frances"], 3, "10–15", "0–1", 90),
    s("sa-6", ["curl-martillo", "curl-barra"], 2, "10–15", "0–1", 60),
    s("sa-7", ["pushdown-polea", "fondos"], 2, "10–15", "0–1", 60),
  ],
};

// Casa: 2 mancuernas ligeras + peso corporal → más reps, 0–1 RIR, tempo lento, unilateral, déficit.
const home = (d: TDay, slots: TSlot[]): TDay => ({ ...d, slots });
const HOME_DAYS: TDay[] = [
  home(PUSH, [
    s("h-push-1", ["flexiones-deficit", "flexiones", "flexiones-declinadas"], 4, "8–20", "0–1", 90),
    s("h-push-2", ["flexiones-declinadas", "flexiones", "press-suelo"], 3, "8–20", "0–1", 90),
    s("h-push-3", ["flexiones-pica", "press-militar-mancuernas"], 3, "6–15", "0–1", 90),
    s("h-push-4", ["elevacion-lateral-inclinada", "elevaciones-laterales-mancuerna"], 4, "15–30", "0", 60),
    s("h-push-5", ["extension-triceps-mancuerna", "flexiones-diamante"], 3, "12–25", "0", 75),
    s("h-push-6", ["fondos-silla", "patada-triceps"], 2, "10–25", "0", 60),
    s("h-push-7", ["crunch-mancuerna", "crunch-inverso"], 3, "12–25", "0–1", 45),
  ]),
  home(PULL, [
    s("h-pull-1", ["remo-mesa", "remo-unilateral"], 4, "6–15", "0–1", 90),
    s("h-pull-2", ["remo-unilateral", "remo-mesa"], 3, "15–30", "0", 60),
    s("h-pull-3", ["pullover-mancuerna"], 3, "12–25", "0–1", 60),
    s("h-pull-4", ["pajaros-mancuernas", "elevaciones-y"], 3, "15–30", "0", 60),
    s("h-pull-5", ["curl-supino", "curl-concentrado"], 3, "12–25", "0", 60),
    s("h-pull-6", ["curl-martillo", "curl-concentrado"], 2, "12–25", "0", 60),
    s("h-pull-7", ["elevaciones-piernas-suelo", "crunch-inverso"], 3, "10–20", "0–1", 45),
  ]),
  home(LEGS, [
    s("h-legs-1", ["sentadilla-bulgara", "zancada-deficit"], 4, "10–20", "0–1", 90),
    s("h-legs-2", ["peso-muerto-una-pierna", "hip-thrust-una-pierna"], 3, "10–20", "0–1", 75),
    s("h-legs-3", ["sissy-squat", "sentadilla-goblet"], 3, "8–20", "0–1", 75),
    s("h-legs-4", ["curl-nordico", "curl-femoral-toalla"], 3, "4–10", "1", 90),
    s("h-legs-5", ["gemelos-una-pierna"], 4, "12–25", "0", 45),
    s("h-legs-6", ["crunch-inverso", "crunch-mancuerna"], 3, "12–20", "0–1", 45),
  ]),
  home(UPPER, [
    s("h-upper-1", ["flexiones", "flexiones-deficit", "flexiones-declinadas"], 3, "8–20", "0–1", 90),
    s("h-upper-2", ["remo-mesa", "remo-unilateral"], 3, "6–15", "0–1", 90),
    s("h-upper-3", ["press-suelo", "flexiones-declinadas"], 3, "15–30", "0", 60),
    s("h-upper-4", ["remo-unilateral", "pullover-mancuerna"], 2, "15–30", "0", 60),
    s("h-upper-5", ["elevaciones-laterales-mancuerna", "elevacion-lateral-inclinada"], 3, "15–30", "0", 60),
    s("h-upper-6", ["curl-concentrado", "curl-supino", "curl-martillo"], 2, "12–25", "0", 45),
    s("h-upper-7", ["patada-triceps", "extension-triceps-mancuerna", "flexiones-diamante"], 2, "12–25", "0", 45),
  ]),
  home(LOWER, [
    s("h-lower-1", ["sentadilla-goblet", "sissy-squat"], 3, "15–30", "0–1", 75),
    s("h-lower-2", ["zancada-deficit", "sentadilla-bulgara"], 3, "10–20", "0–1", 75),
    s("h-lower-3", ["hip-thrust-una-pierna", "peso-muerto-una-pierna"], 3, "12–25", "0", 60),
    s("h-lower-4", ["curl-femoral-toalla", "curl-nordico"], 3, "8–15", "0–1", 75),
    s("h-lower-5", ["gemelos-una-pierna"], 3, "12–25", "0", 45),
    s("h-lower-6", ["elevaciones-piernas-suelo", "crunch-mancuerna"], 3, "10–20", "0–1", 45),
  ]),
];

const _ = null;
export const TEMPLATES: Template[] = [
  { id: "ppl", name: "Push · Pull · Legs", desc: "El clásico de 6 días: cada músculo dos veces por semana.", days: [PUSH, PULL, LEGS], plan: [_, "push", "pull", "legs", "push", "pull", "legs"] },
  { id: "ul", name: "Torso · Pierna", desc: "4 días alternando torso y pierna. Equilibrado y fácil de encajar.", days: [UPPER, { ...LEGS, name: "Pierna" }], plan: [_, "upper", "legs", _, "upper", "legs", _] },
  { id: "ppl-ul", name: "PPL + Torso/Pierna", desc: "5 días: push, pull, legs y luego torso y pierna. Mucho volumen bien repartido.", days: [PUSH, PULL, LEGS, UPPER, LOWER], plan: [_, "push", "pull", "legs", _, "upper", "lower"] },
  { id: "plp", name: "Push · Legs · Pull", desc: "3 días con la pierna en medio para recuperar mejor el tren superior.", days: [PUSH, LEGS, PULL], plan: [_, "push", _, "legs", _, "pull", _] },
  { id: "full", name: "Full Body", desc: "3 días de cuerpo completo. Ideal si empiezas o vas justo de tiempo.", days: [FULL], plan: [_, "full", _, "full", _, "full", _] },
  { id: "arnold", name: "Arnold Split", desc: "6 días: pecho+espalda, hombro+brazo y pierna, dos veces.", days: [CHEST_BACK, SHOULDERS_ARMS, LEGS], plan: [_, "chest-back", "shoulders-arms", "legs", "chest-back", "shoulders-arms", "legs"] },
  { id: "ppl-ul-casa", name: "En casa · PPL + Torso/Pierna", desc: "Solo 2 mancuernas ligeras y tu peso corporal.", days: HOME_DAYS, plan: [_, "push", "pull", "legs", _, "upper", "lower"] },
  { id: "custom", name: "Personalizada", desc: "Empieza en blanco y monta tu rutina día a día.", days: [], plan: EMPTY_PLAN },
];

export function fromTemplate(t: Template, choices: Record<string, string> = {}, id = newId()): Routine {
  return {
    id,
    name: t.id === "custom" ? "Mi rutina" : t.name,
    plan: [...t.plan],
    days: t.days.map((d) => ({
      id: d.id, name: d.name, focus: d.focus, color: d.color,
      slots: d.slots.map((sl) => {
        const ex = sl.options.includes(choices[sl.id]) ? choices[sl.id] : sl.options[0];
        return { id: sl.id, ex, alts: sl.options.filter((o) => o !== ex), sets: sl.sets, reps: sl.reps, rir: sl.rir, rest: sl.rest };
      }),
    })),
  };
}

/** Old single-routine format (fixed PPL+UL, gym/home toggle) → two user routines. Returns {} for new users. */
export function migrateLegacy(old: { plan?: (string | null)[]; choices?: Record<string, string>; place?: "gym" | "home" }) {
  if (!old.plan && !old.choices && !old.place) return {};
  const tpl = (id: string) => TEMPLATES.find((t) => t.id === id)!;
  const gym = fromTemplate(tpl("ppl-ul"), old.choices, "r-gym");
  const casa = { ...fromTemplate(tpl("ppl-ul-casa"), old.choices, "r-home"), name: "En casa" };
  if (old.plan) gym.plan = casa.plan = [...old.plan];
  return { routines: [gym, casa], activeRoutine: old.place === "home" ? casa.id : gym.id };
}
