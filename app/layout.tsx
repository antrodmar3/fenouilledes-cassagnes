import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:5173";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: { default: "Fenouillèdes · Cuaderno de viaje", template: "%s · Fenouillèdes" },
    description: "Una PWA para llevar el itinerario de Fenouillèdes siempre a mano.",
    manifest: "/manifest.webmanifest",
    applicationName: "Fenouillèdes",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fenouillèdes" },
    formatDetection: { telephone: true },
    icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
    openGraph: { title: "Fenouillèdes · 4 días desde Cassagnes", description: "Itinerario móvil por viñedos y fortalezas.", images: [{ url: socialImage, width: 1200, height: 630, alt: "Fenouillèdes, cuatro días desde Cassagnes" }] },
    twitter: { card: "summary_large_image", title: "Fenouillèdes · 4 días desde Cassagnes", description: "Itinerario móvil por viñedos y fortalezas.", images: [socialImage] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee4" },
    { media: "(prefers-color-scheme: dark)", color: "#161b1b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body>{children}</body></html>;
}
