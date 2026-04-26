
# Despliegue de sitio estático en S3

## Resumen
**deploy.sh** es un script Bash que automatiza, paso a paso, la publicación de una página web estática en Amazon S3. Ejecuta las acciones necesarias para crear el bucket, comprobar que realmente se creó, configurar el control de acceso, aplicar una política mínima para servir archivos públicamente, subir tu `index.html` y un `error.html` (si existe), activar el hosting estático y comprobar que el sitio responde en su URL pública.

El flujo que realiza es este, explicado de forma simple:
- **Crear el bucket** en la región que indiques y esperar hasta confirmar que existe.  
- **Configurar Public Access Block** para permitir gestionar el acceso mediante políticas en lugar de ACLs.  
- **Aplicar una Bucket Policy mínima** que permite leer objetos (sólo si quieres que el sitio sea público).  
- **Subir los archivos** `index.html` (obligatorio) y `error.html` (opcional) con el tipo de contenido correcto.  
- **Habilitar Static Website Hosting** para que S3 sirva tu sitio como una página web.  
- **Verificar el endpoint** final (la URL pública) y reportar el resultado (código HTTP o errores comunes).

El script incluye validaciones y mensajes claros para que sepas en qué paso está, detecta errores frecuentes (región mal escrita, falta de permisos, bucket no creado) y evita usar ACLs, siguiendo las prácticas recomendadas de AWS.
---

## Requisitos
- **AWS CLI v2** instalada y accesible en `PATH`.  
- **Credenciales AWS** configuradas (perfil por defecto o perfil explícito).  
- **jq** instalado (opcional, para mostrar ARN en la verificación).  
- Archivos **index.html** (obligatorio) y **error.html** (opcional) en el directorio donde se ejecuta el script.  
- Permisos IAM suficientes para: `s3api:create-bucket`, `s3api:head-bucket`, `s3api:put-public-access-block`, `s3api:put-bucket-policy`, `s3:PutObject`, `s3:PutBucketWebsite`, `sts:GetCallerIdentity`.  
- Conectividad de red hacia los endpoints AWS.

---

## Contenido del repositorio
- **deploy.sh** — Script principal para automatizar el despliegue.  
- **index.html** — Página de inicio que se sube al bucket (debe existir antes de ejecutar).   
- **README.md** — Este archivo con instrucciones y notas.  
---

## Uso
1. **Hacer ejecutable**
```bash
chmod +x deploy.sh
```

2. **Ejecutar**
```bash
./deploy.sh <bucket-name> <region> [profile]
```
- **bucket-name**: nombre único global del bucket (ej. `anto-se3-demo-bucket`).  
- **region**: región AWS válida (ej. `us-west-2`).  
- **profile**: (opcional) nombre del perfil en `~/.aws/credentials`.

**Ejemplo**
```bash
./deploy.sh anto-se3-demo-bucket us-west-2 default
```

3. **Salida esperada**
- Mensajes informativos por cada paso.  
- Al finalizar, se muestra el **endpoint** del sitio web:
```
http://<bucket>.s3-website-<region>.amazonaws.com
```

---

## Comportamiento y validaciones
- **Validación de credenciales**: el script verifica `sts get-caller-identity` antes de continuar.  
- **Validación de región**: intenta validar contra `ec2 describe-regions` si el permiso está disponible; si no, aplica una validación heurística del formato de región.  
- **Creación del bucket**: si el bucket no existe, el script intenta crearlo y **espera** hasta confirmar su existencia con `head-bucket` (reintentos con backoff). Si no se confirma, aborta.  
- **No usa ACLs**: el script **no** aplica `--acl public-read`; controla acceso público mediante **Bucket Policy** y `put-public-access-block`.  
- **Subida de objetos**: sube `index.html` con `Content-Type: text/html`. Si no existe `error.html`, copia `index.html` como `error.html` en el bucket.  
- **Verificación final**: prueba el endpoint con `curl` (si está disponible) y reporta códigos HTTP relevantes (200, 301, 403).

---

## Seguridad y buenas prácticas
- **Principio de menor privilegio**: ejecuta el script con un usuario que tenga solo los permisos necesarios.  
- **Evita buckets públicos en producción**: para producción usa **CloudFront con Origin Access Control** y mantén el bucket privado.  
- **No subas credenciales**: nunca incluyas Access Keys en el repositorio. Usa perfiles o mecanismos de credenciales seguros.  
- **Rotación y MFA**: rota las claves periódicamente y habilita MFA para usuarios con privilegios.  
- **Revisión de políticas**: antes de aplicar la Bucket Policy pública, confirma que exponer objetos es intencional.

---

## Solución de problemas comunes
- **Could not connect to the endpoint**: revisa la **región** (typos como `us-web-2`), conectividad de red y variables de proxy.  
- **404 Not Found en head-bucket**: el bucket no existe; verifica el nombre y que estés en la cuenta correcta (`sts get-caller-identity`).  
- **403 AccessDenied**: tu usuario no tiene permisos IAM necesarios; solicita al administrador los permisos mínimos listados en Requisitos.  
- **describe-regions falla**: puede faltar permiso `ec2:DescribeRegions`; el script seguirá con validación heurística si la región tiene formato correcto.  
- **index.html no encontrado**: coloca `index.html` en el mismo directorio que `deploy.sh` antes de ejecutar.

---

## Instalación de AWS CLI v2

**Opciones recomendadas**

- **macOS (Homebrew)**  
```bash
brew update
brew install awscli
```

- **Windows (Winget o instalador MSI)**  
```powershell
winget install --id Amazon.AWSCLI
```
O descarga e instala el **MSI oficial** desde la página de AWS CLI v2.

- **Linux**  
Descarga el instalador oficial (archivo `.zip`) desde la página de AWS CLI v2, descomprímelo y ejecuta el instalador incluido:
```bash
unzip awscli-exe-linux-x86_64.zip
sudo ./aws/install
```
Alternativamente, usa el paquete de tu distribución si ofrece AWS CLI v2.

**Verificar instalación**
```bash
aws --version
# Ejemplo esperado: aws-cli/2.x.x Python/3.x.x ...
```

---

## Configurar credenciales AWS

**Método interactivo (recomendado para desarrollo local)**  
Ejecuta:
```bash
aws configure
```
Se te pedirá:
- **AWS Access Key ID**
- **AWS Secret Access Key**
- **Default region name** (ej. `us-west-2`)
- **Default output format** (ej. `json`)

**Usar perfiles nombrados**
```bash
aws configure --profile mi-perfil
# luego usar: aws s3 ls --profile mi-perfil
```

**Variables de entorno (temporal, útil en CI o sesiones)**  
```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."   # opcional para credenciales temporales
export AWS_DEFAULT_REGION="us-west-2"
```

**Verificar identidad y permisos**
```bash
aws sts get-caller-identity
# Muestra Account, Arn y UserId
```

---

## Buenas prácticas de credenciales

- **No** subas Access Keys al repositorio.  
- Prefiere **roles IAM** y credenciales temporales (STS) cuando sea posible.  
- Considera usar **AWS SSO / Identity Center** para acceso humano en lugar de claves permanentes.  
- Habilita **MFA** para usuarios con privilegios.  
- Rota las claves periódicamente y elimina las que no se usan.

---

## Requisitos adicionales para el script

- **jq** es opcional pero útil para parsear JSON en la salida de `sts get-caller-identity`.  
- Asegúrate de que el usuario o perfil tenga permisos mínimos necesarios: `s3api:create-bucket`, `s3api:head-bucket`, `s3api:put-public-access-block`, `s3api:put-bucket-policy`, `s3:PutObject`, `s3:PutBucketWebsite`, `sts:GetCallerIdentity`.  

---

## Licencia y contribuciones
- Incluye aquí la **licencia** que prefieras (por ejemplo MIT) y las instrucciones para contribuir (pull requests, issues).  

---