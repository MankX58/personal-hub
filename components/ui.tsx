"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icons";
import type { Muscle } from "@/lib/exercises";

/** Animated number that counts up when value changes */
export function CountUp({ value, decimals = 0, className = "" }: { value: number; decimals?: number; className?: string }) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now(), a = from.current, dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      setV(a + (value - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`num ${className}`}>{(Math.round(v * 10 ** decimals) / 10 ** decimals || 0).toLocaleString("es", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

export function Ring({ value, size = 120, stroke = 10, colors = ["#df9aa7", "#8e8e9a"], children }:
  { value: number; size?: number; stroke?: number; colors?: [string, string] | string[]; children?: React.ReactNode }) {
  const id = useId(), r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} /><stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.06)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${id})`} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Smooth area chart. Pass ≥1 values. */
export function AreaChart({ values, color = "#8e8e9a", height = 140, labels }: { values: number[]; color?: string; height?: number; labels?: string[] }) {
  const id = useId();
  const W = 320, H = 100, pad = 6;
  if (!values.length) return null;
  const pts = values.length === 1 ? [values[0], values[0]] : values;
  const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const xy = pts.map((v, i) => [pad + (i * (W - pad * 2)) / (pts.length - 1), H - pad - ((v - min) / span) * (H - pad * 2 - 14)] as const);
  // Catmull-Rom → bezier
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[i - 1] ?? xy[i], p1 = xy[i], p2 = xy[i + 1], p3 = xy[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const last = xy[xy.length - 1];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full overflow-visible" style={{ height }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".45" /><stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgb(255 255 255 / .05)" vectorEffect="non-scaling-stroke" />)}
        <path d={`${d} L${last[0]},${H} L${xy[0][0]},${H} Z`} fill={`url(#${id})`} className="animate-fade" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round"
          pathLength={1000} strokeDasharray={1000} style={{ animation: "draw 1.2s cubic-bezier(.2,.8,.2,1) both" }} />
      </svg>
      {labels && (
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{labels[0]}</span><span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

export function Bars({ values, labels, color = "#87b2c6", highlightLast = true }: { values: number[]; labels: string[]; color?: string; highlightLast?: boolean }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-36 items-end gap-1.5 sm:gap-2.5">
      {values.map((v, i) => {
        const last = highlightLast && i === values.length - 1;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="relative w-full flex-1">
              <div className="absolute inset-x-0 bottom-0 origin-bottom rounded-lg"
                style={{
                  height: `${Math.max(3, (v / max) * 100)}%`,
                  background: last ? `linear-gradient(180deg, ${color}, ${color}55)` : "rgb(255 255 255 / .08)",
                  animation: `grow .8s ${i * 50}ms cubic-bezier(.2,.8,.2,1) both`,
                }} />
            </div>
            <span className={`text-[10px] ${last ? "text-white" : "text-muted"}`}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Weeks × days grid (Mon..Sun rows) */
export function Heatmap({ cells }: { cells: { date: string; v: number; planned: boolean }[][] }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto">
      {cells.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((c) => (
            <div key={c.date} title={c.date}
              className="size-3.5 rounded-[4px] sm:size-4"
              style={{
                background: c.v > 0 ? `rgb(223 154 167 / ${0.25 + Math.min(1, c.v) * 0.75})` : c.planned ? "rgb(255 255 255 / .09)" : "rgb(255 255 255 / .03)",
                animation: `fade .4s ${i * 25}ms both`,
              }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Bottom sheet on phones, centered dialog on larger screens */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal>
      <div className="absolute inset-0 animate-fade bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative max-h-[92dvh] w-full animate-sheet overflow-y-auto rounded-b-none pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:animate-rise sm:rounded-b-3xl">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-surface/90 px-5 pb-3 pt-3 backdrop-blur-xl">
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15 sm:hidden" />
          <div className="mt-3 flex-1 text-lg font-semibold">{title}</div>
          <button onClick={onClose} aria-label="Cerrar" className="mt-3 grid size-9 place-items-center rounded-full bg-white/5 text-muted transition hover:text-white">
            <Icon name="x" className="size-4" />
          </button>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  );
}

/** Little particle burst for PRs / completions */
export function Burst({ color = "#d9a574" }: { color?: string }) {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <span key={i} className="absolute size-1.5 rounded-full"
          style={{ background: i % 2 ? color : "#df9aa7", ["--x" as string]: `${Math.cos(a) * 34}px`, ["--y" as string]: `${Math.sin(a) * 34}px`, animation: "burst .7s ease-out both" }} />;
      })}
    </span>
  );
}

/** Smooth height expand/collapse (CSS grid 0fr → 1fr). Content stays mounted so inputs keep state. */
export function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Staggered entrance that replays every time `play` becomes true */
export const stagger = (play: boolean, i: number) =>
  play ? { animation: `drop .4s ${80 + i * 50}ms cubic-bezier(.2,.8,.2,1) both` } : undefined;

export type Option = { value: string; label: string; color?: string };

/** Custom select with animated, staggered options (native <select> can't be styled/animated) */
export function Select({ value, options, onChange, className = "", label }: { value: string; options: Option[]; onChange: (v: string) => void; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.find((o) => o.value === value);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  const dot = (c?: string) => <span className="size-2.5 shrink-0 rounded-full" style={{ background: c ?? "rgb(255 255 255 / .15)" }} />;
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        className="field flex items-center gap-2.5 py-2.5 text-left text-sm">
        {options.some((o) => o.color) && dot(cur?.color)}
        <span className="flex-1 truncate">{cur?.label}</span>
        <Icon name="down" className={`size-4 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul role="listbox" className="glass absolute left-0 top-full z-30 mt-2 w-max min-w-full max-w-[80vw] max-h-72 origin-top overflow-y-auto rounded-2xl !bg-surface-2/95 p-1.5 shadow-2xl shadow-black/60"
          style={{ animation: "drop .22s cubic-bezier(.2,.8,.2,1) both" }}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${o.value === value ? "bg-white/[0.07] text-white" : "text-white/75 hover:bg-white/[0.04] hover:text-white"}`}
                style={{ animation: `drop .3s ${i * 35}ms cubic-bezier(.2,.8,.2,1) both` }}>
                {options.some((x) => x.color) && dot(o.color)}
                <span className="flex-1 truncate">{o.label}</span>
                {o.value === value && <Icon name="check" className="size-4 text-white/70" stroke={2.4} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Muscle map ----------
type Shape = { m: Muscle; d: string };
const el = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;
const pair = (m: Muscle, cx: number, cy: number, rx: number, ry: number): Shape[] =>
  [{ m, d: el(50 - cx, cy, rx, ry) }, { m, d: el(50 + cx, cy, rx, ry) }];

const FRONT: Shape[] = [
  ...pair("hombro-ant", 17, 44, 7, 6.5), ...pair("hombro-lat", 21.5, 47, 3.5, 6),
  ...pair("pecho", 8.5, 55, 8.5, 7), ...pair("biceps", 23, 66, 4.5, 9.5), ...pair("antebrazo", 26, 89, 4, 11),
  { m: "abdomen", d: "M43,66 h14 a2,2 0 0 1 2,2 v30 q-9,6 -18,0 v-30 a2,2 0 0 1 2,-2Z" },
  ...pair("oblicuos", 13, 82, 3.5, 11), ...pair("cuadriceps", 8.5, 128, 7.5, 21), ...pair("aductores", 3, 120, 2.5, 11),
  ...pair("gemelos", 9, 170, 4, 13),
];
const BACK: Shape[] = [
  { m: "espalda-alta", d: "M40,38 L50,33 L60,38 L62,52 L50,60 L38,52Z" }, ...pair("hombro-post", 18, 45, 6.5, 6),
  ...pair("dorsal", 11, 66, 8, 14), ...pair("triceps", 23, 64, 4.5, 10), ...pair("antebrazo", 26, 89, 4, 11),
  { m: "lumbar", d: "M44,80 h12 v16 q-6,4 -12,0Z" }, ...pair("gluteo", 7.5, 106, 8, 8.5),
  ...pair("isquios", 8.5, 134, 7, 18), ...pair("gemelos", 9, 168, 5, 12),
];

function Figure({ shapes, active, primary, label }: { shapes: Shape[]; active: Set<Muscle>; primary?: Muscle; label: string }) {
  const id = useId();
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 190" className="h-52 w-auto">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#df9aa7" /><stop offset="1" stopColor="#8e8e9a" /></linearGradient>
        </defs>
        {/* silhouette */}
        <g fill="rgb(255 255 255 / .04)" stroke="rgb(255 255 255 / .08)" strokeWidth=".6">
          <circle cx="50" cy="17" r="10" />
          <path d="M44,27 h12 v6 l14,6 q6,3 7,10 l6,38 q1,8 -2,14 l-4,4 -3,-4 -4,-34 -4,-8 v30 l3,20 q2,30 0,48 l-2,22 h-8 l-3,-40 -4,-28 -4,28 -3,40 h-8 l-2,-22 q-2,-18 0,-48 l3,-20 v-30 l-4,8 -4,34 -3,4 -4,-4 q-3,-6 -2,-14 l6,-38 q1,-7 7,-10 l14,-6Z" />
        </g>
        {shapes.map((s, i) => {
          const on = active.has(s.m);
          return <path key={i} d={s.d} fill={on ? `url(#${id})` : "rgb(255 255 255 / .06)"}
            opacity={on ? (s.m === primary ? 1 : 0.55) : 1}
            />;
        })}
      </svg>
      <figcaption className="text-[10px] uppercase tracking-widest text-muted">{label}</figcaption>
    </figure>
  );
}

export function MuscleMap({ muscles }: { muscles: Muscle[] }) {
  const active = new Set(muscles);
  return (
    <div className="flex justify-center gap-6">
      <Figure shapes={FRONT} active={active} primary={muscles[0]} label="Frontal" />
      <Figure shapes={BACK} active={active} primary={muscles[0]} label="Posterior" />
    </div>
  );
}
