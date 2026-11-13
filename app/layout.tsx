import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import Shell from "@/components/Shell";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin"], weight: ["300", "500", "700"] });

export const metadata: Metadata = {
  title: { default: "Mi Espacio", template: "%s — Mi Espacio" },
  description: "Tu día y tu entreno en un solo lugar",
  appleWebApp: { capable: true, title: "Mi Espacio", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sora.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
