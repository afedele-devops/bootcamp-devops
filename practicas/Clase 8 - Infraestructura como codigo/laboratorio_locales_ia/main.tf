terraform {
  required_version = ">= 1.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "2.8.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.8.1"
    }
  }
}

provider "local" {}

provider "random" {}

resource "random_id" "sufijo" {
  byte_length = 4

  keepers = {
    nombre_base = var.nombre_base
  }
}

locals {
  nombre_archivo    = "${var.nombre_base}-${random_id.sufijo.hex}.txt"
  ruta_archivo      = "${path.module}/salidas/${local.nombre_archivo}"
  contenido_archivo = <<-EOT
  Laboratorio local con Terraform
  ===============================
  Proyecto      : ${var.nombre_proyecto}
  Autor         : ${var.autor}
  Entorno       : ${var.entorno}
  Sufijo unico  : ${random_id.sufijo.hex}
  Generado en   : ${timestamp()}
  Workspace     : ${terraform.workspace}

  Mensaje:
  ${var.mensaje}
  EOT
}

resource "local_file" "laboratorio" {
  filename = local.ruta_archivo
  content  = local.contenido_archivo
}