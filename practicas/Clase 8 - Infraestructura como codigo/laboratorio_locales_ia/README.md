# Laboratorio de recursos locales con Terraform

Este laboratorio usa `hashicorp/random` y `hashicorp/local` para crear un archivo local con nombre y contenido dinamicos.

## Archivos

- `main.tf`: declara providers, genera un `random_id` y crea un `local_file` dentro de `salidas/`.
- `variables.tf`: define las entradas que controlan el nombre base, el mensaje y los metadatos del archivo.
- `outputs.tf`: expone la ruta final, el sufijo aleatorio y un checksum util para verificar cambios.
- `terraform.tfvars`: contiene valores de ejemplo para ejecutar el laboratorio sin pasos extra.

## Uso

```bash
terraform init
terraform apply
```