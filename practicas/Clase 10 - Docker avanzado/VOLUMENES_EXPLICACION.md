# Diferencia entre Volúmenes en Docker Compose

En el archivo `docker-compose.yaml` hay **dos tipos de volúmenes** diferentes. Te explico la diferencia:

## 1. Volumen Nombrado (`web-app-data`) - web-app3

```yaml
volumes:
  - web-app-data:/usr/share/nginx/html
```

- **Gestión**: Docker gestiona completamente el almacenamiento en su propio sistema de archivos
- **Ubicación**: Los datos se guardan en una carpeta administrada por Docker (normalmente en `/var/lib/docker/volumes/`)
- **Portabilidad**: Los datos persisten incluso si borras el contenedor o el proyecto
- **Acceso**: No puedes ver fácilmente los archivos desde tu máquina (están en la carpeta de Docker)
- **Uso ideal**: Para datos de aplicaciones, bases de datos, o información que debe persistir pero no necesita edición frecuente

## 2. Bind Mount (`./html`) - web-app5

```yaml
volumes:
  - ./html:/usr/share/nginx/html
```

- **Gestión**: Conecta directamente una carpeta de tu máquina host al contenedor
- **Ubicación**: Los datos están en tu directorio local `./html` (puedes verlos y editarlos)
- **Portabilidad**: Los datos están ligados a tu proyecto local
- **Acceso**: Acceso directo desde tu editor—cambios en tiempo real
- **Uso ideal**: Desarrollo, servir archivos personalizados, o cuando necesitas editar contenido frecuentemente

## Resumen en tabla

| Aspecto | Volumen Nombrado | Bind Mount |
|--------|-----------------|-----------|
| **Gestión** | Docker | Local |
| **Editable localmente** | No | Sí |
| **Persistencia** | Alta | Por carpeta |
| **Cambios en tiempo real** | No | Sí |

## Ejemplos de uso

### Volumen Nombrado
```yaml
services:
  database:
    image: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```
*Ideal para bases de datos que necesitan persistencia segura*

### Bind Mount
```yaml
services:
  web:
    image: nginx
    volumes:
      - ./src:/usr/share/nginx/html
```
*Ideal para desarrollo local donde editas archivos constantemente*
