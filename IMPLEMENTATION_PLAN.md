# Plan de implementación

## Alcance de esta primera entrega

La aplicación se construye con contenido ficticio claramente identificado. La capa de datos queda separada de la interfaz para que el HTML definitivo pueda sustituirla sin reescribir componentes ni estado local.

## Arquitectura

- `app/`: rutas y metadatos de la aplicación.
- `src/components/`: interfaz y componentes interactivos.
- `src/data/`: datos originales e inmutables del viaje de demostración.
- `src/services/`: persistencia local y futuros adaptadores de OSRM/Open-Meteo.
- `src/utils/`: cálculos puros de horarios.
- `src/types/`: contratos TypeScript compartidos.
- `public/`: manifest, service worker y recursos locales.

## Modelo de datos

Se separan tres capas: contenido editorial (`Trip`, `Day`, `Stop`, `Restaurant`), estado del usuario (`UserState`) y datos remotos almacenados (`weatherCache`, `routeCache`). Los identificadores son estables y el estado nunca modifica los datos originales.

## Decisiones técnicas

- React + TypeScript sobre el starter Vinext/Vite de Sites.
- Navegación SPA compatible con rutas directas de detalle.
- Persistencia local versionada con recuperación ante datos corruptos.
- Reordenación táctil con dnd-kit y alternativa accesible mediante botones.
- Leaflet/OpenStreetMap cargados solo en cliente.
- Service worker propio y manifest instalable.
- Tokens CSS semánticos para tema claro/oscuro y safe areas de iPhone.

## Offline

El shell, los datos editoriales y los recursos locales se precachean. Las visitas, omisiones, notas, tareas, favoritos y preferencias permanecen en el dispositivo. El mapa degrada de forma segura cuando no hay red; no se descargan mosaicos masivamente.

## Integraciones

- OpenStreetMap/Leaflet: mapa interactivo.
- OSRM: el adaptador queda previsto para rutas reales cuando existan coordenadas verificadas.
- Open-Meteo: el adaptador queda previsto para previsiones reales cuando se definan fechas y ubicaciones definitivas.

Durante esta fase los horarios usan tiempos de conducción de muestra y el tiempo meteorológico se marca como demostración; no se presenta como dato real.

## Estrategia de imágenes

La UI usa composiciones editoriales locales de placeholder para evitar atribuir destinos incorrectos. Al recibir el HTML se seleccionarán imágenes reutilizables verificadas, se optimizarán y se documentarán en `IMAGE_CREDITS.md`.

## Riesgos y pendientes

- Falta el HTML fuente definitivo, por lo que textos, enlaces, teléfonos, coordenadas y tiempos son ficticios.
- OSRM y Open-Meteo no deben activarse con ubicaciones o fechas inventadas.
- La instalación PWA en iOS depende de servir la aplicación mediante HTTPS.

## Sustitución del contenido

Cuando llegue el HTML: auditarlo completo, mapearlo a `src/data/trip.ts`, verificar coordenadas y enlaces, sustituir placeholders visuales, activar los adaptadores remotos y ampliar las pruebas de contenido.
