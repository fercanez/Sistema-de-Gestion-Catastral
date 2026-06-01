# Arquitectura funcional del sistema

## Propósito general

El Sistema de Gestión Catastral Base en Baja California está concebido como una plataforma integral para administrar, consultar, homologar y analizar información catastral municipal.

Su objetivo funcional no se limita a consultar el padrón predial, sino a integrar en una misma solución:

- padrón catastral
- cartografía
- propietarios
- expediente predial
- movimientos catastrales
- catálogos institucionales
- análisis territorial y fiscal
- visor web y componentes geográficos

En conjunto, el sistema busca servir como base operativa para un catastro municipal moderno, con capacidad de consulta, mantenimiento, homologación y trazabilidad.

---

## Enfoque general de la arquitectura

La solución sigue una arquitectura modular basada en una API construida con **FastAPI**, desplegada en un servidor Linux y publicada mediante **Uvicorn**.

A nivel funcional, el sistema se organiza en módulos especializados que trabajan sobre una base de datos PostgreSQL y se apoyan en componentes geoespaciales, incluyendo un entorno con **GeoNode v5**.

La arquitectura está orientada a separar responsabilidades por dominio funcional, permitiendo que cada módulo atienda una parte concreta de la operación catastral.

---

## Módulos principales

### 1. Autenticación y seguridad

Responsable de:

- autenticación de usuarios
- generación y validación de tokens JWT
- control de roles
- matriz de permisos
- auditoría de accesos
- control de acceso a funcionalidades sensibles

Este módulo regula quién puede consultar, editar, autorizar o aplicar operaciones dentro del sistema.

Roles detectados:
- admin
- supervisor
- cartografia
- catastro
- fiscalizacion
- consulta

---

### 2. Padrón

Es uno de los módulos centrales del sistema.

Responsable de:

- consulta del padrón catastral
- búsqueda de predios
- ficha predial
- salida GeoJSON
- búsquedas espaciales
- clasificación de régimen y tenencia
- operaciones masivas de saneamiento
- manejo de condominios
- zonas homogéneas
- ajustes e importaciones de valores territoriales

El padrón funciona como base alfanumérica principal para la identificación y consulta de claves catastrales.

---

### 3. Propietarios

Módulo orientado a la gestión de personas y relaciones de titularidad.

Responsable de:

- mantenimiento del catálogo de personas
- manejo de propietarios físicos y morales
- asociación propietario-predio
- validación de porcentajes de propiedad
- sincronización de titulares con el padrón
- homologación de nombres
- fusión de propietarios duplicados
- clasificación de condominio por predio
- manejo de domicilio de personas

Este módulo permite mantener una relación más consistente entre la persona titular y el predio registrado.

---

### 4. Movimientos

Módulo de control de cambios catastrales.

Responsable de:

- registrar movimientos
- almacenar cambios propuestos
- controlar estados de revisión/autorización
- aplicar cambios al padrón
- propagar actualizaciones a estructuras relacionadas
- registrar auditoría de aplicación
- mantener trazabilidad de operaciones

Entre los movimientos detectados están:

- cambio de nombre
- cambio de titularidad
- cambio de superficie
- cambio de construcción
- cambio de uso de suelo
- cambio de zona homogénea
- cambio de número oficial
- cambio de clave
- alta de clave
- baja de clave
- bloqueo
- desbloqueo
- subdivisión
- fusión

Este módulo cumple una función clave de control institucional, ya que separa la captura del cambio de su aplicación efectiva.

---

### 5. Expediente

Módulo orientado a la integración documental, espacial y analítica de un predio.

Responsable de:

- consulta del expediente integral por clave
- historial de expediente
- listado de documentos
- apertura de archivos documentales
- control cartográfico
- dashboards cartográficos
- dashboards fiscales
- análisis de cambios geométricos

El expediente funciona como vista consolidada del estado de un predio, combinando información alfanumérica, documental y geoespacial.

---

### 6. Catálogos

Módulo de mantenimiento institucional de datos de referencia.

Responsable de:

- mantenimiento de calles
- mantenimiento de colonias
- depuración de duplicados
- fusión de registros
- actualización de referencias en padrón y personas

Este módulo ayuda a mantener consistencia en los datos reutilizados por el resto del sistema.

---

### 7. Visor web

Componente web servido desde la propia aplicación para visualización e interacción.

Responsable de exponer recursos como:

- `index.html`
- `catastro.css`
- `catastro.js`
- `movimientos_padron_v57.js`
- `logomxli.png`

Este visor representa la capa de interfaz visual ligada al sistema catastral.

---

## Relación entre módulos

La arquitectura funcional puede entenderse como un conjunto de módulos conectados alrededor del predio y la clave catastral.

### Núcleo de la información
- **Padrón**: base principal de predios y claves
- **Propietarios**: titulares y relaciones persona-predio
- **Cartografía**: geometría y localización territorial
- **Expediente**: visión consolidada del predio

### Módulos de operación y control
- **Movimientos**: controla y aplica cambios
- **Catálogos**: normaliza referencias institucionales
- **Autenticación**: regula acceso y permisos

### Capa de presentación
- **Visor web**
- endpoints API
- documentación automática de FastAPI

---

## Entidad funcional central: la clave catastral

La clave catastral actúa como elemento articulador del sistema.

A través de ella se relacionan:

- datos del padrón
- geometría del predio
- propietarios
- documentos
- historial de movimientos
- control cartográfico
- clasificación de condominio
- análisis fiscal y territorial

Esto convierte a la clave catastral en la unidad funcional principal de consulta, operación y trazabilidad.

---

## Flujo funcional de autenticación

### Objetivo
Controlar acceso al sistema según identidad y rol.

### Flujo general
1. El usuario envía credenciales al endpoint de login
2. El sistema valida usuario, contraseña y estatus activo
3. Se registra auditoría de login
4. Se emite token JWT con información de usuario y rol
5. El cliente envía ese token en peticiones posteriores
6. Las dependencias de seguridad validan token y permisos

### Resultado funcional
El sistema restringe acciones sensibles según rol, por ejemplo:
- consultar
- administrar usuarios
- autorizar movimientos
- aplicar cambios
- consultar auditoría

---

## Flujo funcional de consulta predial

### Objetivo
Obtener información de un predio desde una clave o criterio de búsqueda.

### Flujo general
1. El usuario realiza una búsqueda en padrón
2. El sistema localiza la clave o conjunto de predios
3. Se devuelve una ficha simple, avanzada o geográfica
4. Si se requiere detalle ampliado, se consulta expediente integral
5. La información puede representarse en tabla, ficha o mapa

### Resultado funcional
El usuario puede consultar:
- ubicación
- titular
- valores
- superficies
- uso
- estado cartográfico
- adeudos
- documentos
- geometría

---

## Flujo funcional de propietarios

### Objetivo
Mantener homologada la relación entre personas y predios.

### Flujo general
1. Se consulta o captura una persona en catálogo
2. Se relaciona con una clave catastral
3. Se valida porcentaje de propiedad y tipo de titularidad
4. Se sincroniza el nombre visible hacia el padrón si aplica
5. Se conserva trazabilidad mediante auditoría o historial

### Resultado funcional
El sistema puede:
- evitar duplicados de titulares
- mantener consistencia entre catálogo y padrón
- actualizar titular principal
- soportar copropiedad
- distinguir persona física y moral

---

## Flujo funcional de movimientos catastrales

### Objetivo
Controlar cambios catastrales de forma auditada y segura.

### Flujo general
1. Se crea un movimiento con datos actuales y nuevos
2. El movimiento inicia en estado de trabajo, por ejemplo `BORRADOR`
3. Puede pasar por revisión, observación o autorización
4. Un usuario con permisos suficientes aplica el movimiento
5. El sistema actualiza padrón y estructuras relacionadas
6. Se registra auditoría de aplicación
7. El movimiento cambia a estado `APLICADO`

### Resultado funcional
Se logra:
- control institucional del cambio
- separación entre captura y autorización
- trazabilidad histórica
- consistencia entre estructuras relacionadas

---

## Flujo funcional de expediente integral

### Objetivo
Concentrar en una sola vista la situación completa de un predio.

### Flujo general
1. Se consulta expediente por clave catastral
2. El sistema integra información de:
   - padrón
   - titular
   - geometría
   - documentos
   - control cartográfico
   - historial
   - indicadores fiscales
3. La respuesta puede incluir geometría en formato GeoJSON
4. El usuario visualiza el expediente completo

### Resultado funcional
El expediente funciona como vista unificada para atención técnica, administrativa o analítica.

---

## Flujo funcional de homologación padrón-cartografía

### Objetivo
Alinear la información alfanumérica del padrón con la representación cartográfica.

### Componentes involucrados
- padrón
- cartografía
- expediente
- movimientos
- control cartográfico

### Resultado funcional
Permite:
- detectar predios sin geometría
- identificar cambios geométricos
- medir cobertura cartográfica
- comparar áreas
- priorizar revisión territorial

---

## Zonas homogéneas como subsistema especializado

Las zonas homogéneas aparecen como un subsistema con identidad propia dentro del módulo de padrón.

### Función principal
Administrar y analizar valores por zona homogénea en distintos años.

### Capacidades detectadas
- consulta de zonas
- evolución por año
- importación
- ajuste de valores
- creación de nuevas zonas
- análisis por vigencia temporal

### Importancia funcional
Este subsistema conecta el catastro con procesos de:
- valuación
- fiscalización
- análisis territorial
- mantenimiento técnico del valor del suelo

---

## Régimen, tenencia y condominio

Otra parte especializada del sistema es la clasificación jurídica/operativa del predio.

### Funciones observadas
- identificar régimen de tenencia
- clasificar condominios
- corregir valores faltantes
- aplicar actualizaciones masivas
- distinguir tipos de condominio
- propagar información a grupos relacionados

### Importancia funcional
Esta lógica permite que el sistema no solo consulte predios, sino que también los clasifique y regularice institucionalmente.

---

## Catálogos como mecanismo de normalización

Los catálogos tienen una función transversal.

### Objetivo
Evitar inconsistencias en datos reutilizados por múltiples módulos.

### Ejemplos
- calles
- colonias
- tipos de movimiento
- tipos de régimen
- zonas homogéneas
- personas del catálogo

### Resultado funcional
Los catálogos reducen duplicados, facilitan búsquedas y mejoran la homologación entre módulos.

---

## Integración con cartografía y GeoNode

El sistema opera sobre un entorno donde existe integración con **GeoNode v5**.

### Papel funcional de esta integración
- soporte geoespacial del sistema
- visualización y publicación cartográfica
- relación entre geometría y padrón
- base para análisis territoriales y mapas

### Resultado
La solución no queda limitada a una base tabular, sino que incorpora dimensión espacial real.

---

## Base de datos y modelo operativo

A nivel operativo, el sistema se apoya en PostgreSQL y en múltiples esquemas/tablas/vistas especializadas.

Ejemplos detectados:
- `catalogos.padron_2026`
- `catalogos.personas`
- `catastro.predios`
- `catastro.predio_propietario`
- `catastro.movimientos_padron`
- `catastro.movimientos_padron_detalle`
- `catastro.v_expediente_integral`
- `catastro.v_control_cartografico`
- `auditoria.movimientos_padron_auditoria`
- `seguridad.usuarios`
- `seguridad.roles`
- `seguridad.usuario_roles`

Esto sugiere una arquitectura de datos ya orientada por dominios:
- seguridad
- catastro
- catálogo
- auditoría

---

## Trazabilidad y auditoría

La trazabilidad es una pieza importante en la arquitectura.

Se detecta auditoría en:
- accesos/login
- operaciones administrativas
- aplicación de movimientos
- acciones funcionales específicas

### Valor institucional
Esto permite:
- saber quién hizo qué
- revisar cambios
- reconstruir eventos
- fortalecer control interno

---

## Capa de interfaz y operación diaria

El sistema combina:
- API backend
- visor web
- recursos estáticos
- posible consumo desde otras interfaces
- documentación automática de FastAPI

Esto permite tanto uso técnico directo como integración con interfaces visuales para personal operativo.

---

## Resumen funcional de la arquitectura

La arquitectura funcional del sistema puede resumirse así:

- **Autenticación** controla acceso
- **Padrón** organiza la base predial
- **Propietarios** organiza la titularidad
- **Movimientos** controla el cambio
- **Expediente** consolida la información del predio
- **Catálogos** normalizan referencias
- **Cartografía/GeoNode** aportan la dimensión espacial
- **Visor web** acerca la operación al usuario final

En conjunto, estos módulos conforman una base sólida para un sistema catastral municipal con enfoque en consulta, homologación, mantenimiento, análisis y trazabilidad.

---

## Recomendaciones de documentación futura

Como siguiente nivel de madurez documental, conviene generar también:

- `docs/arquitectura-tecnica.md`
- `docs/modelo-de-datos.md`
- `docs/flujos-operativos.md`

Sugerencias:
- **arquitectura técnica**: componentes, despliegue, dependencias, servicios
- **modelo de datos**: tablas, vistas, relaciones y esquemas
- **flujos operativos**: altas, bajas, cambios de titularidad, homologación, revisión cartográfica

Esto permitiría separar claramente:
- visión funcional
- visión técnica
- visión operativa