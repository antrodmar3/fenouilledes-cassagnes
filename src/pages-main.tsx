import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "@/app/globals.css";
import TripApp from "@/src/components/TripApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TripApp />
  </StrictMode>,
);
