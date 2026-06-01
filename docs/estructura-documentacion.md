# Estructura de documentación

## Propósito

Este documento define una estructura objetivo para organizar la documentación del Sistema de Gestión Catastral BC de forma más clara, mantenible y escalable.

Su objetivo es:

- ordenar mejor la carpeta `docs/`
- facilitar navegación por tema
- reducir crecimiento desordenado
- preparar una futura reorganización sin perder trazabilidad

Este documento no implica mover archivos de inmediato.  
Funciona como referencia para una reorganización futura controlada.

---

## Situación actual

Actualmente la documentación se encuentra en un esquema plano dentro de `docs/`, con múltiples archivos al mismo nivel.

Ese esquema ha funcionado bien para construir rápidamente la base documental, pero conforme aumentan los documentos, conviene agruparlos por categoría.

---

## Objetivo de organización

La propuesta es migrar gradualmente de una estructura plana a una estructura temática por carpetas.

### Estructura objetivo propuesta

```text
docs/
├── 00-general/
│   ├── indice-documentacion.md
│   ├── glosario.md
│   └── roadmap.md
│
├── 01-arquitectura/
│   ├── arquitectura-tecnica.md
│   ├── matriz-modulos.md
│   ├── modelo-de-datos.md
│   ├── endpoints.md
│   ├── flujos-operativos.md
│   └── permisos-y-roles.md
│
├── 02-operacion/
│   ├── operacion-servidor.md
│   ├── despliegue.md
│   ├── checklist-produccion.md
│   ├── respaldo-y-recuperacion.md
│   └── bitacora-cambios.md
│
├── 03-soporte/
│   ├── manual-admin.md
│   ├── manual-operacion-diaria.md
│   ├── manual-soporte.md
│   ├── manual-usuarios.md
│   ├── incidentes-comunes.md
│   └── faq-operativa.md
│
└── 04-gestion-tecnica/
    ├── pendientes-tecnicos.md
    └── backlog-tecnico.md
```

---

## Criterio de agrupación

La propuesta separa la documentación por intención principal de uso.

### `00-general`
Documentos base o de entrada general.

Incluye:
- índice documental
- glosario
- roadmap

### `01-arquitectura`
Documentos que explican cómo está construido el sistema.

Incluye:
- arquitectura técnica
- módulos
- modelo de datos
- endpoints
- flujos
- permisos

### `02-operacion`
Documentos relacionados con producción y operación del servidor.

Incluye:
- operación del servidor
- despliegue
- checklist de producción
- respaldos
- bitácora de cambios

### `03-soporte`
Documentos orientados a uso, soporte y atención operativa.

Incluye:
- manuales
- incidentes comunes
- FAQ operativa

### `04-gestion-tecnica`
Documentos orientados a mejora continua y planeación técnica.

Incluye:
- pendientes técnicos
- backlog
- otros artefactos de gestión futura

---

## Beneficios esperados

### 1. Navegación más clara
La persona que consulta la documentación puede ubicar más rápido qué leer según su necesidad.

### 2. Menor crecimiento desordenado
Evita que `docs/` se convierta en una lista cada vez más larga y difícil de recorrer.

### 3. Mejor mantenibilidad
Facilita agregar nuevos documentos sin perder coherencia.

### 4. Mejor presentación institucional
Una estructura temática mejora calidad de entrega, transferencia de conocimiento y percepción de orden técnico.

### 5. Escalabilidad
Permite crecer hacia documentación más especializada sin romper la estructura base.

---

## Archivos actuales y destino sugerido

| Archivo actual | Destino sugerido |
|---|---|
| `docs/indice-documentacion.md` | `docs/00-general/indice-documentacion.md` |
| `docs/glosario.md` | `docs/00-general/glosario.md` |
| `docs/roadmap.md` | `docs/00-general/roadmap.md` |
| `docs/arquitectura-tecnica.md` | `docs/01-arquitectura/arquitectura-tecnica.md` |
| `docs/matriz-modulos.md` | `docs/01-arquitectura/matriz-modulos.md` |
| `docs/modelo-de-datos.md` | `docs/01-arquitectura/modelo-de-datos.md` |
| `docs/endpoints.md` | `docs/01-arquitectura/endpoints.md` |
| `docs/flujos-operativos.md` | `docs/01-arquitectura/flujos-operativos.md` |
| `docs/permisos-y-roles.md` | `docs/01-arquitectura/permisos-y-roles.md` |
| `docs/operacion-servidor.md` | `docs/02-operacion/operacion-servidor.md` |
| `docs/despliegue.md` | `docs/02-operacion/despliegue.md` |
| `docs/checklist-produccion.md` | `docs/02-operacion/checklist-produccion.md` |
| `docs/respaldo-y-recuperacion.md` | `docs/02-operacion/respaldo-y-recuperacion.md` |
| `docs/bitacora-cambios.md` | `docs/02-operacion/bitacora-cambios.md` |
| `docs/manual-admin.md` | `docs/03-soporte/manual-admin.md` |
| `docs/manual-operacion-diaria.md` | `docs/03-soporte/manual-operacion-diaria.md` |
| `docs/manual-soporte.md` | `docs/03-soporte/manual-soporte.md` |
| `docs/manual-usuarios.md` | `docs/03-soporte/manual-usuarios.md` |
| `docs/incidentes-comunes.md` | `docs/03-soporte/incidentes-comunes.md` |
| `docs/faq-operativa.md` | `docs/03-soporte/faq-operativa.md` |
| `docs/pendientes-tecnicos.md` | `docs/04-gestion-tecnica/pendientes-tecnicos.md` |
| `docs/backlog-tecnico.md` | `docs/04-gestion-tecnica/backlog-tecnico.md` |

---

## Estrategia recomendada de migración

La reorganización no debe hacerse de forma improvisada.  
Se recomienda una migración controlada.

### Opción recomendada
Hacer la migración en una sola intervención breve y ordenada, incluyendo:

1. creación de carpetas nuevas
2. movimiento de archivos
3. actualización de rutas en `README.md`
4. actualización de rutas en `docs/indice-documentacion.md`
5. revisión de referencias cruzadas en documentos
6. validación final de enlaces

---

## Estrategia conservadora

Si no se desea mover archivos todavía, puede mantenerse la estructura actual y usar este documento como referencia futura.

### Recomendación
Mientras no se haga la migración:
- mantener `docs/` plano
- seguir actualizando `README.md`
- seguir actualizando `docs/indice-documentacion.md`
- evitar mezclar nombres inconsistentes

---

## Cuándo sí conviene migrar

La reorganización conviene especialmente cuando ocurra alguno de estos escenarios:

- se agreguen muchos más documentos
- se prepare una entrega formal del proyecto
- se incorpore nuevo personal técnico
- se haga una ronda de mantenimiento mayor del repositorio
- se quiera dejar la documentación con formato más institucional

---

## Cuándo conviene esperar

Puede ser mejor esperar si:

- lo prioritario ahora es estabilidad y no forma
- no hay tiempo para revisar todos los enlaces
- no se quiere asumir riesgo de romper referencias cruzadas
- la documentación apenas se está consolidando

---

## Reglas sugeridas para documentos futuros

Independientemente de cuándo se haga la migración, conviene mantener estas reglas:

- usar minúsculas
- usar guiones para separar palabras
- evitar espacios
- usar nombres descriptivos
- un documento = un tema principal
- actualizar el índice documental cuando se agregue un archivo nuevo
- actualizar `README.md` cuando el cambio afecte navegación general

---

## Documentos futuros sugeridos por categoría

### `00-general`
- `faq-desarrollo.md`
- `convenciones-documentacion.md`

### `01-arquitectura`
- `diccionario-datos.md`
- `matriz-permisos-endpoints.md`
- `guia-integraciones.md`

### `02-operacion`
- `guia-staging.md`
- `procedimiento-release.md`
- `runbook-produccion.md`

### `03-soporte`
- `manual-supervisores.md`
- `guia-capacitacion.md`

### `04-gestion-tecnica`
- `plan-versionado.md`
- `criterios-priorizacion.md`

---

## Recomendación práctica actual

Dado el estado actual del proyecto, la recomendación es:

### Ahora
- no mover archivos todavía
- usar esta estructura como guía
- mantener consistencia documental

### Más adelante
- ejecutar migración completa en una sola intervención
- actualizar enlaces de forma controlada
- validar navegación final

---

## Relación con otros documentos

Este documento complementa especialmente a:

- `README.md`
- `docs/indice-documentacion.md`
- `docs/roadmap.md`

---

## Resumen

La documentación actual ya es amplia y útil, pero su crecimiento hace recomendable una estructura temática futura.

Este documento define esa estructura objetivo sin obligar a una migración inmediata, permitiendo planear una reorganización ordenada cuando sea oportuno.