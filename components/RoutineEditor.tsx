"use client";
import { useState } from "react";
import { Icon } from "./icons";
import { Collapse, Sheet } from "./ui";
import { update, type State } from "@/lib/store";
import { COLORS, TEMPLATES, WEEKDAYS, fromTemplate, newId, type Day, type Routine, type Slot } from "@/lib/routine";
import { EXERCISES, MUSCLE_LABEL, getEx, norm, type Muscle } from "@/lib/exercises";

const MUSCLES = Object.keys(MUSCLE_LABEL) as Muscle[];
const SHORT_DAYS = ["D", "L", "M", "X", "J", "V", "S"];

export function editRoutine(id: string, fn: (r: Routine) => Routine) {
  update((s) => ({ routines: s.routines.map((r) => (r.id === id ? fn(r) : r)) }));
}
const editDay = (rid: string, did: string, fn: (d: Day) => Day) =>
  editRoutine(rid, (r) => ({ ...r, days: r.days.map((d) => (d.id === did ? fn(d) : d)) }));

// ---------------------------------------------------------------- templates
export function TemplatePicker({ onCreated, first }: { onCreated: (r: Routine) => void; first?: boolean }) {
  const create = (tid: string) => {
    const r = fromTemplate(TEMPLATES.find((t) => t.id === tid)!);
    update((s) => ({ routines: [...s.routines, r], activeRoutine: r.id }));
    onCreated(r);
  };
  return (
    <div className="animate-rise">
      <h2 className="text-2xl font-semibold">{first ? "¿Cómo quieres entrenar?" : "Nueva rutina"}</h2>
      <p className="mt-1 text-sm text-muted">Empieza con una distribución lista y ajústala a tu gusto, o crea la tuya desde cero.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t, i) => (
          <button key={t.id} onClick={() => create(t.id)} style={{ animationDelay: `${i * 50}ms` }}
            className="card group flex flex-col gap-3 p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15 animate-rise">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t.desc}</p>
              </div>
              <Icon name={t.id === "custom" ? "plus" : "chevron"} className="mt-0.5 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-white" />
            </div>
            {t.days.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {t.days.map((d) => <span key={d.id} className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: `${d.color}1a`, color: d.color }}>{d.name}</span>)}
              </div>
            )}
            <div className="mt-auto flex gap-1">
              {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
                const d = t.days.find((x) => x.id === t.plan[wd]);
                return <span key={wd} className="grid h-6 flex-1 place-items-center rounded-md text-[9px] font-semibold"
                  style={{ background: d ? `${d.color}26` : "rgb(255 255 255 / .03)", color: d?.color ?? "#55556a" }}>{SHORT_DAYS[wd]}</span>;
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- editor
export function RoutineEditor({ hub, routine, onDone }: { hub: State; routine: Routine; onDone: () => void }) {
  const [openDay, setOpenDay] = useState<string | null>(routine.days[0]?.id ?? null);
  const [picker, setPicker] = useState<string | null>(null); // day id receiving exercises
  const rid = routine.id;

  const addDay = () => {
    const d: Day = { id: newId(), name: `Día ${routine.days.length + 1}`, color: COLORS[routine.days.length % COLORS.length], slots: [] };
    editRoutine(rid, (r) => ({ ...r, days: [...r.days, d] }));
    setOpenDay(d.id);
  };
  const removeDay = (did: string) => {
    if (!confirm("¿Eliminar este día y sus ejercicios?")) return;
    editRoutine(rid, (r) => ({ ...r, days: r.days.filter((d) => d.id !== did), plan: r.plan.map((p) => (p === did ? null : p)) }));
  };
  const removeRoutine = () => {
    if (!confirm(`¿Eliminar la rutina "${routine.name}"? Tus registros de entrenos se conservan.`)) return;
    update((s) => {
      const routines = s.routines.filter((r) => r.id !== rid);
      return { routines, activeRoutine: routines[0]?.id ?? "" };
    });
    onDone();
  };
  const setPlan = (wd: number, did: string | null) => editRoutine(rid, (r) => { const p = [...r.plan]; p[wd] = did; return { ...r, plan: p }; });

  return (
    <div className="space-y-4 animate-rise">
      <div className="flex items-center gap-3">
        <input value={routine.name} onChange={(e) => editRoutine(rid, (r) => ({ ...r, name: e.target.value }))}
          aria-label="Nombre de la rutina" className="field flex-1 text-lg font-semibold" />
        <button onClick={onDone} className="btn-primary rounded-2xl px-5 py-3 active:scale-95">Listo</button>
      </div>

      {/* week */}
      <section className="card p-4 sm:p-5">
        <p className="text-sm font-medium">Tu semana</p>
        <p className="mt-0.5 text-xs text-muted">Toca un día de la semana para cambiar qué entrenas.</p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
            const d = routine.days.find((x) => x.id === routine.plan[wd]);
            const cycle = () => {
              const ids = [null, ...routine.days.map((x) => x.id)];
              setPlan(wd, ids[(ids.indexOf(routine.plan[wd] ?? null) + 1) % ids.length]);
            };
            return (
              <button key={wd} onClick={cycle} title={WEEKDAYS[wd]} aria-label={`${WEEKDAYS[wd]}: ${d?.name ?? "descanso"}`}
                className="flex flex-col items-center gap-1.5 rounded-xl py-2 transition active:scale-95"
                style={{ background: d ? `${d.color}1f` : "rgb(255 255 255 / .03)" }}>
                <span className="text-[10px] text-muted">{SHORT_DAYS[wd]}</span>
                <span className="w-full truncate px-0.5 text-center text-[10px] font-semibold" style={{ color: d?.color ?? "#55556a" }}>{d ? d.name.slice(0, 6) : "—"}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* days */}
      {routine.days.map((d) => {
        const open = openDay === d.id;
        return (
          <section key={d.id} className="card overflow-hidden">
            <div className="flex items-center gap-2 p-3 sm:p-4">
              <button aria-label="Cambiar color" onClick={() => editDay(rid, d.id, (x) => ({ ...x, color: COLORS[(COLORS.indexOf(x.color) + 1) % COLORS.length] }))}
                className="grid size-9 shrink-0 place-items-center rounded-xl transition active:scale-90" style={{ background: `${d.color}26` }}>
                <span className="size-3 rounded-full" style={{ background: d.color }} />
              </button>
              <input value={d.name} onChange={(e) => editDay(rid, d.id, (x) => ({ ...x, name: e.target.value }))}
                aria-label="Nombre del día" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 font-medium outline-none focus:bg-white/[0.04]" />
              <span className="num text-xs text-muted">{d.slots.length} ej.</span>
              <button onClick={() => setOpenDay(open ? null : d.id)} aria-label={open ? "Plegar" : "Desplegar"} className="grid size-9 place-items-center rounded-lg text-muted hover:text-white">
                <Icon name="down" className={`size-4 transition-transform duration-[400ms] ${open ? "rotate-180" : ""}`} />
              </button>
            </div>
            <Collapse open={open}>
              <div className="space-y-2 border-t border-line p-3 sm:p-4">
                {d.slots.length === 0 && <p className="py-3 text-center text-sm text-muted">Aún no hay ejercicios en este día.</p>}
                {d.slots.map((sl, i) => (
                  <SlotRow key={sl.id} slot={sl} hub={hub} first={i === 0} last={i === d.slots.length - 1}
                    onChange={(p) => editDay(rid, d.id, (x) => ({ ...x, slots: x.slots.map((y) => (y.id === sl.id ? { ...y, ...p } : y)) }))}
                    onMove={(dir) => editDay(rid, d.id, (x) => { const a = [...x.slots]; [a[i], a[i + dir]] = [a[i + dir], a[i]]; return { ...x, slots: a }; })}
                    onRemove={() => editDay(rid, d.id, (x) => ({ ...x, slots: x.slots.filter((y) => y.id !== sl.id) }))} />
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setPicker(d.id)} className="seg-on flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm">
                    <Icon name="plus" className="size-4" />Añadir ejercicio
                  </button>
                  <button onClick={() => removeDay(d.id)} aria-label="Eliminar día" className="grid w-12 place-items-center rounded-xl bg-white/[0.04] text-muted transition hover:bg-pink/10 hover:text-pink">
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>
              </div>
            </Collapse>
          </section>
        );
      })}

      <button onClick={addDay} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-muted transition hover:border-white/30 hover:text-white">
        <Icon name="plus" className="size-4" />Añadir día
      </button>
      <button onClick={removeRoutine} className="w-full py-2 text-xs text-muted transition hover:text-pink">Eliminar rutina</button>

      <ExercisePicker hub={hub} open={!!picker} onClose={() => setPicker(null)}
        onAdd={(ex) => picker && editDay(rid, picker, (x) => ({ ...x, slots: [...x.slots, { id: newId(), ex, alts: [], sets: 3, reps: "8–12", rest: 90 }] }))} />
    </div>
  );
}

function SlotRow({ slot, hub, first, last, onChange, onMove, onRemove }: {
  slot: Slot; hub: State; first: boolean; last: boolean;
  onChange: (p: Partial<Slot>) => void; onMove: (dir: -1 | 1) => void; onRemove: () => void;
}) {
  const ex = getEx(slot.ex, hub.custom);
  const small = "field num h-10 px-2 text-center text-sm";
  return (
    <div className="rounded-2xl bg-white/[0.025] p-3 animate-fade">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button disabled={first} onClick={() => onMove(-1)} aria-label="Subir" className="text-muted disabled:opacity-20"><Icon name="up" className="size-4" /></button>
          <button disabled={last} onClick={() => onMove(1)} aria-label="Bajar" className="text-muted disabled:opacity-20"><Icon name="down" className="size-4" /></button>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{ex.name}</p>
          <p className="truncate text-xs text-muted">{ex.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ") || ex.equipment}</p>
        </div>
        <button onClick={onRemove} aria-label="Quitar ejercicio" className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-pink/10 hover:text-pink">
          <Icon name="x" className="size-4" />
        </button>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-muted">
        <label className="space-y-1">Series
          <input inputMode="numeric" value={slot.sets || ""} onChange={(e) => onChange({ sets: Math.min(20, Math.max(0, parseInt(e.target.value) || 0)) })} className={small} />
        </label>
        <label className="space-y-1">Reps
          <input value={slot.reps} onChange={(e) => onChange({ reps: e.target.value.slice(0, 12) })} placeholder="8–12" className={small} />
        </label>
        <label className="space-y-1">Descanso (s)
          <input inputMode="numeric" value={slot.rest || ""} onChange={(e) => onChange({ rest: Math.min(900, Math.max(0, parseInt(e.target.value) || 0)) })} className={small} />
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- exercise bank
export function ExercisePicker({ hub, open, onClose, onAdd }: { hub: State; open: boolean; onClose: () => void; onAdd: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const all = [...Object.keys(hub.custom), ...Object.keys(EXERCISES)];
  const list = all.filter((id) => {
    const ex = getEx(id, hub.custom);
    return (!q || norm(ex.name).includes(norm(q))) && (!muscle || ex.muscles.includes(muscle));
  });
  const add = (id: string) => { onAdd(id); setAdded((a) => [...a, id]); navigator.vibrate?.(10); };
  const close = () => { setQ(""); setMuscle(null); setAdded([]); setCreating(false); onClose(); };

  return (
    <Sheet open={open} onClose={close} title={creating ? "Ejercicio personalizado" : "Banco de ejercicios"}>
      {creating ? (
        <CustomForm initialName={q} onCancel={() => setCreating(false)} onCreate={(id) => { add(id); setCreating(false); }} />
      ) : (
        <div className="pb-2">
          <div className="sticky top-[60px] z-10 -mx-5 space-y-3 bg-surface/95 px-5 pb-3 backdrop-blur-xl">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre: press, curl, sentadilla…" className="field" />
            <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5">
              {MUSCLES.map((m) => (
                <button key={m} onClick={() => setMuscle(muscle === m ? null : m)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${muscle === m ? "bg-white text-black" : "bg-white/[0.05] text-muted hover:text-white"}`}>{MUSCLE_LABEL[m]}</button>
              ))}
            </div>
          </div>

          <button onClick={() => setCreating(true)} className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/15 p-3.5 text-left text-sm transition hover:border-white/30">
            <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05]"><Icon name="plus" className="size-4" /></span>
            <span className="flex-1">{q ? <>Crear “<b className="font-medium">{q}</b>”</> : "Crear ejercicio personalizado"}<span className="block text-xs text-muted">Si no está en la lista</span></span>
          </button>

          <ul className="space-y-1">
            {list.slice(0, 80).map((id, i) => {
              const ex = getEx(id, hub.custom), n = added.filter((a) => a === id).length;
              return (
                <li key={id} style={{ animation: `drop .3s ${Math.min(i, 12) * 25}ms both` }}>
                  <button onClick={() => add(id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/[0.04] active:scale-[.99]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ex.name}{hub.custom[id] && <span className="ml-2 rounded-full bg-violet/15 px-2 py-0.5 text-[10px] text-violet">Tuyo</span>}</p>
                      <p className="truncate text-xs text-muted">{[ex.muscles[0] && MUSCLE_LABEL[ex.muscles[0]], ex.equipment].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-xl transition ${n ? "bg-teal text-black" : "bg-white/[0.05] text-muted"}`}>
                      {n ? <Icon key={n} name="check" className="size-4 animate-pop" stroke={2.6} /> : <Icon name="plus" className="size-4" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted">Sin resultados. Créalo como ejercicio personalizado.</p>}
          {added.length > 0 && (
            <button onClick={close} className="btn-primary sticky bottom-2 mt-3 w-full rounded-2xl py-3.5 animate-rise">
              Listo · {added.length} añadido{added.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function CustomForm({ initialName, onCancel, onCreate }: { initialName: string; onCancel: () => void; onCreate: (id: string) => void }) {
  const [name, setName] = useState(initialName);
  const [equipment, setEquipment] = useState("");
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const toggle = (m: Muscle) => setMuscles((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = `c-${newId()}`;
    update((s) => ({ custom: { ...s.custom, [id]: { name: name.trim().slice(0, 60), muscles, equipment: equipment.trim().slice(0, 40) || undefined } } }));
    onCreate(id);
  };
  return (
    <form onSubmit={save} className="space-y-4 pb-2 animate-fade">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del ejercicio" className="field" maxLength={60} />
      <input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Material (opcional): mancuernas, polea…" className="field" maxLength={40} />
      <div>
        <p className="mb-2 text-sm font-medium">Músculos que trabaja <span className="font-normal text-muted">(opcional)</span></p>
        <p className="mb-3 text-xs text-muted">El primero que marques será el principal. Sirve para tus estadísticas de series por músculo.</p>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLES.map((m) => {
            const i = muscles.indexOf(m);
            return (
              <button type="button" key={m} onClick={() => toggle(m)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${i === 0 ? "bg-pink/20 text-pink" : i > 0 ? "bg-white/15 text-white" : "bg-white/[0.05] text-muted hover:text-white"}`}>
                {MUSCLE_LABEL[m]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-2xl bg-white/[0.05] py-3.5 text-sm">Volver</button>
        <button disabled={!name.trim()} className="btn-primary flex-[2] rounded-2xl py-3.5 disabled:opacity-40">Crear y añadir</button>
      </div>
    </form>
  );
}
