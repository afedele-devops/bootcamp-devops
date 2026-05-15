output "bucket_name" {
  description = "Nombre del bucket S3 creado."
  value       = aws_s3_bucket.practica_bucket.bucket
}

output "bucket_website_endpoint" {
  description = "URL local del sitio web estático del bucket en MiniStack."
  value       = "http://localhost:4566/${aws_s3_bucket.practica_bucket.bucket}/index.html"
}

output "index_object_url" {
  description = "URL local del objeto index.html en el bucket usando MiniStack."
  value       = "http://localhost:4566/${aws_s3_bucket.practica_bucket.bucket}/${var.index_document}"
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
  description = "Proceso: Se sube el archivo index.html al bucket y se publica con permisos públicos."
  value       = "index.html subido y accesible públicamente."
}
