# Plan de implementación

## Fuente y alcance

La fuente de verdad es `content/Fenouilledes-paso-lento-DEFINITIVO.html`. La aplicación transforma su contenido en estructuras TypeScript; no utiliza iframe ni inyecta el HTML original.

## Arquitectura

- `app/`: rutas, metadatos y estilos.
- `src/components/`: interfaz y comportamiento.
- `src/data/trip.ts`: viaje, cuatro días, siete paradas, avisos, alternativas y presupuesto.
- `src/data/restaurants.ts`: treinta fichas de restaurantes, bodegas y compras.
- `src/services/`: persistencia local y futuros adaptadores remotos.
- `src/utils/`: cálculos puros de horario.
- `content/`: documento fuente original.

## Estado

El contenido editorial es inmutable. El estado mutable del usuario —orden, visitas, omisiones, eliminaciones, notas, tareas y favoritos— se guarda en el dispositivo mediante una capa versionada y se normaliza cuando cambia la guía.

## Integraciones

- Leaflet y OpenStreetMap: mapa interactivo.
- OSRM: pendiente de activar para geometría real y caché de rutas.
- Open-Meteo: pendiente de fechas concretas; la interfaz marca claramente la meteorología provisional.
- Service worker: shell, datos y recursos locales disponibles sin conexión después de la primera carga.

## Imágenes

Las portadas actuales son composiciones editoriales CSS rotuladas como provisionales. La tarjeta social original se conserva en `public/og.png`. Las fotografías finales deberán ser locales, optimizadas y documentadas en `IMAGE_CREDITS.md`.

## Pendientes documentados

- Activar OSRM y Open-Meteo cuando se confirme la fecha del viaje.
- Sustituir portadas provisionales por fotografías con licencia verificable.
- Revalidar horarios, precios, días de cierre, teléfonos y coordenadas antes del viaje: la fuente los identifica como orientativos para la temporada 2026.
