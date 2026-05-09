Creá una aplicación full-stack de Pokémon con foco en arquitectura de contenedores. 
La app debe ser simple pero realista, ideal para aprender Docker, docker-compose 
y conceptos de sesiones distribuidas con Redis.

---

## 🏗️ Stack

- **Backend**: Node.js + Express (o FastAPI si preferís Python)
- **Frontend**: HTML + Vanilla JS (o React simple, sin bundler)
- **Cache/Sesiones**: Redis
- **API pública**: https://pokeapi.co/api/v2/

---

## 📦 Funcionalidades

### Backend (puerto 3000)
- `GET /api/pokemon/:name` → consulta PokeAPI y guarda en Redis con TTL de 60s (cache)
- `POST /api/session/favorite` → guarda un pokémon favorito en la sesión del usuario (por session ID en cookie o header)
- `GET /api/session/favorites` → devuelve los favoritos de esa sesión desde Redis
- `DELETE /api/session/favorites/:name` → elimina un favorito
- Middleware de logging básico (método, ruta, duración)

### Frontend (puerto 8080 o servido por el backend)
- Buscador de Pokémon por nombre
- Card con imagen, tipo(s), stats básicos
- Botón "Agregar a favoritos"
- Panel lateral o sección con lista de favoritos de la sesión
- Indicador visual de si el dato vino de cache (Redis) o de la API

### Redis
- Usado para dos cosas: **cache de respuestas de PokeAPI** y **almacenamiento de sesiones de usuario**
- Claves sugeridas:
  - `pokemon:<name>` → cache con TTL
  - `session:<sessionId>:favorites` → lista de favoritos

## Containerizacion
- Generar los siguientes archivos:
### `docker-compose.yml`
- Servicios: `backend`, `frontend` (separados), `redis`
- Red interna: `pockemon-net`
- Variables de entorno en el compose (no hardcodeadas en el codigo)
- Redis sin persistencia (modo ephemeral)
- Healthchecks en todos los servicios
- Volumen nombrado opcional para Redis si se quiere persistencia
 
### `backend/Dockerfile` (separado)
- Multi-stage build (builder + runtime)
- Usuario no-root
- EXPOSE del puerto
- Healt check con curl o wget
### `frontend/Dockerfile` (separado)
- Nginx latest para servir los estaticos
- Configuracion de nginx que haga proxy_pass al backend para `/api/*`
### `.env.example`
- REDIS_HOST, REDIS_PORT, SESSION_SECRET, PORT, NODE_EV

---
  