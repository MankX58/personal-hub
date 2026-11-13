export type Slot = { id: string; options: string[]; sets: number; reps: string; rir: string; rest: number };
export type Day = { id: string; name: string; short: string; focus: string; color: string; slots: Slot[] };

const s = (id: string, options: string[], sets: number, reps: string, rir = "1–2", rest = 120): Slot =>
  ({ id, options, sets, reps, rir, rest });

// PPL + UL (5 días). ~10–20 series semanales por músculo, 1–2 RIR, énfasis en posiciones estiradas.
export const DAYS: Day[] = [
  {
    id: "push", name: "Empuje", short: "PUSH", focus: "Pecho · Hombro · Tríceps", color: "#ff4d8d",
    slots: [
      s("push-1", ["press-inclinado-mancuernas", "press-inclinado-smith", "press-banca", "press-maquina"], 3, "6–10", "1–2", 150),
      s("push-2", ["press-maquina", "press-banca", "fondos", "press-inclinado-smith"], 3, "8–12", "1"),
      s("push-3", ["press-militar-mancuernas", "press-hombro-maquina"], 2, "8–12", "1–2"),
      s("push-4", ["elevaciones-laterales-polea", "elevaciones-laterales-mancuerna", "elevaciones-laterales-maquina"], 4, "12–20", "0–1", 75),
      s("push-5", ["extension-triceps-overhead", "extension-triceps-mancuerna", "press-frances"], 3, "10–15", "0–1", 90),
      s("push-6", ["pushdown-polea", "fondos"], 2, "10–15", "0–1", 75),
      s("push-7", ["crunch-polea", "crunch-maquina", "crunch-declinado"], 3, "10–15", "0–1", 60),
    ],
  },
  {
    id: "pull", name: "Tirón", short: "PULL", focus: "Espalda · Bíceps · Deltoide post.", color: "#22d3ee",
    slots: [
      s("pull-1", ["jalon-pecho", "dominadas", "jalon-neutro"], 3, "8–12", "1–2", 150),
      s("pull-2", ["remo-pecho-apoyado", "remo-polea", "remo-barra"], 3, "8–12", "1"),
      s("pull-3", ["pullover-polea", "jalon-neutro"], 2, "12–15", "0–1", 90),
      s("pull-4", ["pajaros-maquina", "face-pull"], 3, "12–20", "0–1", 75),
      s("pull-5", ["curl-inclinado", "curl-bayesian", "curl-predicador"], 3, "8–12", "0–1", 90),
      s("pull-6", ["curl-martillo", "curl-barra"], 2, "10–15", "0–1", 75),
      s("pull-7", ["elevaciones-piernas", "rueda-abdominal"], 3, "10–15", "0–1", 60),
    ],
  },
  {
    id: "legs", name: "Pierna A", short: "LEGS", focus: "Cuádriceps · Isquios · Gemelos", color: "#a78bfa",
    slots: [
      s("legs-1", ["sentadilla", "hack-squat", "prensa"], 3, "5–8", "1–2", 180),
      s("legs-2", ["peso-muerto-rumano", "hip-thrust"], 3, "6–10", "1–2", 150),
      s("legs-3", ["extension-cuadriceps"], 3, "10–15", "0–1", 90),
      s("legs-4", ["curl-femoral-sentado", "curl-femoral-tumbado"], 3, "10–15", "0–1", 90),
      s("legs-5", ["gemelos-pie", "gemelos-prensa"], 4, "8–12", "0", 75),
      s("legs-6", ["rueda-abdominal", "crunch-polea"], 3, "8–12", "0–1", 60),
    ],
  },
  {
    id: "upper", name: "Torso", short: "UPPER", focus: "Fuerza en torso completo", color: "#fb923c",
    slots: [
      s("upper-1", ["press-banca", "press-maquina", "press-inclinado-smith"], 3, "5–8", "1–2", 180),
      s("upper-2", ["remo-barra", "remo-pecho-apoyado", "remo-polea"], 3, "6–10", "1–2", 150),
      s("upper-3", ["dominadas", "jalon-pecho", "jalon-neutro"], 3, "6–10", "1–2", 150),
      s("upper-4", ["aperturas-polea", "pec-deck"], 2, "12–15", "0–1", 75),
      s("upper-5", ["elevaciones-laterales-mancuerna", "elevaciones-laterales-polea", "elevaciones-laterales-maquina"], 3, "12–20", "0–1", 75),
      s("upper-6", ["curl-bayesian", "curl-inclinado", "curl-predicador"], 2, "10–15", "0–1", 60),
      s("upper-7", ["press-frances", "extension-triceps-overhead", "extension-triceps-mancuerna"], 2, "10–15", "0–1", 60),
    ],
  },
  {
    id: "lower", name: "Pierna B", short: "LOWER", focus: "Glúteo · Isquios · Cuádriceps", color: "#2dd4bf",
    slots: [
      s("lower-1", ["hack-squat", "prensa", "sentadilla"], 3, "8–12", "1–2", 150),
      s("lower-2", ["sentadilla-bulgara", "prensa"], 2, "8–12", "1–2", 120),
      s("lower-3", ["hip-thrust", "peso-muerto-rumano"], 3, "8–12", "1", 120),
      s("lower-4", ["curl-femoral-tumbado", "curl-femoral-sentado"], 3, "10–15", "0–1", 90),
      s("lower-5", ["gemelos-sentado", "gemelos-pie", "gemelos-prensa"], 3, "12–20", "0", 60),
      s("lower-6", ["crunch-maquina", "crunch-polea", "elevaciones-piernas"], 3, "10–15", "0–1", 60),
    ],
  },
];

// Casa: 2 mancuernas ligeras (5–7,5 kg) + peso corporal.
// Cargas ligeras al fallo o muy cerca (0–1 RIR) dan hipertrofia similar a las pesadas → más reps,
// tempo lento, pausas, ejercicios a una pierna/brazo y rango ampliado (déficit) para compensar.
export const HOME: Record<string, Slot[]> = {
  push: [
    s("h-push-1", ["flexiones-deficit", "flexiones", "flexiones-declinadas"], 4, "8–20", "0–1", 90),
    s("h-push-2", ["flexiones-declinadas", "flexiones", "press-suelo"], 3, "8–20", "0–1", 90),
    s("h-push-3", ["flexiones-pica", "press-militar-mancuernas"], 3, "6–15", "0–1", 90),
    s("h-push-4", ["elevacion-lateral-inclinada", "elevaciones-laterales-mancuerna"], 4, "15–30", "0", 60),
    s("h-push-5", ["extension-triceps-mancuerna", "flexiones-diamante"], 3, "12–25", "0", 75),
    s("h-push-6", ["fondos-silla", "patada-triceps"], 2, "10–25", "0", 60),
    s("h-push-7", ["crunch-mancuerna", "crunch-inverso"], 3, "12–25", "0–1", 45),
  ],
  pull: [
    s("h-pull-1", ["remo-mesa", "remo-unilateral"], 4, "6–15", "0–1", 90),
    s("h-pull-2", ["remo-unilateral", "remo-mesa"], 3, "15–30", "0", 60),
    s("h-pull-3", ["pullover-mancuerna"], 3, "12–25", "0–1", 60),
    s("h-pull-4", ["pajaros-mancuernas", "elevaciones-y"], 3, "15–30", "0", 60),
    s("h-pull-5", ["curl-supino", "curl-concentrado"], 3, "12–25", "0", 60),
    s("h-pull-6", ["curl-martillo", "curl-concentrado"], 2, "12–25", "0", 60),
    s("h-pull-7", ["elevaciones-piernas-suelo", "crunch-inverso"], 3, "10–20", "0–1", 45),
  ],
  legs: [
    s("h-legs-1", ["sentadilla-bulgara", "zancada-deficit"], 4, "10–20", "0–1", 90),
    s("h-legs-2", ["peso-muerto-una-pierna", "hip-thrust-una-pierna"], 3, "10–20", "0–1", 75),
    s("h-legs-3", ["sissy-squat", "sentadilla-goblet"], 3, "8–20", "0–1", 75),
    s("h-legs-4", ["curl-nordico", "curl-femoral-toalla"], 3, "4–10", "1", 90),
    s("h-legs-5", ["gemelos-una-pierna"], 4, "12–25", "0", 45),
    s("h-legs-6", ["crunch-inverso", "crunch-mancuerna"], 3, "12–20", "0–1", 45),
  ],
  upper: [
    s("h-upper-1", ["flexiones", "flexiones-deficit", "flexiones-declinadas"], 3, "8–20", "0–1", 90),
    s("h-upper-2", ["remo-mesa", "remo-unilateral"], 3, "6–15", "0–1", 90),
    s("h-upper-3", ["press-suelo", "flexiones-declinadas"], 3, "15–30", "0", 60),
    s("h-upper-4", ["remo-unilateral", "pullover-mancuerna"], 2, "15–30", "0", 60),
    s("h-upper-5", ["elevaciones-laterales-mancuerna", "elevacion-lateral-inclinada"], 3, "15–30", "0", 60),
    s("h-upper-6", ["curl-concentrado", "curl-supino", "curl-martillo"], 2, "12–25", "0", 45),
    s("h-upper-7", ["patada-triceps", "extension-triceps-mancuerna", "flexiones-diamante"], 2, "12–25", "0", 45),
  ],
  lower: [
    s("h-lower-1", ["sentadilla-goblet", "sissy-squat"], 3, "15–30", "0–1", 75),
    s("h-lower-2", ["zancada-deficit", "sentadilla-bulgara"], 3, "10–20", "0–1", 75),
    s("h-lower-3", ["hip-thrust-una-pierna", "peso-muerto-una-pierna"], 3, "12–25", "0", 60),
    s("h-lower-4", ["curl-femoral-toalla", "curl-nordico"], 3, "8–15", "0–1", 75),
    s("h-lower-5", ["gemelos-una-pierna"], 3, "12–25", "0", 45),
    s("h-lower-6", ["elevaciones-piernas-suelo", "crunch-mancuerna"], 3, "10–20", "0–1", 45),
  ],
};

export type Place = "gym" | "home";
export const slotsFor = (day: Day, place: Place) => (place === "home" ? HOME[day.id] : day.slots);

export const dayById =(id?: string | null) => DAYS.find((d) => d.id === id);

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// index = Date.getDay() (0 = domingo)
export const DEFAULT_PLAN: (string | null)[] = [null, "push", "pull", "legs", null, "upper", "lower"];
