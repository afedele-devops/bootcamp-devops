variable "nombre_base" {
  description = "Prefijo base para el nombre del archivo generado."
  type        = string
  default     = "laboratorio-local"
}

variable "nombre_proyecto" {
  description = "Nombre visible del laboratorio."
  type        = string
  default     = "Laboratorio de recursos locales"
}

variable "autor" {
  description = "Nombre del autor del archivo generado."
  type        = string
  default     = "Antonio"
}

variable "entorno" {
  description = "Etiqueta de entorno para el contenido dinamico."
  type        = string
  default     = "local"
}

variable "mensaje" {
  description = "Mensaje libre que se escribira dentro del archivo."
  type        = string
  default     = "Archivo generado automaticamente con local_file y random_id."
}