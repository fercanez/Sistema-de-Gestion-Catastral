# Pendientes técnicos

## Propósito

Este documento reúne hallazgos, riesgos, mejoras y trabajos pendientes identificados durante la revisión técnica y operativa del Sistema de Gestión Catastral BC.

Su objetivo es ayudar a priorizar acciones futuras sobre:

- arquitectura
- seguridad
- despliegue
- mantenimiento
- datos
- documentación
- operación en producción

No representa un backlog exhaustivo, pero sí una base técnica útil para planificación.

---

## Criterios de priorización

Para organizar mejor los pendientes, se usa esta clasificación:

- **Alta prioridad**: puede afectar seguridad, disponibilidad o integridad de datos.
- **Media prioridad**: mejora mantenibilidad, claridad o control operativo.
- **Baja prioridad**: mejora orden, presentación o madurez documental.

---

## 1. Seguridad

## 1.1 Fortalecer control de `SECRET_KEY`
**Prioridad:** Alta

### Hallazgo
La autenticación JWT depende de una `SECRET_KEY` cargada por entorno. Si esta clave es débil, conocida o mal administrada, se compromete la seguridad de autenticación.

### Recomendación
- asegurar que la clave sea robusta
- no versionarla
- documentar política de resguardo
- revisar si existe rotación controlada

---

## 1.2 Revisar expiración y política de tokens
**Prioridad:** Alta

### Hallazgo
Se usa JWT para autenticación, pero conviene formalizar tiempos de expiración y manejo de sesiones.

### Recomendación
- revisar `ACCESS_TOKEN_EXPIRE_MINUTES`
- definir criterios de expiración por seguridad
- evaluar si hace falta refresh token o revocación controlada

---

## 1.3 Formalizar matriz de permisos
**Prioridad:** Alta

### Hallazgo
Existen roles y validaciones por permiso, pero falta una matriz formal rol -> permiso -> endpoint -> acción.

### Recomendación
- documentar ACL real
- comparar permisos esperados vs implementados
- identificar rutas con controles incompletos o ambiguos

---

## 1.4 Revisar endurecimiento de endpoints sensibles
**Prioridad:** Alta

### Hallazgo
Acciones como:
- administración de usuarios
- aplicación de movimientos
- edición de propietarios
- cambios de padrón

deben revisarse con especial cuidado.

### Recomendación
- auditar endpoints críticos
- confirmar validación de rol y permiso
- revisar si todas las acciones quedan auditadas

---

## 2. Despliegue y operación

## 2.1 Formalizar proceso de despliegue
**Prioridad:** Alta

### Hallazgo
El despliegue actual parece manual sobre `/opt/catastro_api`.

### Riesgo
- cambios no trazables
- errores humanos
- rollback difícil
- diferencias entre entorno local y producción

### Recomendación
- definir procedimiento estándar
- usar checklist por despliegue
- registrar versiones desplegadas
- separar claramente código fuente y despliegue operativo

---

## 2.2 Mantener copia Git controlada del proyecto en servidor o staging
**Prioridad:** Alta

### Hallazgo
El despliegue productivo identificado no estaba bajo Git en el servidor.

### Riesgo
- difícil rastrear cambios reales en producción
- complejidad para comparar versiones
- riesgo de hotfixes no documentados

### Recomendación
- mantener repo fuente controlado
- preferir despliegues desde fuente versionada
- evitar edición directa sobre producción

---

## 2.3 Documentar dependencias y procedimiento de instalación
**Prioridad:** Media

### Hallazgo
Aunque existe una base técnica del proyecto, conviene documentar claramente:
- cómo preparar entorno virtual
- cómo instalar dependencias
- cómo levantar el servicio

### Recomendación
- agregar guía práctica reproducible
- incluir versión de Python recomendada
- validar `requirements.txt`

---

## 2.4 Verificar monitoreo básico del servicio
**Prioridad:** Media

### Hallazgo
La API opera con `systemd`, pero no se evidenció monitoreo formal adicional.

### Recomendación
- revisar logs periódicamente
- establecer alertas básicas de caída
- monitorear uso de CPU, memoria y disponibilidad del puerto

---

## 3. Base de datos y modelo de datos

## 3.1 Crear diccionario de datos formal
**Prioridad:** Alta

### Hallazgo
Ya existe documentación funcional inicial del modelo, pero no un diccionario técnico exhaustivo.

### Recomendación
Documentar por tabla:
- columnas
- tipos
- nulos permitidos
- llaves primarias
- llaves foráneas
- índices
- reglas de negocio relevantes

---

## 3.2 Documentar vistas críticas
**Prioridad:** Alta

### Hallazgo
Varias funciones del sistema dependen de vistas consolidadas como:
- `v_expediente_integral`
- `v_control_cartografico`
- `v_ficha_predial`

### Riesgo
Si cambian sin documentación, se rompe funcionalidad difícil de rastrear.

### Recomendación
- documentar SQL y dependencias
- identificar tablas fuente
- explicar propósito funcional de cada vista

---

## 3.3 Formalizar estrategia del padrón anual
**Prioridad:** Alta

### Hallazgo
Se detectó una tabla como `catalogos.padron_2026`, lo que sugiere cortes o versiones anuales.

### Riesgo
- confusión operativa
- queries rígidas por año
- mantenimiento complejo

### Recomendación
- documentar estrategia histórica
- aclarar si existen tablas por año
- evaluar si conviene una estructura temporal más uniforme

---

## 3.4 Revisar integridad de relaciones propietario-predio
**Prioridad:** Alta

### Hallazgo
El sistema maneja titularidad, porcentajes, copropiedad y sincronización al padrón.

### Riesgo
- duplicidad
- porcentajes inconsistentes
- titular principal mal calculado

### Recomendación
- validar reglas de integridad
- revisar restricciones lógicas
- crear reportes de inconsistencias

---

## 3.5 Formalizar manejo de subdivisiones, fusiones y relaciones prediales
**Prioridad:** Media

### Hallazgo
Estas transformaciones existen como parte importante del negocio, pero suelen generar complejidad estructural.

### Recomendación
- documentar reglas
- definir estados esperados
- validar trazabilidad histórica

---

## 4. Código y arquitectura

## 4.1 Revisar tamaño y responsabilidad de routers
**Prioridad:** Media

### Hallazgo
Por la cantidad de funcionalidades, algunos routers o módulos pueden estar creciendo demasiado.

### Riesgo
- mantenimiento difícil
- acoplamiento alto
- pruebas complicadas

### Recomendación
- dividir por subdominios
- separar lógica de negocio de capa HTTP
- extraer servicios reutilizables

---

## 4.2 Reducir dependencia de lógica SQL dispersa
**Prioridad:** Media

### Hallazgo
La solución parece apoyarse fuertemente en SQL y vistas.

### Riesgo
- lógica difícil de versionar/documentar
- dependencia fuerte de consultas embebidas
- debugging más costoso

### Recomendación
- centralizar consultas complejas
- documentar SQL crítico
- evaluar encapsulación por capa de repositorio/servicio

---

## 4.3 Revisar coexistencia de rutas legacy
**Prioridad:** Media

### Hallazgo
Existe evidencia de módulo `movimientos_legacy`.

### Riesgo
- duplicidad funcional
- rutas ambiguas
- mayor complejidad de mantenimiento

### Recomendación
- documentar diferencias entre legado y actual
- definir plan de retiro o consolidación

---

## 4.4 Fortalecer validación de entrada
**Prioridad:** Media

### Hallazgo
La API usa FastAPI, lo que facilita validación, pero conviene revisar cobertura real.

### Recomendación
- validar tipos y formatos de payloads
- reforzar mensajes de error
- revisar parámetros críticos como claves, ids y rutas documentales

---

## 5. Pruebas y calidad

## 5.1 Incorporar pruebas automatizadas mínimas
**Prioridad:** Alta

### Hallazgo
No se evidenció una estrategia formal de pruebas automatizadas.

### Riesgo
- regresiones frecuentes
- despliegues inseguros
- difícil validar refactorizaciones

### Recomendación
Empezar con pruebas sobre:
- autenticación
- ficha predial
- historial
- documentos
- propietarios por predio
- movimientos críticos

---

## 5.2 Crear smoke tests operativos
**Prioridad:** Alta

### Hallazgo
Ya se identificó un conjunto mínimo de endpoints críticos.

### Recomendación
Automatizar pruebas simples post-despliegue para:
- login
- ficha
- historial
- documentos
- propietarios

---

## 5.3 Establecer datos o ambiente de prueba
**Prioridad:** Media

### Hallazgo
Las pruebas pueden depender demasiado de datos reales o entornos productivos.

### Recomendación
- crear dataset mínimo controlado
- disponer de ambiente de staging o desarrollo con datos adecuados
- evitar probar cambios delicados directamente en producción

---

## 6. Documentación

## 6.1 Mantener sincronizado README con docs/
**Prioridad:** Media

### Hallazgo
Ya existe una base documental creciente.

### Recomendación
- actualizar README cuando se agreguen nuevos documentos
- mantener índice documental vigente

---

## 6.2 Crear matriz de módulos
**Prioridad:** Media

### Hallazgo
Existen varios dominios funcionales con relaciones cruzadas.

### Recomendación
Documentar:
- módulo
- responsabilidad
- tablas principales
- endpoints principales
- permisos esperados

---

## 6.3 Crear glosario institucional ampliado
**Prioridad:** Baja

### Hallazgo
Ya existe un glosario base, pero puede ampliarse con términos del negocio catastral local.

### Recomendación
Incluir:
- abreviaturas
- claves internas
- nomenclaturas institucionales
- términos cartográficos específicos

---

## 6.4 Documentar base de datos con ejemplos reales controlados
**Prioridad:** Media

### Recomendación
Agregar ejemplos de:
- relaciones propietario-predio
- estructura de movimientos
- expediente integral
- zonas homogéneas

---

## 7. Respaldo y recuperación

## 7.1 Automatizar respaldos
**Prioridad:** Alta

### Hallazgo
Se propuso estrategia de respaldos, pero debe institucionalizarse.

### Recomendación
- programar dumps automáticos
- respaldar documentos
- retener varias generaciones
- monitorear éxito de backups

---

## 7.2 Probar restauraciones
**Prioridad:** Alta

### Hallazgo
Sin pruebas de recuperación, los respaldos tienen valor limitado.

### Recomendación
- hacer restauraciones controladas
- medir tiempos
- documentar pasos reales
- ajustar procedimientos

---

## 7.3 Respaldar fuera del servidor principal
**Prioridad:** Alta

### Hallazgo
Un respaldo en el mismo servidor no protege ante pérdida total del host.

### Recomendación
- usar almacenamiento externo
- servidor secundario
- mecanismo institucional seguro

---

## 8. Producción e infraestructura

## 8.1 Revisar separación entre producción, pruebas y trabajo manual
**Prioridad:** Alta

### Hallazgo
La revisión del servidor mostró mezcla de:
- servicios activos
- repos de terceros
- despliegues manuales
- artefactos históricos

### Riesgo
- confusión operativa
- borrados accidentales
- dificultad de mantenimiento

### Recomendación
- ordenar rutas
- definir convenciones claras
- separar mejor entornos y componentes

---

## 8.2 Mantener inventario de servicios activos
**Prioridad:** Media

### Hallazgo
Fue necesario reconstruir manualmente qué estaba activo y qué no.

### Recomendación
Mantener documento de referencia con:
- servicios
- rutas
- binarios
- dependencias
- puertos

---

## 8.3 Revisar exposición pública de la API
**Prioridad:** Media

### Hallazgo
Los logs muestran tráfico no deseado y requests basura desde internet.

### Recomendación
- revisar firewall
- revisar proxy inverso
- limitar exposición innecesaria
- considerar rate limiting o controles adicionales

---

## 9. Limpieza y orden técnico

## 9.1 Evitar residuos de componentes retirados
**Prioridad:** Media

### Hallazgo
La desinstalación de QCarta mostró que pueden quedar huellas dispersas en varias rutas.

### Recomendación
- documentar retiros
- revisar binarios, unit files y rutas residuales
- evitar duplicados innecesarios

---

## 9.2 Estandarizar rutas del servidor
**Prioridad:** Media

### Hallazgo
Se detectaron múltiples ubicaciones para distintos componentes con cierta mezcla histórica.

### Recomendación
Establecer convención como:
- `/opt/` para aplicaciones desplegadas
- `/srv/` para fuentes o contenido servido
- `/var/www/` para publicación web
- `/root/backups` o ruta institucional para respaldos

---

## 10. Lista resumida de prioridades

## Alta prioridad
- fortalecer `SECRET_KEY`
- revisar expiración/política de tokens
- formalizar matriz de permisos
- formalizar proceso de despliegue
- mantener fuente Git controlada
- crear diccionario de datos formal
- documentar vistas críticas
- aclarar estrategia de padrón anual
- revisar integridad propietario-predio
- incorporar pruebas automatizadas mínimas
- crear smoke tests
- automatizar respaldos
- probar restauraciones
- respaldar fuera del servidor
- separar mejor producción/pruebas/componentes

## Media prioridad
- documentar instalación y dependencias
- monitoreo básico del servicio
- formalizar subdivisiones/fusiones
- revisar routers grandes
- centralizar SQL crítico
- consolidar o documentar legado
- reforzar validación de entrada
- crear ambiente/dataset de pruebas
- mantener inventario de servicios
- revisar exposición pública
- limpiar residuos técnicos
- estandarizar rutas

## Baja prioridad
- ampliar glosario institucional
- mejoras de presentación documental menores

---

## Recomendación de siguiente fase

Como continuación práctica de este documento, conviene crear un backlog técnico ejecutable con columnas como:

- ID
- pendiente
- prioridad
- responsable
- estado
- fecha objetivo
- observaciones

Esto ayudaría a convertir hallazgos en trabajo gestionable.

---

## Resumen

El sistema ya muestra una base funcional sólida, pero todavía tiene oportunidades importantes de mejora en:

- seguridad
- control de despliegue
- documentación estructural
- pruebas
- respaldo y recuperación
- ordenamiento operativo del servidor

Este documento sirve como punto de partida para una hoja de ruta técnica más formal.