"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Icon } from "@/components/icons";
import { Ring } from "@/components/ui";

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
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"" | "email" | "google">("");
  const [error, setError] = useState("");

  const done = () => { router.replace(safeRedirect()); router.refresh(); };

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
    <div className="relative grid min-h-dvh overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      {/* ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 size-[28rem] rounded-full bg-pink/20 blur-[110px] animate-glow" />
        <div className="absolute -bottom-40 right-0 size-[32rem] rounded-full bg-violet/20 blur-[120px] animate-glow [animation-delay:1.2s]" />
        <div className="absolute left-1/3 top-1/2 size-72 rounded-full bg-cyan/10 blur-[100px]" />
      </div>

      {/* Showcase (desktop) */}
      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <Brand />
        <div className="max-w-lg">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight animate-rise">
            Tu día y tu entreno,<br /><span className="text-white/45">en un solo lugar.</span>
          </h1>
          <div className="mt-12 grid grid-cols-[auto_1fr] gap-4">
            <div className="card flex items-center gap-4 p-5 animate-rise [animation-delay:120ms]">
              <Ring value={0.8} size={72} stroke={7}><span className="num text-lg font-semibold">4/5</span></Ring>
              <div><p className="text-[10px] uppercase tracking-widest text-muted">Semana</p><p className="text-sm">sesiones</p></div>
            </div>
            <div className="card p-5 animate-rise [animation-delay:200ms]">
              <p className="text-[10px] uppercase tracking-widest text-muted">1RM estimado</p>
              <p className="num mt-1 text-3xl font-light">82,5<span className="ml-1 text-sm text-muted">kg</span></p>
              <p className="num mt-1 flex items-center text-xs text-teal"><Icon name="up" className="size-3.5" stroke={2.5} />+12,4 %</p>
            </div>
            <div className="card col-span-2 flex h-28 items-end gap-2 p-5 animate-rise [animation-delay:280ms]">
              {[30, 45, 38, 60, 52, 70, 64, 88].map((h, i) => (
                <span key={i} className="flex-1 origin-bottom rounded-md" style={{ height: `${h}%`, background: i === 7 ? "#22d3ee" : "rgb(255 255 255 / .08)", boxShadow: i === 7 ? "0 0 18px #22d3ee66" : undefined, animation: `grow .8s ${400 + i * 60}ms cubic-bezier(.2,.8,.2,1) both` }} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted">Tareas · Rutina PPL + UL · Progreso</p>
      </section>

      {/* Form */}
      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <h2 className="text-3xl font-semibold tracking-tight">{mode === "in" ? "Hola de nuevo" : "Crea tu cuenta"}</h2>
          <p className="mt-2 text-sm text-muted">{mode === "in" ? "Entra para seguir con tu día." : "Tus datos se sincronizan entre tu celular y tu PC."}</p>

          <button onClick={google} disabled={!!busy}
            className="btn-primary mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 active:scale-[.98] disabled:opacity-60">
            {busy === "google" ? <Spinner dark /> : <GoogleLogo />}
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />o con tu correo<span className="h-px flex-1 bg-line" />
          </div>

          {/* mode switch */}
          <div className="relative mb-4 flex rounded-2xl bg-surface-2 p-1 text-sm" role="tablist">
            <span aria-hidden className="seg-on absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl"
              style={{ transform: `translateX(${mode === "up" ? 100 : 0}%)`, transition: "transform .45s cubic-bezier(.34,1.4,.5,1)" }} />
            {([["in", "Entrar"], ["up", "Crear cuenta"]] as const).map(([v, l]) => (
              <button key={v} type="button" role="tab" aria-selected={mode === v} onClick={() => { setMode(v); setError(""); }}
                className={`relative z-10 flex-1 rounded-xl py-2.5 transition-colors duration-300 ${mode === v ? "text-white" : "text-muted"}`}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ${mode === "up" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={mode !== "up"}>
              <div className="min-h-0 overflow-hidden">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" className="field" aria-label="Nombre" />
              </div>
            </div>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" className="field" aria-label="Correo" />
            <div className="relative">
              <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" autoComplete={mode === "in" ? "current-password" : "new-password"} className="field pr-20" aria-label="Contraseña" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs text-muted transition hover:text-white">
                {show ? "Ocultar" : "Ver"}
              </button>
            </div>

            {error && <p role="alert" className="rounded-xl bg-pink/10 px-3 py-2.5 text-sm text-pink animate-fade">{error}</p>}

            <button disabled={!!busy}
              className="seg-on flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3.5 font-medium transition active:scale-[.98] disabled:opacity-60">
              {busy === "email" && <Spinner />}
              {mode === "in" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grad grid size-10 place-items-center rounded-2xl font-bold text-white shadow-lg shadow-violet/30">H</div>
      <div><p className="font-semibold">Hub</p><p className="text-xs text-muted">Personal</p></div>
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
