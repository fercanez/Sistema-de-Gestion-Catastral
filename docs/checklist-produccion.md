# Checklist de producción

## Propósito

Este documento reúne una lista práctica de verificación para operar el Sistema de Gestión Catastral BC en producción con menor riesgo.

Su objetivo es servir como guía rápida antes y después de:

- despliegues
- cambios de configuración
- cambios en base de datos
- reinicios de servicios
- tareas de mantenimiento
- limpiezas o retiros de componentes

No sustituye la documentación técnica detallada, pero sí ayuda a reducir errores operativos.

---

## Cuándo usar este checklist

Se recomienda revisarlo en cualquiera de estos escenarios:

- antes de desplegar cambios de código
- antes de reiniciar la API
- antes de modificar variables de entorno
- antes de tocar tablas, vistas o funciones en PostgreSQL
- antes de cambiar archivos del visor o documentos
- antes de retirar software del servidor
- después de una recuperación o rollback

---

## 1. Checklist previo a despliegue

### Código y fuente
- [ ] confirmar qué versión o cambio se va a desplegar
- [ ] verificar que el cambio fue revisado previamente
- [ ] confirmar que existe respaldo del código actual
- [ ] evitar editar directamente producción sin respaldo
- [ ] confirmar que el directorio correcto es `/opt/catastro_api`

### Configuración
- [ ] respaldar `.env`
- [ ] validar que no se cambiará accidentalmente `SECRET_KEY`
- [ ] revisar variables de conexión a base de datos
- [ ] verificar que la configuración esperada corresponde al entorno productivo

### Dependencias
- [ ] revisar si el cambio requiere nuevas dependencias Python
- [ ] validar `requirements.txt`
- [ ] confirmar que el entorno virtual correcto es `/opt/catastro_api/venv`

### Base de datos
- [ ] confirmar si el cambio requiere modificación de tablas, vistas o funciones
- [ ] generar respaldo de base de datos antes del cambio si aplica
- [ ] validar scripts SQL antes de ejecutarlos en producción

### Comunicación y control
- [ ] definir ventana de cambio si aplica
- [ ] notificar a responsables si habrá impacto operativo
- [ ] registrar fecha y motivo del despliegue

---

## 2. Checklist de respaldo previo

### Código
- [ ] respaldo de `/opt/catastro_api`

Ejemplo:
```bash
cp -a /opt/catastro_api /root/backups/catastro_api_$(date +%Y%m%d_%H%M%S)
```

### Configuración
- [ ] respaldo de `.env`

Ejemplo:
```bash
cp -a /opt/catastro_api/.env /root/backups/.env_catastro_$(date +%Y%m%d_%H%M%S) 2>/dev/null
```

### Servicio systemd
- [ ] respaldo de `/etc/systemd/system/catastro-api.service`

Ejemplo:
```bash
cp -a /etc/systemd/system/catastro-api.service /root/backups/catastro-api.service_$(date +%Y%m%d_%H%M%S)
```

### Base de datos
- [ ] respaldo lógico con `pg_dump` si el cambio toca datos o estructura

### Documentos
- [ ] respaldo de `/var/www/catastro/documentos` si habrá cambios relacionados

---

## 3. Checklist durante despliegue

### Copia/actualización de código
- [ ] copiar archivos al directorio correcto
- [ ] verificar que no falten módulos críticos
- [ ] revisar permisos de archivos si hubo copia manual

### Dependencias
- [ ] activar entorno virtual correcto
- [ ] instalar dependencias solo si aplica
- [ ] revisar errores de instalación

Ejemplo:
```bash
source /opt/catastro_api/venv/bin/activate
pip install -r /opt/catastro_api/requirements.txt
deactivate
```

### Servicio
- [ ] reiniciar `catastro-api`
- [ ] esperar unos segundos antes de validar
- [ ] revisar si el servicio quedó activo

Ejemplo:
```bash
systemctl restart catastro-api
systemctl status catastro-api --no-pager
```

---

## 4. Checklist posterior a despliegue

### Servicio principal
- [ ] verificar que `catastro-api.service` esté activo
- [ ] revisar que Uvicorn esté corriendo
- [ ] confirmar que el puerto esperado siga disponible

Comandos útiles:
```bash
systemctl status catastro-api --no-pager
ps aux | grep uvicorn
ss -tulpn | grep 9000
```

### Logs
- [ ] revisar logs recientes del servicio
- [ ] confirmar que no existan errores de importación
- [ ] confirmar que no existan errores de conexión a base de datos
- [ ] revisar si hay excepciones nuevas en endpoints críticos

Comando:
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Validación funcional mínima
- [ ] login
- [ ] ficha predial
- [ ] historial de expediente
- [ ] documentos del expediente
- [ ] propietarios por predio

Endpoints críticos observados:
- [ ] `GET /padron/{clave}/ficha`
- [ ] `GET /expediente/{clave}/historial`
- [ ] `GET /expediente/{clave}/documentos`
- [ ] `GET /predios/{clave}/propietarios`

### Visor y archivos
- [ ] confirmar acceso a `/var/www/catastro` si aplica
- [ ] validar que documentos abran correctamente
- [ ] validar recursos estáticos si hubo cambios relacionados

---

## 5. Checklist para cambios en base de datos

Antes:
- [ ] respaldar base completa o esquema afectado
- [ ] revisar script SQL completo
- [ ] validar impacto en vistas dependientes
- [ ] identificar si requiere ventana de mantenimiento

Durante:
- [ ] ejecutar script sobre la base correcta
- [ ] registrar fecha y cambio aplicado
- [ ] revisar errores inmediatamente

Después:
- [ ] validar consultas críticas
- [ ] validar vistas principales:
  - [ ] `v_ficha_predial`
  - [ ] `v_expediente_integral`
  - [ ] `v_control_cartografico`
- [ ] probar endpoints afectados
- [ ] revisar logs del backend

---

## 6. Checklist para cambios de configuración

### Variables de entorno
- [ ] respaldar `.env`
- [ ] revisar sintaxis del archivo
- [ ] confirmar que no se eliminaron variables requeridas
- [ ] confirmar que valores sensibles siguen correctos

### Riesgos comunes
- [ ] `SECRET_KEY` incorrecta
- [ ] datos de conexión a DB incorrectos
- [ ] tiempo de expiración de token mal configurado
- [ ] credenciales incompletas

Después del cambio:
- [ ] reiniciar servicio
- [ ] validar arranque correcto
- [ ] probar login
- [ ] probar endpoint autenticado

---

## 7. Checklist para reinicio controlado

Antes de reiniciar:
- [ ] confirmar motivo del reinicio
- [ ] revisar si hay usuarios activos o ventana de trabajo crítica
- [ ] revisar si el servicio ya presenta errores

Reinicio:
```bash
systemctl restart catastro-api
```

Después:
- [ ] validar estado del servicio
- [ ] revisar logs
- [ ] probar endpoint crítico

---

## 8. Checklist para rollback

Usar cuando el despliegue o cambio generó fallo.

### Pasos
- [ ] detener servicio si es necesario
- [ ] restaurar respaldo previo del código
- [ ] restaurar `.env` si fue modificado
- [ ] restaurar servicio systemd si fue alterado
- [ ] restaurar base de datos si el problema fue estructural o de datos
- [ ] reiniciar servicio
- [ ] validar operación mínima

### Validar después
- [ ] `systemctl status catastro-api`
- [ ] logs recientes sin errores críticos
- [ ] endpoints mínimos funcionando

---

## 9. Checklist para respaldo y recuperación

### Respaldo
- [ ] código desplegado
- [ ] `.env`
- [ ] servicio systemd
- [ ] base de datos
- [ ] documentos
- [ ] visor/archivos estáticos si aplica

### Recuperación
- [ ] restaurar componente correcto
- [ ] revisar permisos
- [ ] reiniciar servicios
- [ ] validar endpoints
- [ ] validar acceso a documentos
- [ ] documentar incidente y recuperación

---

## 10. Checklist para limpieza o retiro de componentes

Útil al desinstalar software auxiliar o eliminar artefactos del servidor.

Antes:
- [ ] confirmar que el componente realmente no se usa
- [ ] revisar servicios systemd relacionados
- [ ] revisar binarios relacionados
- [ ] revisar rutas de datos y publicación web
- [ ] mover a cuarentena antes de borrar definitivamente

Durante:
- [ ] detener servicio
- [ ] deshabilitar servicio
- [ ] mover archivos a cuarentena o respaldo
- [ ] recargar `systemd`

Después:
- [ ] validar que `catastro-api` siga activo
- [ ] validar que `geonode` siga activo si aplica
- [ ] revisar que no queden procesos residuales
- [ ] revisar que no queden unit files o binarios huérfanos

---

## 11. Checklist de validación general del servidor

### Servicios principales
- [ ] `catastro-api.service` activo
- [ ] `geonode.service` activo
- [ ] `geonode-celery.service` activo

### Comandos útiles
```bash
systemctl status catastro-api --no-pager
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Procesos
- [ ] Uvicorn corriendo
- [ ] Gunicorn/GeoNode corriendo
- [ ] Celery corriendo

### Puertos
- [ ] puerto de API disponible
- [ ] puertos esperados sin conflictos

### Disco/espacio
- [ ] revisar espacio libre antes de respaldos o cargas grandes
- [ ] revisar crecimiento de documentos o logs

Ejemplo:
```bash
df -h
```

---

## 12. Checklist de observaciones post-cambio

Después de cualquier cambio importante registrar:

- [ ] fecha
- [ ] responsable
- [ ] qué se cambió
- [ ] qué respaldo se generó
- [ ] resultado
- [ ] incidentes observados
- [ ] rollback aplicado o no
- [ ] validación funcional realizada

Esto ayuda a mantener trazabilidad operativa.

---

## Checklist resumido de despliegue rápido

### Antes
- [ ] respaldo de código
- [ ] respaldo de `.env`
- [ ] respaldo de DB si aplica
- [ ] revisar dependencias
- [ ] confirmar rutas correctas

### Durante
- [ ] copiar cambios
- [ ] instalar dependencias si aplica
- [ ] reiniciar `catastro-api`

### Después
- [ ] revisar `systemctl status`
- [ ] revisar `journalctl`
- [ ] probar login
- [ ] probar ficha
- [ ] probar historial
- [ ] probar documentos
- [ ] probar propietarios

---

## Recomendación futura

Como evolución de este checklist conviene:

- convertirlo en procedimiento operativo estándar
- crear una versión corta “pre-flight” para despliegues rápidos
- crear una versión de incidente/recuperación
- integrarlo con bitácora de cambios de producción

---

## Resumen

Este checklist busca reducir errores operativos en producción mediante verificaciones simples pero críticas sobre:

- código
- configuración
- base de datos
- servicios
- documentos
- respaldos
- validación funcional

Debe utilizarse como guía práctica antes y después de cambios relevantes en el sistema.