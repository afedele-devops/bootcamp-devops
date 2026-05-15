
# Laboratorio Práctico: Publica un sitio web estático en S3 sobre AWS real

## Objetivo
Desplegar un sitio web estático en un bucket S3 dentro de una cuenta AWS real, usando Terraform. Cada paso muestra el fragmento de código de `main.tf` y su explicación.

---

## Paso 1: Definir proveedor y versión de AWS

Fragmento de `main.tf`:
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.45.0"
    }
  }
}

provider "aws" {
  # Configuration options
}
```

Explicación:
- Se fija la versión del provider AWS para asegurar ejecuciones reproducibles.
- El proveedor se autentica con credenciales reales de tu entorno (perfil AWS CLI, variables de entorno o rol).

---

## Paso 2: Crear el bucket S3

Fragmento de `main.tf`:
```hcl
resource "aws_s3_bucket" "practica_bucket" {
  bucket = var.nombre_bucket
  tags = {
    Name        = var.tag_name
    Environment = var.environment
  }
}
```

Explicación:
- Crea un bucket S3 con nombre configurable.
- Aplica etiquetas para trazabilidad en costos, entornos y administración.

Nota de práctica:
- En AWS real el nombre del bucket debe ser globalmente único.

---

## Paso 3: Habilitar hosting estático

Fragmento de `main.tf`:
```hcl
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.practica_bucket.id

  index_document {
    suffix = var.index_document
  }
}
```

Explicación:
- Activa el modo de sitio web estático del bucket.
- Define el documento de entrada (por defecto, `index.html`).

---

## Paso 4: Subir el archivo web

Fragmento de `main.tf`:
```hcl

# Permite políticas públicas a nivel bucket para hosting estático.
resource "aws_s3_bucket_public_access_block" "website_access" {
  bucket = aws_s3_bucket.practica_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política pública de lectura del objeto del sitio web.
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.practica_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = ["${aws_s3_bucket.practica_bucket.arn}/*"]
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website_access]
}

# Subir index.html al bucket
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.practica_bucket.id
  key          = var.index_document
  source       = var.index_file_path
  content_type = "text/html"

  depends_on = [aws_s3_bucket_policy.public_read]
}
```

Explicación:
- Sube el archivo local al bucket.
- Declara `content_type` como HTML para servirlo correctamente en navegador.
- Configura politicas de Public Read Access y Block Public Access

---

## Ejecución del laboratorio en AWS real

1. Configura credenciales AWS válidas en tu equipo.
  Puedes hacerlo con AWS CLI:
  ```bash
  aws configure
  ```

  AWS CLI te pedirá estos datos:
  - `AWS Access Key ID`: tu access key de IAM.
  - `AWS Secret Access Key`: tu secret key de IAM.
  - `Default region name`: usa la región real donde vas a crear el bucket (por ejemplo `us-west-2`).
  - `Default output format`: puedes usar `json`.

  Nota: en este laboratorio el provider AWS toma la región desde tu perfil/entorno (AWS CLI), por lo que debe coincidir con la región objetivo para evitar errores como `AuthorizationHeaderMalformed`.

  Para validar que tus credenciales funcionan:
  ```bash
  aws sts get-caller-identity
  ```
  Si el comando responde con `Account`, `Arn` y `UserId`, la autenticación está correcta.

2. Inicializa Terraform:
```bash
terraform init
```
3. Revisa el plan:
```bash
terraform plan
```
4. Aplica la infraestructura:
```bash
terraform apply -auto-approve
```
5. Verifica el sitio desde los enlaces del output en la terminal


## Requisitos
- Terraform 1.x
- Cuenta AWS activa
- Credenciales con permisos para S3 (crear bucket, configurar website, subir objetos)
- Región AWS configurada correctamente en tu perfil o variables de entorno
- Archivo `index.html` en la ruta definida por `index_file_path`

---

## Cierre del laboratorio
Para eliminar todos los recursos creados:
```bash
terraform destroy -auto-approve
```