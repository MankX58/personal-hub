"use client";
import { useEffect, useSyncExternalStore } from "react";
import { dateKey, rollover, type Task, type Workout } from "./logic";
import { migrateLegacy, soften, type Routine } from "./routine";
import type { CustomEx } from "./exercises";

export type State = {
  tasks: Task[];
  archive: Task[];
  rolloverMode: "archive" | "delete";
  gymTimes: string[]; // "HH:MM" or "", by getDay()
  routines: Routine[];
  activeRoutine: string;
  custom: Record<string, CustomEx>; // user-made exercises
  workouts: Record<string, Workout>; // date -> workout
};

const DEFAULTS: State = {
  tasks: [],
  archive: [],
  rolloverMode: "archive",
  gymTimes: ["", "", "", "", "", "", ""],
  routines: [],
  activeRoutine: "",
  custom: {},
  workouts: {},
};

type Legacy = Partial<State> & { plan?: (string | null)[]; choices?: Record<string, string>; place?: "gym" | "home" };

/** Old single-routine documents (fixed PPL+UL with gym/home toggle) → user routines. New users start empty. */
export function migrate(raw: Legacy): State {
  const { plan, choices, place, ...rest } = raw;
  const s: State = { ...DEFAULTS, ...rest };
  if (!raw.routines) Object.assign(s, migrateLegacy({ plan, choices, place }));
  s.routines = soften(s.routines);
  return s;
}

// Local cache per user + whole-document sync to Neon (/api/state).
// ponytail: last-write-wins on the whole document; per-field merge if two devices edit at the same time.
const LEGACY_KEY = "hub:v1";
let state: State | null = null;
let userId = "";
let pushTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const localKey = () => `hub:v1:${userId}`;
const pendingKey = () => `hub:pending:${userId}`;

function readLocal(k: string): Partial<State> | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeLocal() {
  try {
    localStorage.setItem(localKey(), JSON.stringify(state));
  } catch {}
}
const isPending = () => { try { return !!localStorage.getItem(pendingKey()); } catch { return false; } };

function applyRollover() {
  if (!state) return;
  const r = rollover(state.tasks, state.archive, dateKey(), state.rolloverMode);
  if (r) update(() => r);
}

/** El servidor ya no reconoce la sesión (cerrada, revocada o caducada): al login con recarga completa. */
function expired() {
  window.location.replace("/auth/sign-in");
}

async function push(leaving = false) {
  clearTimeout(pushTimer);
  if (!state || !userId) return;
  const body = JSON.stringify(state);
  try {
    // keepalive lets the request survive closing the tab, but browsers reject keepalive bodies over 64 KB
    const res = await fetch("/api/state", { method: "PUT", body, headers: { "content-type": "application/json" }, keepalive: leaving && body.length < 60_000 });
    if (res.status === 401) return expired();
    if (res.ok) localStorage.removeItem(pendingKey());
  } catch {} // offline: stays pending, retried on next change or next load
}

async function pull() {
  if (!userId || isPending()) return;
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (res.status === 401) return expired();
    if (!res.ok) return;
    const { data } = await res.json();
    if (data && !isPending()) {
      state = migrate(data);
      writeLocal();
      emit();
      applyRollover();
    }
  } catch {}
}

/** Called once the signed-in user is known. Loads the local cache instantly, then syncs with Neon. */
export async function connect(uid: string) {
  if (userId === uid) return;
  userId = uid;
  const local = readLocal(localKey());
  state = migrate(local ?? {});
  emit();
  applyRollover();
  try {
    if (isPending()) return void push(); // unsynced offline edits win
    const res = await fetch("/api/state", { cache: "no-store" });
    if (res.status === 401) return expired();
    if (!res.ok) return;
    const { data } = await res.json();
    if (data) {
      state = migrate(data);
      writeLocal();
      emit();
      applyRollover();
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

/** Flush pending changes and forget this user's local data (sign-out). */
export async function disconnect() {
  if (isPending()) await push();
  try {
    if (!isPending()) localStorage.removeItem(localKey()); // keep unsynced data for the next sign-in
  } catch {}
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pull(); // pick up changes from other devices
    else if (isPending()) push(true);
  });
  // volver con «atrás» después de cerrar sesión: no mostrar la página cacheada, que el servidor decida
  window.addEventListener("pageshow", (e) => { if (e.persisted) window.location.reload(); });
}

function get(): State {
  return state ?? DEFAULTS;
}

export function update(fn: (s: State) => Partial<State>) {
  if (!state) return;
  state = { ...state, ...fn(state) };
  writeLocal();
  emit();
  try {
    localStorage.setItem(pendingKey(), "1");
  } catch {}
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 800);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** null until the user's data is loaded (and during SSR) */
export const useHub = () => useSyncExternalStore(subscribe, () => state, () => null);

/** Current local date, refreshed every 30 s; runs task rollover when the day changes. */
const subscribeClock = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};

export function useToday() {
  const today = useSyncExternalStore(subscribeClock, () => dateKey(), () => "");
  useEffect(() => {
    if (today) applyRollover();
  }, [today]);
  return today;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const exportData = () => JSON.stringify(get(), null, 2);
export function importData(json: string) {
  const parsed = JSON.parse(json);
  if (typeof parsed !== "object" || !Array.isArray(parsed.tasks)) throw new Error("Archivo no válido");
  update(() => migrate(parsed));
}
