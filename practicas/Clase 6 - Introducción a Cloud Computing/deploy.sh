#!/usr/bin/env bash
set -euo pipefail

# deploy.sh
# Uso: ./deploy.sh <bucket-name> <region> [profile]
# Ejemplo: ./deploy.sh anto-se3-demo-bucket us-west-2 default

BUCKET="${1:-}"
REGION_INPUT="${2:-}"
PROFILE="${3:-}"

if [ -z "$BUCKET" ] || [ -z "$REGION_INPUT" ]; then
  echo "Uso: $0 <bucket-name> <region> [profile]"
  echo "Ejemplo: $0 anto-se3-demo-bucket us-west-2 default"
  exit 2
fi

PROFILE_ARG=()
if [ -n "$PROFILE" ]; then
  PROFILE_ARG=(--profile "$PROFILE")
fi

AWS_CMD=(aws "${PROFILE_ARG[@]}")

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; }

trap 'err "Script interrumpido"; exit 1' INT TERM

# Sugerencia simple para typos comunes
suggest_region() {
  local r="$1"
  if [[ "$r" =~ web ]]; then
    echo "${r//web/west}"
    return
  fi
  if [[ "$r" =~ oeste ]]; then
    echo "${r//oeste/west}"
    return
  fi
  if [[ "$r" =~ ^us- ]]; then
    echo "us-west-2"
    return
  fi
  echo ""
}

# 0. Prechecks
log "Verificando AWS CLI..."
if ! command -v aws >/dev/null 2>&1; then
  err "aws CLI no encontrada. Instala AWS CLI v2."
  exit 3
fi

log "Verificando credenciales..."
if ! "${AWS_CMD[@]}" sts get-caller-identity >/dev/null 2>&1; then
  err "No se pudo obtener identidad. Revisa tus credenciales o perfil."
  "${AWS_CMD[@]}" sts get-caller-identity || true
  exit 4
fi
IDENTITY=$("${AWS_CMD[@]}" sts get-caller-identity --output json)
ok "Identidad verificada: $(echo "$IDENTITY" | jq -r '.Arn')"

# 1. Validar región (intenta describe-regions; si falla, usa heurística)
REGION="$REGION_INPUT"
log "Validando región: $REGION_INPUT"

REGIONS_LIST=""
if REGIONS_LIST=$("${AWS_CMD[@]}" ec2 describe-regions --query "Regions[].RegionName" --output text 2>/dev/null || true); then
  # REGIONS_LIST puede estar vacío si no hay permisos
  if [ -n "$REGIONS_LIST" ]; then
    if echo "$REGIONS_LIST" | tr '\t' '\n' | grep -xq "$REGION_INPUT"; then
      ok "Región válida (verificada contra describe-regions): $REGION_INPUT"
    else
      SUGGEST=$(suggest_region "$REGION_INPUT")
      err "La región '$REGION_INPUT' no figura entre las regiones devueltas por AWS."
      if [ -n "$SUGGEST" ]; then
        warn "Sugerencia: quizás quisiste '$SUGGEST'."
      fi
      echo "Algunas regiones disponibles (parcial):"
      echo "$REGIONS_LIST" | tr '\t' '\n' | sed -n '1,10p'
      exit 5
    fi
  else
    # describe-regions ejecutó pero devolvió vacío (probablemente sin permisos)
    warn "No se pudo obtener la lista de regiones (describe-regions devolvió vacío). Aplicando validación heurística."
    if [[ ! "$REGION_INPUT" =~ ^[a-z]{2}-[a-z0-9-]+-[0-9]+$ ]]; then
      SUGGEST=$(suggest_region "$REGION_INPUT")
      err "La región '$REGION_INPUT' no cumple el patrón esperado (ej. us-west-2)."
      if [ -n "$SUGGEST" ]; then
        warn "Sugerencia: quizás quisiste '$SUGGEST'."
      fi
      exit 5
    else
      ok "Región parece válida por patrón: $REGION_INPUT (no verificada contra AWS)."
    fi
  fi
else
  # describe-regions falló (sin permisos o error de red)
  warn "No se pudo consultar la lista oficial de regiones (falta permiso o error). Aplicando validación heurística."
  if [[ ! "$REGION_INPUT" =~ ^[a-z]{2}-[a-z0-9-]+-[0-9]+$ ]]; then
    SUGGEST=$(suggest_region "$REGION_INPUT")
    err "La región '$REGION_INPUT' no cumple el patrón esperado (ej. us-west-2)."
    if [ -n "$SUGGEST" ]; then
      warn "Sugerencia: quizás quisiste '$SUGGEST'."
    fi
    exit 5
  else
    ok "Región parece válida por patrón: $REGION_INPUT (no verificada contra AWS)."
  fi
fi

# 2. Comprobar si bucket existe; si no, crear
log "Comprobando existencia del bucket $BUCKET..."
if "${AWS_CMD[@]}" s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  ok "Bucket $BUCKET ya existe y es accesible."
else
  log "Bucket no encontrado. Intentando crear bucket $BUCKET en región $REGION..."
  set +e
  if [ "$REGION" = "us-east-1" ]; then
    CREATE_OUT=$("${AWS_CMD[@]}" s3api create-bucket --bucket "$BUCKET" --region "$REGION" 2>&1)
    CREATE_RC=$?
  else
    CREATE_OUT=$("${AWS_CMD[@]}" s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION" 2>&1)
    CREATE_RC=$?
  fi
  set -e

  if [ $CREATE_RC -ne 0 ]; then
    err "Fallo al crear el bucket. Mensaje de AWS:"
    echo "$CREATE_OUT"
    if echo "$CREATE_OUT" | grep -qi "Could not connect to the endpoint"; then
      warn "Parece un problema de endpoint (posible typo en la región). Verifica que la región sea correcta (ej. us-west-2)."
    fi
    exit 6
  fi
  ok "Comando de creación enviado correctamente."
fi

# 3. Esperar y verificar creación antes de continuar
MAX_ATTEMPTS=12
SLEEP_SECONDS=5
attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  if "${AWS_CMD[@]}" s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
    ok "Bucket $BUCKET confirmado (head-bucket OK)."
    break
  else
    warn "Intento $attempt/$MAX_ATTEMPTS: bucket no encontrado aún. Esperando $SLEEP_SECONDS s..."
    sleep $SLEEP_SECONDS
    attempt=$((attempt + 1))
    SLEEP_SECONDS=$((SLEEP_SECONDS + 5))
  fi
done

if [ $attempt -gt $MAX_ATTEMPTS ]; then
  err "No se pudo confirmar la creación del bucket después de $MAX_ATTEMPTS intentos. Abortando."
  exit 7
fi

# 4. Desactivar bloqueos de acceso público
log "Configurando Public Access Block..."
"${AWS_CMD[@]}" s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false >/dev/null
ok "Public Access Block actualizado"

# 5. Aplicar Bucket Policy mínima
POLICY_FILE="$(mktemp)"
cat > "$POLICY_FILE" <<EOF
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicReadGetObject",
      "Effect":"Allow",
      "Principal":"*",
      "Action":"s3:GetObject",
      "Resource":"arn:aws:s3:::$BUCKET/*"
    }
  ]
}
EOF

log "Aplicando Bucket Policy pública mínima..."
"${AWS_CMD[@]}" s3api put-bucket-policy --bucket "$BUCKET" --policy file://"$POLICY_FILE"
ok "Bucket Policy aplicada"
rm -f "$POLICY_FILE"

# 6. Subir index.html y error.html sin ACLs
INDEX_FILE="index.html"
ERROR_FILE="error.html"

if [ ! -f "$INDEX_FILE" ]; then
  err "No se encontró $INDEX_FILE en el directorio actual. Coloca tu archivo y vuelve a ejecutar."
  exit 8
fi

log "Subiendo $INDEX_FILE con Content-Type text/html..."
"${AWS_CMD[@]}" s3 cp "$INDEX_FILE" "s3://$BUCKET/index.html" --content-type "text/html"
ok "$INDEX_FILE subido"

if [ -f "$ERROR_FILE" ]; then
  log "Subiendo $ERROR_FILE..."
  "${AWS_CMD[@]}" s3 cp "$ERROR_FILE" "s3://$BUCKET/error.html" --content-type "text/html"
  ok "$ERROR_FILE subido"
else
  warn "No se encontró $ERROR_FILE. Se copiará index.html como error.html en el bucket."
  "${AWS_CMD[@]}" s3 cp "s3://$BUCKET/index.html" "s3://$BUCKET/error.html" >/dev/null 2>&1 || true
fi

# 7. Habilitar Static Website Hosting
log "Habilitando Static Website Hosting..."
"${AWS_CMD[@]}" s3 website "s3://$BUCKET/" --index-document index.html --error-document error.html >/dev/null
ok "Static Website Hosting habilitado"

# 8. Verificar configuración y probar endpoint
WEBSITE_ENDPOINT="http://$BUCKET.s3-website-$REGION.amazonaws.com"
log "Probando endpoint $WEBSITE_ENDPOINT ..."
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_ENDPOINT" || echo "000")
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "403" ] || [ "$HTTP_STATUS" = "301" ]; then
    ok "Respuesta HTTP $HTTP_STATUS desde $WEBSITE_ENDPOINT"
    if [ "$HTTP_STATUS" = "403" ]; then
      warn "403 AccessDenied. Revisa Bucket Policy y Public Access Block."
    fi
  else
    warn "Respuesta inesperada HTTP $HTTP_STATUS. Revisa configuración y permisos."
  fi
else
  warn "curl no está instalado. Prueba manualmente: curl -I $WEBSITE_ENDPOINT"
fi

ok "Despliegue completado. Endpoint: $WEBSITE_ENDPOINT"
