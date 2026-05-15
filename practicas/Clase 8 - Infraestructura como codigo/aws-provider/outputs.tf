data "aws_region" "current" {}

output "bucket_name" {
  description = "Nombre del bucket S3 creado."
  value       = aws_s3_bucket.practica_bucket.bucket
}

output "bucket_website_endpoint" {
  description = "Endpoint del sitio web estático del bucket en AWS real."
  value       = "http://${aws_s3_bucket.practica_bucket.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
}

output "index_object_url" {
  description = "URL del objeto index en AWS real."
  value       = "https://${aws_s3_bucket.practica_bucket.bucket}.s3.${data.aws_region.current.name}.amazonaws.com/${var.index_document}"
}

output "proceso_creacion_bucket" {
  description = "Proceso: Se crea un bucket S3 con nombre, etiquetas y configuración básica."
  value       = "Bucket creado con nombre y etiquetas."
}

output "proceso_configuracion_web" {
  description = "Proceso: Se habilita el bucket como sitio web estático y se define el documento de inicio."
  value       = "Bucket configurado como sitio web estático."
}

output "proceso_subida_index" {
  description = "Proceso: Se sube el archivo index.html al bucket en AWS real."
  value       = "index.html subido al bucket."
}
