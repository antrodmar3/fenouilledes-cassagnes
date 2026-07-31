# Fenouillèdes · Cuaderno de viaje

PWA mobile-first para consultar y personalizar un viaje de cuatro días por Fenouillèdes y el país cátaro, con base en Cassagnes.

El contenido procede de `content/Fenouilledes-paso-lento-DEFINITIVO.html`, conservado como fuente de verdad. La interfaz no incrusta ese documento: días, paradas, restaurantes y consejos están estructurados en TypeScript.

## Stack

- React 19 y TypeScript
- Vinext sobre Vite
- Leaflet y React Leaflet con OpenStreetMap
- dnd-kit para reordenación táctil y por teclado
- Lucide React para iconos
- CSS moderno con tokens de tema
- Service worker y Web App Manifest propios
- Persistencia local versionada

## Instalación y desarrollo

```bash
npm install
npm run dev
```

El servidor mostrará la URL local. Para probar la instalación PWA y el service worker con todas las garantías, usa HTTPS o un despliegue de prueba.

## Build, lint y pruebas

```bash
npm run lint
npm run test
npm run build
```

## Estructura relevante

```text
app/                  Rutas, metadatos y estilos globales
src/components/       Pantallas y componentes interactivos
src/data/trip.ts      Contenido original inmutable
src/services/         Persistencia y futuros adaptadores remotos
src/types/            Tipos compartidos
src/utils/            Cálculos puros de horario
public/               Manifest, service worker e iconos
```

## Cómo modificar el contenido

- **Viaje y cabecera:** modifica `trip` en `src/data/trip.ts`.
- **Días:** modifica `days`. Conserva un `id` estable y enlaza sus paradas con `stopIds`.
- **Paradas:** modifica `stops`. `dayId` debe apuntar a un día y `originalOrder` determina la restauración.
- **Restaurantes:** modifica `restaurants`. `dayIds` admite uno o varios días.
- **Consejos y alternativas:** modifica `practicalInfo` y `alternatives`.
- **Coordenadas:** actualiza `coordinates.latitude` y `coordinates.longitude` tras verificarlas; no uses centros genéricos si existe una ubicación exacta.
- **Enlaces:** guarda el enlace original en `googleMapsUrl`.

Los componentes no contienen el contenido editorial. `src/data/trip.ts` conserva viaje, jornadas, paradas, consejos, alternativas y presupuesto; `src/data/restaurants.ts` conserva las treinta fichas de mesa y compra.

## Imágenes

Inicio y las cabeceras de jornada usan fotografías reales de Galamus, Collioure, Carcasona y Villefranche-de-Conflent. Los archivos se sirven localmente desde `public/images/`; autoría, fuente y licencia están documentadas en `IMAGE_CREDITS.md`.

## PWA y funcionamiento offline

`public/manifest.webmanifest` configura el modo standalone, colores y punto de inicio. `public/sw.js` precachea el shell y aplica una estrategia network-first con fallback a caché; los mosaicos consultados de OpenStreetMap se almacenan de forma oportunista, sin descarga masiva.

El estado del usuario se guarda en su dispositivo mediante la capa de `src/services/storage.ts`: tema, horarios, orden, visitas, omisiones, eliminaciones, favoritos, descartes, notas y tareas. La clave incluye versión de esquema y se recupera con valores seguros si los datos están corruptos.

## OSRM y Open-Meteo

- **OSRM:** la UI deja preparado el control de ruta. Se activará el adaptador cuando existan coordenadas definitivas verificadas; debe cachear por secuencia de coordenadas y degradar a tiempos editoriales si falla.
- **Open-Meteo:** las jornadas muestran la previsión real de los próximos cuatro días, asociando Día 1 con hoy y Día 4 con dentro de tres días. Se consultan Galamus, Collioure, Carcasona y Mont-Louis. La última respuesta válida se guarda localmente para el modo sin conexión y la interfaz indica cuándo fue actualizada.

## Despliegue

La aplicación se publica automáticamente en GitHub Pages mediante `.github/workflows/pages.yml` cada vez que se actualiza `main`. Para generar localmente el mismo artefacto:

```bash
npm run build:pages
```

El resultado queda en `dist-pages/`; también incluye `404.html` para que las rutas directas como `/dias/:dayId` vuelvan al shell de la aplicación.

El proyecto también está preparado para Sites/Cloudflare, Netlify o Vercel siempre que el hosting reescriba rutas desconocidas al shell de la aplicación.

Para Sites, genera primero el build y publica desde la integración de hosting. No requiere servidor propio, base de datos ni variables secretas.

## Limitaciones conocidas

- Las coordenadas son estáticas y deben volver a verificarse si cambia el destino de algún enlace de Google Maps.
- OSRM permanece desactivado intencionadamente hasta completar la verificación de rutas.
- Los cambios locales no se sincronizan entre dispositivos.
- El mapa base necesita red para mosaicos no visitados anteriormente.
- La instalación y el comportamiento exacto de la PWA dependen del navegador y de HTTPS.

## Licencias y créditos

- Datos cartográficos: © contribuidores de OpenStreetMap.
- Iconos: Lucide, licencia ISC.
- Créditos visuales: consulta `IMAGE_CREDITS.md`.
