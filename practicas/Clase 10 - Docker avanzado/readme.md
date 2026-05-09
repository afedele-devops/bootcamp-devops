# Clase 10 - Docker avanzado

Este directorio contiene dos practicas para reforzar conceptos de Docker Compose con Nginx:

1. compose-v1: orquestacion de contenedores usando imagen oficial de Nginx, puertos, variables de entorno, volumen nombrado, bind mount y red personalizada.
2. compose-v2: construccion de una imagen personalizada con Dockerfile y despliegue de un sitio estatico con Docker Compose.

## Estructura

```text
.
|-- compose-v1/
|   |-- docker-compose.yaml
|   `-- html/index.html
|-- compose-v2/
|   |-- compose.yml
|   |-- Dockerfile
|   `-- index.html
`-- readme.md
```

## Practica 1: compose-v1

Archivo principal: compose-v1/docker-compose.yaml

### Objetivo

Levantar varios servicios Nginx para practicar configuraciones comunes de Docker Compose:

1. Publicacion de puertos.
2. Variables de entorno.
3. Volumen nombrado para persistencia.
4. Bind mount para servir contenido local.
5. Red de tipo bridge para comunicacion entre contenedores.

### Servicios definidos

1. web-app
	- Imagen: nginx
	- Puerto: 8086 -> 80

2. web-app2
	- Imagen: nginx
	- Puerto: 8087 -> 80
	- Variables de entorno: NGINX_HOST y NGINX_PORT

3. web-app3
	- Imagen: nginx
	- Puerto: 8088 -> 80
	- Volumen nombrado: web-app-data:/usr/share/nginx/html
	- Red: web-network

4. web-app4
	- Imagen: nginx
	- Puerto: 8089 -> 80
	- Red: web-network

5. web-app5
	- Imagen: nginx
	- Puerto: 8090 -> 80
	- Bind mount: ./html:/usr/share/nginx/html

### Recursos adicionales

1. Volumen nombrado: web-app-data
2. Red personalizada: web-network (driver bridge)

### Comandos de ejecucion

Desde compose-v1:

```bash
docker compose up -d
```

Ver estado de servicios:

```bash
docker compose ps
```

Detener y eliminar contenedores:

```bash
docker compose down
```

Detener y eliminar contenedores junto con volumenes:

```bash
docker compose down -v
```

### Verificacion esperada

1. http://localhost:8086 responde con Nginx.
2. http://localhost:8087 responde con Nginx.
3. http://localhost:8088 responde con Nginx (contenido desde volumen nombrado).
4. http://localhost:8089 responde con Nginx.
5. http://localhost:8090 responde con contenido de la carpeta local html.

## Practica 2: compose-v2

Archivos principales:

1. compose-v2/compose.yml
2. compose-v2/Dockerfile
3. compose-v2/index.html

### Objetivo

Construir una imagen personalizada basada en Nginx que incluya un sitio estatico propio y ejecutarla con Docker Compose.

### Configuracion

1. Dockerfile
	- Base: nginx:latest
	- Copia el archivo index.html a /usr/share/nginx/html

2. compose.yml
	- Servicio: web-app-docker
	- build: .
	- Puerto: 8091 -> 80

3. index.html
	- Sitio estatico con estilos embebidos.
	- Contenido orientado a despliegue con Docker Compose.

### Comandos de ejecucion

Desde compose-v2:

```bash
docker compose -f compose.yml up -d --build
```

Ver estado del servicio:

```bash
docker compose -f compose.yml ps
```

Ver logs:

```bash
docker compose -f compose.yml logs -f
```

Detener y eliminar:

```bash
docker compose -f compose.yml down
```

### Verificacion esperada

1. http://localhost:8091 muestra el sitio estatico personalizado.
2. Si se reconstruye la imagen, el contenido actualizado de index.html se publica en el contenedor.

## Diferencia clave entre ambas practicas

1. compose-v1 usa imagenes preconstruidas de Nginx y demuestra distintas configuraciones operativas (puertos, volumenes, red).
2. compose-v2 construye una imagen personalizada con Dockerfile para empaquetar contenido propio y desplegarlo con Compose.

## Recomendaciones

1. Ejecutar cada practica por separado para evitar confusiones de puertos y contenedores.
2. Usar docker compose ps para validar estado.
3. Usar docker logs <contenedor> para diagnosticar problemas.

## Practica 3: compose-v3

Archivos principales:

1. compose-v3/compose.yml
2. compose-v3/Dockerfile
3. compose-v3/index.html

### Objetivo

Extender el ejercicio de sitio estatico agregando un segundo servicio de base de datos para practicar Compose con multiples contenedores y dependencias entre servicios.

### Configuracion

1. Servicio web-app-docker
	- build desde Dockerfile local.
	- publica puerto 8092 -> 80.
	- depende de db usando depends_on.

2. Servicio db
	- imagen mysql:latest.
	- variables de entorno para inicializacion:
	  - MYSQL_ROOT_PASSWORD
	  - MYSQL_DATABASE
	  - MYSQL_USER
	  - MYSQL_PASSWORD
	- publica 3306 -> 3306.

### Comandos de ejecucion

Desde compose-v3:

```bash
docker compose -f compose.yml up -d --build
```

Ver estado:

```bash
docker compose -f compose.yml ps
```

Ver logs:

```bash
docker compose -f compose.yml logs -f
```

Detener y eliminar:

```bash
docker compose -f compose.yml down
```

### Verificacion esperada

1. http://localhost:8092 muestra el sitio estatico servido por Nginx.
2. El contenedor db inicia con MySQL escuchando en 3306.
3. El servicio web se levanta despues de que Compose inicia db (orden de arranque via depends_on).

## Practica 4: compose-v4

Archivos principales:

1. compose-v4/docker-compose.yml
2. compose-v4/.env.example
3. compose-v4/backend/Dockerfile
4. compose-v4/backend/src/server.js
5. compose-v4/frontend/Dockerfile
6. compose-v4/frontend/nginx/default.conf
7. compose-v4/frontend/index.html
8. compose-v4/frontend/app.js

### Objetivo

Construir una app full-stack de Pokemon con arquitectura de contenedores, cache con Redis y sesiones distribuidas por identificador de sesion.

### Arquitectura

1. backend (Node.js + Express)
	- puerto interno 3000.
	- consulta PokeAPI y aplica cache en Redis con TTL de 60 segundos.
	- administra favoritos por sesion (cookie sid o header x-session-id).
	- middleware de logging: metodo, ruta, status y duracion.

2. frontend (Nginx + HTML/CSS/JS)
	- puerto interno 80.
	- UI para buscar Pokemon, ver card, agregar y borrar favoritos.
	- muestra si la respuesta vino de cache o de API.
	- proxy_pass de /api/* hacia backend:3000.

3. redis (redis:7-alpine)
	- modo ephemeral: sin snapshot ni appendonly.
	- usado para:
	  - pokemon:<name> (cache con TTL).
	  - session:<sessionId>:favorites (set de favoritos por sesion).

4. red interna
	- pockemon-net (driver bridge).

### Variables de entorno

Definidas en compose-v4/.env.example:

1. REDIS_HOST
2. REDIS_PORT
3. SESSION_SECRET
4. PORT
5. NODE_EV
6. FRONTEND_PORT

Notas:

1. En docker-compose.yml se usan valores por defecto para evitar fallos si falta algun valor.
2. FRONTEND_PORT permite evitar conflictos cuando 8080 ya esta ocupado.

### Contenerizacion

1. Backend
	- Dockerfile multi-stage (builder + runtime).
	- usuario no-root (appuser).
	- EXPOSE 3000.
	- HEALTHCHECK con wget a /health.

2. Frontend
	- imagen base nginx:latest.
	- copia estaticos y configuracion Nginx custom.
	- EXPOSE 80.
	- HEALTHCHECK a /health.

3. Redis
	- healthcheck con redis-cli ping.
	- opcion de persistencia documentada de forma comentada en compose.

### Endpoints backend

1. GET /health
2. GET /api/pokemon/:name
3. POST /api/session/favorite
4. GET /api/session/favorites
5. DELETE /api/session/favorites/:name

### Comandos de ejecucion

Desde compose-v4:

```bash
docker compose up -d --build
```

Si 8080 esta en uso:

```bash
FRONTEND_PORT=8081 docker compose up -d --build
```

Ver estado:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Detener y eliminar:

```bash
docker compose down
```

### Verificacion realizada

1. GET http://localhost:3000/health retorna 200 y backend conectado a Redis.
2. GET http://localhost:8081/health retorna 200 cuando FRONTEND_PORT=8081.
3. GET /api/session/favorites retorna sessionId y favoritos.
4. Primera llamada a /api/pokemon/pikachu retorna source=api.
5. Segunda llamada a /api/pokemon/pikachu retorna source=cache (cache Redis funcionando).

## Diferencias clave entre compose-v3 y compose-v4

1. compose-v3 introduce un servicio de base de datos (MySQL) junto a Nginx para practicar multi-servicio basico.
2. compose-v4 implementa una arquitectura full-stack realista con backend, frontend, Redis, healthchecks, proxy Nginx y manejo de sesiones distribuidas.
3. compose-v4 incorpora cache y estado de sesion en Redis, mientras que compose-v3 se enfoca en orquestacion y dependencias.
