# Poké Battle — SPA (Estático)

Proyecto demo: aplicación tipo juego de Pokémon (SPA) construida con HTML, TailwindCDN y JS modular (sin frameworks).

Características implementadas (inicial):
- Pantalla principal: lista de Pokémon, búsqueda, filtro por tipo, tarjetas con hover.
- Detalle de Pokémon: imagen, tipos, stats, habilidades, botón capturar (localStorage).
- Modo batalla: selección de Pokémon, rival aleatorio, simulación básica con log y ganador.
- Mi Pokédex: vista de colección y opción para eliminar.
- UI/UX: responsive, modo oscuro, skeleton loading, lazy loading de imágenes, microinteracciones.

Tecnologías: HTML + Tailwind via CDN + JS modular. Consume https://pokeapi.co/

Cómo ejecutar localmente:

1. Abrir `index.html` en un servidor estático (recomendado). Ejemplo rápido con Python:

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

Despliegue: cualquier host de archivos estáticos o Nginx sirve el contenido.

Notas: Este es un scaffold funcional; puedes mejorar animaciones, sonidos, y la lógica de batalla.
