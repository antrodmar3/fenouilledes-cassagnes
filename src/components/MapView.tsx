"use client";

import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { days } from "@/src/data/trip";
import type { Stop } from "@/src/types/trip";

const home = {
  latitude: 42.746922,
  longitude: 2.635382,
  googleMapsUrl: "https://maps.app.goo.gl/KvoBGaC1qjnR5y8G7?g_st=ac",
};

const dayColors: Record<string, string> = {
  "dia-1": "#7b1e2b",
  "dia-2": "#c2901f",
  "dia-3": "#4e6a52",
  "dia-4": "#1c5b66",
};

type LatLng = [number, number];
type DayRoute = { dayId: string; positions: LatLng[] };

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    const positions: LatLng[] = [
      [home.latitude, home.longitude],
      ...stops.map((stop) => [stop.coordinates.latitude, stop.coordinates.longitude] as LatLng),
    ];
    map.fitBounds(positions, { padding: [28, 28] });
  }, [map, stops]);
  return null;
}

function fallbackRoute(stops: Stop[]): LatLng[] {
  return [
    [home.latitude, home.longitude],
    ...stops.map((stop) => [stop.coordinates.latitude, stop.coordinates.longitude] as LatLng),
    [home.latitude, home.longitude],
  ];
}

export default function MapView({ stops, routeVisible, onOpenDay }: { stops: Stop[]; routeVisible: boolean; onOpenDay: (dayId: string) => void }) {
  const stopsByDay = useMemo(() => days.map((day) => ({ dayId: day.id, stops: stops.filter((stop) => stop.dayId === day.id) })).filter((entry) => entry.stops.length > 0), [stops]);
  const routeSignature = stops.map((stop) => stop.id).join("|");
  const fallbackRoutes = useMemo(() => stopsByDay.map((entry) => ({ dayId: entry.dayId, positions: fallbackRoute(entry.stops) })), [stopsByDay]);
  const [routeResult, setRouteResult] = useState<{ signature: string; routes: DayRoute[] }>({ signature: "", routes: [] });
  const routes = routeResult.signature === routeSignature ? routeResult.routes : fallbackRoutes;
  const homeIcon = useMemo(() => divIcon({
    className: "home-map-marker",
    html: '<span aria-hidden="true">⌂</span>',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  }), []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(stopsByDay.map(async (entry): Promise<DayRoute> => {
      const coordinates = [
        `${home.longitude},${home.latitude}`,
        ...entry.stops.map((stop) => `${stop.coordinates.longitude},${stop.coordinates.latitude}`),
        `${home.longitude},${home.latitude}`,
      ].join(";");
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, { signal: controller.signal });
        if (!response.ok) throw new Error("No se pudo calcular la ruta");
        const payload = await response.json() as { routes?: Array<{ geometry?: { coordinates?: [number, number][] } }> };
        const geometry = payload.routes?.[0]?.geometry?.coordinates;
        if (!geometry?.length) throw new Error("Ruta vacía");
        return { dayId: entry.dayId, positions: geometry.map(([longitude, latitude]) => [latitude, longitude]) };
      } catch {
        return { dayId: entry.dayId, positions: fallbackRoute(entry.stops) };
      }
    })).then((nextRoutes) => { if (!controller.signal.aborted) setRouteResult({ signature: routeSignature, routes: nextRoutes }); });

    return () => controller.abort();
  }, [routeSignature, stopsByDay]);

  return (
    <MapContainer center={[home.latitude, home.longitude]} zoom={10} scrollWheelZoom className="leaflet-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stops={stops} />
      {routeVisible && routes.map((route) => <Polyline key={route.dayId} positions={route.positions} pathOptions={{ color: dayColors[route.dayId], weight: 5, opacity: .82 }} />)}
      <Marker position={[home.latitude, home.longitude]} icon={homeIcon} zIndexOffset={1000} title="Casa · punto de partida">
        <Popup><strong>Casa · punto de partida</strong><span className="map-popup-meta">Cassagnes</span><a className="text-link" href={home.googleMapsUrl} target="_blank" rel="noreferrer">Abrir en Google Maps</a></Popup>
      </Marker>
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.coordinates.latitude, stop.coordinates.longitude]}
          radius={9}
          pathOptions={{ color: "#fff", weight: 3, fillColor: dayColors[stop.dayId], fillOpacity: 1 }}
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
