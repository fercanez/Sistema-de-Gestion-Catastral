# Flujos operativos

## Propósito

Este documento describe los principales flujos operativos identificados en el Sistema de Gestión Catastral BC.

Su objetivo es explicar, desde una perspectiva funcional, cómo se ejecutan procesos frecuentes del sistema y cómo interactúan los módulos involucrados.

No sustituye manuales de usuario detallados, pero sí ayuda a entender:

- qué pasos siguen los procesos principales
- qué módulos participan
- qué controles existen
- qué resultados produce cada flujo

---

## Enfoque general

Los flujos operativos del sistema giran alrededor de la clave catastral y de los procesos institucionales asociados a:

- consulta predial
- administración de propietarios
- movimientos catastrales
- expediente integral
- control cartográfico
- mantenimiento de catálogos
- autenticación y control de acceso

Cada flujo combina uno o más módulos y, en varios casos, deja trazabilidad en auditoría.

---

## Flujo 1. Inicio de sesión

### Objetivo
Permitir acceso controlado al sistema según usuario, rol y permisos.

### Módulos involucrados
- autenticación
- seguridad
- auditoría

### Pasos generales
1. el usuario captura sus credenciales
2. el sistema valida usuario y contraseña
3. se verifica que la cuenta esté activa
4. se identifican roles y permisos
5. se registra evento de acceso
6. se genera token JWT
7. el cliente usa ese token para peticiones posteriores

### Resultado
- acceso autorizado al sistema
- permisos disponibles según rol
- trazabilidad básica de acceso

### Controles
- contraseña hasheada
- token firmado
- validación de usuario activo
- restricción por roles y permisos

---

## Flujo 2. Consulta de ficha predial

### Objetivo
Consultar la información principal de un predio a partir de su clave catastral.

### Módulos involucrados
- padrón
- expediente
- propietarios
- cartografía

### Pasos generales
1. el usuario busca un predio por clave u otro criterio
2. el sistema localiza el registro en padrón
3. se devuelve la ficha predial consolidada
4. si aplica, se complementa con propietarios o geometría
5. el usuario revisa la información en pantalla

### Resultado
La ficha puede mostrar, según el caso:
- clave catastral
- ubicación
- titular principal
- superficies
- valores
- uso
- estado cartográfico
- datos integrados para consulta rápida

### Controles
- acceso según permisos del usuario
- validación de existencia del predio
- respuesta controlada por vistas o consultas consolidadas

---

## Flujo 3. Consulta de expediente integral

### Objetivo
Obtener una vista ampliada del estado de un predio.

### Módulos involucrados
- expediente
- padrón
- propietarios
- auditoría
- cartografía

### Pasos generales
1. el usuario solicita expediente por clave catastral
2. el sistema consulta la vista integral correspondiente
3. se integran datos del predio, titularidad, control cartográfico y documentos
4. si existen eventos históricos, se integran al historial
5. el sistema devuelve la respuesta consolidada

### Resultado
El usuario obtiene una vista integral del predio, con información útil para:
- atención operativa
- revisión técnica
- consulta administrativa
- análisis territorial

### Controles
- acceso restringido por rol/permisos
- consistencia entre módulos consultados
- trazabilidad mediante historial cuando aplica

---

## Flujo 4. Consulta de historial del predio

### Objetivo
Visualizar eventos relevantes asociados a un predio a lo largo del tiempo.

### Módulos involucrados
- expediente
- auditoría
- movimientos
- cartografía

### Pasos generales
1. el usuario solicita historial por clave
2. el sistema consulta la estructura cronológica correspondiente
3. se integran eventos de movimiento, cambios o auditoría
4. se devuelve la línea de tiempo del expediente

### Resultado
Permite revisar:
- movimientos anteriores
- eventos administrativos
- cambios cartográficos
- eventos históricos relevantes

---

## Flujo 5. Consulta de documentos

### Objetivo
Listar y abrir documentos relacionados con un predio.

### Módulos involucrados
- expediente
- documentos/visor de archivos

### Pasos generales
1. el usuario consulta documentos de una clave
2. el sistema localiza los archivos asociados
3. se devuelve listado de documentos disponibles
4. el usuario selecciona un archivo
5. el backend valida la ruta segura
6. el sistema entrega el archivo solicitado

### Resultado
Acceso controlado a documentos vinculados al expediente predial.

### Controles
- validación de ruta real del archivo
- protección contra path traversal
- acceso solo a documentos autorizados por la lógica del sistema

---

## Flujo 6. Consulta de propietarios por predio

### Objetivo
Ver las personas asociadas a una clave catastral.

### Módulos involucrados
- propietarios
- padrón
- catastro

### Pasos generales
1. el usuario consulta propietarios de una clave
2. el sistema obtiene relaciones persona-predio
3. se calculan o validan porcentajes y titularidad principal
4. se devuelve el listado de titulares relacionados

### Resultado
Se obtiene información como:
- nombre de propietario(s)
- titular principal
- porcentajes de propiedad
- tipo de titularidad

---

## Flujo 7. Alta o edición de persona propietaria

### Objetivo
Registrar o actualizar una persona en el catálogo institucional.

### Módulos involucrados
- propietarios
- catálogos
- padrón

### Pasos generales
1. el usuario captura o localiza una persona
2. el sistema valida si ya existe
3. si no existe, se crea registro
4. si existe, se permite su actualización
5. si aplica, se sincroniza información visible hacia el padrón

### Resultado
Catálogo de personas actualizado y más consistente.

### Controles
- validación de duplicados
- homologación de captura
- sincronización controlada con relaciones prediales

---

## Flujo 8. Asociación de propietario con predio

### Objetivo
Relacionar una persona con un predio específico.

### Módulos involucrados
- propietarios
- catastro
- padrón

### Pasos generales
1. se localiza la persona
2. se localiza el predio
3. se crea o actualiza la relación propietario-predio
4. se define porcentaje y tipo de titularidad
5. se recalcula el titular principal si aplica
6. se sincroniza el padrón cuando corresponde

### Resultado
El predio queda correctamente vinculado con uno o varios propietarios.

### Controles
- validación de porcentajes
- consistencia de copropiedad
- actualización del titular visible
- control de relaciones duplicadas

---

## Flujo 9. Fusión de propietarios duplicados

### Objetivo
Corregir casos en los que una misma persona aparece duplicada en el catálogo.

### Módulos involucrados
- propietarios
- catastro
- padrón

### Pasos generales
1. se detectan registros duplicados o equivalentes
2. se selecciona un registro principal
3. se migran relaciones y referencias
4. se desactiva o elimina el duplicado según la lógica implementada
5. se valida consistencia posterior

### Resultado
Disminución de duplicidad y mejora de calidad de datos.

---

## Flujo 10. Captura de movimiento catastral

### Objetivo
Registrar un cambio propuesto sobre un predio sin aplicarlo inmediatamente.

### Módulos involucrados
- movimientos
- padrón
- propietarios
- catálogos
- auditoría

### Pasos generales
1. el usuario selecciona el tipo de movimiento
2. captura datos actuales y nuevos
3. el sistema registra el movimiento
4. se almacenan detalles del cambio
5. el movimiento queda en estado inicial de trabajo o revisión

### Resultado
Movimiento registrado, pero aún no aplicado al padrón definitivo.

### Controles
- validación de tipo de movimiento
- control por permisos
- persistencia de encabezado y detalle
- separación entre captura y aplicación

---

## Flujo 11. Revisión/autorización de movimiento

### Objetivo
Controlar institucionalmente los cambios antes de impactar el padrón.

### Módulos involucrados
- movimientos
- seguridad
- auditoría

### Pasos generales
1. un usuario con permisos revisa el movimiento capturado
2. valida consistencia y datos propuestos
3. autoriza, observa o rechaza según corresponda
4. el estado del movimiento se actualiza

### Resultado
El movimiento queda listo para aplicación o regreso a corrección.

### Controles
- permisos específicos por rol
- control de estados
- trazabilidad de revisión

---

## Flujo 12. Aplicación de movimiento

### Objetivo
Impactar en el padrón y estructuras relacionadas un cambio previamente autorizado.

### Módulos involucrados
- movimientos
- padrón
- propietarios
- cartografía
- auditoría

### Pasos generales
1. se selecciona un movimiento autorizado
2. el sistema identifica el tipo de cambio
3. aplica la lógica correspondiente sobre tablas/vistas relacionadas
4. actualiza datos del padrón
5. propaga cambios a relaciones auxiliares cuando aplica
6. registra auditoría de aplicación
7. cambia el estado del movimiento a aplicado

### Resultado
El cambio se vuelve efectivo en la base operativa.

### Controles
- validación de estado previo
- restricción por permisos
- actualización auditada
- trazabilidad de antes/después mediante detalle y auditoría

---

## Flujo 13. Cambio de titularidad

### Objetivo
Actualizar la persona titular de un predio mediante un proceso controlado.

### Módulos involucrados
- movimientos
- propietarios
- padrón
- auditoría

### Pasos generales
1. se captura un movimiento de titularidad
2. se identifican propietario actual y nuevo propietario
3. se actualizan relaciones propietario-predio
4. se sincroniza el nombre visible en padrón
5. se registra auditoría del cambio

### Resultado
El predio queda con nueva titularidad de manera controlada y trazable.

---

## Flujo 14. Subdivisión o fusión predial

### Objetivo
Registrar transformaciones estructurales entre predios.

### Módulos involucrados
- movimientos
- catastro
- relaciones prediales
- auditoría
- cartografía

### Pasos generales
1. se captura el movimiento correspondiente
2. se identifican predios origen y destino
3. se actualizan relaciones prediales
4. se aplican claves nuevas, bajas o vinculaciones históricas
5. se registra la transformación en auditoría
6. se actualizan componentes derivados cuando corresponde

### Resultado
El sistema conserva trazabilidad sobre cambios estructurales del predio.

---

## Flujo 15. Clasificación y regularización de condominio

### Objetivo
Actualizar o corregir predios vinculados a régimen de condominio.

### Módulos involucrados
- padrón
- propietarios
- catastro

### Pasos generales
1. se identifican predios bajo esquema de condominio
2. se revisan reglas de clasificación
3. se corrigen valores faltantes o inconsistentes
4. se actualiza estructura relacionada
5. se valida impacto en titularidad o régimen

### Resultado
Predios correctamente clasificados dentro del modelo de condominio.

---

## Flujo 16. Actualización de zonas homogéneas

### Objetivo
Mantener vigente la clasificación o valor territorial asociado a zonas homogéneas.

### Módulos involucrados
- padrón
- catálogos
- análisis territorial

### Pasos generales
1. se consulta el estado actual de zonas
2. se captura importación, ajuste o alta
3. el sistema valida estructura y datos
4. se actualizan valores o relaciones por año
5. se generan resultados para consulta posterior

### Resultado
Zonas homogéneas actualizadas y disponibles para análisis técnico o valuación.

---

## Flujo 17. Control cartográfico

### Objetivo
Revisar consistencia entre padrón y componente geográfico.

### Módulos involucrados
- expediente
- cartografía
- auditoría
- padrón

### Pasos generales
1. se consulta el control cartográfico de un predio o conjunto
2. el sistema compara geometría, cobertura o metadatos
3. se detectan faltantes, diferencias o cambios
4. se muestran indicadores o resultados
5. si aplica, se canaliza a revisión técnica

### Resultado
Identificación de inconsistencias o cambios geométricos relevantes.

---

## Flujo 18. Mantenimiento de calles y colonias

### Objetivo
Mantener consistencia en catálogos territoriales de referencia.

### Módulos involucrados
- catálogos
- padrón
- propietarios

### Pasos generales
1. se consulta catálogo de calles o colonias
2. se crean, actualizan, fusionan o depuran registros
3. el sistema actualiza referencias relacionadas
4. se valida consistencia sobre padrón y personas

### Resultado
Catálogos normalizados y con menos duplicidad.

---

## Flujo 19. Administración de usuarios

### Objetivo
Gestionar acceso institucional al sistema.

### Módulos involucrados
- administración
- seguridad
- auditoría

### Pasos generales
1. un administrador consulta usuarios
2. crea, actualiza o desactiva cuentas
3. asigna roles
4. restablece contraseñas si es necesario
5. se registra auditoría administrativa

### Resultado
Control centralizado de acceso y permisos.

---

## Flujo 20. Auditoría y revisión operativa

### Objetivo
Revisar acciones realizadas en el sistema para fines de control interno.

### Módulos involucrados
- auditoría
- administración
- movimientos
- seguridad

### Pasos generales
1. se consulta el registro de auditoría correspondiente
2. se filtran eventos por usuario, fecha, tipo o entidad
3. se revisan acciones relevantes
4. se usan resultados para trazabilidad o revisión institucional

### Resultado
Mayor control y capacidad de reconstrucción de eventos.

---

## Resumen de módulos por flujo

### Seguridad
Participa en:
- inicio de sesión
- autorización de acceso
- administración de usuarios
- auditoría de acceso

### Padrón
Participa en:
- ficha predial
- consulta predial
- clasificación territorial
- regularización de régimen
- zonas homogéneas

### Propietarios
Participa en:
- catálogo de personas
- asociación persona-predio
- titularidad
- fusión de duplicados

### Movimientos
Participa en:
- captura
- revisión
- autorización
- aplicación
- subdivisión/fusión
- cambios de datos prediales

### Expediente
Participa en:
- expediente integral
- historial
- documentos
- control cartográfico

### Catálogos
Participa en:
- calles
- colonias
- normalización institucional
- apoyo a consistencia de captura

### Auditoría
Participa transversalmente en:
- accesos
- cambios administrativos
- aplicación de movimientos
- cambios geométricos
- historial del expediente

---

## Observaciones finales

Los flujos operativos del sistema muestran una arquitectura institucional orientada a:

- control del cambio
- trazabilidad
- consulta integral del predio
- integración entre padrón, propietarios y cartografía
- operación segura basada en roles y permisos

El diseño más importante que se aprecia es la separación entre:

- captura del cambio
- revisión/autorización
- aplicación efectiva

Eso fortalece el control institucional del sistema catastral.

---

## Recomendación futura

Como siguiente nivel de detalle, conviene complementar este documento con:

- manuales operativos por perfil
- inventario de endpoints confirmados
- matriz rol -> permisos -> acciones
- diagrama de estados para movimientos
- glosario institucional de términos catastrales