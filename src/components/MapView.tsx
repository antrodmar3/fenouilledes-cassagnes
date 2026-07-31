"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Stop } from "@/src/types/trip";

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    map.fitBounds(stops.map((stop) => [stop.coordinates.latitude, stop.coordinates.longitude]), { padding: [28, 28] });
  }, [map, stops]);
  return null;
}

export default function MapView({ stops, onOpenDay }: { stops: Stop[]; onOpenDay: (dayId: string) => void }) {
  return (
    <MapContainer center={[42.8, 2.56]} zoom={10} scrollWheelZoom className="leaflet-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stops={stops} />
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.coordinates.latitude, stop.coordinates.longitude]}
          radius={9}
          pathOptions={{ color: "#fff", weight: 3, fillColor: "#7a263a", fillOpacity: 1 }}
        >
          <Popup>
            <strong>{stop.name}</strong>
            <span className="map-popup-meta">{stop.town} · {stop.type}</span>
            <p>{stop.description}</p>
            <button className="text-link" onClick={() => onOpenDay(stop.dayId)}>Ver en el itinerario</button>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
