import type { UserState } from "@/src/types/trip";
import { days } from "@/src/data/trip";

const STORAGE_KEY = "fenouilledes:user-state:v1";

export function createDefaultState(): UserState {
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return {
    schemaVersion: 1,
    theme: prefersDark ? "dark" : "light",
    departureTimes: Object.fromEntries(days.map((day) => [day.id, "09:00"])),
    stopOrder: Object.fromEntries(days.map((day) => [day.id, [...day.stopIds]])),
    visitedStopIds: [],
    skippedStopIds: [],
    removedStopIds: [],
    favoriteRestaurantIds: [],
    discardedRestaurantIds: [],
    notes: {},
    expandedBlocks: {},
  };
}

export function loadState(): UserState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<UserState>;
    if (parsed.schemaVersion !== 1) return createDefaultState();
    return { ...createDefaultState(), ...parsed };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: UserState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
