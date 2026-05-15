
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.45.0"
    }
  }
}


provider "aws" {
}

# Creación de un bucket S3 con etiquetas    
resource "aws_s3_bucket" "practica_bucket" {
  bucket = var.nombre_bucket
  tags = {
    Name        = var.tag_name
    Environment = var.environment
  }
}

# Habilitar el bucket como sitio web estático
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.practica_bucket.id

  index_document {
    suffix = var.index_document
  }
}

# Permite políticas públicas a nivel bucket para hosting estático.
resource "aws_s3_bucket_public_access_block" "website_access" {
  bucket = aws_s3_bucket.practica_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política pública de lectura del objeto del sitio web.
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.practica_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = ["${aws_s3_bucket.practica_bucket.arn}/*"]
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website_access]
}

# Subir index.html al bucket
resource "aws_s3_object" "index" {
  bucket = aws_s3_bucket.practica_bucket.id
  key    = var.index_document
  source = var.index_file_path
  content_type = "text/html"

  depends_on = [aws_s3_bucket_policy.public_read]
}

