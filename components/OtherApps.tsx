// Enlaces discretos a las otras apps del mismo autor (cada app es independiente). Copia en cada app: si cambias URLs, cámbialas en las 3.
const OTHERS = [
  { name: "Mi semestre", note: "Planner universitario", accent: "#8b9cff", dev: "http://localhost:3001", prod: "https://gestion-universitaria-fikx.vercel.app" },
  { name: "Mis Finanzas", note: "Dinero y tarjeta", accent: "#e8b04b", dev: "http://localhost:5173", prod: "https://mis-finanzas-mankx.vercel.app" },
];

export function OtherApps() {
  const dev = process.env.NODE_ENV === "development";
  return (
    <div className="mt-5 border-t border-line pt-4 text-left">
      <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted">Del mismo autor</p>
      <ul className="space-y-0.5">
        {OTHERS.map((a) => (
          <li key={a.name}>
            <a href={dev ? a.dev : a.prod} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition hover:bg-white/[0.05]">
              <span className="size-2 shrink-0 rounded-full" style={{ background: a.accent }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{a.name}</span>
                <span className="block truncate text-xs text-muted">{a.note}</span>
              </span>
              <span aria-hidden className="text-muted">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
