import { auth } from "@/lib/auth/server";

// Every page requires a session; /auth/* sign-in views and /api/auth are public by default.
export default auth.middleware({
  loginUrl: "/auth/sign-in",
  publicRoutes: ["/manifest.webmanifest", "/icon.svg", "/api/logout", "/privacidad.html", "/terminos.html"],
});

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
