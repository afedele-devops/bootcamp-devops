
# Poké Battle — SPA (Estático)

Aplicación demo: juego tipo Pokémon (SPA) construido con HTML, Tailwind (CDN) y JavaScript modular, sin frameworks.

Resumen rápido
- Lista de Pokémon (imagen, nombre, número, tipos)
- Búsqueda por nombre y filtro por tipo
- Vista detalle: imagen grande, tipos (con colores), stats con barras, habilidades y botón `Capturar` (persistente en `localStorage`)
- Modo Batalla: selección de Pokémon, rival aleatorio, animación turn-by-turn, efectos de sonido procedurales y log de combate
- Mi Pokédex: colección capturada con opción de eliminar
- UI/UX: responsive, modo oscuro, skeleton loading, lazy-loading de imágenes, microinteracciones

Tecnologías
- HTML
- TailwindCSS (CDN)
- JavaScript modular (ES Modules)
- Consume PokeAPI: https://pokeapi.co/

Estructura principal
- `index.html` — punto de entrada
- `src/app.js` — bootstrap de la app
- `src/router.js` — ruteo hash (SPA)
- `src/api.js` — helpers para consumir PokeAPI
- `src/ui.js` — renderización de vistas (home, detalle, pokédex, batalla)
- `src/store.js` — estado mínimo y persistencia de Pokédex
- `src/battle.js` — simulación y animación de batallas + WebAudio procedural
- `src/styles.css` — estilos y mejoras para modo oscuro

Cómo ejecutar localmente

1. Servidor estático (recomendado). Ejemplo rápido con Python desde la carpeta `poke`:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

2. Navega a `#/` para ver la lista, `#/pokemon/{id}` para detalle, `#/pokedex` para tu colección y `#/battle` para batallas.

Controles útiles
- Modo oscuro: botón `Modo` en la barra superior (guardado en `localStorage`)
- Sonidos de batalla: botón de audio (🔊/🔈) en la barra superior. Los efectos son procedurales (WebAudio) y se mapean por `id`/tipo del Pokémon; la preferencia se guarda en `localStorage`.

Notas sobre la batalla
- La animación muestra ambos Pokémon con microanimaciones (ataque/impacto), barras de HP que se actualizan y un log en pantalla.
- Los sonidos son generados en tiempo real (no hay archivos externos) usando osciladores y envolventes para mantener el proyecto estático y portable.

Accesibilidad y contraste
- Se añadieron ajustes de contraste para modo oscuro en `src/styles.css` (mejores fondos para tarjetas, botones e inputs).
- Aún se puede mejorar (WCAG checks, focus states y tests automatizados).

Despliegue
- El proyecto está listo para ser servido como sitio estático (Nginx, GitHub Pages, Netlify, Vercel, etc.).

Extensiones recomendadas (siguientes pasos)
- Mejorar la carga de tipos y paginación (consumir más páginas de la API bajo demanda)
- Mejorar la lógica de batalla (turnos reales, animaciones más ricas, efectos por tipo)
- Añadir sonidos basados en `type.name` más ricos (filtros, reverb)
- Añadir pruebas y comprobaciones de contraste WCAG

Contribuir
- Fork y PR. Mantén cambios pequeños y documentados.

Licencia
- Este proyecto es un scaffold de ejemplo; añade licencia si lo deseas.

