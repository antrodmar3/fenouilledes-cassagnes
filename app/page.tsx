import type { Metadata } from "next";
import TripApp from "@/src/components/TripApp";

export const metadata: Metadata = {
  title: "Fenouillèdes · Cuaderno de viaje",
  description: "PWA mobile-first para organizar cuatro días desde Cassagnes.",
};

export default function Home() {
  return <TripApp />;
}
