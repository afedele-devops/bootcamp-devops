
# Laboratorio Práctico: Publica un sitio web estático en S3 con Terraform y MiniStack

## Objetivo
Aprender a desplegar un sitio web estático en un bucket S3 usando Terraform y MiniStack como entorno local de nube. Cada paso incluye el fragmento de código correspondiente y su explicación.

---

## Paso 1: Configuración del proveedor y versión

Fragmento de main.tf:
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
  region                      = var.region
  access_key                  = "test"
  secret_key                  = "test"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  endpoints {
    s3 = "http://localhost:4566"
  }
}
```
**Explicación:**
Se define el proveedor AWS apuntando a MiniStack. Se usan credenciales de prueba y se configuran opciones para desarrollo local.

---

## Paso 2: Crear un bucket S3 con etiquetas

Fragmento de main.tf:
```hcl
resource "aws_s3_bucket" "practica_bucket" {
  bucket = var.nombre_bucket
  tags = {
    Name        = var.tag_name
    Environment = var.environment
  }
}
```
**Explicación:**
Se crea un bucket S3 cuyo nombre y etiquetas se definen por variables. Esto permite identificar y organizar recursos fácilmente.

---

## Paso 3: Habilitar el bucket como sitio web estático

Fragmento de main.tf:
```hcl
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.practica_bucket.id
  index_document {
    suffix = var.index_document
  }
}
```
**Explicación:**
Se configura el bucket para servir archivos como un sitio web estático, definiendo el archivo principal (index.html).

---

## Paso 4: Subir el archivo index.html al bucket

Fragmento de main.tf:
```hcl
resource "aws_s3_object" "index" {
  bucket = aws_s3_bucket.practica_bucket.id
  key    = var.index_document
  source = var.index_file_path
  acl    = "public-read"
  content_type = "text/html"
}
```
**Explicación:**
Se sube el archivo index.html al bucket y se le otorgan permisos públicos para que sea accesible desde la web.

---

## Ejecución del laboratorio

1. Inicializa el entorno:
   ```bash
   terraform init
   ```
2. Previsualiza los cambios:
   ```bash
   terraform plan
   ```
3. Aplica la infraestructura:
   ```bash
   terraform apply -auto-approve
   ```
4. Verifica el sitio accediendo a:
   ```
   http://localhost:4566/anto-tf-test-bucket/index.html
   ```
5. Elimina los recursos al finalizar:
   ```bash
   terraform destroy -auto-approve
   ```

---

## Requisitos
- Terraform >= 1.0
- MiniStack corriendo: `docker run -p 4566:4566 ministackorg/ministack`
- AWS CLI (opcional para pruebas)

---

## Personalización y outputs
- Modifica variables en `variables.tf` para cambiar nombres y rutas.
- Consulta `outputs.tf` para ver endpoints y resultados del despliegue.