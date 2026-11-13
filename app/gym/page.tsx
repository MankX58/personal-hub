"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Burst, Collapse, CountUp, MuscleMap, Ring, Sheet, stagger } from "@/components/ui";
import { update, useHub, useToday, type State } from "@/lib/store";
import { e1rm, parseKey, previousBest, volume, type SetLog, type Workout } from "@/lib/logic";
import { DAYS, dayById, slotsFor, type Day, type Place, type Slot } from "@/lib/routine";
import { EXERCISES, MUSCLE_LABEL, youtubeUrl } from "@/lib/exercises";

const pick = (hub: State, slot: Slot) => (hub.choices[slot.id] && slot.options.includes(hub.choices[slot.id]) ? hub.choices[slot.id] : slot.options[0]);
const fmtRest = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return isFinite(n) && n >= 0 ? n : 0; };

function lastSession(workouts: Record<string, Workout>, exId: string, before: string) {
  const date = Object.keys(workouts).filter((d) => d < before && workouts[d].sets[exId]?.some((s) => s.done)).sort().pop();
  return date ? { date, sets: workouts[date].sets[exId].filter((s) => s.done) } : null;
}

export default function Gym() {
  const hub = useHub()!;
  const today = useToday();
  const planned = hub.plan[parseKey(today).getDay()];
  const [dayId, setDayId] = useState(hub.workouts[today]?.dayId ?? planned ?? "push");
  const day = dayById(dayId)!;
  const [info, setInfo] = useState<Slot | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [rest, setRest] = useState<{ end: number; total: number } | null>(null);
  const [summary, setSummary] = useState(false);

  const workout = hub.workouts[today];
  const logging = !workout || workout.dayId === dayId; // today's log belongs to this day
  const place = hub.place;
  const slots = slotsFor(day, place);
  const totalSets = slots.reduce((a, s) => a + s.sets, 0);
  const doneSets = logging ? slots.reduce((a, s) => a + (workout?.sets[pick(hub, s)]?.filter((x) => x.done).length ?? 0), 0) : 0;
  const minutes = Math.round(slots.reduce((a, s) => a + s.sets * (s.rest + 45), 0) / 60);

  const setRow = (exId: string, i: number, patch: Partial<SetLog>) =>
    update((s) => {
      const w: Workout = s.workouts[today] ?? { dayId, done: false, sets: {} };
      const rows = [...(w.sets[exId] ?? [])];
      while (rows.length <= i) rows.push({ w: 0, r: 0, done: false });
      rows[i] = { ...rows[i], ...patch };
      return { workouts: { ...s.workouts, [today]: { ...w, dayId, place, sets: { ...w.sets, [exId]: rows } } } };
    });

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex items-end justify-between animate-rise">
        <div>
          <p className="text-sm text-muted">Rutina PPL + UL</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Entreno</h1>
        </div>
        <PlaceToggle place={place} />
      </header>

      {/* Day chips */}
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {DAYS.map((d) => (
          <button key={d.id} onClick={() => setDayId(d.id)}
            className={`relative shrink-0 rounded-2xl px-4 py-2.5 text-sm transition-all duration-300 ${dayId === d.id ? "text-black" : "bg-white/[0.04] text-muted hover:text-white"}`}
            style={dayId === d.id ? { background: d.color, boxShadow: `0 8px 24px -8px ${d.color}` } : undefined}>
            <span className="font-semibold">{d.name}</span>
            {planned === d.id && <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${dayId === d.id ? "bg-black/15" : "bg-white/10"}`}>hoy</span>}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section key={day.id} className="card relative mt-4 overflow-hidden p-5 sm:p-7 animate-rise">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full opacity-40 blur-3xl" style={{ background: day.color }} />
        <div className="relative flex items-center gap-5">
          <div className="flex-1">
            <p className="num text-xs tracking-[0.3em]" style={{ color: day.color }}>{day.short}</p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{day.name}</h2>
            <p className="mt-1 text-sm text-muted">{day.focus}</p>
            <div className="mt-5 flex gap-6">
              {[[slots.length, "ejercicios"], [totalSets, "series"], [`~${minutes}`, "min"]].map(([v, l]) => (
                <div key={l as string}><p className="num text-2xl font-light">{v}</p><p className="text-[10px] uppercase tracking-widest text-muted">{l}</p></div>
              ))}
            </div>
          </div>
          <Ring value={doneSets / totalSets} size={104} stroke={9} colors={[day.color, "#8b5cf6"]}>
            <div><p className="num text-2xl font-bold leading-none"><CountUp value={Math.round((doneSets / totalSets) * 100)} />%</p><p className="mt-1 text-[9px] uppercase tracking-widest text-muted">sesión</p></div>
          </Ring>
        </div>
        {!logging && (
          <p className="relative mt-4 rounded-xl bg-orange/10 px-3 py-2 text-xs text-orange">
            Hoy ya registraste {dayById(workout?.dayId)?.name}. Vista solo de consulta.
          </p>
        )}
      </section>

      {/* Exercises */}
      <ol key={place + day.id} className="mt-5 space-y-3">
        {slots.map((slot, i) => (
          <ExerciseCard key={slot.id} i={i} slot={slot} day={day} hub={hub} today={today} logging={logging}
            open={open === slot.id} onOpen={() => setOpen(open === slot.id ? null : slot.id)}
            onInfo={() => setInfo(slot)} setRow={setRow}
            onRest={() => setRest({ end: Date.now() + slot.rest * 1000, total: slot.rest })} />
        ))}
      </ol>

      {logging && doneSets > 0 && (
        <button onClick={() => { update((s) => ({ workouts: { ...s.workouts, [today]: { ...s.workouts[today], done: true } } })); setSummary(true); }}
          className="btn-primary mt-6 w-full rounded-2xl py-4 active:scale-[.98] animate-rise">
          {workout?.done ? "Ver resumen" : "Terminar entreno"}
        </button>
      )}

      <ExerciseSheet key={info?.id} slot={info} hub={hub} onClose={() => setInfo(null)} />
      {rest && <RestTimer rest={rest} color={day.color} onDone={() => setRest(null)} onAdd={() => setRest({ ...rest, end: rest.end + 15000, total: rest.total + 15 })} />}
      <Summary open={summary} onClose={() => setSummary(false)} hub={hub} day={day} today={today} slots={slots} />
    </div>
  );
}

function ExerciseCard({ i, slot, day, hub, today, logging, open, onOpen, onInfo, setRow, onRest }: {
  i: number; slot: Slot; day: Day; hub: State; today: string; logging: boolean; open: boolean;
  onOpen: () => void; onInfo: () => void; setRow: (ex: string, i: number, p: Partial<SetLog>) => void; onRest: () => void;
}) {
  const exId = pick(hub, slot), ex = EXERCISES[exId];
  const logged = (logging && hub.workouts[today]?.sets[exId]) || [];
  const last = lastSession(hub.workouts, exId, today);
  const prev = previousBest(hub.workouts, exId, today);
  const rows = Math.max(slot.sets, logged.length);
  const done = logged.filter((s) => s.done).length;
  const bestToday = Math.max(0, ...logged.filter((s) => s.done).map((s) => e1rm(s.w, s.r)));
  const isPR = prev > 0 && bestToday > prev;

  return (
    <li className="card overflow-hidden animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
      <div className="flex items-center gap-3 p-4">
        <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-semibold"
            style={{ background: done >= slot.sets ? day.color : `${day.color}1a`, color: done >= slot.sets ? "#000" : day.color }}>
            {done >= slot.sets ? <Icon name="check" className="size-5 animate-pop" stroke={2.6} /> : <span className="num">{String(i + 1).padStart(2, "0")}</span>}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium">{ex.name}</span>
              {isPR && <span className="flex shrink-0 items-center gap-1 rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-semibold text-orange animate-pop"><Icon name="trophy" className="size-3" />PR</span>}
            </span>
            <span className="num mt-0.5 block text-xs text-muted">
              {slot.sets} × {slot.reps} · RIR {slot.rir} · {fmtRest(slot.rest)}
            </span>
            {last && <span className="mt-0.5 block truncate text-xs text-muted/80">Última: <span className="num text-white/80">{last.sets[0].w ? `${last.sets[0].w} kg × ${last.sets[0].r}` : `${last.sets[0].r} reps`}</span>{last.sets.length > 1 && ` +${last.sets.length - 1}`}</span>}
          </span>
          <Icon name="down" className={`ml-auto size-4 shrink-0 text-muted transition-transform duration-[400ms] ${open ? "rotate-180" : ""}`} />
        </button>
        <button onClick={onInfo} aria-label="Técnica y alternativas" className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-muted transition hover:text-white">
          <Icon name="info" className="size-[18px]" />
        </button>
      </div>

      {/* progress strip */}
      <div className="flex gap-1 px-4 pb-3">
        {Array.from({ length: rows }, (_, k) => (
          <span key={k} className="h-1 flex-1 rounded-full transition-all duration-500" style={{ background: logged[k]?.done ? day.color : "rgb(255 255 255 / .06)" }} />
        ))}
      </div>

      {logging && (
        <Collapse open={open}>
        <div className="border-t border-line px-3 pb-3 pt-2 sm:px-4">
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.75rem] gap-2 px-1 pb-1 text-[10px] uppercase tracking-wider text-muted" style={stagger(open, 0)}>
            <span>#</span><span>Anterior</span><span className="text-center">{ex.bw ? "+kg" : "kg"}</span><span className="text-center">reps</span><span />
          </div>
          {Array.from({ length: rows }, (_, k) => (
            <div key={k} style={stagger(open, k + 1)}>
            <SetRow k={k} row={logged[k]} prev={last?.sets[k] ?? last?.sets[last.sets.length - 1]} color={day.color}
              pr={!!logged[k]?.done && prev > 0 && e1rm(logged[k].w, logged[k].r) > prev && e1rm(logged[k].w, logged[k].r) === bestToday}
              beat={prev > 0 ? Math.max(prev, bestToday) : 0}
              onChange={(p) => setRow(exId, k, p)}
              onCheck={(row) => { if (!row.done) onRest(); }} />
            </div>
          ))}
          <button style={stagger(open, rows + 1)} onClick={() => setRow(exId, rows, { w: 0, r: 0, done: false })} className="mt-1 w-full rounded-xl py-2.5 text-sm text-muted transition hover:bg-white/[0.03] hover:text-white">
            + Añadir serie
          </button>
        </div>
        </Collapse>
      )}
    </li>
  );
}

function SetRow({ k, row, prev, color, pr, beat, onChange, onCheck }: {
  k: number; row?: SetLog; prev?: SetLog; color: string; pr: boolean; beat: number;
  onChange: (p: Partial<SetLog>) => void; onCheck: (row: SetLog) => void;
}) {
  const [w, setW] = useState(row?.w ? String(row.w) : "");
  const [r, setR] = useState(row?.r ? String(row.r) : "");
  const [burst, setBurst] = useState(false);
  const isDone = !!row?.done;

  const check = () => {
    // empty fields reuse last session's numbers → one tap to repeat
    const wv = w ? num(w) : prev?.w ?? 0, rv = r ? num(r) : prev?.r ?? 0;
    if (!isDone && !rv) return;
    if (!w && wv) setW(String(wv));
    if (!r && rv) setR(String(rv));
    if (!isDone && beat > 0 && e1rm(wv, rv) > beat) { setBurst(true); setTimeout(() => setBurst(false), 800); }
    onCheck({ w: wv, r: rv, done: isDone });
    onChange({ w: wv, r: rv, done: !isDone });
    navigator.vibrate?.(15);
  };
  const input = "field num h-11 px-2 text-center text-base";
  return (
    <div className={`grid grid-cols-[2rem_1fr_1fr_1fr_2.75rem] items-center gap-2 rounded-xl px-1 py-1 transition ${isDone ? "bg-white/[0.025]" : ""}`}>
      <span className="num relative text-sm text-muted">{pr ? <Icon name="trophy" className="size-4 text-orange" /> : k + 1}</span>
      <span className="num truncate text-xs text-muted">{prev ? (prev.w ? `${prev.w}×${prev.r}` : `${prev.r} reps`) : "—"}</span>
      <input inputMode="decimal" value={w} placeholder={prev ? String(prev.w) : "0"} aria-label={`Peso serie ${k + 1}`}
        onChange={(e) => { setW(e.target.value); onChange({ w: num(e.target.value) }); }} className={input} />
      <input inputMode="numeric" value={r} placeholder={prev ? String(prev.r) : "0"} aria-label={`Repeticiones serie ${k + 1}`}
        onChange={(e) => { setR(e.target.value); onChange({ r: num(e.target.value) }); }} className={input} />
      <button onClick={check} aria-label={isDone ? "Desmarcar serie" : "Completar serie"}
        className="relative grid size-11 place-items-center rounded-xl transition-all duration-300 active:scale-90"
        style={{ background: isDone ? color : "rgb(255 255 255 / .05)", color: isDone ? "#000" : "#8a8a9a" }}>
        <Icon name="check" className={`size-5 ${isDone ? "animate-pop" : ""}`} stroke={2.6} />
        {burst && <Burst />}
      </button>
    </div>
  );
}

function RestTimer({ rest, color, onDone, onAdd }: { rest: { end: number; total: number }; color: string; onDone: () => void; onAdd: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(i); }, []);
  const left = Math.max(0, Math.ceil((rest.end - now) / 1000));
  useEffect(() => { if (left === 0) { navigator.vibrate?.([200, 100, 200]); const t = setTimeout(onDone, 1200); return () => clearTimeout(t); } }, [left, onDone]);
  return (
    <div className="glass fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-40 !bg-surface-2/95 mx-auto flex max-w-sm items-center gap-3 rounded-3xl p-2.5 pr-3 shadow-2xl shadow-black/60 animate-rise lg:bottom-8">
      <Ring value={left / rest.total} size={48} stroke={4} colors={[color, "#8b5cf6"]}><Icon name="clock" className="size-4 text-muted" /></Ring>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted">{left ? "Descanso" : "¡A por la siguiente!"}</p>
        <p className="num text-2xl font-semibold">{fmtRest(left)}</p>
      </div>
      <button onClick={onAdd} className="rounded-xl bg-white/5 px-3 py-2 text-sm">+15s</button>
      <button onClick={onDone} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-muted">Saltar</button>
    </div>
  );
}

function ExerciseSheet({ slot, hub, onClose }: { slot: Slot | null; hub: State; onClose: () => void }) {
  const exId = slot ? pick(hub, slot) : "";
  const [view, setView] = useState<string | null>(null);
  const shown = view ?? exId;
  const ex = EXERCISES[shown];
  return (
    <Sheet open={!!slot} onClose={onClose} title={ex?.name}>
      {slot && ex && (
        <div key={shown} className="space-y-6 pb-2 animate-fade">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/5 px-3 py-1 text-muted">{ex.equipment}</span>
            {ex.muscles.map((m, i) => <span key={m} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-pink/15 text-pink" : "bg-white/5 text-muted"}`}>{MUSCLE_LABEL[m]}</span>)}
          </div>
          <div className="card bg-surface-2 py-4"><MuscleMap muscles={ex.muscles} /></div>

          <a href={youtubeUrl(ex)} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-[#ff0033]/10 p-3.5 text-sm transition hover:bg-[#ff0033]/15">
            <span className="grid size-10 place-items-center rounded-xl bg-[#ff0033] text-white"><Icon name="play" className="size-4" /></span>
            <span className="flex-1"><b className="font-medium">Ver técnica en vídeo</b><span className="block text-xs text-muted">Abre YouTube</span></span>
            <Icon name="external" className="size-4 text-muted" />
          </a>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Cómo se hace</h3>
            <ol className="space-y-3">
              {ex.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/85">
                  <span className="num grid size-6 shrink-0 place-items-center rounded-lg bg-white/5 text-xs text-muted">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            <ul className="mt-4 space-y-1.5">
              {ex.tips.map((t) => <li key={t} className="flex gap-2 text-sm text-muted"><span className="text-cyan">›</span>{t}</li>)}
            </ul>
          </div>

          {ex.science && (
            <div className="rounded-2xl border border-violet/20 bg-violet/[0.07] p-4 text-sm leading-relaxed">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-violet">Evidencia</p>{ex.science}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold">Alternativas en tu rutina</h3>
            <ul className="space-y-2">
              {slot.options.map((o) => {
                const main = o === exId;
                return (
                  <li key={o} className={`flex items-center gap-3 rounded-2xl p-3 transition ${o === shown ? "bg-white/[0.06]" : "bg-white/[0.02]"}`}>
                    <button onClick={() => setView(o)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium">{EXERCISES[o].name}</p>
                      <p className="truncate text-xs text-muted">{EXERCISES[o].equipment}</p>
                    </button>
                    {main ? (
                      <span className="rounded-full bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">Principal</span>
                    ) : (
                      <button onClick={() => update((s) => ({ choices: { ...s.choices, [slot.id]: o } }))}
                        className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs transition hover:bg-white/10">
                        <Icon name="swap" className="size-3.5" />Usar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Summary({ open, onClose, hub, day, today, slots }: { open: boolean; onClose: () => void; hub: State; day: Day; today: string; slots: Slot[] }) {
  const w = hub.workouts[today];
  if (!w) return null;
  const exIds = slots.map((s) => pick(hub, s));
  const vol = exIds.reduce((a, id) => a + volume(w.sets[id]), 0);
  const sets = exIds.reduce((a, id) => a + (w.sets[id]?.filter((s) => s.done).length ?? 0), 0);
  const prs = exIds.filter((id) => { const p = previousBest(hub.workouts, id, today); return p > 0 && Math.max(0, ...(w.sets[id] ?? []).filter((s) => s.done).map((s) => e1rm(s.w, s.r))) > p; });
  const prevDate = Object.keys(hub.workouts).filter((d) => d < today && hub.workouts[d].dayId === day.id).sort().pop();
  const prevVol = prevDate ? exIds.reduce((a, id) => a + volume(hub.workouts[prevDate].sets[id]), 0) : 0;
  const delta = prevVol ? ((vol - prevVol) / prevVol) * 100 : 0;
  return (
    <Sheet open={open} onClose={onClose} title={`${day.name} completado`}>
      <div className="space-y-4 pb-2">
        <div className="relative overflow-hidden rounded-3xl p-6 text-center" style={{ background: `linear-gradient(140deg, ${day.color}33, #8b5cf622)` }}>
          <p className="text-[10px] uppercase tracking-widest text-muted">Volumen total</p>
          <p className="mt-1 text-5xl font-extralight"><CountUp value={vol} /><span className="ml-1 text-lg text-muted">kg</span></p>
          {prevVol > 0 && (
            <p className={`num mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${delta >= 0 ? "bg-teal/15 text-teal" : "bg-pink/15 text-pink"}`}>
              <Icon name={delta >= 0 ? "up" : "down"} className="size-4" stroke={2.5} />{Math.abs(delta).toFixed(1)}% vs. anterior
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4"><p className="text-[10px] uppercase tracking-widest text-muted">Series</p><p className="num mt-1 text-3xl font-light"><CountUp value={sets} /></p></div>
          <div className="card relative p-4"><p className="text-[10px] uppercase tracking-widest text-muted">Récords</p><p className="num mt-1 text-3xl font-light text-orange"><CountUp value={prs.length} /></p>{prs.length > 0 && <Burst />}</div>
        </div>
        {prs.length > 0 && (
          <ul className="space-y-2">
            {prs.map((id) => <li key={id} className="flex items-center gap-2 text-sm"><Icon name="trophy" className="size-4 text-orange" />{EXERCISES[id].name}</li>)}
          </ul>
        )}
      </div>
    </Sheet>
  );
}

function PlaceToggle({ place }: { place: Place }) {
  const opts: [Place, string][] = [["gym", "Gimnasio"], ["home", "Casa"]];
  return (
    <div className="relative flex rounded-2xl bg-surface-2 p-1 text-sm" role="tablist" aria-label="Dónde entrenas">
      <span aria-hidden className="seg-on absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl"
        style={{ transform: `translateX(${place === "home" ? 100 : 0}%)`, transition: "transform .45s cubic-bezier(.34,1.4,.5,1)" }} />
      {opts.map(([v, l]) => (
        <button key={v} role="tab" aria-selected={place === v} onClick={() => update(() => ({ place: v }))}
          className={`relative z-10 w-20 rounded-xl py-2 transition-colors duration-300 sm:w-24 ${place === v ? "text-white" : "text-muted"}`}>{l}</button>
      ))}
    </div>
  );
}
