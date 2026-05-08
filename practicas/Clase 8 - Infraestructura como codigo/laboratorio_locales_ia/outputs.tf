output "archivo_generado" {
  description = "Ruta completa del archivo creado por local_file."
  value       = local_file.laboratorio.filename
}

output "nombre_archivo" {
  description = "Nombre final del archivo con el sufijo aleatorio."
  value       = local.nombre_archivo
}

output "sufijo_unico_hex" {
  description = "Sufijo unico generado con random_id en formato hexadecimal."
  value       = random_id.sufijo.hex
}

output "checksum_sha256" {
  description = "Hash SHA256 del contenido escrito por local_file."
  value       = local_file.laboratorio.content_sha256
}

output "vista_previa_contenido" {
  description = "Resumen corto del contenido dinamico generado."
  value       = "${var.nombre_proyecto} | ${var.entorno} | ${random_id.sufijo.hex}"
}