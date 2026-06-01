# Roadmap técnico y operativo

## Propósito

Este documento propone una hoja de ruta inicial para la evolución técnica, operativa y documental del Sistema de Gestión Catastral BC.

Su objetivo es convertir los hallazgos actuales en una secuencia razonable de trabajo, priorizando estabilidad, seguridad, mantenibilidad y madurez operativa.

No sustituye un plan formal de proyecto, pero sí ofrece una guía clara para orientar decisiones y priorizar esfuerzos.

---

## Principios del roadmap

La evolución recomendada del sistema debe buscar:

- reducir riesgo operativo
- fortalecer seguridad
- mejorar control de producción
- documentar mejor el núcleo funcional
- disminuir deuda técnica
- habilitar mantenimiento más seguro
- preparar el sistema para evolución futura

---

## Estado actual resumido

Actualmente el sistema ya cuenta con:

- backend FastAPI funcional
- autenticación basada en JWT
- despliegue operativo en Linux con `systemd`
- integración con PostgreSQL
- flujos funcionales clave operando
- documentación técnica y operativa base
- inventario inicial de riesgos y pendientes
- backlog técnico preliminar

Al mismo tiempo, se detectan oportunidades importantes en:

- formalización de despliegues
- seguridad y permisos
- documentación de datos
- pruebas automatizadas
- estrategia de respaldo y recuperación
- ordenamiento operativo del servidor
- consolidación de deuda técnica histórica

---

## Horizonte de trabajo sugerido

Este roadmap se organiza en cuatro horizontes:

1. **corto plazo**
2. **corto-mediano plazo**
3. **mediano plazo**
4. **largo plazo**

---

## 1. Corto plazo
### Objetivo
Asegurar estabilidad operativa, control básico y reducción de riesgo inmediato.

### Prioridades principales
- proteger seguridad básica
- formalizar cambios en producción
- asegurar recuperación ante falla
- establecer validaciones mínimas repetibles

### Líneas de trabajo

#### 1.1 Seguridad esencial
- revisar robustez de `SECRET_KEY`
- revisar expiración de tokens
- documentar mejor roles y permisos actuales
- auditar endpoints críticos de administración y movimientos

#### 1.2 Control de producción
- usar `docs/checklist-produccion.md` antes de cambios
- registrar cambios en `docs/bitacora-cambios.md`
- evitar cambios manuales no documentados
- mantener respaldos antes de despliegues

#### 1.3 Respaldo y recuperación
- automatizar dumps básicos de PostgreSQL
- respaldar configuración y código antes de cambios
- probar restauración simple de código y configuración
- establecer ubicación clara para respaldos

#### 1.4 Validación mínima del sistema
- definir un set fijo de endpoints críticos para smoke tests
- validar siempre:
  - ficha predial
  - historial
  - documentos
  - propietarios
- documentar resultados de validación post-cambio

### Entregables esperados
- operación más controlada
- menos riesgo de cambios improvisados
- mayor trazabilidad
- capacidad básica de rollback

---

## 2. Corto-mediano plazo
### Objetivo
Fortalecer comprensión estructural del sistema y reducir deuda técnica crítica.

### Prioridades principales
- documentar mejor el núcleo de datos y permisos
- ordenar código y flujos críticos
- mejorar calidad de validación y soporte

### Líneas de trabajo

#### 2.1 Datos y modelo
- construir diccionario de datos formal
- documentar vistas críticas
- aclarar estrategia del padrón anual
- revisar integridad de relaciones propietario-predio
- documentar mejor subdivisiones, fusiones y relaciones prediales

#### 2.2 Código y arquitectura
- revisar routers grandes
- separar lógica HTTP y lógica de negocio
- centralizar SQL complejo o crítico
- documentar diferencias entre componentes actuales y legacy

#### 2.3 Seguridad funcional
- construir matriz rol -> permiso -> endpoint
- contrastar ACL documentada contra comportamiento real
- revisar consistencia entre roles, permisos y rutas expuestas

#### 2.4 Operación y soporte
- consolidar manuales ya creados
- refinar catálogo de incidentes comunes
- formalizar flujo de escalación
- capturar preguntas frecuentes reales de usuarios internos

### Entregables esperados
- mayor entendimiento estructural
- mejor mantenibilidad
- menor dependencia de conocimiento informal
- mejor soporte técnico y funcional

---

## 3. Mediano plazo
### Objetivo
Incrementar calidad del desarrollo y reducir riesgo de regresiones.

### Prioridades principales
- incorporar pruebas
- mejorar disciplina de despliegue
- crear entorno más seguro para cambios

### Líneas de trabajo

#### 3.1 Pruebas automatizadas
- crear pruebas mínimas para autenticación
- crear pruebas para endpoints críticos
- crear smoke tests automáticos post-despliegue
- definir datos de prueba controlados

#### 3.2 Ambientes
- separar mejor producción de fuentes y artefactos históricos
- definir entorno de staging o pruebas si es posible
- validar cambios en ambiente previo antes de producción

#### 3.3 Monitoreo básico
- revisar salud periódica de servicios
- monitorear disponibilidad del puerto/API
- establecer métricas o alertas mínimas
- revisar espacio en disco y crecimiento de documentos

#### 3.4 Gobierno del cambio
- formalizar una bitácora operativa continua
- establecer responsables para cambios técnicos
- alinear backlog con prioridades reales del área

### Entregables esperados
- cambios más seguros
- menos regresiones
- mejor observabilidad
- menor dependencia de producción para validar todo

---

## 4. Largo plazo
### Objetivo
Preparar al sistema para evolución sostenible y modernización gradual.

### Prioridades principales
- consolidar arquitectura
- profesionalizar operación
- habilitar evolución controlada

### Líneas de trabajo

#### 4.1 Modernización técnica
- revisar oportunidades de refactorización mayor
- reducir dependencia de lógica dispersa en SQL manual
- mejorar separación por capas
- consolidar módulos legacy o planear retiro

#### 4.2 Gestión formal de releases
- versionar despliegues
- generar notas de cambio por release
- formalizar pipeline de entrega si es viable
- mejorar reproducibilidad del despliegue

#### 4.3 Gobierno de datos
- establecer reglas formales de calidad de datos
- generar reportes periódicos de inconsistencias
- formalizar catálogos y diccionario de datos
- definir políticas más claras para evolución estructural del padrón

#### 4.4 Documentación madura
- mantener documentación viva
- crear manuales por perfil de usuario
- documentar FAQ funcional y técnica especializada
- vincular documentación con cambios reales del sistema

### Entregables esperados
- arquitectura más sostenible
- operación más predecible
- evolución menos riesgosa
- mejor transferencia de conocimiento

---

## Fases sugeridas

## Fase 1. Estabilización operativa
### Enfoque
Asegurar operación y control.

### Incluye
- seguridad básica
- checklist productivo
- bitácora de cambios
- respaldos
- rollback básico
- validación mínima repetible

---

## Fase 2. Comprensión y orden técnico
### Enfoque
Entender y documentar mejor lo que ya existe.

### Incluye
- diccionario de datos
- matriz de permisos
- revisión de vistas críticas
- documentación de reglas funcionales clave
- análisis de módulos legacy

---

## Fase 3. Calidad y prueba
### Enfoque
Reducir riesgo de cambio.

### Incluye
- pruebas automatizadas mínimas
- smoke tests
- staging o ambiente controlado
- monitoreo básico

---

## Fase 4. Evolución sostenible
### Enfoque
Mejorar arquitectura y profesionalizar operación.

### Incluye
- refactorización gradual
- mejor gobierno del cambio
- releases versionados
- gobierno de datos
- madurez documental continua

---

## Dependencias importantes

Algunos trabajos dependen de otros:

| Trabajo | Depende de |
|---|---|
| matriz rol -> permiso -> endpoint | revisión de ACL + inventario real de endpoints |
| smoke tests | definición de endpoints críticos estables |
| pruebas automatizadas | entorno de prueba y datos mínimos |
| staging | ordenamiento de despliegue y configuración |
| refactorización mayor | comprensión suficiente de módulos y SQL crítico |
| gobierno de datos | diccionario de datos + revisión del padrón anual |

---

## Indicadores simples de avance

Se pueden usar métricas sencillas como:

- número de cambios productivos registrados en bitácora
- porcentaje de endpoints críticos validados tras despliegue
- número de respaldos automatizados exitosos
- porcentaje de tareas de alta prioridad cerradas
- número de incidentes repetitivos no resueltos
- cobertura mínima de pruebas en rutas críticas
- número de documentos actualizados por trimestre

---

## Riesgos de no ejecutar este roadmap

Si no se atienden estas líneas de mejora, persisten riesgos como:

- cambios productivos no controlados
- dificultad para recuperación ante falla
- accesos inconsistentes o inseguros
- dependencia de conocimiento informal
- regresiones frecuentes
- mantenimiento costoso
- crecimiento desordenado del sistema
- dificultad para incorporar nuevo personal técnico

---

## Recomendación de gobernanza

Para que este roadmap funcione, conviene definir al menos:

- responsable técnico principal
- responsable operativo/documental
- periodicidad de revisión del backlog
- criterio para declarar prioridades
- mecanismo de seguimiento de avances

---

## Próximos pasos sugeridos

### Inmediatos
1. usar el checklist de producción de forma habitual
2. registrar cambios en bitácora
3. asegurar respaldos previos a cambios
4. priorizar tareas críticas del backlog técnico

### Siguiente nivel
1. construir diccionario de datos
2. formalizar matriz de permisos
3. iniciar smoke tests básicos
4. ordenar despliegue y recuperación

### Más adelante
1. incorporar pruebas automatizadas
2. separar mejor ambientes
3. consolidar refactorizaciones
4. formalizar releases y roadmap continuo

---

## Relación con otros documentos

Este roadmap se apoya especialmente en:

- `docs/pendientes-tecnicos.md`
- `docs/backlog-tecnico.md`
- `docs/checklist-produccion.md`
- `docs/bitacora-cambios.md`
- `docs/matriz-modulos.md`
- `docs/permisos-y-roles.md`

---

## Resumen

El sistema ya tiene una base funcional y documental valiosa.

El siguiente paso no es “rehacer todo”, sino evolucionarlo de forma ordenada:

- primero estabilizar
- luego entender y documentar mejor
- después probar y controlar cambios
- finalmente modernizar con menor riesgo

Este roadmap propone esa secuencia para avanzar con criterio técnico y operativo.