"use client";
import { useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Icon } from "@/components/icons";
import { Select } from "@/components/ui";
import { disconnect, exportData, importData, update, useHub } from "@/lib/store";
import Link from "next/link";
import { WEEKDAYS, getRoutine } from "@/lib/routine";
import { OtherApps } from "@/components/OtherApps";

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

export default function Settings() {
  const hub = useHub()!;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const routine = getRoutine(hub);
  const days = routine?.days ?? [];
  const setPlan = (wd: number, v: string) => update((s) => ({ routines: s.routines.map((r) => { if (r.id !== routine?.id) return r; const p = [...r.plan]; p[wd] = v || null; return { ...r, plan: p }; }) }));
  const setTime = (wd: number, v: string) => update((s) => { const t = [...s.gymTimes]; t[wd] = v; return { gymTimes: t }; });

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([exportData()], { type: "application/json" }));
    a.download = `hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const upload = async (f?: File) => {
    if (!f) return;
    try { importData(await f.text()); setMsg("Datos importados ✓"); } catch (e) { setMsg((e as Error).message); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 animate-rise lg:mb-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">Ajustes</h1>
        <p className="text-xs text-muted sm:text-sm">Personaliza tu hub y administra tu cuenta</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
      <Account />

      <div className="space-y-6">
      <Group title="Entreno">
      <section className="relative z-10 p-4 sm:p-5">
        <h2 className="text-sm font-medium">Semana de entreno</h2>
        <p className="mt-0.5 text-xs text-muted">
          {routine ? <>Rutina activa: <b className="font-medium text-white">{routine.name}</b>. </> : null}
          Elige qué día toca cada día y, si quieres, a qué hora. Sin hora, el entreno aparece el primero en tus tareas.
        </p>
        {!routine && <Link href="/gym" className="btn-primary mt-4 inline-block rounded-xl px-4 py-2.5 text-sm">Crear mi rutina</Link>}
        <ul className={`mt-5 space-y-2 ${routine ? "" : "hidden"}`}>
          {ORDER.map((wd) => {
            const day = days.find((d) => d.id === routine?.plan[wd]);
            return (
              <li key={wd} className="grid grid-cols-[2.25rem_minmax(0,1fr)_6.25rem] items-center gap-2 sm:grid-cols-[6rem_minmax(0,1fr)_8rem] sm:gap-3">
                <span className="text-sm"><span className="sm:hidden">{WEEKDAYS[wd].slice(0, 3)}</span><span className="hidden sm:inline">{WEEKDAYS[wd]}</span></span>
                <Select value={routine?.plan[wd] ?? ""} onChange={(v) => setPlan(wd, v)} label={`Rutina ${WEEKDAYS[wd]}`}
                  options={[{ value: "", label: "Descanso" }, ...days.map((d) => ({ value: d.id, label: d.name || "Sin nombre", color: d.color }))]} />
                <input type="time" value={hub.gymTimes[wd]} disabled={!day} onChange={(e) => setTime(wd, e.target.value)}
                  className="field num min-w-0 px-2 py-2.5 text-center text-sm disabled:opacity-30" aria-label={`Hora ${WEEKDAYS[wd]}`} />
              </li>
            );
          })}
        </ul>
      </section>
      </Group>

      <Group title="Tareas" delay={60}>
      <section className="p-4 sm:p-5">
        <h2 className="text-sm font-medium">Al cambiar de día</h2>
        <p className="mt-0.5 text-xs text-muted">Qué pasa con las tareas del día anterior.</p>
        <div className="mt-4 flex rounded-[0.9rem] bg-surface-2 p-1">
          {([["archive", "Archivar"], ["delete", "Borrar"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => update(() => ({ rolloverMode: v }))}
              className={`flex-1 rounded-[0.7rem] py-2.5 text-sm transition ${hub.rolloverMode === v ? "seg-on" : "text-muted"}`}>{l}</button>
          ))}
        </div>
        {hub.archive.length > 0 && (
          <button onClick={() => confirm("¿Vaciar el historial de tareas? No se puede deshacer.") && update(() => ({ archive: [] }))}
            className="mt-3 text-xs text-muted underline-offset-4 hover:text-pink hover:underline">Vaciar historial ({hub.archive.length})</button>
        )}
      </section>
      </Group>

      <Group title="Datos" delay={120}>
      <section className="p-4 sm:p-5">
        <h2 className="text-sm font-medium">Tus datos</h2>
        <p className="mt-0.5 text-xs text-muted">Se guardan en tu cuenta y se sincronizan entre dispositivos. También puedes exportar una copia.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={download} className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition hover:bg-white/10">Exportar</button>
          <button onClick={() => file.current?.click()} className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition hover:bg-white/10">Importar</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        {msg && <p className="mt-3 text-xs text-teal animate-fade">{msg}</p>}
      </section>
      </Group>
      </div>
      </div>
    </div>
  );
}

/** Mismo formato que los grupos de Ajustes en Mi semestre: etiqueta pequeña + tarjeta. */
function Group({ title, delay = 0, children }: { title: string; delay?: number; children: React.ReactNode }) {
  return (
    <section className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</h2>
      <div className="card divide-y divide-line overflow-hidden">{children}</div>
    </section>
  );
}

function Account() {
  const { data } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const user = data?.user;
  const logout = async () => {
    setBusy(true);
    try {
      await disconnect(); // flush unsynced changes first
      await fetch("/api/logout", { method: "POST", cache: "no-store" });
    } finally {
      // full reload: clears the cached session, router cache and in-memory data
      window.location.replace("/auth/sign-in");
    }
  };
  return (
    <section className="card animate-rise p-5 text-center lg:sticky lg:top-10">
      {user?.image && !imgFailed
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={user.image} alt="" referrerPolicy="no-referrer" onError={() => setImgFailed(true)} className="mx-auto size-16 rounded-2xl object-cover" />
        : <span className="grad mx-auto grid size-16 place-items-center rounded-2xl text-2xl font-semibold">{(user?.name || user?.email || "?")[0].toUpperCase()}</span>}
      <p className="mt-3 truncate font-semibold">{user?.name || "Tu cuenta"}</p>
      <p className="truncate text-xs text-muted">{user?.email ?? "…"}</p>
      <button onClick={logout} disabled={busy}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 active:scale-[0.97] disabled:opacity-60">
        <Icon name="logout" className="size-4" />{busy ? "Saliendo…" : "Cerrar sesión"}
      </button>
      <p className="mt-3 text-xs text-muted">
        <a href="/terminos.html" target="_blank" rel="noreferrer" className="underline">Términos</a> · <a href="/privacidad.html" target="_blank" rel="noreferrer" className="underline">Privacidad</a>
      </p>
      <OtherApps />
    </section>
  );
}
