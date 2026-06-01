# Operación del servidor

## Propósito

Este documento resume la operación actual del servidor donde se ejecutan los componentes principales del sistema catastral, incluyendo la API de catastro y la plataforma GeoNode.

También documenta la limpieza realizada para retirar QCarta del servidor sin afectar los servicios activos restantes.

---

## Componentes actualmente activos

### 1. API del sistema catastral

Servicio:

```text
catastro-api.service
```

Función:
- publicar la API FastAPI del Sistema de Gestión Catastral BC
- atender consultas de padrón, expediente, propietarios, movimientos y administración
- servir el backend principal consumido por el visor y/o clientes

Estado observado:
- activo y en ejecución mediante `systemd`

Ejecución observada:
```bash
/opt/catastro_api/venv/bin/python3 /opt/catastro_api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 9000
```

Ruta operativa principal:
```text
/opt/catastro_api
```

---

### 2. GeoNode

Servicios observados:

```text
geonode.service
geonode-celery.service
```

Función:
- plataforma geoespacial principal
- publicación/gestión geográfica complementaria
- procesamiento asociado a GeoNode

Ruta fuente observada:
```text
/root/src/geonode
```

Estado observado:
- ambos servicios activos después de retirar QCarta

---

## Rutas importantes del servidor

### API de catastro
```text
/opt/catastro_api
```

### Visor / estáticos de catastro
```text
/var/www/catastro
```

### Documentos del sistema
```text
/var/www/catastro/documentos
```

### GeoNode fuente
```text
/root/src/geonode
```

### Document root web general
```text
/var/www/html
```

> Nota: después de retirar QCarta, `/var/www/html` fue recreado vacío para no dejar una ruta faltante en el servidor web.

---

## Servicios systemd relevantes

### API catastral
```bash
systemctl status catastro-api --no-pager
```

### GeoNode
```bash
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Reinicio de la API catastral
```bash
systemctl restart catastro-api
```

### Reinicio de GeoNode
```bash
systemctl restart geonode
systemctl restart geonode-celery
```

---

## Validaciones operativas básicas

### Verificar API activa
```bash
systemctl status catastro-api --no-pager
```

### Verificar GeoNode activo
```bash
systemctl list-units --type=service | grep -i geonode
```

### Ver logs recientes de la API
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Ver logs recientes de GeoNode
```bash
journalctl -u geonode -n 100 --no-pager
journalctl -u geonode-celery -n 100 --no-pager
```

---

## Retiro de QCarta del servidor

### Objetivo
Se retiró QCarta y sus servicios porque ya no eran necesarios, procurando no afectar:

- GeoNode
- la API de catastro
- el visor/documentos de catastro

### Componentes QCarta identificados previamente

Se detectaron componentes QCarta en rutas como:

```text
/srv/qcarta
/var/www/html
/var/www/qcarta
/usr/local/bin/qcarta-tiles
/usr/local/bin/qcarta-tiles_ctl.sh
/etc/systemd/system/qcarta-tiles.service
/var/www/data/qcarta-tiles
```

### Acción realizada
- se detuvo y deshabilitó el servicio `qcarta-tiles`
- se retiraron archivos y componentes asociados a QCarta
- se recargó `systemd`
- se recreó `/var/www/html` vacío para no dejar una ruta faltante
- se validó que `catastro-api` continuara activo
- se validó que `geonode` y `geonode-celery` continuaran activos

### Resultado
QCarta quedó retirado sin afectar los servicios principales del sistema catastral ni GeoNode.

---

## Comandos útiles de operación

### Estado de servicios principales
```bash
systemctl status catastro-api --no-pager
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Reiniciar servicios
```bash
systemctl restart catastro-api
systemctl restart geonode
systemctl restart geonode-celery
```

### Recargar systemd
```bash
systemctl daemon-reload
systemctl reset-failed
```

### Revisar procesos Python/Uvicorn/Gunicorn
```bash
ps aux | grep -E "uvicorn|gunicorn|geonode|celery"
```

### Revisar puertos escuchando
```bash
ss -tulpn
```

---

## Comprobaciones posteriores a cambios

Después de cualquier limpieza, actualización o despliegue, conviene revisar:

1. estado del servicio `catastro-api`
2. estado de `geonode`
3. estado de `geonode-celery`
4. acceso al visor/documentos
5. consultas básicas a endpoints críticos:
   - ficha de padrón
   - historial de expediente
   - documentos
   - propietarios por predio

---

## Incidencias observadas no críticas

En logs de la API se observaron eventos como:

- `Invalid HTTP request received`
- solicitudes a rutas inexistentes como `/auth1.js`

Estas solicitudes probablemente corresponden a:
- bots
- escáneres automáticos
- tráfico oportunista desde internet

No se consideran evidencia de falla propia del sistema.

---

## Recomendaciones operativas

### 1. Mantener separados los roles del servidor
Conviene distinguir claramente:

- código fuente
- despliegue operativo
- archivos estáticos
- documentos
- servicios auxiliares
- repositorios de terceros

### 2. Evitar trabajar directamente sobre despliegues productivos
Idealmente:
- el código fuente debería vivir en una ruta clara de trabajo
- el despliegue debería salir de una fuente controlada
- los cambios manuales en producción deberían minimizarse

### 3. Documentar toda ruta crítica
Especialmente:
- servicios systemd
- binarios instalados manualmente
- rutas de documentos
- rutas servidas por web
- orígenes de despliegue

### 4. Respaldar antes de retirar componentes
Antes de eliminar software auxiliar o repos de terceros, siempre conviene:
- detener servicio
- respaldar binarios/configuración
- mover a cuarentena temporal
- validar operación del resto del sistema

---

## Pendientes recomendados

Como siguientes documentos útiles conviene generar:

- `docs/modelo-de-datos.md`
- `docs/despliegue.md`
- `docs/respaldo-y-recuperacion.md`

Sugerencias:
- **modelo de datos**: tablas, vistas, esquemas críticos
- **despliegue**: cómo subir cambios a la API
- **respaldo y recuperación**: qué respaldar y cómo restaurar

---

## Resumen

Actualmente el servidor conserva como componentes principales activos:

- la API del Sistema de Gestión Catastral BC
- GeoNode
- recursos estáticos/documentales del sistema catastral

QCarta fue retirado del servidor sin afectar estos servicios.

Este documento sirve como referencia rápida para operación, validación y mantenimiento básico del entorno.