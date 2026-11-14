import { cookies } from "next/headers";
import { auth } from "@/lib/auth/server";

// Cierre de sesión hecho en el servidor: revoca la sesión en Neon Auth (sin cabecera Origin del navegador,
// que Neon puede rechazar) y borra SIEMPRE las cookies de sesión, aunque Neon falle.
export async function POST() {
  try { await auth.signOut(); } catch {}
  const jar = await cookies();
  for (const c of jar.getAll()) {
    if (c.name.includes("neon-auth")) jar.set(c.name, "", { path: "/", maxAge: 0, secure: true, httpOnly: true, sameSite: "lax" });
  }
  return Response.json({ ok: true }, { headers: { "Clear-Site-Data": '"cookies", "cache"', "Cache-Control": "no-store" } });
}
