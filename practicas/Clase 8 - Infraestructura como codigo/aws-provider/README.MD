
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
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.practica_bucket.id
  key          = var.index_document
  source       = var.index_file_path
  acl          = "public-read"
  content_type = "text/html"
}
```

Explicación:
- Sube el archivo local al bucket.
- Declara `content_type` como HTML para servirlo correctamente en navegador.
- Define ACL pública para lectura del objeto.

Nota de práctica:
- Algunas cuentas AWS tienen políticas que bloquean ACLs públicas; si ocurre, debes ajustar políticas de acceso público del bucket/cuenta.

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
  - `Default region name`: por ejemplo `us-east-1`.
  - `Default output format`: puedes usar `json`.

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
5. Verifica el sitio accediendo a:

Con los valores default de `variables.tf` (`nombre_bucket=anto-tf-test-bucket`, `index_document=index.html`) y usando región `us-east-1`, el endpoint esperado para validar el sitio estático es:
```
`http://anto-tf-test-bucket.s3-website-us-east-1.amazonaws.com`
   ```

---

## Requisitos
- Terraform 1.x
- Cuenta AWS activa
- Credenciales con permisos para S3 (crear bucket, configurar website, subir objetos)
- Archivo `index.html` en la ruta definida por `index_file_path`

---

## Cierre del laboratorio
Para eliminar todos los recursos creados:
```bash
terraform destroy -auto-approve
```