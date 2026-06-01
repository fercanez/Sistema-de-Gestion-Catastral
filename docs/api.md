# Documentación de API

## Base de la API

La aplicación está construida con **FastAPI** y se ejecuta con `uvicorn`.

En despliegue, la aplicación utiliza:

```text
root_path=/api/catastro
```

Por lo tanto, si existe un proxy o publicación bajo ese prefijo, las rutas pueden exponerse como:

```text
/api/catastro/...
```

## Autenticación

La API utiliza autenticación basada en **JWT Bearer Token**.

### Flujo general

1. El usuario inicia sesión mediante `POST /login`
2. La API responde con un `access_token`
3. Ese token debe enviarse en el encabezado:

```http
Authorization: Bearer <token>
```

### Roles identificados

Los roles observados en el sistema son:

- `admin`
- `supervisor`
- `cartografia`
- `catastro`
- `fiscalizacion`
- `consulta`

### Permisos de backend

La API maneja una matriz de permisos por rol, incluyendo capacidades como:

- `administrar_usuarios`
- `ver_auditoria`
- `editar_cartografia`
- `editar_catastro`
- `editar_fiscal`
- `ver_fiscal`
- `ver_expediente`
- `ver_documentos`
- `ver_dashboard`
- `exportar_pdf`
- `exportar_excel`
- `consulta`

---

## Endpoints de autenticación

### `POST /login`

Inicia sesión y devuelve token JWT.

#### Body
```json
{
  "usuario": "usuario",
  "password": "contrasena"
}
```

#### Respuesta esperada
```json
{
  "access_token": "token",
  "token_type": "bearer",
  "usuario": "usuario",
  "nombre": "Nombre Completo",
  "rol": "admin",
  "permisos": [],
  "expira_minutos": 480
}
```

#### Errores posibles
- `400`: usuario o contraseña vacíos
- `401`: usuario no encontrado, contraseña incorrecta o usuario inactivo
- `500`: error interno

---

### `GET /me`

Devuelve información del usuario autenticado.

#### Requiere autenticación
Sí

#### Respuesta
```json
{
  "autenticado": true,
  "usuario": "usuario",
  "nombre": "Nombre Completo",
  "rol": "admin",
  "permisos": []
}
```

---

### `GET /seguridad/usuarios`

Lista usuarios del sistema.

#### Requiere rol
- `admin`

---

### `GET /seguridad/auditoria-login`

Consulta auditoría de inicios de sesión.

#### Query params
- `limite` (default: `100`, min: `1`, max: `1000`)

#### Requiere rol
- `admin`

---

### `GET /seguridad/permisos`

Devuelve permisos del usuario autenticado y la matriz global de permisos.

#### Requiere autenticación
Sí

---

### `GET /admin/permisos`

Devuelve matriz de permisos completa.

#### Requiere rol
- `admin`

---

### `GET /seguridad/probar-permiso/{permiso}`

Permite verificar si el usuario autenticado tiene un permiso específico.

#### Requiere autenticación
Sí

---

## Endpoints administrativos

## `GET /admin/auditoria`

Obtiene auditoría general del sistema.

#### Query params
- `limite` (default: `200`, min: `1`, max: `1000`)

#### Requiere rol
- `admin`

---

### `GET /admin/usuarios`

Obtiene listado de usuarios con roles agregados.

#### Requiere rol
- `admin`

---

### `GET /admin/roles`

Lista roles registrados en `seguridad.roles`.

#### Requiere rol
- `admin`

---

### `POST /admin/usuarios`

Crea un usuario nuevo.

#### Requiere rol
- `admin`

#### Body
```json
{
  "usuario": "nuevo_usuario",
  "nombre_completo": "Nombre Completo",
  "password": "contrasena",
  "rol": "consulta"
}
```

#### Errores posibles
- `400`: datos incompletos
- `409`: usuario ya existe

---

### `PUT /admin/usuarios/{usuario_id}`

Actualiza nombre, rol o estatus de un usuario.

#### Requiere rol
- `admin`

#### Body
```json
{
  "nombre_completo": "Nuevo Nombre",
  "rol": "admin",
  "activo": true
}
```

---

### `POST /admin/usuarios/{usuario_id}/reset-password`

Restablece contraseña de un usuario.

#### Requiere rol
- `admin`

#### Body
```json
{
  "password": "nueva_contrasena"
}
```

---

## Endpoints de movimientos

### Seguridad funcional

Los movimientos usan dos niveles principales:

- `permiso_movimientos`: roles `admin`, `supervisor`, `catastro`
- `permiso_aplicar_movimientos`: roles `admin`, `supervisor`

---

### `GET /movimientos/aplicar-version`

Devuelve la versión interna de la lógica de aplicación al padrón.

---

### `GET /movimientos/tipos`

Lista tipos de movimiento activos.

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `GET /movimientos`

Lista movimientos del padrón.

#### Query params
- `clave`
- `estado`
- `limite` (default `100`, max `500`)

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `GET /movimientos/{movimiento_id}`

Obtiene detalle de un movimiento, incluyendo:
- datos del movimiento
- detalle por campos
- auditoría relacionada

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `POST /movimientos`

Crea un movimiento nuevo.

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

#### Body base
```json
{
  "clave_catastral": "CLAVE",
  "clave_catastral_anterior": null,
  "clave_catastral_nueva": null,
  "tipo_movimiento": "CAMBIO_NOMBRE",
  "motivo": "Motivo",
  "observaciones": "Observaciones",
  "datos_anteriores": {},
  "datos_nuevos": {},
  "detalles": []
}
```

#### Estado inicial
- `BORRADOR`

---

### `PUT /movimientos/{movimiento_id}/estado`

Actualiza el estado del movimiento.

#### Requiere rol
- `admin`
- `supervisor`

#### Estados válidos
- `BORRADOR`
- `EN_REVISION`
- `OBSERVADO`
- `AUTORIZADO`
- `RECHAZADO`
- `APLICADO`
- `CANCELADO`

---

### `GET /movimientos/historial/{clave}`

Consulta historial de movimientos asociados a una clave catastral.

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `GET /movimientos/historial/{clave}/numero-oficial`

Consulta historial de cambios o asignaciones de número oficial.

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `GET /movimientos/copropietarios/{clave}`

Lista copropietarios asociados a una clave.

#### Requiere rol
- `admin`
- `supervisor`
- `catastro`

---

### `POST /movimientos/{movimiento_id}/aplicar`

Aplica un movimiento autorizado al padrón y/o estructuras relacionadas.

#### Requiere rol
- `admin`
- `supervisor`

#### Tipos de movimiento detectados con lógica de aplicación
- `CAMBIO_NOMBRE`
- `CAMBIO_TITULARIDAD`
- `CAMBIO_SUPERFICIE`
- `CAMBIO_CONSTRUCCION`
- `CAMBIO_USO_SUELO`
- `CAMBIO_ZONA_HOMOGENEA`
- `NUMERO_OFICIAL`
- `ASIGNACION_NUMERO_OFICIAL`
- `CAMBIO_NUMERO_OFICIAL`
- `CAMBIO_CLAVE`
- `BLOQUEO`
- `DESBLOQUEO`
- `BAJA_CLAVE`
- `ALTA_CLAVE`
- `SUBDIVISION`
- `FUSION`

#### Observaciones
Este endpoint también:
- registra auditoría
- actualiza estado a `APLICADO`
- puede sincronizar datos hacia `catalogos.padron_2026`
- puede propagar cambios a `catastro.predios`
- puede registrar relaciones prediales
- puede registrar información de condominio

---

## Endpoints legacy de movimientos

### `POST /movimientos/{movimiento_id}/aplicar-titularidad`
### `POST /movimientos/{movimiento_id}/aplicar-titularidad-v27g`
### `POST /movimientos/{movimiento_id}/aplicar-titularidad-v27h`
### `POST /movimientos/{movimiento_id}/aplicar-titularidad-v27i`

Endpoints conservados por compatibilidad para aplicar cambios de titularidad y RFC.

#### Requiere rol
- `admin`
- `supervisor`

#### Nota
Se consideran rutas legacy y conviene documentar su vigencia operativa antes de usarlas en nuevas integraciones.

---

## Endpoints de catálogos

Estos endpoints están orientados al mantenimiento institucional de calles y colonias.

#### Requieren permiso funcional
Usan `permiso_movimientos`, por lo que normalmente requieren:
- `admin`
- `supervisor`
- `catastro`

---

### Calles

#### `GET /catalogos/calles/mantenimiento/buscar`
Busca calles en catálogo y en padrón.

#### Query params
- `q`
- `limite`

---

#### `POST /catalogos/calles`
Crea o reactiva una calle.

#### Body
```json
{
  "nombre_calle": "NOMBRE DE CALLE"
}
```

---

#### `PUT /catalogos/calles/{id_calle}`
Actualiza nombre de calle y propaga cambios a padrón y personas.

---

#### `DELETE /catalogos/calles/{id_calle}`
Da de baja lógica una calle (`activo = FALSE`).

---

#### `POST /catalogos/calles/fusionar`
Fusiona varios registros de calle hacia uno destino.

#### Body
```json
{
  "id_destino": 1,
  "ids_origen": [2, 3]
}
```

---

### Colonias

#### `GET /catalogos/colonias/mantenimiento/buscar`
Busca colonias en catálogo y padrón.

#### Query params
- `q`
- `limite`

---

#### `POST /catalogos/colonias`
Crea o reactiva una colonia.

#### Body
```json
{
  "nombre_colonia": "NOMBRE DE COLONIA"
}
```

---

#### `PUT /catalogos/colonias/{id_colonia}`
Actualiza nombre de colonia y propaga cambios.

---

#### `DELETE /catalogos/colonias/{id_colonia}`
Da de baja lógica una colonia.

---

#### `POST /catalogos/colonias/fusionar`
Fusiona colonias origen hacia una colonia destino.

#### Body
```json
{
  "id_destino": 1,
  "ids_origen": [2, 3]
}
```

---

## Endpoints de expediente y control cartográfico

Todos estos endpoints usan autenticación con usuario actual.

### `GET /control-cartografico/estadisticas`

Resumen de control cartográfico:
- dibujados
- sin geometría
- no existe en cartografía
- total
- cobertura

---

### `GET /control-cartografico/sin-geometria`

Lista predios sin geometría.

#### Query params
- `limite` (default `100`, max `1000`)

---

### `GET /expediente/{clave}`

Devuelve expediente integral de una clave catastral en formato **GeoJSON Feature**:

```json
{
  "type": "Feature",
  "geometry": {},
  "properties": {}
}
```

Incluye información como:
- datos generales del predio
- titular principal
- adeudos
- superficies
- estado cartográfico
- indicadores documentales
- geometría transformada a EPSG:4326

---

### `GET /expediente/{clave}/historial`

Devuelve historial de expediente.

---

### `GET /expediente/{clave}/documentos`

Lista documentos asociados al expediente.

---

### `GET /documentos/{clave}/{archivo}`

Entrega archivo físico de documento.

#### Observación importante
Incluye protección contra **path traversal** validando que la ruta resuelta permanezca dentro de:

```text
/var/www/catastro/documentos
```

---

### `GET /cambios-geometricos`

Devuelve cambios geométricos en formato GeoJSON `FeatureCollection`.

---

### `GET /dashboard-cartografico`

Resumen ejecutivo cartográfico:
- total predios
- dibujados
- sin geometría
- cobertura
- cambios geométricos
- prioridad de revisión

---

### `GET /dashboard-fiscal`

Dashboard fiscal y documental con indicadores como:

- total de predios
- adeudo total
- adeudo anual
- valor catastral total
- superficies acumuladas
- cobertura cartográfica
- expedientes con o sin documentos
- top colonias con adeudo
- resumen por uso
- resumen por zona homogénea

---

## Módulos detectados pero pendientes de documentación detallada

### Padrón
Se identifican funcionalidades relacionadas con:

- búsqueda simple y avanzada
- ficha de padrón
- ficha predial
- GeoJSON de predio
- búsqueda geográfica
- usos y tasas
- zonas homogéneas
- importación y ajuste de zonas homogéneas
- teselas (`tile_predios`)
- resumen y aplicación de tenencia
- operaciones masivas sobre régimen/tenencia
- manejo de condominios

> Este módulo requiere una pasada adicional para documentar cada endpoint de forma individual.

### Propietarios
Se identifican capacidades como:

- mantenimiento de personas del catálogo
- búsqueda de propietarios
- apellidos, nombres y razones sociales
- mantenimiento y fusión de propietarios
- asociación propietario-predio
- sincronización padrón-catálogo
- clasificación de condominio
- reemplazo masivo de propietarios
- gestión de domicilio de personas

> Este módulo requiere una pasada adicional con el archivo completo para documentar rutas exactas, métodos HTTP y payloads.

---

## Recomendación de uso

Para exploración técnica en ambiente activo, complementar esta documentación con la interfaz automática de FastAPI:

- `/docs`
- `/redoc`

según la configuración final del despliegue y el prefijo publicado de la aplicación.

## Módulo de propietarios

El módulo de propietarios concentra la gestión de personas, titulares, relaciones propietario-predio, sincronización con padrón y clasificación de información de condominio.

A nivel funcional, este módulo parece ser uno de los núcleos principales del sistema para mantener homologada la información entre:

- padrón catastral
- catálogo de personas
- relaciones predio-propietario
- clasificación de condominios
- datos de domicilio asociados a personas

### Modelos detectados

#### `PropietarioPersonaPayload`

Modelo utilizado para crear o actualizar personas del catálogo.

```json
{
  "tipo_persona": "FISICA",
  "nombre": "JUAN",
  "apellido_paterno": "PEREZ",
  "apellido_materno": "LOPEZ",
  "razon_social": null,
  "rfc": "XXXX000000XXX",
  "curp": null,
  "activo": true,
  "calle": "CALLE EJEMPLO",
  "colonia": "COLONIA EJEMPLO",
  "numof": "123",
  "cp": "21000",
  "delegacion": "CENTRO"
}
```

#### `PredioPropietarioPayload`

Modelo para asociar una persona a un predio.

```json
{
  "id_persona": 1,
  "porcentaje_propiedad": 100,
  "tipo_titularidad": "PROPIETARIO"
}
```

#### `PredioPropietarioUpdatePayload`

Modelo para actualizar porcentaje o tipo de titularidad de una relación.

```json
{
  "porcentaje_propiedad": 50,
  "tipo_titularidad": "COPROPIETARIO"
}
```

#### `PredioPropietariosReemplazoPayload`

Modelo para reemplazar en bloque los propietarios de un predio.

```json
{
  "propietarios": [
    {
      "id_persona": 1,
      "porcentaje_propiedad": 50,
      "tipo_titularidad": "PROPIETARIO"
    },
    {
      "id_persona": 2,
      "porcentaje_propiedad": 50,
      "tipo_titularidad": "COPROPIETARIO"
    }
  ]
}
```

#### `FusionarPropietariosPayload`

Modelo para fusionar varios propietarios hacia una persona destino.

```json
{
  "id_persona_destino": 1,
  "id_personas_origen": [2, 3, 4]
}
```

#### `SincronizarPadronMasivoPayload`

Modelo para sincronización masiva entre catálogo y padrón.

```json
{
  "confirmar": false,
  "texto_padron": "",
  "limite": 5000
}
```

#### `PredioCondominioPayload`

Modelo para registrar o actualizar información de condominio de un predio.

```json
{
  "modalidad": "VERTICAL",
  "nombre_condominio": "CONDOMINIO EJEMPLO",
  "observaciones": "Observaciones",
  "propagar_grupo": true
}
```

#### `CondominioClasificacionBuscarPayload`

Modelo para buscar predios candidatos a clasificación de condominio.

```json
{
  "claves_texto": "",
  "claves": [],
  "nombre_condominio": "",
  "colonia": "",
  "calle": "",
  "numof": "",
  "clave_prefijo": "",
  "q": "",
  "solo_regimen_c": true,
  "limite": 500,
  "offset": 0
}
```

#### `CondominioClasificacionMasivaPayload`

Modelo para clasificar varios predios como condominio.

```json
{
  "claves": ["CLAVE1", "CLAVE2"],
  "modalidad": "VERTICAL",
  "nombre_condominio": "CONDOMINIO EJEMPLO",
  "observaciones": "Clasificación masiva"
}
```

---

## Capacidades funcionales detectadas

Con base en las funciones observadas en `routers/propietarios.py`, el módulo cubre al menos estas áreas:

### 1. Búsqueda en catálogo de propietarios

Se detectan funciones para:

- buscar propietarios en catálogo
- buscar por apellidos
- buscar por nombres
- buscar por razones sociales
- buscar calles en catálogo

Funciones detectadas:
- `buscar_propietarios_catalogo`
- `buscar_apellidos_catalogo`
- `buscar_nombres_catalogo`
- `buscar_razones_sociales_catalogo`
- `buscar_calles_catalogo`

### 2. Mantenimiento de personas del catálogo

Se detectan operaciones de alta, consulta, actualización y baja lógica de personas.

Funciones detectadas:
- `obtener_propietario_catalogo`
- `crear_propietario_catalogo`
- `actualizar_propietario_catalogo`
- `eliminar_propietario_catalogo`

### 3. Mantenimiento y normalización de calles

Además del módulo `catalogos`, aquí también existe capacidad para trabajar calles asociadas a propietarios.

Funciones detectadas:
- `crear_calle_catalogo`

### 4. Fusión de propietarios duplicados

Se detecta una operación específica para homologación de personas repetidas o duplicadas.

Funciones detectadas:
- `fusionar_propietarios_catalogo`

Esta capacidad es especialmente importante cuando:
- una misma persona aparece con variantes de nombre
- existe desfase entre padrón y catálogo
- se requiere consolidar historial o relaciones hacia una sola persona destino

### 5. Asociación propietario-predio

Se detectan operaciones para administrar relaciones entre personas y claves catastrales.

Funciones detectadas:
- `listar_propietarios_predio_v28`
- `agregar_propietario_predio_v28`
- `actualizar_propietario_predio_v28`
- `quitar_propietario_predio_v28`
- `reemplazar_propietarios_predio_v28`

Esto sugiere que el sistema permite:
- consultar titulares por predio
- agregar nuevos copropietarios
- ajustar porcentajes de propiedad
- cambiar tipo de titularidad
- reemplazar completamente la estructura de propietarios asociada a un predio

### 6. Sincronización catálogo ↔ padrón

Uno de los componentes más importantes del módulo es la sincronización de nombres y relaciones entre el padrón y el catálogo de personas.

Funciones detectadas:
- `refrescar_nombre_padron_desde_catalogo_v28`
- `resumen_desfase_padron_catalogo`
- `sincronizar_padron_catalogo_masivo_v28`
- `sincronizar_padron_nombre_persona_v28`
- `sincronizar_padron_titular_predio_v28`
- `sincronizar_padron_nombre_claves_v28`
- `titular_padron_sincronizado_v28`

Esto indica que el módulo puede ayudar a:

- alinear nombres de titulares en `catalogos.padron_2026`
- detectar diferencias entre padrón y catálogo
- propagar cambios desde el catálogo de personas
- corregir nombres de titulares vigentes por predio
- ejecutar procesos masivos de normalización

### 7. Gestión de domicilio de personas

El modelo `PropietarioPersonaPayload` y las funciones auxiliares muestran soporte para domicilio:

- calle
- colonia
- número oficial
- código postal
- delegación

Funciones auxiliares detectadas:
- `asegurar_columnas_domicilio_persona`
- `domicilio_persona_desde_payload`

Esto sugiere que el catálogo de personas puede enriquecerse no solo con identidad, sino también con datos de localización o contacto territorial.

### 8. Gestión de condominios por predio

El módulo también contiene lógica para clasificar predios bajo régimen de condominio y registrar atributos asociados.

Funciones detectadas:
- `obtener_condominio_predio_v28`
- `guardar_condominio_predio_v28`
- `normalizar_modalidad_condominio`
- `etiqueta_modalidad_condominio`
- `sugerir_modalidad_condominio`
- `obtener_info_condominio_predio_v28`
- `upsert_predio_condominio_v28`

Esto sugiere operaciones como:
- registrar modalidad
- registrar nombre de condominio
- almacenar observaciones
- propagar clasificación a grupos relacionados
- sugerir modalidad según contexto predial

### 9. Clasificación masiva de condominios

Se detectan funciones orientadas a búsqueda, análisis y clasificación masiva:

- `listar_nombres_condominio_v28`
- `buscar_clasificacion_condominio_v28`
- `clasificacion_masiva_condominio_v28`

Esto puede servir para:
- encontrar predios similares por nombre de condominio
- revisar coincidencias por calle, colonia, número oficial o prefijo de clave
- aplicar clasificación grupal a múltiples claves catastrales

### 10. Validaciones y utilerías de homologación

También se observan funciones auxiliares para normalización y validación:

- `upper_clean_v28`
- `normalizar_nombre_fusion_v28`
- `parse_nombre_padron_v28`
- `es_nombre_moral_v28`
- `resolver_persona_por_nombre_padron_v28`
- `fila_propietario_padron_v28`
- `validar_porcentaje_v28`
- `suma_propiedad_vigente_v28`
- `registrar_auditoria_simple_v28`

Estas funciones reflejan que el módulo ya incorpora lógica para:
- limpieza de texto
- normalización de nombres
- distinción entre persona física y moral
- validación de porcentajes de propiedad
- auditoría de operaciones

---

## Operaciones probables del módulo

Con base en los nombres de funciones y modelos detectados, el módulo de propietarios probablemente expone endpoints para operaciones como:

- buscar personas del catálogo
- obtener una persona específica
- crear una persona
- actualizar una persona
- desactivar una persona
- fusionar propietarios duplicados
- listar propietarios de un predio
- agregar propietario a un predio
- actualizar propietario de un predio
- eliminar/quitar propietario de un predio
- reemplazar propietarios de un predio
- resumir desfase entre padrón y catálogo
- sincronizar nombres del padrón
- obtener y actualizar clasificación de condominio
- ejecutar clasificación masiva de condominio

> Importante: estas operaciones están inferidas a partir del código compartido, pero las rutas HTTP exactas (`GET`, `POST`, `PUT`, `DELETE`) deben confirmarse con el archivo completo sin recortes.

---

## Dependencias funcionales observadas

Este módulo parece apoyarse en:

- autenticación por usuario actual
- tablas de catálogo de personas
- relaciones `predio_propietario`
- padrón `catalogos.padron_2026`
- estructuras auxiliares para condominio
- auditoría simple de acciones

También parece ser un módulo fuertemente conectado con:

- `padron`
- `movimientos`
- `catalogos`

---

## Recomendación de documentación futura

Para completar la documentación exacta del módulo de propietarios, hace falta una segunda pasada con:

- las rutas completas decoradas con `@router.get`, `@router.post`, `@router.put`, `@router.delete`
- prefijos concretos
- parámetros `Query`, `Path` y `Body`
- respuestas reales por endpoint

Una vez se tenga esa versión completa, conviene convertir esta sección en:

1. **endpoints confirmados**
2. **payloads**
3. **respuestas esperadas**
4. **roles/permisos requeridos**
5. **casos de uso comunes**

## Módulo de propietarios

El módulo de propietarios concentra la gestión de personas, titulares, relaciones propietario-predio, sincronización con padrón y clasificación de información de condominio.

A nivel funcional, este módulo parece ser uno de los núcleos principales del sistema para mantener homologada la información entre:

- padrón catastral
- catálogo de personas
- relaciones predio-propietario
- clasificación de condominios
- datos de domicilio asociados a personas

### Modelos detectados

#### `PropietarioPersonaPayload`

Modelo utilizado para crear o actualizar personas del catálogo.

```json
{
  "tipo_persona": "FISICA",
  "nombre": "JUAN",
  "apellido_paterno": "PEREZ",
  "apellido_materno": "LOPEZ",
  "razon_social": null,
  "rfc": "XXXX000000XXX",
  "curp": null,
  "activo": true,
  "calle": "CALLE EJEMPLO",
  "colonia": "COLONIA EJEMPLO",
  "numof": "123",
  "cp": "21000",
  "delegacion": "CENTRO"
}
```

#### `PredioPropietarioPayload`

Modelo para asociar una persona a un predio.

```json
{
  "id_persona": 1,
  "porcentaje_propiedad": 100,
  "tipo_titularidad": "PROPIETARIO"
}
```

#### `PredioPropietarioUpdatePayload`

Modelo para actualizar porcentaje o tipo de titularidad de una relación.

```json
{
  "porcentaje_propiedad": 50,
  "tipo_titularidad": "COPROPIETARIO"
}
```

#### `PredioPropietariosReemplazoPayload`

Modelo para reemplazar en bloque los propietarios de un predio.

```json
{
  "propietarios": [
    {
      "id_persona": 1,
      "porcentaje_propiedad": 50,
      "tipo_titularidad": "PROPIETARIO"
    },
    {
      "id_persona": 2,
      "porcentaje_propiedad": 50,
      "tipo_titularidad": "COPROPIETARIO"
    }
  ]
}
```

#### `FusionarPropietariosPayload`

Modelo para fusionar varios propietarios hacia una persona destino.

```json
{
  "id_persona_destino": 1,
  "id_personas_origen": [2, 3, 4]
}
```

#### `SincronizarPadronMasivoPayload`

Modelo para sincronización masiva entre catálogo y padrón.

```json
{
  "confirmar": false,
  "texto_padron": "",
  "limite": 5000
}
```

#### `PredioCondominioPayload`

Modelo para registrar o actualizar información de condominio de un predio.

```json
{
  "modalidad": "VERTICAL",
  "nombre_condominio": "CONDOMINIO EJEMPLO",
  "observaciones": "Observaciones",
  "propagar_grupo": true
}
```

#### `CondominioClasificacionBuscarPayload`

Modelo para buscar predios candidatos a clasificación de condominio.

```json
{
  "claves_texto": "",
  "claves": [],
  "nombre_condominio": "",
  "colonia": "",
  "calle": "",
  "numof": "",
  "clave_prefijo": "",
  "q": "",
  "solo_regimen_c": true,
  "limite": 500,
  "offset": 0
}
```

#### `CondominioClasificacionMasivaPayload`

Modelo para clasificar varios predios como condominio.

```json
{
  "claves": ["CLAVE1", "CLAVE2"],
  "modalidad": "VERTICAL",
  "nombre_condominio": "CONDOMINIO EJEMPLO",
  "observaciones": "Clasificación masiva"
}
```

---

## Capacidades funcionales detectadas

Con base en las funciones observadas en `routers/propietarios.py`, el módulo cubre al menos estas áreas:

### 1. Búsqueda en catálogo de propietarios

Se detectan funciones para:

- buscar propietarios en catálogo
- buscar por apellidos
- buscar por nombres
- buscar por razones sociales
- buscar calles en catálogo

Funciones detectadas:
- `buscar_propietarios_catalogo`
- `buscar_apellidos_catalogo`
- `buscar_nombres_catalogo`
- `buscar_razones_sociales_catalogo`
- `buscar_calles_catalogo`

### 2. Mantenimiento de personas del catálogo

Se detectan operaciones de alta, consulta, actualización y baja lógica de personas.

Funciones detectadas:
- `obtener_propietario_catalogo`
- `crear_propietario_catalogo`
- `actualizar_propietario_catalogo`
- `eliminar_propietario_catalogo`

### 3. Mantenimiento y normalización de calles

Además del módulo `catalogos`, aquí también existe capacidad para trabajar calles asociadas a propietarios.

Funciones detectadas:
- `crear_calle_catalogo`

### 4. Fusión de propietarios duplicados

Se detecta una operación específica para homologación de personas repetidas o duplicadas.

Funciones detectadas:
- `fusionar_propietarios_catalogo`

Esta capacidad es especialmente importante cuando:
- una misma persona aparece con variantes de nombre
- existe desfase entre padrón y catálogo
- se requiere consolidar historial o relaciones hacia una sola persona destino

### 5. Asociación propietario-predio

Se detectan operaciones para administrar relaciones entre personas y claves catastrales.

Funciones detectadas:
- `listar_propietarios_predio_v28`
- `agregar_propietario_predio_v28`
- `actualizar_propietario_predio_v28`
- `quitar_propietario_predio_v28`
- `reemplazar_propietarios_predio_v28`

Esto sugiere que el sistema permite:
- consultar titulares por predio
- agregar nuevos copropietarios
- ajustar porcentajes de propiedad
- cambiar tipo de titularidad
- reemplazar completamente la estructura de propietarios asociada a un predio

### 6. Sincronización catálogo ↔ padrón

Uno de los componentes más importantes del módulo es la sincronización de nombres y relaciones entre el padrón y el catálogo de personas.

Funciones detectadas:
- `refrescar_nombre_padron_desde_catalogo_v28`
- `resumen_desfase_padron_catalogo`
- `sincronizar_padron_catalogo_masivo_v28`
- `sincronizar_padron_nombre_persona_v28`
- `sincronizar_padron_titular_predio_v28`
- `sincronizar_padron_nombre_claves_v28`
- `titular_padron_sincronizado_v28`

Esto indica que el módulo puede ayudar a:

- alinear nombres de titulares en `catalogos.padron_2026`
- detectar diferencias entre padrón y catálogo
- propagar cambios desde el catálogo de personas
- corregir nombres de titulares vigentes por predio
- ejecutar procesos masivos de normalización

### 7. Gestión de domicilio de personas

El modelo `PropietarioPersonaPayload` y las funciones auxiliares muestran soporte para domicilio:

- calle
- colonia
- número oficial
- código postal
- delegación

Funciones auxiliares detectadas:
- `asegurar_columnas_domicilio_persona`
- `domicilio_persona_desde_payload`

Esto sugiere que el catálogo de personas puede enriquecerse no solo con identidad, sino también con datos de localización o contacto territorial.

### 8. Gestión de condominios por predio

El módulo también contiene lógica para clasificar predios bajo régimen de condominio y registrar atributos asociados.

Funciones detectadas:
- `obtener_condominio_predio_v28`
- `guardar_condominio_predio_v28`
- `normalizar_modalidad_condominio`
- `etiqueta_modalidad_condominio`
- `sugerir_modalidad_condominio`
- `obtener_info_condominio_predio_v28`
- `upsert_predio_condominio_v28`

Esto sugiere operaciones como:
- registrar modalidad
- registrar nombre de condominio
- almacenar observaciones
- propagar clasificación a grupos relacionados
- sugerir modalidad según contexto predial

### 9. Clasificación masiva de condominios

Se detectan funciones orientadas a búsqueda, análisis y clasificación masiva:

- `listar_nombres_condominio_v28`
- `buscar_clasificacion_condominio_v28`
- `clasificacion_masiva_condominio_v28`

Esto puede servir para:
- encontrar predios similares por nombre de condominio
- revisar coincidencias por calle, colonia, número oficial o prefijo de clave
- aplicar clasificación grupal a múltiples claves catastrales

### 10. Validaciones y utilerías de homologación

También se observan funciones auxiliares para normalización y validación:

- `upper_clean_v28`
- `normalizar_nombre_fusion_v28`
- `parse_nombre_padron_v28`
- `es_nombre_moral_v28`
- `resolver_persona_por_nombre_padron_v28`
- `fila_propietario_padron_v28`
- `validar_porcentaje_v28`
- `suma_propiedad_vigente_v28`
- `registrar_auditoria_simple_v28`

Estas funciones reflejan que el módulo ya incorpora lógica para:
- limpieza de texto
- normalización de nombres
- distinción entre persona física y moral
- validación de porcentajes de propiedad
- auditoría de operaciones

---

## Operaciones probables del módulo

Con base en los nombres de funciones y modelos detectados, el módulo de propietarios probablemente expone endpoints para operaciones como:

- buscar personas del catálogo
- obtener una persona específica
- crear una persona
- actualizar una persona
- desactivar una persona
- fusionar propietarios duplicados
- listar propietarios de un predio
- agregar propietario a un predio
- actualizar propietario de un predio
- eliminar/quitar propietario de un predio
- reemplazar propietarios de un predio
- resumir desfase entre padrón y catálogo
- sincronizar nombres del padrón
- obtener y actualizar clasificación de condominio
- ejecutar clasificación masiva de condominio

> Importante: estas operaciones están inferidas a partir del código compartido, pero las rutas HTTP exactas (`GET`, `POST`, `PUT`, `DELETE`) deben confirmarse con el archivo completo sin recortes.

---

## Dependencias funcionales observadas

Este módulo parece apoyarse en:

- autenticación por usuario actual
- tablas de catálogo de personas
- relaciones `predio_propietario`
- padrón `catalogos.padron_2026`
- estructuras auxiliares para condominio
- auditoría simple de acciones

También parece ser un módulo fuertemente conectado con:

- `padron`
- `movimientos`
- `catalogos`

---

## Recomendación de documentación futura

Para completar la documentación exacta del módulo de propietarios, hace falta una segunda pasada con:

- las rutas completas decoradas con `@router.get`, `@router.post`, `@router.put`, `@router.delete`
- prefijos concretos
- parámetros `Query`, `Path` y `Body`
- respuestas reales por endpoint

Una vez se tenga esa versión completa, conviene convertir esta sección en:

1. **endpoints confirmados**
2. **payloads**
3. **respuestas esperadas**
4. **roles/permisos requeridos**
5. **casos de uso comunes**