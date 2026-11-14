"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/icons";

const ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con ese correo. Prueba a entrar.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese correo. Prueba a entrar.",
  PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres.",
  INVALID_EMAIL: "Ese correo no parece válido.",
  EMAIL_NOT_VERIFIED: "Verifica tu correo antes de entrar.",
};
const message = (e: { code?: string; message?: string } | null) =>
  (e?.code && ERRORS[e.code]) || e?.message || "Algo salió mal. Inténtalo de nuevo.";

/** Only same-site paths, never protocol-relative */
function safeRedirect() {
  const r = new URLSearchParams(window.location.search).get("redirectTo") ?? "/";
  return r.startsWith("/") && !r.startsWith("//") && !r.startsWith("/auth") ? r : "/";
}

export default function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"" | "email" | "google">("");
  const [error, setError] = useState("");

  // recarga completa: el servidor lee la cookie nueva y no queda estado viejo en memoria
  const done = () => window.location.replace(safeRedirect());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy("email");
    try {
      const { error } = mode === "in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name.trim() || email.split("@")[0] });
      if (error) setError(message(error));
      else done();
    } catch (err) {
      setError(message(err as Error));
    }
    setBusy("");
  };

  const google = async () => {
    setError(""); setBusy("google");
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: safeRedirect() });
      if (error) { setError(message(error)); setBusy(""); }
    } catch (err) {
      setError(message(err as Error)); setBusy("");
    }
  };

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Tu día: agenda que se va completando (solo decorativa) */}
      <section aria-hidden className="relative hidden flex-col justify-between overflow-hidden border-r border-line p-10 lg:flex xl:p-14">
        <Brand />
        <Agenda />
        <p className="text-xs text-muted">Tareas del día · Rutina de gimnasio · Progreso</p>
      </section>

      {/* Acceso */}
      <section className="flex items-center justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-8">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-8 lg:hidden"><Brand /></div>
          <MiniAgenda />
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{mode === "in" ? "Hola de nuevo" : "Empieza tu día"}</h1>
          <p className="mt-2 text-sm text-muted">{mode === "in" ? "Entra para ver lo que te toca hoy." : "Crea tu cuenta: tareas y entreno, sincronizados en todos tus dispositivos."}</p>

          <button onClick={google} disabled={!!busy}
            className="btn-primary mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-2xl active:scale-[.98] disabled:opacity-60">
            {busy === "google" ? <Spinner dark /> : <GoogleLogo />}
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />o con tu correo<span className="h-px flex-1 bg-line" />
          </div>

          <div className="relative mb-4 flex rounded-2xl bg-surface-2 p-1 text-sm" role="tablist" aria-label="Modo de acceso">
            <span aria-hidden className="seg-on absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl"
              style={{ transform: `translateX(${mode === "up" ? 100 : 0}%)`, transition: "transform .4s cubic-bezier(.34,1.3,.5,1)" }} />
            {([["in", "Entrar"], ["up", "Crear cuenta"]] as const).map(([v, l]) => (
              <button key={v} type="button" role="tab" aria-selected={mode === v} onClick={() => { setMode(v); setError(""); }}
                className={`relative z-10 h-10 flex-1 rounded-xl transition-colors duration-300 ${mode === v ? "text-white" : "text-muted"}`}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <label className="block animate-fade">
                <span className="sr-only">Nombre</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" className="field text-base" />
              </label>
            )}
            <label className="block">
              <span className="sr-only">Correo</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" inputMode="email" className="field text-base" />
            </label>
            <label className="relative block">
              <span className="sr-only">Contraseña</span>
              <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña (mín. 8)" autoComplete={mode === "in" ? "current-password" : "new-password"} className="field pr-20 text-base" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}
                className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg px-3 text-xs text-muted transition hover:text-white">
                {show ? "Ocultar" : "Ver"}
              </button>
            </label>

            {error && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-sm text-red-300 animate-fade">{error}</p>}

            <button disabled={!!busy}
              className="seg-on flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line font-medium transition active:scale-[.98] disabled:opacity-60">
              {busy === "email" && <Spinner />}
              {mode === "in" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Agenda de ejemplo: las tareas se marcan una a una; el entreno lleva el acento de la app.
const DAY: { t: string; label: string; gym?: boolean }[] = [
  { t: "07:00", label: "Despertar sin snooze" },
  { t: "08:30", label: "Leer 20 minutos" },
  { t: "13:00", label: "Revisar pendientes" },
  { t: "18:00", label: "Empuje · pecho, hombro, tríceps", gym: true },
  { t: "21:30", label: "Planear mañana" },
];

function Agenda() {
  return (
    <div className="max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Hoy</p>
      <h2 className="mt-2 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
        Tu día y tu entreno,<br /><span className="text-muted">en un solo lugar.</span>
      </h2>
      <ol className="relative mt-10 space-y-3">
        {DAY.map((d, i) => (
          <li key={d.t} className="grid grid-cols-[3rem_1rem_1fr] items-center gap-3 animate-rise" style={{ animationDelay: `${150 + i * 90}ms` }}>
            <span className="num text-xs text-muted">{d.t}</span>
            <span className="grid size-4 place-items-center rounded-full border border-line bg-bg">
              {/* cada tarea se marca después de la anterior */}
              <span className="size-2 rounded-full bg-pink [animation:pop_.35s_cubic-bezier(.3,1.6,.5,1)_both]" style={{ animationDelay: `${900 + i * 450}ms` }} />
            </span>
            <span className={`card flex items-center justify-between gap-3 px-4 py-3 text-sm ${d.gym ? "border-pink/30" : ""}`}>
              <span className="truncate">{d.label}</span>
              {d.gym && <span className="shrink-0 rounded-full bg-pink/15 px-2 py-0.5 text-[10px] font-medium text-pink">Entreno</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** En móvil y tablet: tres tareas compactas sobre el formulario, para que se entienda de qué va la app. */
function MiniAgenda() {
  return (
    <ul aria-hidden className="mb-7 space-y-2 lg:hidden">
      {DAY.slice(1, 4).map((d, i) => (
        <li key={d.t} className="card flex items-center gap-3 px-3.5 py-2.5 text-sm animate-rise" style={{ animationDelay: `${100 + i * 80}ms` }}>
          <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line">
            <span className="size-2.5 rounded-full bg-pink [animation:pop_.35s_cubic-bezier(.3,1.6,.5,1)_both]" style={{ animationDelay: `${700 + i * 400}ms` }} />
          </span>
          <span className="num w-11 shrink-0 text-xs text-muted">{d.t}</span>
          <span className="truncate">{d.label}</span>
          {d.gym && <span className="ml-auto shrink-0 rounded-full bg-pink/15 px-2 py-0.5 text-[10px] font-medium text-pink">Entreno</span>}
        </li>
      ))}
    </ul>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <div><p className="font-semibold">Mi Espacio</p><p className="text-xs text-muted">Tareas y entreno</p></div>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return <span className={`size-4 animate-spin rounded-full border-2 ${dark ? "border-black/20 border-t-black" : "border-white/20 border-t-white"}`} />;
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c1-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}
