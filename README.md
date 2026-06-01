# Sistema de Gestión Catastral BC

Sistema backend y documental para operación catastral, consulta predial, expediente, propietarios, movimientos catastrales y administración, con soporte geoespacial e integración operativa con PostgreSQL y GeoNode.

---

## Descripción general

Este proyecto implementa una API basada en FastAPI para la operación de procesos catastrales institucionales.

Entre sus capacidades principales se encuentran:

- autenticación y autorización con JWT
- consulta de padrón predial
- expediente integral
- consulta y administración de propietarios
- captura y aplicación de movimientos catastrales
- mantenimiento de catálogos
- control de acceso por roles y permisos
- integración con componentes geoespaciales
- servicio de archivos estáticos y documentos asociados al visor

---

## Stack principal

- Python
- FastAPI
- Uvicorn
- PostgreSQL
- psycopg2
- python-dotenv
- python-jose
- passlib
- bcrypt

---

## Estructura general del proyecto

Componentes principales identificados:

- `main.py`  
  Punto de entrada de la aplicación.

- `config.py`  
  Configuración general y carga de variables de entorno.

- `database.py`  
  Conexión a PostgreSQL.

- `auth/`  
  Autenticación, dependencias de seguridad, modelos y ACL.

- `routers/`  
  Endpoints por dominio funcional:
  - movimientos
  - movimientos legacy
  - padrón
  - expediente
  - administración
  - propietarios
  - catálogos

- `docs/`  
  Documentación técnica y operativa del sistema.

---

## Requisitos

Dependencias principales del backend:

```txt
fastapi
uvicorn
psycopg2-binary
python-dotenv
python-jose
passlib
bcrypt
```

---

## Configuración

El sistema utiliza variables de entorno cargadas desde un archivo `.env`.

Variables observadas:

- `SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

> Importante: la aplicación no debe ejecutarse con una `SECRET_KEY` insegura o vacía.

---

## Ejecución local

Ejemplo de ejecución con Uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 9000
```

---

## Despliegue observado

En producción se identificó una ejecución equivalente a:

```bash
/opt/catastro_api/venv/bin/python3 /opt/catastro_api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 9000
```

Y un servicio Linux administrado con `systemd`:

```text
catastro-api.service
```

---

## Documentación disponible

La carpeta `docs/` contiene documentación técnica y operativa del sistema.

### Índice documental

- [`docs/arquitectura-tecnica.md`](docs/arquitectura-tecnica.md)  
  Arquitectura técnica general del sistema.

- [`docs/modelo-de-datos.md`](docs/modelo-de-datos.md)  
  Descripción funcional inicial del modelo de datos.

- [`docs/endpoints.md`](docs/endpoints.md)  
  Inventario inicial de endpoints confirmados y probables.

- [`docs/flujos-operativos.md`](docs/flujos-operativos.md)  
  Flujos funcionales principales del sistema.

- [`docs/despliegue.md`](docs/despliegue.md)  
  Guía de despliegue manual y validación posterior.

- [`docs/operacion-servidor.md`](docs/operacion-servidor.md)  
  Operación del servidor, servicios y rutas relevantes.

---

## Módulos funcionales principales

### Autenticación y seguridad
Responsable de:
- login
- validación de token
- control por roles
- control por permisos
- auditoría de acceso

### Padrón
Responsable de:
- ficha predial
- consultas alfanuméricas
- consultas espaciales
- zonas homogéneas
- régimen y tenencia

### Propietarios
Responsable de:
- catálogo de personas
- relación propietario-predio
- actualización de domicilio
- sincronización de titularidad

### Expediente
Responsable de:
- expediente integral
- historial
- documentos
- control cartográfico

### Movimientos
Responsable de:
- captura de movimientos
- revisión
- autorización
- aplicación de cambios al padrón
- trazabilidad operativa

### Catálogos
Responsable de:
- calles
- colonias
- catálogos auxiliares del sistema

### Administración
Responsable de:
- usuarios
- roles
- contraseñas
- auditoría administrativa

---

## Validación operativa mínima

Después de cambios o despliegues, se recomienda validar al menos:

- login
- ficha predial
- historial de expediente
- documentos de expediente
- propietarios por predio

Rutas observadas:

```text
GET /padron/{clave}/ficha
GET /expediente/{clave}/historial
GET /expediente/{clave}/documentos
GET /predios/{clave}/propietarios
```

---

## Observaciones técnicas

El sistema presenta una arquitectura modular funcional y orientada a operación institucional, con fortalezas en:

- separación por dominios
- seguridad basada en JWT
- soporte de auditoría
- integración predial y cartográfica
- despliegue real en entorno Linux

También existen oportunidades de mejora en:

- formalización de migraciones
- modularización de routers grandes
- consolidación de rutas legacy
- ampliación de pruebas automatizadas
- fortalecimiento del proceso de despliegue

---

## Estado de la documentación

La documentación actual representa una base inicial para mantenimiento y transferencia de conocimiento.

Se recomienda continuar con documentos adicionales como:

- permisos y roles
- glosario institucional/técnico
- diccionario de datos detallado
- guía de respaldo y recuperación

---

## Licencia

Pendiente de definir según política institucional o del repositorio.