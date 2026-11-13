"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Ring, Sheet, Burst, Collapse, stagger } from "@/components/ui";
import { update, useHub, useToday, uid, type State } from "@/lib/store";
import { addDays, byTime, hasWork, parseKey, type Task } from "@/lib/logic";
import { getRoutine } from "@/lib/routine";

type Item = (Task & { gym?: false }) | { gym: true; id: string; title: string; sub: string; time?: string; done: boolean; color: string };

function gymItem(hub: State, date: string): Item | null {
  const wd = parseKey(date).getDay();
  const r = getRoutine(hub);
  const day = r?.days.find((d) => d.id === r.plan[wd]);
  if (!day) return null;
  return { gym: true, id: `gym-${date}`, title: `Entreno · ${day.name}`, sub: day.focus ?? `${day.slots.length} ejercicios`, time: hub.gymTimes[wd] || undefined, done: !!hub.workouts[date]?.done, color: day.color };
}

/** Gym without time goes first; then timed items; then untimed tasks */
function sortItems(items: Item[]) {
  const pinned = items.filter((i) => i.gym && !i.time);
  return [...pinned, ...items.filter((i) => !pinned.includes(i)).sort(byTime)];
}

const nowHM = () => new Date().toTimeString().slice(0, 5);
const fmtDate = (k: string) => { const s = parseKey(k).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }); return s[0].toUpperCase() + s.slice(1); };
function until(hm: string, now: string) {
  const m = (+hm.slice(0, 2) * 60 + +hm.slice(3)) - (+now.slice(0, 2) * 60 + +now.slice(3));
  return m < 60 ? `en ${m} min` : `en ${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`;
}

export default function Today() {
  const hub = useHub()!;
  const today = useToday();
  const tomorrow = addDays(today, 1);
  const [now, setNow] = useState(nowHM);
  const [adding, setAdding] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  useEffect(() => { const i = setInterval(() => setNow(nowHM()), 30_000); return () => clearInterval(i); }, []);

  const build = (date: string) => {
    const g = gymItem(hub, date);
    return sortItems([...(g ? [g] : []), ...hub.tasks.filter((t) => t.date === date)]);
  };
  const items = build(today), next = build(tomorrow);
  const done = items.filter((i) => i.done).length;
  const upcoming = items.find((i) => !i.done && i.time && i.time >= now);
  const hour = +now.slice(0, 2);
  const hello = hour < 6 ? "Buenas noches" : hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  const toggle = (it: Item) => {
    if (it.gym) {
      update((s) => {
        const r = getRoutine(s);
        const w = s.workouts[today] ?? { dayId: r?.plan[parseKey(today).getDay()] ?? "", done: false, sets: {} };
        return { workouts: { ...s.workouts, [today]: { ...w, done: !it.done } } };
      });
    } else update((s) => ({ tasks: s.tasks.map((t) => (t.id === it.id ? { ...t, done: !t.done } : t)) }));
  };
  const remove = (id: string) => update((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  const move = (id: string, date: string) => update((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, date } : t)) }));

  // index where the "now" marker goes
  const nowIdx = items.findIndex((i) => i.time && i.time > now);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
      <section className="min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 animate-rise">
          <div className="flex-1">
            <p className="text-sm text-muted">{hello}</p>
            <h1 className="mt-1 text-[28px] font-semibold leading-tight sm:text-4xl">{fmtDate(today)}</h1>
          </div>
          <Ring value={items.length ? done / items.length : 0} size={84} stroke={8}>
            <div>
              <p className="num text-xl font-bold leading-none">{done}<span className="text-muted">/{items.length}</span></p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-muted">hecho</p>
            </div>
          </Ring>
        </header>

        {/* Next up */}
        <div className="mt-5 grid grid-cols-2 gap-3 animate-rise [animation-delay:60ms]">
          <div className="card p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted">Siguiente</p>
            {upcoming ? (
              <>
                <p className="mt-2 truncate font-medium">{upcoming.title}</p>
                <p className="num mt-1 text-sm text-cyan">{upcoming.time} · {until(upcoming.time!, now)}</p>
              </>
            ) : <p className="mt-2 text-sm text-muted">Nada con hora pendiente</p>}
          </div>
          <div className="card p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted">Pendiente</p>
            <p className="num mt-1 text-4xl font-light">{items.length - done}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hoy</h2>
          <button onClick={() => setAdding(true)} className="hidden items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 lg:flex">
            <Icon name="plus" className="size-4" /> Añadir
          </button>
        </div>

        <ol className="relative mt-3 space-y-2.5">
          {items.length === 0 && (
            <li className="card grid place-items-center gap-3 p-10 text-center text-muted">
              <Icon name="today" className="size-8 opacity-50" />
              <p className="text-sm">Día despejado. Pulsa <b className="text-white">+</b> para planificarlo.</p>
            </li>
          )}
          {items.map((it, i) => (
            <div key={it.id}>
              {i === nowIdx && <NowLine now={now} />}
              <Row it={it} i={i} late={!!it.time && it.time < now && !it.done}
                onToggle={() => toggle(it)} onDelete={it.gym ? undefined : () => remove(it.id)}
                onMove={it.gym ? undefined : () => move(it.id, tomorrow)} moveLabel="Pasar a mañana" />
            </div>
          ))}
          {items.length > 0 && nowIdx === -1 && <NowLine now={now} />}
        </ol>

        {/* Tomorrow */}
        <h2 className="mt-9 flex items-center gap-2 text-lg font-semibold">Mañana <span className="text-sm font-normal capitalize text-muted">{parseKey(tomorrow).toLocaleDateString("es", { weekday: "long" })}</span></h2>
        <ol className="mt-3 space-y-2.5 opacity-80">
          {next.length === 0 && <li className="text-sm text-muted">Sin nada todavía.</li>}
          {next.map((it, i) => (
            <Row key={it.id} it={it} i={i} preview onDelete={it.gym ? undefined : () => remove(it.id)}
              onMove={it.gym ? undefined : () => move(it.id, today)} moveLabel="Pasar a hoy" />
          ))}
        </ol>
      </section>

      {/* Side column */}
      <aside className="space-y-4">
        <GymCard hub={hub} today={today} />
        {hub.rolloverMode === "archive" && hub.archive.length > 0 && (
          <div className="card p-5">
            <button onClick={() => setShowArchive((v) => !v)} className="flex w-full items-center gap-3 text-sm">
              <Icon name="archive" className="size-4 text-muted" />
              <span className="flex-1 text-left">Historial <span className="text-muted">({hub.archive.length})</span></span>
              <Icon name="chevron" className={`size-4 text-muted transition ${showArchive ? "rotate-90" : ""}`} />
            </button>
            <Collapse open={showArchive}>
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
                {hub.archive.slice(0, 60).map((t, i) => (
                  <li key={t.id} className="flex items-center gap-2" style={stagger(showArchive, Math.min(i, 12))}>
                    <span className={`size-1.5 rounded-full ${t.done ? "bg-teal" : "bg-pink"}`} />
                    <span className={`flex-1 truncate ${t.done ? "text-muted line-through" : ""}`}>{t.title}</span>
                    <span className="num text-xs text-muted">{t.date.slice(5).split("-").reverse().join("/")}</span>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>
        )}
      </aside>

      {/* FAB */}
      <button onClick={() => setAdding(true)} aria-label="Añadir tarea"
        className="btn-primary fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-5 z-30 grid size-14 place-items-center rounded-2xl transition active:scale-90 lg:hidden">
        <Icon name="plus" className="size-6" stroke={2.4} />
      </button>

      <AddTask open={adding} onClose={() => setAdding(false)} today={today} tomorrow={tomorrow} />
    </div>
  );
}

function NowLine({ now }: { now: string }) {
  return (
    <div className="my-2 flex items-center gap-2 px-1" aria-label="Ahora">
      <span className="num text-[11px] text-pink">{now}</span>
      <span className="relative h-px flex-1 bg-gradient-to-r from-pink to-transparent">
        <span className="absolute -left-1 -top-[3px] size-[7px] animate-glow rounded-full bg-pink" />
      </span>
    </div>
  );
}

function Row({ it, i, late, preview, onToggle, onDelete, onMove, moveLabel }:
  { it: Item; i: number; late?: boolean; preview?: boolean; onToggle?: () => void; onDelete?: () => void; onMove?: () => void; moveLabel: string }) {
  const [burst, setBurst] = useState(false);
  const content = (
    <div className="min-w-0 flex-1">
      <p className={`truncate font-medium transition ${it.done ? "text-muted line-through" : ""}`}>{it.title}</p>
      <p className="mt-0.5 flex items-center gap-2 whitespace-nowrap text-xs text-muted">
        {it.time ? <span className={`num flex items-center gap-1 ${late ? "text-orange" : ""}`}><Icon name="clock" className="size-3" />{it.time}</span>
          : it.gym ? <span>Sin hora</span> : null}
        {it.gym && <span className="truncate">{it.sub}</span>}
      </p>
    </div>
  );
  return (
    <li className={`card group relative flex items-center gap-3 p-3.5 pr-2 animate-rise ${it.gym ? "border-transparent" : ""}`}
      style={{ animationDelay: `${i * 40}ms`, ...(it.gym ? { background: `linear-gradient(var(--color-surface),var(--color-surface)) padding-box, linear-gradient(120deg, ${it.color}, transparent 70%) border-box`, border: "1px solid transparent" } : {}) }}>
      {!preview && (
        <button onClick={() => { if (!it.done) { setBurst(true); setTimeout(() => setBurst(false), 700); } onToggle?.(); }}
          aria-label={it.done ? "Marcar pendiente" : "Completar"}
          className={`relative grid size-8 shrink-0 place-items-center rounded-xl border transition-all duration-300 ${it.done ? "border-transparent bg-teal text-black" : late ? "border-orange/50" : "border-white/15 hover:border-white/40"}`}>
          {it.done && <Icon name="check" className="size-4 animate-pop" stroke={3} />}
          {burst && <Burst color="#2dd4bf" />}
        </button>
      )}
      {it.gym && <span className="grid size-8 shrink-0 place-items-center rounded-xl" style={{ background: `${it.color}22`, color: it.color }}><Icon name="gym" className="size-4" /></span>}
      {it.gym ? <Link href="/gym" className="min-w-0 flex-1">{content}</Link> : content}
      {onMove && (
        <button onClick={onMove} title={moveLabel} aria-label={moveLabel} className="grid size-9 place-items-center rounded-lg text-muted/70 transition hover:bg-white/5 hover:text-white">
          <Icon name="chevron" className={`size-4 ${preview ? "rotate-180" : ""}`} />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} aria-label="Eliminar" className="grid size-9 place-items-center rounded-lg text-muted/70 transition hover:bg-pink/10 hover:text-pink">
          <Icon name="trash" className="size-4" />
        </button>
      )}
      {it.gym && <Link href="/gym" aria-label="Abrir entreno" className="grid size-9 place-items-center text-muted"><Icon name="chevron" className="size-4" /></Link>}
    </li>
  );
}

function AddTask({ open, onClose, today, tomorrow }: { open: boolean; onClose: () => void; today: string; tomorrow: string }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState<"hoy" | "mañana">("hoy");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    update((s) => ({ tasks: [...s.tasks, { id: uid(), title: title.trim(), time: time || undefined, date: date === "hoy" ? today : tomorrow, done: false }] }));
    setTitle(""); setTime("");
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Nueva tarea">
      <form onSubmit={submit} className="space-y-4 pb-2 pt-1">
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué tienes que hacer?" className="field text-base" maxLength={120} />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex rounded-[0.9rem] bg-surface-2 p-1">
            {(["hoy", "mañana"] as const).map((d) => (
              <button type="button" key={d} onClick={() => setDate(d)}
                className={`flex-1 rounded-[0.7rem] py-2.5 text-sm capitalize transition ${date === d ? "seg-on" : "text-muted"}`}>{d}</button>
            ))}
          </div>
          <label className="relative">
            <span className="sr-only">Hora</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field num h-full" />
          </label>
        </div>
        <p className="text-xs text-muted">La hora es opcional. Las tareas de “mañana” pasan a hoy automáticamente al cambiar el día.</p>
        <button className="btn-primary w-full rounded-2xl py-3.5 transition active:scale-[.98] disabled:opacity-40" disabled={!title.trim()}>Añadir</button>
      </form>
    </Sheet>
  );
}

function GymCard({ hub, today }: { hub: State; today: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - ((parseKey(today).getDay() + 6) % 7)));
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Esta semana</p>
        <Link href="/progreso" className="text-xs text-muted hover:text-white">Ver progreso →</Link>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const r = getRoutine(hub);
          const day = r?.days.find((x) => x.id === r.plan[parseKey(d).getDay()]);
          const did = hasWork(hub.workouts[d]);
          const isToday = d === today;
          return (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] uppercase ${isToday ? "text-white" : "text-muted"}`}>{parseKey(d).toLocaleDateString("es", { weekday: "narrow" })}</span>
              <span className={`grid aspect-square w-full place-items-center rounded-xl text-[9px] font-semibold transition ${isToday ? "ring-1 ring-white/30" : ""}`}
                style={{ background: did ? day?.color ?? "#2dd4bf" : day ? `${day.color}1f` : "rgb(255 255 255 / .03)", color: did ? "#000" : day?.color }}>
                {did ? <Icon name="check" className="size-3.5" stroke={3} /> : day?.name.slice(0, 2).toUpperCase() ?? ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
