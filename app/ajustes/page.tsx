"use client";
import { useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Icon } from "@/components/icons";
import { Select } from "@/components/ui";
import { disconnect, exportData, importData, update, useHub } from "@/lib/store";
import Link from "next/link";
import { WEEKDAYS, getRoutine } from "@/lib/routine";

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
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="animate-rise">
        <p className="text-sm text-muted">Personaliza tu hub</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Ajustes</h1>
      </header>

      <Account />

      <section className="card relative z-10 p-5 sm:p-6 animate-rise">
        <h2 className="font-semibold">Semana de entreno</h2>
        <p className="mt-1 text-xs text-muted">
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

      <section className="card p-5 sm:p-6 animate-rise [animation-delay:60ms]">
        <h2 className="font-semibold">Al cambiar de día</h2>
        <p className="mt-1 text-xs text-muted">Qué pasa con las tareas del día anterior.</p>
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


      <section className="card p-5 sm:p-6 animate-rise [animation-delay:180ms]">
        <h2 className="font-semibold">Tus datos</h2>
        <p className="mt-1 text-xs text-muted">Se guardan en tu cuenta y se sincronizan entre dispositivos. También puedes exportar una copia.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={download} className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition hover:bg-white/10">Exportar</button>
          <button onClick={() => file.current?.click()} className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition hover:bg-white/10">Importar</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        {msg && <p className="mt-3 text-xs text-teal animate-fade">{msg}</p>}
      </section>
    </div>
  );
}

function Account() {
  const { data } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const user = data?.user;
  const logout = async () => {
    setBusy(true);
    try {
      await disconnect(); // flush unsynced changes first
      await fetch("/api/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    } finally {
      // full reload: clears the cached session, router cache and in-memory data
      window.location.replace("/auth/sign-in");
    }
  };
  return (
    <section className="card flex items-center gap-4 p-5 sm:p-6 animate-rise">
      {user?.image
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-12 rounded-2xl object-cover" />
        : <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.06] text-lg font-semibold">{(user?.name || user?.email || "?")[0].toUpperCase()}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{user?.name || "Tu cuenta"}</p>
        <p className="truncate text-xs text-muted">{user?.email ?? "…"}</p>
      </div>
      <button onClick={logout} disabled={busy}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm transition hover:bg-pink/10 hover:text-pink disabled:opacity-50">
        <Icon name="logout" className="size-4" />{busy ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </section>
  );
}
