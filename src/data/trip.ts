import type { AlternativePlace, Day, PracticalItem, Restaurant, Stop } from "@/src/types/trip";

export const trip = {
  id: "fenouilledes-demo",
  title: "Fenouillèdes",
  subtitle: "4 días entre viñedos y fortalezas",
  base: "Cassagnes, Francia",
  description:
    "Un cuaderno de viaje móvil por carreteras tranquilas, pueblos de piedra y paisajes cátaros. Todo el contenido de esta versión es de demostración.",
};

export const days: Day[] = [
  { id: "dia-1", number: 1, title: "Primeras fortalezas", subtitle: "Maury · Quéribus", distanceKm: 74, drivingMinutes: 102, walkingMinutes: 95, tone: "wine", stopIds: ["maury", "queribus", "cucugnan"], weatherLabel: "Quéribus", weatherDemo: { icon: "sun", min: 16, max: 26, rain: 10, wind: 18 } },
  { id: "dia-2", number: 2, title: "Gargantas y abadías", subtitle: "Galamus · Saint-Paul", distanceKm: 62, drivingMinutes: 88, walkingMinutes: 120, tone: "gold", stopIds: ["galamus", "saint-paul", "cubieres"], weatherLabel: "Galamus", weatherDemo: { icon: "cloud-sun", min: 15, max: 24, rain: 25, wind: 14 } },
  { id: "dia-3", number: 3, title: "Corazón del país cátaro", subtitle: "Peyrepertuse · Duilhac", distanceKm: 83, drivingMinutes: 118, walkingMinutes: 135, tone: "vine", stopIds: ["peyrepertuse", "duilhac", "rouffiac"], weatherLabel: "Duilhac", weatherDemo: { icon: "sun", min: 17, max: 28, rain: 5, wind: 11 } },
  { id: "dia-4", number: 4, title: "Piedra, agua y vino", subtitle: "Bélesta · Ille-sur-Têt", distanceKm: 58, drivingMinutes: 81, walkingMinutes: 75, tone: "slate", stopIds: ["belesta", "orgues", "caramany"], weatherLabel: "Bélesta", weatherDemo: { icon: "cloud", min: 14, max: 23, rain: 35, wind: 9 } },
];

export const stops: Stop[] = [
  { id: "maury", dayId: "dia-1", originalOrder: 0, name: "Paseo por Maury", town: "Maury", type: "pueblo", description: "Calles tranquilas, piedra clara y una primera toma de contacto con el paisaje vinícola.", estimatedVisitMinutes: 55, travelMinutesFromPrevious: 25, coordinates: { latitude: 42.811, longitude: 2.593 }, googleMapsUrl: "https://maps.google.com/?q=Maury+France" },
  { id: "queribus", dayId: "dia-1", originalOrder: 1, name: "Castillo de Quéribus", town: "Cucugnan", type: "castillo", description: "Una fortaleza suspendida sobre la cresta con vistas abiertas hacia el Mediterráneo y los Pirineos.", estimatedVisitMinutes: 105, travelMinutesFromPrevious: 28, warning: "Acceso expuesto al viento; llevar calzado con buena suela.", coordinates: { latitude: 42.836, longitude: 2.621 }, googleMapsUrl: "https://maps.google.com/?q=Chateau+de+Queribus" },
  { id: "cucugnan", dayId: "dia-1", originalOrder: 2, name: "Tarde en Cucugnan", town: "Cucugnan", type: "pueblo", description: "Pausa entre casas de piedra, pequeños comercios y vistas de la fortaleza.", estimatedVisitMinutes: 70, travelMinutesFromPrevious: 12, coordinates: { latitude: 42.851, longitude: 2.602 }, googleMapsUrl: "https://maps.google.com/?q=Cucugnan" },
  { id: "galamus", dayId: "dia-2", originalOrder: 0, name: "Gargantas de Galamus", town: "Saint-Paul-de-Fenouillet", type: "garganta", description: "Una carretera tallada en la roca conduce a un desfiladero de escala sorprendente.", estimatedVisitMinutes: 90, travelMinutesFromPrevious: 34, warning: "El acceso puede regularse en temporada alta.", coordinates: { latitude: 42.838, longitude: 2.48 }, googleMapsUrl: "https://maps.google.com/?q=Gorges+de+Galamus" },
  { id: "saint-paul", dayId: "dia-2", originalOrder: 1, name: "Saint-Paul-de-Fenouillet", town: "Saint-Paul-de-Fenouillet", type: "pueblo", description: "Parada para almorzar y recorrer el pequeño centro a ritmo lento.", estimatedVisitMinutes: 75, travelMinutesFromPrevious: 18, coordinates: { latitude: 42.81, longitude: 2.504 }, googleMapsUrl: "https://maps.google.com/?q=Saint-Paul-de-Fenouillet" },
  { id: "cubieres", dayId: "dia-2", originalOrder: 2, name: "Ermita entre barrancos", town: "Cubières-sur-Cinoble", type: "abadía", description: "Un final sereno junto a la roca, pensado para detenerse y escuchar el paisaje.", estimatedVisitMinutes: 60, travelMinutesFromPrevious: 22, coordinates: { latitude: 42.84, longitude: 2.46 }, googleMapsUrl: "https://maps.google.com/?q=Cubieres-sur-Cinoble" },
  { id: "peyrepertuse", dayId: "dia-3", originalOrder: 0, name: "Castillo de Peyrepertuse", town: "Duilhac-sous-Peyrepertuse", type: "castillo", description: "Dos recintos fortificados recorren una larga espina caliza sobre el valle.", estimatedVisitMinutes: 130, travelMinutesFromPrevious: 42, warning: "Subida irregular y escaleras; evitar las horas de más calor.", coordinates: { latitude: 42.87, longitude: 2.556 }, googleMapsUrl: "https://maps.google.com/?q=Chateau+de+Peyrepertuse" },
  { id: "duilhac", dayId: "dia-3", originalOrder: 1, name: "Duilhac bajo la roca", town: "Duilhac-sous-Peyrepertuse", type: "pueblo", description: "Una pausa con sombra y fuentes bajo la silueta del castillo.", estimatedVisitMinutes: 65, travelMinutesFromPrevious: 12, coordinates: { latitude: 42.864, longitude: 2.566 }, googleMapsUrl: "https://maps.google.com/?q=Duilhac-sous-Peyrepertuse" },
  { id: "rouffiac", dayId: "dia-3", originalOrder: 2, name: "Mirador de Rouffiac", town: "Rouffiac-des-Corbières", type: "mirador", description: "Una última mirada a las crestas antes de regresar a Cassagnes.", estimatedVisitMinutes: 45, travelMinutesFromPrevious: 19, coordinates: { latitude: 42.886, longitude: 2.552 }, googleMapsUrl: "https://maps.google.com/?q=Rouffiac-des-Corbieres" },
  { id: "belesta", dayId: "dia-4", originalOrder: 0, name: "Bélesta y su patrimonio", town: "Bélesta", type: "pueblo", description: "Casas minerales, un museo pequeño y vistas hacia el macizo.", estimatedVisitMinutes: 80, travelMinutesFromPrevious: 28, coordinates: { latitude: 42.717, longitude: 2.608 }, googleMapsUrl: "https://maps.google.com/?q=Belesta+Pyrenees-Orientales" },
  { id: "orgues", dayId: "dia-4", originalOrder: 1, name: "Orgues d’Ille-sur-Têt", town: "Ille-sur-Têt", type: "naturaleza", description: "Formaciones de arena esculpidas por el agua que parecen una ciudad efímera.", estimatedVisitMinutes: 90, travelMinutesFromPrevious: 20, warning: "Hay poca sombra en el recorrido principal.", coordinates: { latitude: 42.671, longitude: 2.615 }, googleMapsUrl: "https://maps.google.com/?q=Orgues+Ille-sur-Tet" },
  { id: "caramany", dayId: "dia-4", originalOrder: 2, name: "Atardecer en Caramany", town: "Caramany", type: "bodega", description: "Un cierre junto al embalse y los viñedos, con tiempo para una compra tranquila.", estimatedVisitMinutes: 60, travelMinutesFromPrevious: 29, coordinates: { latitude: 42.735, longitude: 2.568 }, googleMapsUrl: "https://maps.google.com/?q=Caramany" },
];

export const restaurants: Restaurant[] = [
  { id: "r-1", name: "La Table des Vignes", town: "Maury", dayIds: ["dia-1"], rating: 4.7, reviewCount: 184, description: "Cocina de mercado con producto local y una carta breve de vinos.", mealType: "Almuerzo pausado", schedule: "12:00–14:00 · Cierra lunes", phone: "+33 4 68 00 00 01", googleMapsUrl: "https://maps.google.com/?q=Maury+restaurant", coordinates: { latitude: 42.812, longitude: 2.594 } },
  { id: "r-2", name: "L’Auberge du Moulin", town: "Cucugnan", dayIds: ["dia-1"], rating: 4.5, reviewCount: 326, description: "Platos tradicionales, terraza y buenas opciones para compartir.", mealType: "Comida tras Quéribus", schedule: "12:00–14:30 · 19:00–21:30", googleMapsUrl: "https://maps.google.com/?q=Cucugnan+restaurant", coordinates: { latitude: 42.851, longitude: 2.603 } },
  { id: "r-3", name: "Le Relais des Gorges", town: "Saint-Paul-de-Fenouillet", dayIds: ["dia-2"], rating: 4.4, reviewCount: 211, description: "Una parada informal con especialidades catalanas y servicio ágil.", mealType: "Almuerzo", schedule: "11:45–14:30 · Cierra martes", phone: "+33 4 68 00 00 02", googleMapsUrl: "https://maps.google.com/?q=Saint-Paul-de-Fenouillet+restaurant", coordinates: { latitude: 42.81, longitude: 2.505 } },
  { id: "r-4", name: "La Cour du Château", town: "Duilhac", dayIds: ["dia-3"], rating: 4.8, reviewCount: 149, description: "Terraza escondida y platos generosos después de la subida al castillo.", mealType: "Comida tardía", schedule: "12:30–15:00 · Reserva recomendada", googleMapsUrl: "https://maps.google.com/?q=Duilhac+restaurant", coordinates: { latitude: 42.864, longitude: 2.565 } },
  { id: "r-5", name: "Café de la Place", town: "Bélesta", dayIds: ["dia-4"], rating: 4.3, reviewCount: 97, description: "Fórmula sencilla de mediodía, café y mesas bajo los plátanos.", mealType: "Parada ligera", schedule: "08:00–18:00 · Cierra miércoles", googleMapsUrl: "https://maps.google.com/?q=Belesta+restaurant", coordinates: { latitude: 42.717, longitude: 2.608 } },
];

export const practicalInfo: PracticalItem[] = [
  { id: "p-1", category: "Clima", title: "La tramontana cambia el plan", text: "Revisa el viento antes de subir a fortalezas expuestas y lleva una capa ligera incluso en días despejados.", icon: "wind" },
  { id: "p-2", category: "En ruta", title: "Carreteras estrechas", text: "Calcula margen adicional: varias carreteras son sinuosas y los cruces pueden requerir paciencia.", icon: "car" },
  { id: "p-3", category: "Equipaje", title: "Agua y calzado", text: "Lleva agua suficiente, protección solar y calzado con agarre para piedra pulida.", icon: "backpack" },
  { id: "p-4", category: "Conectividad", title: "Cobertura irregular", text: "Abre la aplicación antes de salir. El contenido principal seguirá disponible sin conexión.", icon: "signal" },
  { id: "p-5", category: "Día 3", title: "Evita el calor central", text: "La subida a Peyrepertuse es más agradable a primera hora.", dayId: "dia-3", icon: "sun" },
];

export const alternatives: AlternativePlace[] = [
  { id: "a-1", name: "Museo de la Prehistoria", reason: "Plan de lluvia", description: "Una visita cubierta y breve para mantener el día 4 flexible.", distance: "18 km desde Cassagnes", googleMapsUrl: "https://maps.google.com/?q=Belesta+museum" },
  { id: "a-2", name: "Lago de Caramany", reason: "Si sobra tiempo", description: "Paseo corto junto al agua con luz agradable al final del día.", distance: "12 km desde Cassagnes", googleMapsUrl: "https://maps.google.com/?q=Lac+de+Caramany" },
];

export const stopById = Object.fromEntries(stops.map((stop) => [stop.id, stop]));
