# Laboratorio de recursos locales con Terraform

Este laboratorio usa `hashicorp/random` y `hashicorp/local` para crear un archivo local con nombre y contenido dinamicos.

## Origen

Este laboratorio fue generado a partir del prompt definido en `../prompt ejemplo para archivos locales.txt` mediante un agente IA.

## Que se practica

- Uso de providers locales (`local` y `random`) para automatizacion sin nube.
- Construccion de nombres y contenido dinamico con `locals`.
- Validacion del resultado con `outputs` (ruta, sufijo y checksum).
- Flujo de trabajo asistido por IA para pasar de prompt a codigo Terraform funcional.

## Intencion del laboratorio

- Reforzar conceptos intermedios de Terraform en un entorno local y seguro.
- Practicar trazabilidad y repetibilidad de artefactos generados.
- Entender como un prompt bien definido puede convertirse en infraestructura declarativa usando un agente IA.

## Alcance

- Crea un archivo local dentro de `salidas/` con contenido dinamico.
- No crea recursos en AWS ni depende de credenciales cloud.
- Cubre solo la generacion local de artefactos y su validacion por outputs.

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