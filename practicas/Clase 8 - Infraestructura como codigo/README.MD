# Clase 8 - Infraestructura como código (IaC)

## Objetivo de la clase
Esta práctica reúne laboratorios progresivos para aprender Terraform desde fundamentos locales hasta despliegues reales en AWS.

## Estructura del contenido

### 1) mi-primer-iac
Ruta: `mi-primer-iac/`

Qué se practica:
- Sintaxis base de Terraform.
- Uso de provider local para crear archivos en disco.
- Variables, `terraform.tfvars` y outputs.

Intención del laboratorio:
- Introducir IaC de forma simple y observable.
- Entender cómo una declaración Terraform se traduce en recursos concretos.

Alcance:
- Solo recursos locales (archivos).
- No usa servicios cloud.

---

### 2) laboratorio_locales_ia
Ruta: `laboratorio_locales_ia/`

Qué se practica:
- Uso combinado de providers `local` y `random`.
- Construcción de contenido dinámico con `locals`.
- Generación de artefactos versionables y verificables con checksum.
- Ingeniería de prompts aplicada a IaC: el laboratorio se genera desde el prompt en `prompt ejemplo para archivos locales.txt` usando un agente IA.

Intención del laboratorio:
- Pasar de un ejemplo básico a un patrón más robusto de automatización local.
- Practicar trazabilidad y consistencia en artefactos generados.
- Mostrar cómo un agente IA puede traducir un prompt funcional en una estructura Terraform ejecutable.

Alcance:
- Recursos locales con mayor complejidad funcional.
- Sin dependencias de AWS.
- Incluye el flujo de generación asistida por IA (prompt -> código Terraform -> apply).

---

### 3) aws-ministack-provider
Ruta: `aws-ministack-provider/`

Qué se practica:
- Configuración del provider AWS apuntando a MiniStack (`localhost:4566`).
- Creación de bucket S3.
- Habilitación de website estático.
- Subida de `index.html` al bucket.

Intención del laboratorio:
- Simular un flujo cloud en entorno local antes de pasar a AWS real.
- Validar ciclo `init/plan/apply/destroy` con bajo riesgo.

Alcance:
- Emulación local de servicios AWS enfocados en S3.
- Útil para pruebas rápidas y aprendizaje seguro.

---

### 4) aws-provider
Ruta: `aws-provider/`

Qué se practica:
- Despliegue real en AWS S3.
- Configuración de hosting estático y publicación de objeto HTML.
- Gestión de acceso público mediante bucket policy y public access block.
- Validación de endpoints de website y object URL.

Intención del laboratorio:
- Llevar el ejercicio a condiciones reales de nube.
- Trabajar restricciones reales: IAM, región, políticas y seguridad.

Alcance:
- Implementación real de sitio estático en S3.
- No incluye CDN, DNS, certificados TLS ni pipeline CI/CD.

## Lectura global del conjunto
La secuencia pedagógica de la clase avanza en cuatro etapas:

1. Fundamentos de Terraform en local (`mi-primer-iac`).
2. Patrones locales intermedios con contenido dinámico (`laboratorio_locales_ia`).
3. Simulación cloud local para practicar S3 sin costo (`aws-ministack-provider`).
4. Despliegue en AWS real con consideraciones operativas (`aws-provider`).

En conjunto, la clase cubre la transición completa desde IaC básico hasta una publicación funcional en S3, con enfoque incremental y práctico.

## Recomendación de ejecución
Orden sugerido para recorrer los laboratorios:

1. `mi-primer-iac`
2. `laboratorio_locales_ia`
3. `aws-ministack-provider`
4. `aws-provider`

Este orden reduce fricción técnica y ayuda a consolidar conceptos antes de pasar a AWS real.
