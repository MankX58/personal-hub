// Pure logic (no imports) so it can be tested with `node lib/logic.test.ts`.

export type Task = { id: string; title: string; time?: string; date: string; done: boolean };
export type SetLog = { w: number; r: number; done: boolean };
export type Workout = { dayId: string; done: boolean; sets: Record<string, SetLog[]>; place?: "gym" | "home" };

// ---------- dates (local time, YYYY-MM-DD) ----------
export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (k: string, n: number) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

/** Monday of the week containing k */
export const weekStart = (k: string) => addDays(k, -((parseKey(k).getDay() + 6) % 7));

// ---------- tasks ----------
/** Moves/removes tasks from past days. Tasks for today or later stay untouched,
 *  so a task added "for tomorrow" simply becomes today's when the date changes. */
export function rollover(tasks: Task[], archive: Task[], today: string, mode: "archive" | "delete") {
  const past = tasks.filter((t) => t.date < today);
  if (!past.length) return null;
  return {
    tasks: tasks.filter((t) => t.date >= today),
    archive: mode === "archive" ? [...past, ...archive].slice(0, 500) : archive,
  };
}

export const byTime = (a: { time?: string }, b: { time?: string }) =>
  (a.time ?? "99:99").localeCompare(b.time ?? "99:99");

// ---------- training math ----------
/** Epley estimated 1RM. Bodyweight sets (0 kg) score as plain reps so they still show progress/PRs.
 *  ponytail: mixing 0 kg and loaded sets of one exercise makes the curve jump; add bodyweight setting if needed. */
export const e1rm = (w: number, r: number) => (r <= 0 ? 0 : w > 0 ? w * (1 + r / 30) : r);

export function bestE1rm(sets: SetLog[] = []) {
  return Math.max(0, ...sets.filter((s) => s.done).map((s) => e1rm(s.w, s.r)));
}

export const volume = (sets: SetLog[] = []) =>
  sets.filter((s) => s.done).reduce((a, s) => a + s.w * s.r, 0);

export const hasWork = (w?: Workout) =>
  !!w && (w.done || Object.values(w.sets).some((ss) => ss.some((s) => s.done)));

/** Per-exercise history: one point per workout date with best e1RM and volume */
export function exerciseHistory(workouts: Record<string, Workout>, exId: string) {
  return Object.keys(workouts)
    .sort()
    .map((date) => ({ date, sets: workouts[date].sets[exId] ?? [] }))
    .filter((p) => p.sets.some((s) => s.done))
    .map((p) => ({
      date: p.date,
      e1rm: bestE1rm(p.sets),
      volume: volume(p.sets),
      top: p.sets.filter((s) => s.done).sort((a, b) => e1rm(b.w, b.r) - e1rm(a.w, a.r))[0],
    }));
}

/** Best e1RM before a date (for PR detection) */
export function previousBest(workouts: Record<string, Workout>, exId: string, before: string) {
  let best = 0;
  for (const [date, w] of Object.entries(workouts))
    if (date < before) best = Math.max(best, bestE1rm(w.sets[exId]));
  return best;
}

/** Consecutive planned training days completed, walking back from today.
 *  Rest days are skipped; today only counts if already done. */
export function streak(workouts: Record<string, Workout>, plan: (string | null)[], today: string) {
  if (!plan.some(Boolean)) return 0;
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const k = addDays(today, -i);
    if (!plan[parseKey(k).getDay()]) continue;
    if (hasWork(workouts[k])) n++;
    else if (i > 0) break;
  }
  return n;
}
