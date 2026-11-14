"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { AreaChart, Bars, CountUp, Heatmap, Ring, Select } from "@/components/ui";
import { useHub, useToday } from "@/lib/store";
import { addDays, exerciseHistory, hasWork, parseKey, streak, volume, weekStart } from "@/lib/logic";
import { EMPTY_PLAN, getRoutine } from "@/lib/routine";
import { EXERCISES, MUSCLE_LABEL, getEx, type Muscle } from "@/lib/exercises";

const short = (k: string) => `${+k.slice(8)}/${+k.slice(5, 7)}`;

export default function Progress() {
  const hub = useHub()!;
  const today = useToday();
  const W = hub.workouts;
  const dates = Object.keys(W).filter((d) => hasWork(W[d])).sort();
  const thisWeek = weekStart(today);
  const routine = getRoutine(hub);
  const plan = routine?.plan ?? EMPTY_PLAN;
  const plannedPerWeek = plan.filter(Boolean).length || 1;

  const weekVol = (ws: string) => dates.filter((d) => weekStart(d) === ws).reduce((a, d) => a + Object.values(W[d].sets).reduce((b, s) => b + volume(s), 0), 0);
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, (i - 7) * 7));
  const vols = weeks.map(weekVol);
  const vNow = vols[7], vPrev = vols[6];
  const vDelta = vPrev ? ((vNow - vPrev) / vPrev) * 100 : 0;
  const sessionsWeek = dates.filter((d) => weekStart(d) === thisWeek).length;
  const st = streak(W, plan, today);
  const totalSets = dates.reduce((a, d) => a + Object.values(W[d].sets).reduce((b, s) => b + s.filter((x) => x.done).length, 0), 0);

  // heatmap: 18 weeks
  const heat = Array.from({ length: 18 }, (_, i) => {
    const ws = addDays(thisWeek, (i - 17) * 7);
    return Array.from({ length: 7 }, (_, d) => {
      const date = addDays(ws, d);
      const v = hasWork(W[date]) ? Math.min(1, Object.values(W[date].sets).reduce((b, s) => b + s.filter((x) => x.done).length, 0) / 20) || 0.5 : 0;
      return { date, v: date > today ? 0 : v, planned: !!plan[parseKey(date).getDay()] && date <= today };
    });
  });

  // muscle weekly sets (primary = 1, secondary = 0.5)
  const muscleSets = (() => {
    const acc: Partial<Record<Muscle, number>> = {};
    for (const d of dates.filter((d) => weekStart(d) === thisWeek))
      for (const [id, sets] of Object.entries(W[d].sets)) {
        const n = sets.filter((s) => s.done).length, ex = getEx(id, hub.custom);
        if (!ex || !n) continue;
        ex.muscles.forEach((m, i) => (acc[m] = (acc[m] ?? 0) + (i === 0 ? n : n * 0.5)));
      }
    return acc;
  })();
  const tracked: Muscle[] = ["pecho", "dorsal", "espalda-alta", "hombro-lat", "hombro-post", "biceps", "triceps", "cuadriceps", "isquios", "gluteo", "gemelos", "abdomen"];

  // exercises with history
  const logged = [...Object.keys(hub.custom), ...Object.keys(EXERCISES)].filter((id) => dates.some((d) => W[d].sets[id]?.some((s) => s.done)));
  const [sel, setSel] = useState<string | null>(null);
  const exId = sel && logged.includes(sel) ? sel : logged[0];
  const hist = exId ? exerciseHistory(W, exId) : [];
  const first = hist[0]?.e1rm ?? 0, lastP = hist[hist.length - 1];
  const gain = first ? ((lastP.e1rm - first) / first) * 100 : 0;
  const best = Math.max(0, ...hist.map((h) => h.e1rm));
  const unit = lastP && lastP.top.w === 0 ? "reps" : "kg";

  // recent PRs
  const prs = (() => {
    const out: { date: string; id: string; val: number }[] = [];
    for (const id of logged) {
      let b = 0;
      for (const h of exerciseHistory(W, id)) { if (b && h.e1rm > b) out.push({ date: h.date, id, val: h.e1rm }); b = Math.max(b, h.e1rm); }
    }
    return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  })();

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <p className="text-sm text-muted">Tus números</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Progreso</h1>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card relative overflow-hidden p-5 animate-rise">
          <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-orange/20 blur-2xl" />
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted"><Icon name="flame" className="size-3.5 text-orange" />Racha</p>
          <p className="mt-2 text-5xl font-extralight"><CountUp value={st} /></p>
          <p className="text-xs text-muted">entrenos seguidos</p>
        </div>
        <div className="card p-5 animate-rise [animation-delay:60ms]">
          <p className="text-[11px] uppercase tracking-widest text-muted">Semana</p>
          <div className="mt-2 flex items-center gap-3">
            <Ring value={sessionsWeek / plannedPerWeek} size={64} stroke={6} colors={["#87b2c6", "#8e8e9a"]}>
              <p className="num text-base font-semibold">{sessionsWeek}<span className="text-muted">/{plannedPerWeek}</span></p>
            </Ring>
            <p className="text-xs text-muted">sesiones</p>
          </div>
        </div>
        <div className="card p-5 animate-rise [animation-delay:120ms]">
          <p className="text-[11px] uppercase tracking-widest text-muted">Volumen semana</p>
          <p className="mt-2 text-3xl font-extralight sm:text-4xl"><CountUp value={vNow / 1000} decimals={1} /><span className="ml-1 text-base text-muted">t</span></p>
          {vPrev > 0 && <p className={`num mt-1 flex items-center text-xs ${vDelta >= 0 ? "text-teal" : "text-pink"}`}><Icon name={vDelta >= 0 ? "up" : "down"} className="size-3.5" stroke={2.5} />{Math.abs(vDelta).toFixed(0)}% vs. anterior</p>}
        </div>
        <div className="card p-5 animate-rise [animation-delay:180ms]">
          <p className="text-[11px] uppercase tracking-widest text-muted">Total</p>
          <p className="mt-2 text-3xl font-extralight sm:text-4xl"><CountUp value={dates.length} /><span className="ml-1 text-base text-muted">sesiones</span></p>
          <p className="num mt-1 text-xs text-muted">{totalSets.toLocaleString("es")} series</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Exercise chart */}
        <section className="card relative z-10 p-5 sm:p-6 animate-rise">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{unit === "kg" ? "1RM estimado" : "Mejores reps"}</h2>
            {logged.length > 0 && (
              <Select value={exId} onChange={setSel} label="Ejercicio" className="w-[60%] max-w-72"
                options={logged.map((id) => ({ value: id, label: getEx(id, hub.custom).name }))} />
            )}
          </div>
          {hist.length ? (
            <>
              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div><p className="text-[10px] uppercase tracking-widest text-muted">Actual</p><p className="text-5xl font-extralight"><CountUp value={lastP.e1rm} decimals={unit === "kg" ? 1 : 0} /><span className="ml-1 text-base text-muted">{unit}</span></p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-muted">Desde el inicio</p>
                  <p className={`num flex items-center text-2xl ${gain >= 0 ? "text-teal" : "text-pink"}`}><Icon name={gain >= 0 ? "up" : "down"} className="size-5" stroke={2.5} />{gain >= 0 ? "+" : ""}<CountUp value={gain} decimals={1} />%</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-muted">Mejor serie</p><p className="num text-lg">{lastP.top.w ? `${lastP.top.w} kg × ${lastP.top.r}` : `${lastP.top.r} reps`}</p></div>
              </div>
              <div className="mt-6" key={exId}><AreaChart values={hist.map((h) => h.e1rm)} labels={hist.map((h) => short(h.date))} color="#df9aa7" height={170} /></div>
              {best === lastP.e1rm && hist.length > 1 && <p className="mt-3 flex items-center gap-2 text-xs text-orange"><Icon name="trophy" className="size-4" />Estás en tu mejor marca</p>}
            </>
          ) : <Empty />}
        </section>

        {/* Weekly volume */}
        <section className="card p-5 sm:p-6 animate-rise [animation-delay:80ms]">
          <h2 className="font-semibold">Volumen semanal</h2>
          <p className="text-xs text-muted">kg × reps · últimas 8 semanas</p>
          <div className="mt-6"><Bars values={vols} labels={weeks.map(short)} /></div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* Muscle sets */}
        <section className="card p-5 sm:p-6 animate-rise">
          <h2 className="font-semibold">Series por músculo · semana</h2>
          <p className="text-xs text-muted">Zona óptima de hipertrofia: 10–20 series</p>
          <ul className="mt-5 space-y-3">
            {tracked.map((m, i) => {
              const v = muscleSets[m] ?? 0, pct = Math.min(100, (v / 20) * 100);
              const color = v >= 10 ? "#82c1ae" : v >= 5 ? "#87b2c6" : "#8e8e9a";
              return (
                <li key={m} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="truncate text-muted">{MUSCLE_LABEL[m]}</span>
                  <span className="relative h-2 overflow-hidden rounded-full bg-white/5">
                    <span className="absolute inset-y-0 left-1/2 w-1/2 border-l border-dashed border-white/15 bg-teal/[0.06]" />
                    <span className="absolute inset-y-0 left-0 origin-left rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}88`, animation: `rise .6s ${i * 40}ms both` }} />
                  </span>
                  <span className="num text-right">{v % 1 ? v.toFixed(1) : v}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-5">
          {/* Heatmap */}
          <section className="card p-5 sm:p-6 animate-rise [animation-delay:80ms]">
            <h2 className="font-semibold">Constancia</h2>
            <p className="mb-4 text-xs text-muted">Últimas 18 semanas</p>
            <Heatmap cells={heat} />
            <div className="mt-4 flex flex-wrap gap-2">
              {(routine?.days ?? []).map((d) => {
                const n = dates.filter((x) => W[x].dayId === d.id).length;
                return <span key={d.id} className="num rounded-full px-3 py-1 text-xs" style={{ background: `${d.color}1a`, color: d.color }}>{d.name} · {n}</span>;
              })}
            </div>
          </section>

          {/* PRs */}
          <section className="card p-5 sm:p-6 animate-rise [animation-delay:140ms]">
            <h2 className="flex items-center gap-2 font-semibold"><Icon name="trophy" className="size-4 text-orange" />Récords recientes</h2>
            {prs.length ? (
              <ul className="mt-4 divide-y divide-line">
                {prs.map((p) => (
                  <li key={p.id + p.date} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="flex-1 truncate">{getEx(p.id, hub.custom).name}</span>
                    <span className="num text-orange">{p.val.toFixed(1)} kg</span>
                    <span className="num w-12 text-right text-xs text-muted">{short(p.date)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-muted">Supera una marca anterior y aparecerá aquí.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-56 place-items-center text-center text-sm text-muted">
      <div><Icon name="chart" className="mx-auto mb-3 size-8 opacity-40" />Registra tu primera serie en Entreno<br />para ver tu curva de fuerza.</div>
    </div>
  );
}
