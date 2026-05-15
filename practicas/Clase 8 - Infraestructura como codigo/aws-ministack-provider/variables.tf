variable "region" {
    description = "Región de AWS para el proveedor y para construir URLs."
    type        = string
    default     = "us-east-1"
}
variable "nombre_bucket" {
    description = "Nombre del bucket S3"
    type        = string
    default     = "anto-tf-test-bucket"    
}

variable "tag_name" {
    description = "Valor de la etiqueta Name"
    type        = string
    default     = "TF MiniStack bucket"
}

variable "environment" {
    description = "Valor de la etiqueta Environment"
    type        = string
    default     = "Dev"
}

variable "index_document" {
    description = "Nombre del archivo index.html para el sitio web"
    type        = string
    default     = "index.html"
}

variable "index_file_path" {
    description = "Ruta local al archivo index.html a subir"
    type        = string
    default     = "index.html"
}