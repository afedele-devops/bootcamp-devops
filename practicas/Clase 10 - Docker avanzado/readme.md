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
