output "local_file_foo" {
  description = "nombre del archivo de salida foo"
  value = local_file.foo.filename
}

output "local_file_hola" {
  description = "nombre del archivo de salida hola" 
  value = local_file.hola.filename
}

output "local_file_foo_var" {
  description = "nombre del archivo de salida foo_var" 
  value = local_file.foo_var.filename
}

output "local_file_hola_var" {
  description = "nombre del archivo de salida hola_var"
  value = local_file.hola_var.filename
}   
