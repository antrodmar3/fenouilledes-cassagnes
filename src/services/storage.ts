import type { UserState } from "@/src/types/trip";
import { days, groupAdvice } from "@/src/data/trip";

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
    daySuggestionIds: Object.fromEntries(days.map((day) => [day.id, []])),
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
    const defaults = createDefaultState();
    const merged = { ...defaults, ...parsed } as UserState;
    merged.stopOrder = Object.fromEntries(days.map((day) => {
      const saved = parsed.stopOrder?.[day.id] ?? [];
      const validSaved = saved.filter((id) => day.stopIds.includes(id));
      const missing = day.stopIds.filter((id) => !validSaved.includes(id));
      return [day.id, [...validSaved, ...missing]];
    }));
    const validStopIds = new Set(days.flatMap((day) => day.stopIds));
    merged.visitedStopIds = merged.visitedStopIds.filter((id) => validStopIds.has(id));
    merged.skippedStopIds = merged.skippedStopIds.filter((id) => validStopIds.has(id));
    merged.removedStopIds = merged.removedStopIds.filter((id) => validStopIds.has(id));
    const validSuggestionIds = new Set(groupAdvice.map((item) => item.id));
    merged.daySuggestionIds = Object.fromEntries(days.map((day) => [
      day.id,
      (parsed.daySuggestionIds?.[day.id] ?? []).filter((id) => validSuggestionIds.has(id)),
    ]));
    return merged;
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
