
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.45.0"
    }
  }
}


provider "aws" {
  region                      = var.region
  access_key                  = "test"
  secret_key                  = "test"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3             = "http://localhost:4566"
    /* dynamodb       = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    lambda         = "http://localhost:4566"
    iam            = "http://localhost:4566"
    ec2            = "http://localhost:4566"
    ecs            = "http://localhost:4566"
    cloudformation = "http://localhost:4566"
    route53        = "http://localhost:4566"
    cloudwatch     = "http://localhost:4566"
    secretsmanager = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    kms            = "http://localhost:4566"
    rds            = "http://localhost:4566"
    sts            = "http://localhost:4566" */
  }
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

# Subir index.html al bucket
resource "aws_s3_object" "index" {
  bucket = aws_s3_bucket.practica_bucket.id
  key    = var.index_document
  source = var.index_file_path
  acl    = "public-read"
  content_type = "text/html"
}

