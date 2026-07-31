"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Backpack, CalendarDays, Car, Check,
  ChevronDown, CircleHelp, Clock3, CloudSun, ExternalLink, Heart, Info, Landmark,
  Map as MapIcon, MapPin, Moon, MoreHorizontal, Navigation, NotebookPen, Phone,
  Plus, RotateCcw, Route, Star, Sun, Trash2, Utensils, WifiOff, Wind, X,
} from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { alternatives, budget, days, foodSafety, groupAdvice, practicalInfo, restaurants, stopById, stops, trip } from "@/src/data/trip";
import { clearState, createDefaultState, loadState, saveState } from "@/src/services/storage";
import type { Day, PlaceStatus, Stop, UserState } from "@/src/types/trip";
import { calculateSchedule } from "@/src/utils/schedule";

const MapView = lazy(() => import("./MapView"));
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appPath = (path: string) => `${basePath}${path}` || "/";

type Section = "summary" | "map" | "restaurants" | "monuments" | "practical";

const navItems = [
  { id: "summary" as const, label: "Inicio", icon: CalendarDays },
  { id: "map" as const, label: "Mapa", icon: MapIcon },
  { id: "restaurants" as const, label: "Restaurantes", icon: Utensils },
  { id: "monuments" as const, label: "Monumentos", icon: Landmark },
  { id: "practical" as const, label: "Info", icon: Info },
];

const dayPhotos: Record<string, { src: string; alt: string; credit: string }> = {
  "dia-1": { src: "/images/galamus.jpg", alt: "Relieve calizo y bosque en las Gorges de Galamus", credit: "Doronenko · CC BY-SA 4.0" },
  "dia-2": { src: "/images/collioure.jpg", alt: "Casas de Collioure junto al Mediterráneo", credit: "Jorge Franganillo · CC BY 3.0" },
  "dia-3": { src: "/images/carcassonne.jpg", alt: "Panorama de la ciudad fortificada de Carcasona", credit: "Lesueur André · CC BY-SA 4.0" },
  "dia-4": { src: "/images/villefranche.jpg", alt: "Villefranche-de-Conflent entre montañas", credit: "Alan Mattingly · CC0" },
};

const toggleId = (list: string[], id: string) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

function WeatherPill({ day, detailed = false }: { day: Day; detailed?: boolean }) {
  return (
    <div className={detailed ? "weather weather-large" : "weather"} aria-label="Meteorología de demostración">
      <CloudSun size={detailed ? 24 : 18} />
      <span><strong>{day.weatherDemo.max}°</strong> / {day.weatherDemo.min}°</span>
      {detailed && <><span>{day.weatherDemo.rain}% lluvia</span><span><Wind size={15} /> {day.weatherDemo.wind} km/h</span></>}
      <small>demo</small>
    </div>
  );
}

function StatusChip({ status }: { status: PlaceStatus }) {
  const labels = { pending: "Pendiente", visited: "Visitada", skipped: "Omitida", removed: "Eliminada" };
  return <span className={`status status-${status}`}>{status === "visited" && <Check size={13} />} {labels[status]}</span>;
}

function Metric({ icon: Icon, value, label }: { icon: typeof Clock3; value: string; label: string }) {
  return <div className="metric"><Icon size={18} /><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function TravelPhoto({ photo, large = false }: { photo: (typeof dayPhotos)[string]; large?: boolean }) {
  return (
    <figure className={`travel-photo ${large ? "travel-photo-large" : ""}`}>
      {/* Plain img keeps the same component portable in the Vinext and static GitHub Pages builds. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={appPath(photo.src)} alt={photo.alt} loading={large ? "eager" : "lazy"} />
      <figcaption>{photo.credit}</figcaption>
    </figure>
  );
}

function SortableStopCard({
  item, index, total, status, isNext, onMove, onToggleVisited, onToggleSkipped, onRemove, noteOpen, onToggleNotes, state, setState,
}: {
  item: ReturnType<typeof calculateSchedule>["items"][number]; index: number; total: number; status: PlaceStatus; isNext: boolean;
  onMove: (direction: -1 | 1) => void; onToggleVisited: () => void; onToggleSkipped: () => void; onRemove: () => void;
  noteOpen: boolean; onToggleNotes: () => void; state: UserState; setState: React.Dispatch<React.SetStateAction<UserState>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.stop.id });
  const note = state.notes[item.stop.id] ?? { text: "", tasks: [] };
  const pendingTasks = note.tasks.filter((task) => !task.done).length;

  const updateNote = (next: typeof note) => setState((current) => ({ ...current, notes: { ...current.notes, [item.stop.id]: next } }));
  const addTask = () => updateNote({ ...note, tasks: [...note.tasks, { id: `${Date.now()}`, text: "Nueva tarea", done: false }] });

  return (
    <article ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`stop-card ${isNext ? "stop-next" : ""} ${isDragging ? "is-dragging" : ""}`}>
      <div className="timeline-node">{index + 1}</div>
      <div className="stop-main">
        <div className="stop-topline">
          <span className="stop-time">{item.arrival}</span>
          {isNext ? <span className="next-chip">Siguiente</span> : <StatusChip status={status} />}
          <button className="drag-handle" aria-label={`Arrastrar ${item.stop.name}`} {...attributes} {...listeners}><MoreHorizontal /></button>
        </div>
        <p className="eyebrow">{item.stop.type} · {item.stop.town}</p>
        <h3>{item.stop.name}</h3>
        {item.stop.badge && <span className="editorial-badge">{item.stop.badge}</span>}
        <p>{item.stop.description}</p>
        {item.stop.details?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {item.stop.warning && <div className="warning"><Wind size={16} /><span>{item.stop.warning}</span></div>}
        <div className="stop-meta">
          <span><Clock3 size={15} /> {item.stop.estimatedVisitMinutes} min</span>
          <span>{item.arrival}–{item.end}</span>
          {item.stop.entryPrice && <span>{item.stop.entryPrice}</span>}
          {index < total - 1 && <span><Car size={15} /> {item.stop.travelMinutesFromPrevious} min aprox.</span>}
        </div>
        <div className="action-row">
          <button className={`chip-button ${status === "visited" ? "is-active" : ""}`} onClick={onToggleVisited}><Check size={17} /> {status === "visited" ? "Desmarcar" : "Visitada"}</button>
          <button className={`chip-button ${status === "skipped" ? "is-active" : ""}`} onClick={onToggleSkipped}><ArrowRight size={17} /> {status === "skipped" ? "Incluir" : "Omitir"}</button>
          <a className="icon-button" href={item.stop.googleMapsUrl} target="_blank" rel="noreferrer" aria-label="Abrir en Google Maps"><Navigation size={18} /></a>
          <button className="icon-button danger" onClick={onRemove} aria-label="Eliminar del itinerario"><Trash2 size={18} /></button>
        </div>
        <div className="reorder-row" aria-label="Reordenar parada">
          <button onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp size={16} /> Subir</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}><ArrowDown size={16} /> Bajar</button>
        </div>
        <button className="notes-toggle" onClick={onToggleNotes} aria-expanded={noteOpen}>
          <span><NotebookPen size={17} /> Notas y tareas {pendingTasks > 0 && <em>{pendingTasks} pendientes</em>}</span>
          <ChevronDown size={18} className={noteOpen ? "rotated" : ""} />
        </button>
        {noteOpen && (
          <div className="notes-panel">
            <label>Nota personal<textarea value={note.text} onChange={(event) => updateNote({ ...note, text: event.target.value })} placeholder="Añade algo que quieras recordar…" /></label>
            {note.tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <input type="checkbox" checked={task.done} onChange={() => updateNote({ ...note, tasks: note.tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item) })} aria-label={`Completar ${task.text}`} />
                <input value={task.text} onChange={(event) => updateNote({ ...note, tasks: note.tasks.map((item) => item.id === task.id ? { ...item, text: event.target.value } : item) })} aria-label="Texto de la tarea" />
                <button onClick={() => updateNote({ ...note, tasks: note.tasks.filter((item) => item.id !== task.id) })} aria-label="Eliminar tarea"><X size={16} /></button>
              </div>
            ))}
            <button className="text-link" onClick={addTask}><Plus size={16} /> Añadir tarea</button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function TripApp({ initialDayId }: { initialDayId?: string }) {
  const [section, setSection] = useState<Section>("summary");
  const [activeDayId, setActiveDayId] = useState<string | null>(() => initialDayId ?? (typeof window !== "undefined" ? window.location.pathname.match(/\/dias\/([^/]+)/)?.[1] ?? null : null));
  const [state, setState] = useState<UserState>(() => ({ ...createDefaultState(), theme: "light" }));
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [restaurantDay, setRestaurantDay] = useState("all");
  const [monumentDay, setMonumentDay] = useState("all");
  const [mapDays, setMapDays] = useState<string[]>(days.map((day) => day.id));
  const [routeVisible, setRouteVisible] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    queueMicrotask(() => {
      setState(loadState());
      setHydrated(true);
      setOnline(navigator.onLine);
    });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(appPath("/sw.js")).catch(() => undefined);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.style.colorScheme = state.theme;
    if (hydrated) saveState(state);
  }, [hydrated, state]);

  const navigate = useCallback((next: Section) => {
    setSection(next);
    setActiveDayId(null);
    window.history.pushState({}, "", next === "summary" ? appPath("/") : `${appPath("/")}?seccion=${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openDay = useCallback((dayId: string) => {
    setActiveDayId(dayId);
    window.history.pushState({}, "", appPath(`/dias/${dayId}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const statusFor = (id: string): PlaceStatus => state.removedStopIds.includes(id) ? "removed" : state.skippedStopIds.includes(id) ? "skipped" : state.visitedStopIds.includes(id) ? "visited" : "pending";
  const activeDay = activeDayId ? days.find((day) => day.id === activeDayId) : undefined;

  const updateList = (key: "visitedStopIds" | "skippedStopIds" | "favoriteRestaurantIds" | "discardedRestaurantIds", id: string) => {
    setState((current) => {
      const next = { ...current, [key]: toggleId(current[key], id) };
      if (key === "visitedStopIds" && !current.visitedStopIds.includes(id)) next.skippedStopIds = current.skippedStopIds.filter((item) => item !== id);
      if (key === "skippedStopIds" && !current.skippedStopIds.includes(id)) next.visitedStopIds = current.visitedStopIds.filter((item) => item !== id);
      return next;
    });
  };

  const progress = (day: Day) => {
    const visited = day.stopIds.filter((id) => state.visitedStopIds.includes(id)).length;
    return { visited, total: day.stopIds.length, percent: Math.round((visited / day.stopIds.length) * 100) };
  };

  const content = activeDay ? (
    <DayDetail day={activeDay} state={state} setState={setState} statusFor={statusFor} onBack={() => { setActiveDayId(null); window.history.pushState({}, "", appPath("/")); }} sensors={sensors} />
  ) : section === "summary" ? (
    <Summary openDay={openDay} navigate={navigate} progress={progress} />
  ) : section === "map" ? (
    <MapScreen state={state} mapDays={mapDays} setMapDays={setMapDays} routeVisible={routeVisible} setRouteVisible={setRouteVisible} openDay={openDay} />
  ) : section === "restaurants" ? (
    <RestaurantsScreen state={state} updateList={updateList} favoriteOnly={favoriteOnly} setFavoriteOnly={setFavoriteOnly} restaurantDay={restaurantDay} setRestaurantDay={setRestaurantDay} />
  ) : section === "monuments" ? (
    <MonumentsScreen updateList={updateList} statusFor={statusFor} monumentDay={monumentDay} setMonumentDay={setMonumentDay} />
  ) : (
    <PracticalScreen setState={setState} />
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("summary")} aria-label="Ir a Inicio">
          <span className="brand-mark">F</span><span><strong>{trip.title}</strong><small>desde Cassagnes</small></span>
        </button>
        <button className="theme-toggle" onClick={() => setState((current) => ({ ...current, theme: current.theme === "light" ? "dark" : "light" }))} aria-label={`Activar modo ${state.theme === "light" ? "oscuro" : "claro"}`}>
          {state.theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>
      {!online && <div className="offline-banner"><WifiOff size={16} /> Sin conexión · usando contenido guardado</div>}
      <main>{content}</main>
      {!activeDay && (
        <nav className="bottom-nav" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={21} /><span>{item.label}</span></button>;
          })}
        </nav>
      )}
    </div>
  );
}

function Summary({ openDay, navigate, progress }: { openDay: (id: string) => void; navigate: (section: Section) => void; progress: (day: Day) => { visited: number; total: number; percent: number } }) {
  return (
    <div className="page summary-page">
      <section className="hero">
        <TravelPhoto photo={dayPhotos["dia-1"]} large />
        <div className="hero-copy">
          <p className="eyebrow light">Tu escapada de 4 días</p>
          <h1>{trip.title}<br /><em>{trip.subtitle}</em></h1>
          <p>{trip.description}</p>
          <div className="hero-base"><MapPin size={18} /><span>Base en <strong>{trip.base}</strong> · 9 personas</span></div>
        </div>
      </section>

      <div className="section-heading"><div><p className="eyebrow">Tu ruta</p><h2>Cuatro días, sin apretar el paso</h2></div><span>Guía definitiva</span></div>
      <section className="day-grid">
        {days.map((day) => {
          const done = progress(day);
          return (
            <button key={day.id} className="day-card" onClick={() => openDay(day.id)}>
              <TravelPhoto photo={dayPhotos[day.id]} />
              <div className="day-card-body">
                <div className="day-card-top"><span className="day-number">Día {day.number}</span><WeatherPill day={day} /></div>
                <p className="eyebrow">{day.subtitle}</p><h3>{day.title}</h3>
                <div className="mini-metrics"><span><Route size={16} /> {day.distanceKm} km</span><span><Car size={16} /> {Math.floor(day.drivingMinutes / 60)} h {day.drivingMinutes % 60} min</span><span><Backpack size={16} /> {Math.floor(day.walkingMinutes / 60)} h {day.walkingMinutes % 60} min</span><span>Entradas {day.entryCost}</span></div>
                <div className="progress-copy"><span>{done.visited} de {done.total} visitadas</span><strong>{done.percent}%</strong></div>
                <div className="progress-track"><span style={{ width: `${done.percent}%` }} /></div>
                <span className="card-link">Ver itinerario <ArrowRight size={18} /></span>
              </div>
            </button>
          );
        })}
      </section>
      <section className="quick-grid">
        <button className="quick-card quick-map" onClick={() => navigate("map")}><div><MapIcon /><span className="eyebrow light">Vista general</span><h3>Todo el viaje, en un mapa</h3></div><ArrowRight /></button>
        <button className="quick-card" onClick={() => navigate("practical")}><div><CircleHelp /><span className="eyebrow">Antes de salir</span><h3>Consejos y alternativas</h3></div><ArrowRight /></button>
      </section>
    </div>
  );
}

function DayDetail({ day, state, setState, statusFor, onBack, sensors }: { day: Day; state: UserState; setState: React.Dispatch<React.SetStateAction<UserState>>; statusFor: (id: string) => PlaceStatus; onBack: () => void; sensors: ReturnType<typeof useSensors> }) {
  const order = state.stopOrder[day.id] ?? day.stopIds;
  const activeIds = order.filter((id) => !state.removedStopIds.includes(id) && !state.skippedStopIds.includes(id));
  const activeStops = activeIds.map((id) => stopById[id]).filter(Boolean);
  const schedule = calculateSchedule(state.departureTimes[day.id] ?? "09:00", activeStops);
  const nextId = activeIds.find((id) => !state.visitedStopIds.includes(id));
  const removed = day.stopIds.filter((id) => state.removedStopIds.includes(id)).map((id) => stopById[id]);
  const skipped = day.stopIds.filter((id) => state.skippedStopIds.includes(id) && !state.removedStopIds.includes(id)).map((id) => stopById[id]);
  const visited = day.stopIds.filter((id) => state.visitedStopIds.includes(id)).length;

  const move = (id: string, direction: -1 | 1) => setState((current) => {
    const currentOrder = current.stopOrder[day.id] ?? day.stopIds;
    const from = currentOrder.indexOf(id);
    const to = from + direction;
    if (to < 0 || to >= currentOrder.length) return current;
    return { ...current, stopOrder: { ...current.stopOrder, [day.id]: arrayMove(currentOrder, from, to) } };
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setState((current) => {
      const currentOrder = current.stopOrder[day.id] ?? day.stopIds;
      return { ...current, stopOrder: { ...current.stopOrder, [day.id]: arrayMove(currentOrder, currentOrder.indexOf(String(active.id)), currentOrder.indexOf(String(over.id))) } };
    });
  };

  const resetRoute = () => {
    if (!window.confirm("Se restaurarán el orden original y todas las paradas omitidas o eliminadas. Las notas y el progreso se conservarán.")) return;
    setState((current) => ({ ...current, stopOrder: { ...current.stopOrder, [day.id]: [...day.stopIds] }, skippedStopIds: current.skippedStopIds.filter((id) => !day.stopIds.includes(id)), removedStopIds: current.removedStopIds.filter((id) => !day.stopIds.includes(id)) }));
  };

  const restoreAtOriginalPosition = (stop: Stop) => setState((current) => {
    const withoutStop = (current.stopOrder[day.id] ?? day.stopIds).filter((id) => id !== stop.id);
    const originalIdsBefore = day.stopIds.slice(0, stop.originalOrder);
    let insertAt = 0;
    for (const id of originalIdsBefore) {
      const currentIndex = withoutStop.indexOf(id);
      if (currentIndex >= insertAt) insertAt = currentIndex + 1;
    }
    const nextOrder = [...withoutStop];
    nextOrder.splice(insertAt, 0, stop.id);
    return { ...current, stopOrder: { ...current.stopOrder, [day.id]: nextOrder }, removedStopIds: current.removedStopIds.filter((id) => id !== stop.id) };
  });

  return (
    <div className="day-detail">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Volver a Inicio</button>
      <section className="day-hero">
        <TravelPhoto photo={dayPhotos[day.id]} large />
        <div className="day-hero-copy"><span className="day-number">Día {day.number}</span><p className="eyebrow light">{day.subtitle}</p><h1>{day.title}</h1><WeatherPill day={day} detailed /></div>
      </section>
      <section className="day-overview">
        <Metric icon={Route} value={`${day.distanceKm} km`} label="Ruta total" />
        <Metric icon={Car} value={`${Math.floor(day.drivingMinutes / 60)} h ${day.drivingMinutes % 60} min`} label="En coche" />
        <Metric icon={Backpack} value={`${Math.floor(day.walkingMinutes / 60)} h ${day.walkingMinutes % 60} min`} label="A pie" />
        <Metric icon={Check} value={`${visited} / ${day.stopIds.length}`} label="Visitadas" />
      </section>
      <section className="departure-card">
        <div><span className="departure-icon"><Clock3 /></span><div><p className="eyebrow">Organiza el día</p><h2>¿A qué hora salimos?</h2><p>Recalculamos las horas con 15 minutos de margen entre paradas.</p></div></div>
        <label>Hora de salida<input type="time" value={state.departureTimes[day.id] ?? "09:00"} onChange={(event) => setState((current) => ({ ...current, departureTimes: { ...current.departureTimes, [day.id]: event.target.value } }))} /></label>
      </section>
      <div className="itinerary-heading"><div><p className="eyebrow">Itinerario personalizado</p><h2>{activeStops.length} paradas · regreso aprox. {schedule.returnTime}</h2><span>Horario orientativo basado en la guía, con 15 minutos de margen</span></div><button className="secondary-button" onClick={resetRoute}><RotateCcw size={16} /> Restaurar ruta</button></div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={activeIds} strategy={verticalListSortingStrategy}>
          <section className="timeline">
            {schedule.items.map((item, index) => (
              <SortableStopCard key={item.stop.id} item={item} index={index} total={schedule.items.length} status={statusFor(item.stop.id)} isNext={item.stop.id === nextId}
                onMove={(direction) => move(item.stop.id, direction)}
                onToggleVisited={() => setState((current) => ({ ...current, visitedStopIds: toggleId(current.visitedStopIds, item.stop.id), skippedStopIds: current.skippedStopIds.filter((id) => id !== item.stop.id) }))}
                onToggleSkipped={() => setState((current) => ({ ...current, skippedStopIds: toggleId(current.skippedStopIds, item.stop.id), visitedStopIds: current.visitedStopIds.filter((id) => id !== item.stop.id) }))}
                onRemove={() => { if (window.confirm("La parada desaparecerá del itinerario personalizado, pero podrás restaurarla.")) setState((current) => ({ ...current, removedStopIds: [...current.removedStopIds, item.stop.id] })); }}
                noteOpen={Boolean(state.expandedBlocks[`notes-${item.stop.id}`])}
                onToggleNotes={() => setState((current) => ({ ...current, expandedBlocks: { ...current.expandedBlocks, [`notes-${item.stop.id}`]: !current.expandedBlocks[`notes-${item.stop.id}`] } }))}
                state={state} setState={setState}
              />
            ))}
          </section>
        </SortableContext>
      </DndContext>
      {skipped.length > 0 && <section className="removed-block"><h2>Omitidas por ahora</h2>{skipped.map((stop) => <div key={stop.id}><div><strong>{stop.name}</strong><span>No se incluye en el horario ni en la ruta activa</span></div><button onClick={() => setState((current) => ({ ...current, skippedStopIds: current.skippedStopIds.filter((id) => id !== stop.id) }))}><RotateCcw size={16} /> Volver a incluir</button></div>)}</section>}
      {removed.length > 0 && <section className="removed-block"><h2>Paradas eliminadas</h2>{removed.map((stop) => <div key={stop.id}><div><strong>{stop.name}</strong><span>{stop.town}</span></div><button onClick={() => restoreAtOriginalPosition(stop)}><RotateCcw size={16} /> Restaurar</button></div>)}</section>}
      <section className="short-version"><p className="eyebrow">Versión corta</p><h2>El día sigue mereciendo la pena</h2><p>{day.shortVersion}</p></section>
    </div>
  );
}

function MapScreen({ state, mapDays, setMapDays, routeVisible, setRouteVisible, openDay }: { state: UserState; mapDays: string[]; setMapDays: (days: string[]) => void; routeVisible: boolean; setRouteVisible: (value: boolean) => void; openDay: (dayId: string) => void }) {
  const visibleStops = stops.filter((stop) => mapDays.includes(stop.dayId) && !state.removedStopIds.includes(stop.id));
  return <div className="page"><div className="page-title"><p className="eyebrow">Explora la ruta</p><h1>Mapa del viaje</h1><p>Todas las paradas de la guía, agrupadas por día.</p></div>
    <div className="map-toolbar"><div className="filter-scroll">{days.map((day) => <button key={day.id} className={mapDays.includes(day.id) ? "active" : ""} onClick={() => setMapDays(toggleId(mapDays, day.id))}><span>{day.number}</span>Día {day.number}</button>)}</div><button className={`route-toggle ${routeVisible ? "active" : ""}`} onClick={() => setRouteVisible(!routeVisible)}><Route size={17} /> Ruta {routeVisible ? "visible" : "oculta"}</button></div>
    <div className="map-wrap"><Suspense fallback={<div className="map-loading"><MapIcon size={30} /><span>Preparando el mapa…</span></div>}><MapView stops={visibleStops} onOpenDay={openDay} /></Suspense>{!routeVisible ? null : <div className="route-notice"><Info size={15} /> La ruta OSRM se activará con las coordenadas definitivas.</div>}</div>
    <div className="map-legend">{days.map((day) => <span key={day.id}><i className={`legend-dot tone-${day.tone}`} />Día {day.number}</span>)}</div>
  </div>;
}

function RestaurantsScreen({ state, updateList, favoriteOnly, setFavoriteOnly, restaurantDay, setRestaurantDay }: { state: UserState; updateList: (key: "visitedStopIds" | "skippedStopIds" | "favoriteRestaurantIds" | "discardedRestaurantIds", id: string) => void; favoriteOnly: boolean; setFavoriteOnly: (value: boolean) => void; restaurantDay: string; setRestaurantDay: (value: string) => void }) {
  const visible = restaurants.filter((restaurant) => !state.discardedRestaurantIds.includes(restaurant.id) && (!favoriteOnly || state.favoriteRestaurantIds.includes(restaurant.id)) && (restaurantDay === "all" || restaurant.dayIds.includes(restaurantDay)));
  const discarded = restaurants.filter((restaurant) => state.discardedRestaurantIds.includes(restaurant.id));
  return <div className="page"><div className="page-title"><p className="eyebrow">Para sentarse a la mesa</p><h1>Restaurantes</h1><p>Las treinta fichas de la guía: comidas, cenas, caprichos y compras para llevar a casa.</p></div>
    <div className="filters"><button className={favoriteOnly ? "active" : ""} onClick={() => setFavoriteOnly(!favoriteOnly)}><Heart size={17} /> Solo favoritos</button><select value={restaurantDay} onChange={(event) => setRestaurantDay(event.target.value)} aria-label="Filtrar restaurantes por día"><option value="all">Todos los días</option>{days.map((day) => <option key={day.id} value={day.id}>Día {day.number}</option>)}</select></div>
    <section className="restaurant-grid">{visible.map((restaurant) => <article className="restaurant-card" key={restaurant.id}><div className="restaurant-top"><div className="restaurant-icon"><Utensils /></div><button className={`heart-button ${state.favoriteRestaurantIds.includes(restaurant.id) ? "active" : ""}`} onClick={() => updateList("favoriteRestaurantIds", restaurant.id)} aria-label="Alternar favorito"><Heart size={21} fill={state.favoriteRestaurantIds.includes(restaurant.id) ? "currentColor" : "none"} /></button></div><p className="eyebrow">{restaurant.town} · {restaurant.mealType}</p><h2>{restaurant.name}</h2><div className="rating"><Star size={17} fill="currentColor" /><strong>{restaurant.rating}</strong><span>{restaurant.reviewCount.toLocaleString("es-ES")} opiniones</span></div><p>{restaurant.description}</p><div className="restaurant-facts"><span>{restaurant.priceRange}</span><span>{restaurant.groupCapacity}</span></div>{restaurant.safetyNote && <div className="warning"><Info size={16} /><span><strong>Embarazo:</strong> {restaurant.safetyNote}</span></div>}<div className="schedule"><Clock3 size={16} />{restaurant.schedule}</div><div className="action-row">{restaurant.phone && <a className="chip-button" href={`tel:${restaurant.phone}`}><Phone size={16} /> Llamar</a>}<a className="chip-button" href={restaurant.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Mapa</a><button className="icon-button" onClick={() => updateList("discardedRestaurantIds", restaurant.id)} aria-label="Descartar restaurante"><X size={17} /></button></div></article>)}</section>
    {visible.length === 0 && <div className="empty-state"><Utensils /><h2>No hay restaurantes con estos filtros</h2><button onClick={() => { setFavoriteOnly(false); setRestaurantDay("all"); }}>Quitar filtros</button></div>}
    {discarded.length > 0 && <section className="removed-block"><h2>Restaurantes descartados</h2>{discarded.map((restaurant) => <div key={restaurant.id}><div><strong>{restaurant.name}</strong><span>{restaurant.town}</span></div><button onClick={() => updateList("discardedRestaurantIds", restaurant.id)}><RotateCcw size={16} /> Restaurar</button></div>)}</section>}
  </div>;
}

function MonumentsScreen({ updateList, statusFor, monumentDay, setMonumentDay }: { updateList: (key: "visitedStopIds" | "skippedStopIds" | "favoriteRestaurantIds" | "discardedRestaurantIds", id: string) => void; statusFor: (id: string) => PlaceStatus; monumentDay: string; setMonumentDay: (value: string) => void }) {
  const visible = stops.filter((stop) => monumentDay === "all" || stop.dayId === monumentDay);
  return <div className="page"><div className="page-title"><p className="eyebrow">Lugares con historia</p><h1>Monumentos y paisajes</h1><p>El mismo estado de cada lugar se comparte con el itinerario.</p></div><div className="filters"><select value={monumentDay} onChange={(event) => setMonumentDay(event.target.value)} aria-label="Filtrar lugares por día"><option value="all">Todos los días</option>{days.map((day) => <option key={day.id} value={day.id}>Día {day.number}</option>)}</select></div>
    <section className="place-list">{visible.map((stop) => { const status = statusFor(stop.id); const day = days.find((item) => item.id === stop.dayId)!; return <article className="place-card" key={stop.id}><div className={`place-number tone-${day.tone}`}>{day.number}</div><div><div className="place-top"><p className="eyebrow">{stop.type} · {stop.town}</p><StatusChip status={status} /></div><h2>{stop.name}</h2><p>{stop.description}</p><div className="stop-meta"><span><Clock3 size={15} /> {stop.estimatedVisitMinutes} min</span>{stop.warning && <span><Wind size={15} /> Aviso</span>}</div><div className="action-row"><button className={`chip-button ${status === "visited" ? "is-active" : ""}`} onClick={() => updateList("visitedStopIds", stop.id)}><Check size={16} /> Visitada</button><button className={`chip-button ${status === "skipped" ? "is-active" : ""}`} onClick={() => updateList("skippedStopIds", stop.id)}><ArrowRight size={16} /> Omitir</button><a className="icon-button" href={stop.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation size={17} /></a></div></div></article>; })}</section>
  </div>;
}

function PracticalScreen({ setState }: { setState: React.Dispatch<React.SetStateAction<UserState>> }) {
  const iconFor = (icon: string) => icon === "wind" ? <Wind /> : icon === "car" ? <Car /> : icon === "backpack" ? <Backpack /> : icon === "sun" ? <Sun /> : <WifiOff />;
  const reset = () => { if (window.confirm("Se borrarán del dispositivo las visitas, notas, tareas, favoritos y preferencias.")) { clearState(); setState(createDefaultState()); } };
  return <div className="page"><div className="page-title"><p className="eyebrow">Conviene saber</p><h1>Información práctica</h1><p>La guía completa para moverse, comer y decidir sobre la marcha cuando sois nueve.</p></div>
    <section className="weather-board"><div><p className="eyebrow light">Vista conjunta</p><h2>El tiempo, día a día</h2><span>Datos ficticios · no usar para planificar</span></div><div className="weather-days">{days.map((day) => <div key={day.id}><strong>D{day.number}</strong><CloudSun /><span>{day.weatherDemo.max}°</span><small>{day.weatherDemo.rain}%</small></div>)}</div></section>
    <div className="section-heading"><div><p className="eyebrow">En la mochila</p><h2>Antes de salir</h2></div></div><section className="practical-grid">{practicalInfo.map((item) => <article key={item.id}><span className="practical-icon">{iconFor(item.icon)}</span><div><p className="eyebrow">{item.category}{item.dayId ? ` · Día ${days.find((day) => day.id === item.dayId)?.number}` : ""}</p><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</section>
    <div className="section-heading"><div><p className="eyebrow">Nueve a la mesa</p><h2>Lo que cambia en grupo</h2></div></div><section className="practical-grid">{groupAdvice.map((item) => <article key={item.id}><span className="practical-icon"><Utensils /></span><div><p className="eyebrow">{item.kicker}</p><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</section>
    <div className="section-heading"><div><p className="eyebrow">A la mesa</p><h2>Comer catalán con una lista</h2></div></div><section className="food-safety"><p>{foodSafety.intro}</p><div><article><h3><Check size={19} /> Sin problema</h3><ul>{foodSafety.safe.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3><X size={19} /> Mejor no</h3><ul>{foodSafety.avoid.map((item) => <li key={item}>{item}</li>)}</ul></article></div><p className="food-phrases"><strong>Frases útiles:</strong> {foodSafety.phrases}</p></section>
    <div className="section-heading"><div><p className="eyebrow">Temporada 2026</p><h2>Presupuesto orientativo</h2></div></div><div className="budget-wrap"><table className="budget-table"><thead><tr><th>Jornada</th><th>Entradas</th><th>Comida</th><th>Cena</th><th>Coche</th><th>Persona</th><th>Los nueve</th></tr></thead><tbody>{budget.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.entries}</td><td>{row.lunch}</td><td>{row.dinner}</td><td>{row.car}</td><td><strong>{row.person}</strong></td><td><strong>{row.group}</strong></td></tr>)}</tbody></table></div><p className="budget-note">Euros. Comida y cena: principal más entrante o postre, con agua o refresco y sin vino. Coche calculado con dos vehículos. No incluye alojamiento, desayunos, cafés, helados ni compras.</p>
    <div className="section-heading"><div><p className="eyebrow">Plan B</p><h2>Alternativas</h2></div></div><section className="alternative-grid">{alternatives.map((place) => <article key={place.id}><span>{place.reason}</span><h3>{place.name}</h3><p>{place.description}</p><small>{place.distance}</small><a href={place.googleMapsUrl} target="_blank" rel="noreferrer">Abrir en Maps <ExternalLink size={15} /></a></article>)}</section>
    <section className="settings-card"><div><h2>Datos de este dispositivo</h2><p>Restablece todos los cambios locales y vuelve al itinerario original de la guía.</p></div><button className="danger-button" onClick={reset}><Trash2 size={17} /> Restablecer datos</button></section>
  </div>;
}
