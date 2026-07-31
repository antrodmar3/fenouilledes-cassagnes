export type PlaceStatus = "pending" | "visited" | "skipped" | "removed";

export type PlaceType =
  | "castillo"
  | "pueblo"
  | "abadía"
  | "mirador"
  | "garganta"
  | "bodega"
  | "naturaleza";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Stop {
  id: string;
  dayId: string;
  originalOrder: number;
  name: string;
  town: string;
  type: PlaceType;
  description: string;
  details?: string[];
  badge?: string;
  entryPrice?: string;
  originalStartTime?: string;
  estimatedVisitMinutes: number;
  travelMinutesFromPrevious: number;
  warning?: string;
  coordinates: Coordinates;
  googleMapsUrl: string;
}

export interface Day {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  distanceKm: number;
  drivingMinutes: number;
  walkingMinutes: number;
  entryCost: string;
  shortVersion: string;
  tone: "wine" | "gold" | "vine" | "slate";
  stopIds: string[];
  weatherLabel: string;
  weatherDemo: { icon: string; min: number; max: number; rain: number; wind: number };
}

export interface Restaurant {
  id: string;
  name: string;
  town: string;
  dayIds: string[];
  rating: number;
  reviewCount: number;
  description: string;
  mealType: string;
  schedule: string;
  priceRange: string;
  groupCapacity: string;
  safetyNote?: string;
  phone?: string;
  websiteUrl?: string;
  googleMapsUrl: string;
  coordinates: Coordinates;
}

export interface PracticalItem {
  id: string;
  category: string;
  title: string;
  text: string;
  dayId?: string;
  icon: string;
}

export interface GroupAdvice {
  id: string;
  kicker: string;
  title: string;
  text: string;
}

export interface BudgetRow {
  label: string;
  entries: string;
  lunch: string;
  dinner: string;
  car: string;
  person: string;
  group: string;
}

export interface AlternativePlace {
  id: string;
  name: string;
  reason: string;
  description: string;
  distance: string;
  googleMapsUrl: string;
}

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteState {
  text: string;
  tasks: TaskItem[];
}

export interface UserState {
  schemaVersion: 1;
  theme: "light" | "dark";
  departureTimes: Record<string, string>;
  stopOrder: Record<string, string[]>;
  visitedStopIds: string[];
  skippedStopIds: string[];
  removedStopIds: string[];
  favoriteRestaurantIds: string[];
  discardedRestaurantIds: string[];
  notes: Record<string, NoteState>;
  expandedBlocks: Record<string, boolean>;
}
