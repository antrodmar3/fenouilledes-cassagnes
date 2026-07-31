import type { Stop } from "@/src/types/trip";

export interface ScheduledStop {
  stop: Stop;
  arrival: string;
  end: string;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
};

export function calculateSchedule(departure: string, stops: Stop[]): { items: ScheduledStop[]; returnTime: string } {
  let cursor = toMinutes(departure);
  const items = stops.map((stop) => {
    cursor += stop.travelMinutesFromPrevious;
    const arrival = toTime(cursor);
    cursor += stop.estimatedVisitMinutes;
    const end = toTime(cursor);
    cursor += 15;
    return { stop, arrival, end };
  });
  return { items, returnTime: toTime(cursor + 30) };
}
