export interface DayForecast {
  dayId: string;
  location: string;
  date: string;
  weatherCode: number;
  min: number;
  max: number;
  rainProbability: number;
  windMax: number;
}

export interface ForecastSnapshot {
  forecasts: Record<string, DayForecast>;
  updatedAt: string;
}

const CACHE_KEY = "fenouilledes:weather:v1";

const locations = [
  { dayId: "dia-1", location: "Galamus", latitude: 42.8358, longitude: 2.4798 },
  { dayId: "dia-2", location: "Collioure", latitude: 42.5251, longitude: 3.0832 },
  { dayId: "dia-3", location: "Carcasona", latitude: 43.2063, longitude: 2.364 },
  { dayId: "dia-4", location: "Mont-Louis", latitude: 42.5084, longitude: 2.1217 },
] as const;

interface OpenMeteoPlace {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
}

export async function fetchForecasts(signal?: AbortSignal): Promise<ForecastSnapshot> {
  const params = new URLSearchParams({
    latitude: locations.map((place) => place.latitude).join(","),
    longitude: locations.map((place) => place.longitude).join(","),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
    timezone: "Europe/Paris",
    forecast_days: "4",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
  const payload = await response.json() as OpenMeteoPlace[];
  if (!Array.isArray(payload) || payload.length !== locations.length) throw new Error("Respuesta meteorológica incompleta");

  const forecasts = Object.fromEntries(locations.map((place, index) => {
    const daily = payload[index]?.daily;
    const dayIndex = index;
    if (!daily?.time[dayIndex]) throw new Error(`Falta la previsión para ${place.location}`);
    const forecast: DayForecast = {
      dayId: place.dayId,
      location: place.location,
      date: daily.time[dayIndex],
      weatherCode: daily.weather_code[dayIndex],
      min: Math.round(daily.temperature_2m_min[dayIndex]),
      max: Math.round(daily.temperature_2m_max[dayIndex]),
      rainProbability: Math.round(daily.precipitation_probability_max[dayIndex] ?? 0),
      windMax: Math.round(daily.wind_speed_10m_max[dayIndex]),
    };
    return [place.dayId, forecast];
  }));

  const snapshot = { forecasts, updatedAt: new Date().toISOString() };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot)); } catch { /* Cache is optional. */ }
  return snapshot;
}

export function loadCachedForecasts(): ForecastSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as ForecastSnapshot;
    return cached.updatedAt && Object.keys(cached.forecasts ?? {}).length === locations.length ? cached : null;
  } catch {
    return null;
  }
}

export function weatherDescription(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Nubes y claros";
  if (code <= 48) return "Niebla";
  if (code <= 57) return "Llovizna";
  if (code <= 67) return "Lluvia";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 86) return "Nieve";
  return "Tormenta";
}

export function formatForecastDate(date: string, compact = false): string {
  return new Intl.DateTimeFormat("es-ES", compact
    ? { weekday: "short", day: "numeric" }
    : { weekday: "long", day: "numeric", month: "short" })
    .format(new Date(`${date}T12:00:00`));
}

export function formatUpdatedAt(updatedAt: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    .format(new Date(updatedAt));
}
