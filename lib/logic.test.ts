// Run: node lib/logic.test.ts
import assert from "node:assert/strict";
import { rollover, addDays, weekStart, e1rm, streak, previousBest, type Task, type Workout } from "./logic.ts";

const t = (id: string, date: string): Task => ({ id, title: id, date, done: false });

// rollover: yesterday goes away, today/tomorrow stay (tomorrow becomes "today" naturally)
const tasks = [t("old", "2026-11-12"), t("today", "2026-11-13"), t("tomorrow", "2026-11-14")];
const a = rollover(tasks, [], "2026-11-13", "archive")!;
assert.deepEqual(a.tasks.map((x) => x.id), ["today", "tomorrow"]);
assert.deepEqual(a.archive.map((x) => x.id), ["old"]);
assert.deepEqual(rollover(tasks, [], "2026-11-13", "delete")!.archive, []);
assert.equal(rollover(a.tasks, [], "2026-11-13", "archive"), null);
const next = rollover(a.tasks, [], "2026-11-14", "delete")!;
assert.deepEqual(next.tasks.map((x) => x.id), ["tomorrow"]);

// dates across month boundary
assert.equal(addDays("2026-11-30", 1), "2026-12-01");
assert.equal(weekStart("2026-11-15"), "2026-11-09"); // Sunday -> Monday before

// e1rm
assert.equal(e1rm(100, 0), 0);
assert.equal(e1rm(0, 15), 15); // bodyweight -> reps
assert.ok(Math.abs(e1rm(100, 10) - 133.33) < 0.01);

// streak: plan Mon/Wed (getDay 1,3). 2026-11-09 Mon, 11 Wed, 16 Mon
const plan = [null, "a", null, "b", null, null, null];
const w = (done: boolean): Workout => ({ dayId: "a", done, sets: {} });
assert.equal(streak({ "2026-11-09": w(true), "2026-11-11": w(true) }, plan, "2026-11-16"), 2); // today not done yet
assert.equal(streak({ "2026-11-11": w(true), "2026-11-16": w(true) }, plan, "2026-11-16"), 2);
assert.equal(streak({ "2026-11-09": w(true) }, plan, "2026-11-13"), 0); // missed Wed

// previousBest ignores same day
const ws: Record<string, Workout> = {
  "2026-11-01": { dayId: "a", done: true, sets: { x: [{ w: 100, r: 5, done: true }] } },
  "2026-11-05": { dayId: "a", done: true, sets: { x: [{ w: 110, r: 5, done: true }] } },
};
assert.equal(previousBest(ws, "x", "2026-11-05"), e1rm(100, 5));

// legacy routine migration keeps the user's chosen exercises and week plan
const { migrateLegacy, TEMPLATES, fromTemplate } = await import("./routine.ts");
const m = migrateLegacy({ plan: [null, "push", null, null, null, null, null], choices: { "push-1": "press-banca" }, place: "home" });
assert.equal(m.activeRoutine, "r-home");
assert.equal(m.routines![0].days[0].slots[0].ex, "press-banca");
assert.ok(m.routines![0].days[0].slots[0].alts.includes("press-inclinado-mancuernas"));
assert.equal(m.routines![1].plan[1], "push");
assert.deepEqual(migrateLegacy({}), {}); // new users start from zero
assert.equal(fromTemplate(TEMPLATES.find((t) => t.id === "custom")!).days.length, 0);

console.log("logic ok");
