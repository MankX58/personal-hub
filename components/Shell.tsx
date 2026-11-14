"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Logo, type IconName } from "./icons";
import { AppSwitcher } from "./AppSwitcher";
import { useEffect } from "react";
import { connect, useHub, useToday } from "@/lib/store";
import { authClient } from "@/lib/auth/client";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Hoy", icon: "today" },
  { href: "/gym", label: "Entreno", icon: "gym" },
  { href: "/progreso", label: "Progreso", icon: "chart" },
  { href: "/ajustes", label: "Ajustes", icon: "settings" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const hub = useHub();
  const userId = authClient.useSession().data?.user?.id; // proxy.ts already guarantees a session on app pages
  useToday(); // keeps the day rollover running on every screen
  useEffect(() => { if (userId) connect(userId); }, [userId]);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const idx = Math.max(0, NAV.findIndex((n) => active(n.href)));
  const spring = "cubic-bezier(.34,1.4,.5,1)";

  // Atajos de teclado en escritorio: 1–4 cambian de sección (igual que Mi semestre)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || el?.closest("input, textarea, select, [contenteditable], [role=dialog]")) return;
      const item = NAV[Number(e.key) - 1];
      if (item) router.push(item.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (path.startsWith("/auth")) return <>{children}</>; // sign-in screens: no app chrome

  return (
    <div className="lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-dvh w-64 shrink-0 flex-col gap-2 border-r border-line p-5">
        <div className="mb-4 flex items-center gap-3 px-2">
          <Logo />
          <div>
            <p className="font-semibold">Mi Espacio</p>
            <p className="text-xs text-muted">Tareas y entreno</p>
          </div>
        </div>
        <AppSwitcher className="mb-4" />
        <nav className="relative flex flex-col gap-2">
          {/* sliding highlight: items are h-11 + gap-2 = 3.25rem apart */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-11 rounded-2xl bg-white/[0.07] ring-1 ring-white/10"
            style={{ transform: `translateY(${idx * 3.25}rem)`, transition: `transform .5s ${spring}` }}>
            <span key={idx} className="absolute left-0 top-2.5 h-6 w-1 rounded-full bg-pink"
              style={{ animation: `grow .45s ${spring} both` }} />
          </span>
          {NAV.map((n, i) => (
            <Link key={n.href} href={n.href}
              className={`group relative flex h-11 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-colors duration-300 ${i === idx ? "text-white" : "text-muted hover:bg-white/[0.04] hover:text-white"}`}>
              <Icon name={n.icon} className={`size-5 transition-transform duration-500 ${i === idx ? "scale-110 text-pink" : "group-hover:translate-x-0.5"}`} />
              <span className={`flex-1 transition-transform duration-500 ${i === idx ? "translate-x-1" : ""}`}>{n.label}</span>
              <kbd className="num hidden rounded border border-line px-1.5 text-[10px] text-muted/60 xl:block">{i + 1}</kbd>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="pb-nav mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-10 lg:pt-10">
        {/* Móvil / tablet: marca + selector de apps */}
        {/* Header móvil común a las 3 apps: marca a la izquierda, selector de apps fijo en el borde derecho (120×42) */}
        <header className="mb-5 flex h-[42px] items-center gap-3 lg:hidden">
          <Logo className="size-9" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-semibold">Mi Espacio</p>
            <p className="truncate text-xs text-muted">Tareas y entreno</p>
          </div>
          <AppSwitcher className="w-[7.5rem] shrink-0" />
        </header>
        {hub ? children : <div className="grid h-[60dvh] place-items-center"><div className="grad size-10 animate-glow rounded-2xl" /></div>}
      </main>

      {/* Mobile / tablet bottom bar */}
      <nav className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md rounded-[1.75rem] p-1.5 shadow-2xl shadow-black/60 lg:hidden">
        <span aria-hidden className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/4)] rounded-[1.4rem] bg-white/[0.07]"
          style={{ transform: `translateX(${idx * 100}%)`, transition: `transform .5s ${spring}` }} />
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-label={n.label}
            className={`relative flex flex-1 flex-col items-center gap-1 rounded-[1.4rem] py-2.5 text-[11px] transition-all duration-300 ${active(n.href) ? "text-white" : "text-muted active:scale-95"}`}>
            <Icon name={n.icon} className={`size-[22px] transition ${active(n.href) ? "text-pink" : ""}`} />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
