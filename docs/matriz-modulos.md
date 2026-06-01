# Matriz de módulos

## Propósito

Este documento resume los principales módulos del Sistema de Gestión Catastral BC y los relaciona con sus responsabilidades, datos principales, endpoints esperados, permisos operativos y observaciones técnicas.

Su objetivo es ofrecer una vista rápida y transversal del sistema para:

- desarrollo
- mantenimiento
- soporte
- documentación
- análisis funcional

Complementa otros documentos como:

- `docs/arquitectura-tecnica.md`
- `docs/modelo-de-datos.md`
- `docs/endpoints.md`
- `docs/permisos-y-roles.md`
- `docs/flujos-operativos.md`

---

## Criterios de lectura

Cada módulo se resume con estos campos:

- **responsabilidad**: qué hace dentro del sistema
- **tablas/vistas principales**: estructuras de datos asociadas
- **endpoints representativos**: rutas clave confirmadas o probables
- **roles típicos**: perfiles que normalmente interactúan con el módulo
- **acciones típicas**: operaciones funcionales principales
- **riesgos/observaciones**: puntos relevantes para mantenimiento o mejora

---

## 1. Autenticación y seguridad

| Campo | Detalle |
|---|---|
| **Módulo** | Autenticación y seguridad |
| **Responsabilidad** | Validar identidad, emitir tokens, controlar acceso por roles y permisos |
| **Componentes técnicos** | `auth/routes`, `auth/security`, `auth/dependencies`, `auth/acl.py` |
| **Tablas principales** | `seguridad.usuarios`, `seguridad.roles`, `seguridad.usuario_roles`, `seguridad.auditoria_login`, `seguridad.auditoria_sistema` |
| **Endpoints representativos** | `POST /auth/login` |
| **Roles típicos** | todos los roles autenticables |
| **Acciones típicas** | login, validación de token, verificación de rol, verificación de permiso |
| **Riesgos/observaciones** | depende críticamente de `SECRET_KEY`, expiración de tokens y definición correcta de ACL |

---

## 2. Padrón

| Campo | Detalle |
|---|---|
| **Módulo** | Padrón |
| **Responsabilidad** | Consultar información base predial, ficha predial, clasificación territorial y datos operativos principales |
| **Tablas/vistas principales** | `catalogos.padron_2026`, `catastro.v_ficha_predial`, estructuras de zonas homogéneas y régimen |
| **Endpoints representativos** | `GET /padron/{clave}/ficha`, rutas probables `/padron`, `/padron/buscar`, `/padron/{clave}/geojson` |
| **Roles típicos** | `admin`, `supervisor`, `catastro`, `cartografia`, `fiscalizacion`, `consulta` |
| **Acciones típicas** | búsqueda de predio, consulta de ficha, consulta geográfica, regularización, clasificación |
| **Riesgos/observaciones** | alta dependencia funcional; conviene documentar estrategia del padrón anual y reglas de tenencia/régimen |

---

## 3. Propietarios

| Campo | Detalle |
|---|---|
| **Módulo** | Propietarios |
| **Responsabilidad** | Gestionar personas, relación propietario-predio, titularidad y sincronización operativa con padrón |
| **Tablas principales** | `catalogos.personas`, `catastro.predio_propietario`, relaciones auxiliares de titularidad |
| **Endpoints representativos** | `GET /predios/{clave}/propietarios`, rutas probables `/propietarios`, `/propietarios/{id}`, `/propietarios/fusionar` |
| **Roles típicos** | `admin`, `supervisor`, `catastro`, parcialmente `fiscalizacion` y `consulta` para lectura |
| **Acciones típicas** | alta de persona, edición, consulta, asociación con predio, cambio de domicilio, fusión de duplicados |
| **Riesgos/observaciones** | requiere validar integridad de porcentajes, copropiedad y titular principal |

---

## 4. Expediente

| Campo | Detalle |
|---|---|
| **Módulo** | Expediente |
| **Responsabilidad** | Integrar información ampliada del predio, historial, documentos y control cartográfico |
| **Tablas/vistas principales** | `catastro.v_expediente_integral`, `auditoria.v_expedientes_timeline`, `catastro.v_control_cartografico` |
| **Endpoints representativos** | `GET /expediente/{clave}/historial`, `GET /expediente/{clave}/documentos`, rutas probables `/expediente/{clave}`, `/expediente/{clave}/control-cartografico` |
| **Roles típicos** | `admin`, `supervisor`, `catastro`, `cartografia`, `fiscalizacion`, `consulta` |
| **Acciones típicas** | consultar expediente integral, revisar historial, abrir documentos, revisar indicadores cartográficos |
| **Riesgos/observaciones** | módulo de alto valor operativo; depende de vistas críticas y manejo seguro de rutas documentales |

---

## 5. Movimientos

| Campo | Detalle |
|---|---|
| **Módulo** | Movimientos |
| **Responsabilidad** | Registrar, revisar, autorizar y aplicar cambios sobre el padrón y datos relacionados |
| **Tablas principales** | `catastro.movimientos_padron`, `catastro.movimientos_padron_detalle`, `auditoria.movimientos_padron_auditoria` |
| **Endpoints representativos** | rutas probables `/movimientos`, `/movimientos/{id}`, `/movimientos/{id}/aplicar`, `/movimientos/{id}/estado` |
| **Roles típicos** | `admin`, `supervisor`, `catastro`; revisión o autorización más restringida |
| **Acciones típicas** | crear movimiento, editar, revisar, autorizar, rechazar, aplicar, auditar |
| **Riesgos/observaciones** | módulo crítico por impacto en integridad del padrón; requiere fuerte control de permisos y trazabilidad |

---

## 6. Movimientos legacy

| Campo | Detalle |
|---|---|
| **Módulo** | Movimientos legacy |
| **Responsabilidad** | Mantener compatibilidad con lógica o rutas heredadas de versiones anteriores |
| **Componentes técnicos** | `routers.movimientos_legacy` |
| **Tablas asociadas** | probablemente comparte estructuras de movimientos y titularidad |
| **Endpoints representativos** | rutas no confirmadas; probable prefijo o lógica heredada |
| **Roles típicos** | perfiles operativos históricos o compatibilidad técnica |
| **Acciones típicas** | operaciones heredadas relacionadas con movimientos o titularidad |
| **Riesgos/observaciones** | riesgo de duplicidad y mantenimiento complejo; conviene documentar diferencias frente al flujo actual |

---

## 7. Catálogos

| Campo | Detalle |
|---|---|
| **Módulo** | Catálogos |
| **Responsabilidad** | Mantener datos de referencia institucional usados por otros módulos |
| **Tablas principales** | `catalogos.cat_calles`, `catalogos.cat_colonias`, `catalogos.cat_tipos_movimiento_padron` |
| **Endpoints representativos** | rutas probables `/catalogos/calles`, `/catalogos/colonias`, `/catalogos/tipos-movimiento` |
| **Roles típicos** | `admin`, `supervisor`, `catastro`; consulta por otros perfiles según permisos |
| **Acciones típicas** | consultar, crear, editar, fusionar o depurar catálogos |
| **Riesgos/observaciones** | catálogos inconsistentes generan errores transversales en captura y consulta |

---

## 8. Administración

| Campo | Detalle |
|---|---|
| **Módulo** | Administración |
| **Responsabilidad** | Gestionar usuarios, roles, contraseñas y funciones administrativas del sistema |
| **Tablas principales** | `seguridad.usuarios`, `seguridad.roles`, `seguridad.usuario_roles`, `seguridad.auditoria_sistema` |
| **Endpoints representativos** | rutas probables `/admin/usuarios`, `/admin/roles`, `/admin/usuarios/{id}/reset-password`, `/admin/auditoria` |
| **Roles típicos** | principalmente `admin`; parcialmente `supervisor` según reglas reales |
| **Acciones típicas** | alta de usuario, edición, asignación de roles, reinicio de contraseña, consulta de auditoría |
| **Riesgos/observaciones** | módulo muy sensible; debe tener control estricto por rol y auditoría completa |

---

## 9. Auditoría

| Campo | Detalle |
|---|---|
| **Módulo** | Auditoría |
| **Responsabilidad** | Registrar trazabilidad de accesos, acciones administrativas, movimientos y cambios relevantes |
| **Tablas/vistas principales** | `seguridad.auditoria_login`, `seguridad.auditoria_sistema`, `auditoria.movimientos_padron_auditoria`, `auditoria.cambios_geometricos_predios`, `auditoria.v_expedientes_timeline` |
| **Endpoints representativos** | probablemente integrados en `admin`, `expediente` y `movimientos` |
| **Roles típicos** | `admin`, `supervisor`, perfiles de control; consulta parcial por otros perfiles según caso |
| **Acciones típicas** | registrar eventos, consultar historial, analizar cambios, sustentar trazabilidad |
| **Riesgos/observaciones** | esencial para control institucional; debe protegerse contra pérdida o inconsistencias |

---

## 10. Cartografía / control geográfico

| Campo | Detalle |
|---|---|
| **Módulo** | Cartografía / control geográfico |
| **Responsabilidad** | Soportar consultas espaciales, geometría predial y control cartográfico |
| **Tablas/vistas principales** | `catastro.v_control_cartografico`, `auditoria.cambios_geometricos_predios`, posibles geometrías y vistas auxiliares |
| **Endpoints representativos** | rutas probables `/padron/{clave}/geojson`, `/expediente/{clave}/control-cartografico`, consultas espaciales del padrón |
| **Roles típicos** | `cartografia`, `admin`, `supervisor`, `catastro`, parcialmente `fiscalizacion` |
| **Acciones típicas** | visualizar geometrías, revisar consistencia espacial, analizar cambios geométricos |
| **Riesgos/observaciones** | alta relevancia técnica; debe mantenerse sincronizado con padrón y expediente |

---

## 11. Visor y documentos

| Campo | Detalle |
|---|---|
| **Módulo** | Visor y documentos |
| **Responsabilidad** | Entregar archivos estáticos, documentos y recursos consumidos por la interfaz |
| **Rutas principales** | `/var/www/catastro`, `/var/www/catastro/documentos` |
| **Endpoints/recursos representativos** | consulta de documentos del expediente, recursos tipo `/visor/...` |
| **Roles típicos** | lectura amplia según permisos del sistema |
| **Acciones típicas** | listar documentos, descargar/abrir archivos, servir recursos estáticos |
| **Riesgos/observaciones** | requiere validación de rutas seguras, permisos correctos y respaldo de archivos |

---

## 12. Infraestructura operativa

| Campo | Detalle |
|---|---|
| **Módulo** | Infraestructura operativa |
| **Responsabilidad** | Ejecutar y mantener disponibles los servicios principales del sistema |
| **Servicios principales** | `catastro-api.service`, `geonode.service`, `geonode-celery.service` |
| **Rutas principales** | `/opt/catastro_api`, `/root/src/geonode`, `/var/www/catastro` |
| **Acciones típicas** | iniciar, detener, reiniciar, revisar logs, validar puertos, respaldar, restaurar |
| **Roles típicos** | administración técnica / soporte |
| **Riesgos/observaciones** | mezcla histórica de componentes en servidor; conviene mantener inventario y estandarizar rutas |

---

## Relación resumida entre módulos

| Módulo | Depende de | Impacta a |
|---|---|---|
| Autenticación y seguridad | usuarios, roles, JWT | todos los módulos protegidos |
| Padrón | base predial, catálogos | expediente, propietarios, movimientos, cartografía |
| Propietarios | personas, relación predio-persona | padrón, expediente, movimientos |
| Expediente | padrón, auditoría, documentos, cartografía | consulta operativa integral |
| Movimientos | padrón, propietarios, auditoría | integridad del sistema catastral |
| Catálogos | tablas de referencia | padrón, propietarios, movimientos |
| Administración | seguridad, auditoría | acceso y gobernanza del sistema |
| Auditoría | acciones del sistema | control institucional |
| Cartografía | geometrías, control espacial | padrón, expediente, análisis técnico |
| Visor y documentos | archivos estáticos/documentales | usuarios finales y flujos de expediente |

---

## Prioridad operativa sugerida por módulo

| Módulo | Criticidad operativa | Comentario |
|---|---|---|
| Autenticación y seguridad | Muy alta | sin este módulo no hay acceso controlado |
| Padrón | Muy alta | es el núcleo de consulta predial |
| Movimientos | Muy alta | impacta integridad de datos |
| Expediente | Alta | concentra valor operativo y documental |
| Propietarios | Alta | crítico para titularidad y consulta |
| Administración | Alta | controla acceso y usuarios |
| Auditoría | Alta | esencial para trazabilidad |
| Cartografía | Media/Alta | importante para validación técnica |
| Catálogos | Media/Alta | soporte transversal |
| Visor y documentos | Alta | clave para operación de consulta documental |

---

## Recomendaciones de evolución

### 1. Convertir esta matriz en inventario ejecutable
Agregar columnas como:
- responsable técnico
- archivo/router principal
- servicio dependiente
- estado documental
- estado de pruebas

### 2. Vincular cada módulo con permisos exactos
Cruzar esta matriz con:
- `docs/permisos-y-roles.md`
- ACL real del backend

### 3. Vincular cada módulo con endpoints exactos
Cruzar esta matriz con:
- `docs/endpoints.md`
- OpenAPI real generado por FastAPI

### 4. Vincular cada módulo con tablas confirmadas
Cruzar esta matriz con:
- diccionario de datos futuro
- vistas SQL críticas

---

## Resumen

La arquitectura funcional del sistema puede entenderse a través de una serie de módulos estrechamente relacionados:

- seguridad
- padrón
- propietarios
- expediente
- movimientos
- catálogos
- administración
- auditoría
- cartografía
- visor/documentos
- infraestructura operativa

Esta matriz sirve como mapa transversal para entender responsabilidades, relaciones y riesgos principales del sistema.