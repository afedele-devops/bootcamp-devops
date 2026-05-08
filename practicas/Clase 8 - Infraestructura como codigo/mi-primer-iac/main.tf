terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "2.8.0"
    }
  }
}

provider "local" {
  # Configuration options
}

resource "local_file" "foo" {
  content  = "foo modificado!"
  filename = "${path.module}/foo.bar"
}

resource "local_file" "hola" {
  content  = "hola mundo!"
  filename = "${path.module}/hola.txt"
}

# uso de variables para crear archivos con contenido y nombre dinámico
resource "local_file" "foo_var" {
  content  = var.contenido
  filename = "${path.module}/foo_${var.nombre_archivo}" 
}

resource "local_file" "hola_var" {
  content  = var.contenido
  filename = "${path.module}/hola_${var.nombre_archivo}"  
}

