# Manual de operación diaria

## Propósito

Este documento describe rutinas y verificaciones prácticas para la operación cotidiana del Sistema de Gestión Catastral BC.

Su objetivo es servir como guía para personas responsables de la operación diaria, soporte funcional o supervisión básica del sistema, ayudando a:

- verificar que el sistema esté disponible
- identificar fallas comunes
- realizar validaciones mínimas
- registrar incidencias relevantes
- mantener orden operativo

No sustituye manuales específicos por perfil ni lineamientos institucionales internos, pero sí ofrece una base práctica para el día a día.

---

## Perfil al que va dirigido

Este manual está pensado para:

- personal operativo con funciones de revisión
- soporte de primer nivel
- supervisión funcional básica
- administración técnica ligera

---

## Qué debe verificarse diariamente

En términos generales, todos los días conviene revisar:

- que la API principal esté arriba
- que GeoNode esté arriba si forma parte de la operación
- que el visor/documentos siga accesible
- que los endpoints críticos respondan
- que no existan errores recientes graves en logs
- que no haya incidentes abiertos sin seguimiento

---

## 1. Revisión básica al inicio del día

### Validar la API principal
```bash
systemctl status catastro-api --no-pager
```

### Resultado esperado
- servicio `active (running)`

### Validar GeoNode
```bash
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Validar procesos principales
```bash
ps aux | grep -E "uvicorn|gunicorn|celery"
```

### Validar que el puerto esperado siga disponible
```bash
ss -tulpn | grep 9000
```

---

## 2. Revisión rápida funcional

Conviene probar al menos una clave catastral conocida y verificar:

### Ficha predial
```text
GET /padron/{clave}/ficha
```

### Historial del expediente
```text
GET /expediente/{clave}/historial
```

### Documentos del expediente
```text
GET /expediente/{clave}/documentos
```

### Propietarios por predio
```text
GET /predios/{clave}/propietarios
```

### Objetivo
Confirmar que:
- la API responde
- la base de datos responde
- los módulos críticos siguen operativos
- el expediente y documentos no se rompieron

---

## 3. Revisión básica de logs

### Ver últimos eventos de la API
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Qué buscar
- errores repetidos
- fallos de conexión a base de datos
- errores de autenticación inesperados
- excepciones no controladas
- errores 500 frecuentes
- problemas al cargar documentos

### Qué no debe alarmar de inmediato
Solicitudes como:
- `Invalid HTTP request received`
- rutas inexistentes pedidas por bots
- intentos de acceso a archivos extraños

Eso suele ser tráfico automatizado si el servidor está expuesto a internet.

---

## 4. Revisión del visor y documentos

Si el flujo operativo depende del visor o de recursos web, conviene validar:

- que el visor cargue
- que scripts y estilos carguen correctamente
- que una consulta de expediente muestre documentos
- que un documento pueda abrirse o descargarse

### Rutas importantes observadas
```text
/var/www/catastro
/var/www/catastro/documentos
```

---

## 5. Qué hacer si un usuario reporta falla

Cuando llegue un reporte como:
- “no entra el sistema”
- “no aparece la ficha”
- “no carga documentos”
- “no salen propietarios”
- “está lento”
- “marca error”

seguir esta secuencia básica.

### Paso 1. Confirmar alcance del problema
Preguntar:
- qué pantalla o módulo falla
- desde cuándo
- si afecta a un solo predio o a todos
- si afecta a todos los usuarios o solo a uno
- si hay mensaje exacto de error

### Paso 2. Validar servicio
```bash
systemctl status catastro-api --no-pager
```

### Paso 3. Revisar logs
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Paso 4. Reproducir con una consulta conocida
Probar un endpoint crítico o una clave conocida.

### Paso 5. Clasificar el problema
Puede ser:
- autenticación
- base de datos
- expediente/documentos
- propietarios
- servicio caído
- problema del navegador/cliente
- problema específico de datos

---

## 6. Problemas comunes y reacción inicial

## Caso A. La API está caída
### Síntoma
`systemctl status` muestra servicio inactivo, fallido o muerto.

### Acción inicial
```bash
systemctl restart catastro-api
systemctl status catastro-api --no-pager
journalctl -u catastro-api -n 100 --no-pager
```

### Si no levanta
Escalar a revisión técnica más profunda.

---

## Caso B. El servicio está arriba pero falla login
### Revisar
- logs recientes
- cambios recientes en `.env`
- problemas de token o autenticación
- usuarios específicos afectados o todos

### Acción
- validar si el problema es general o individual
- si el cambio fue reciente, revisar bitácora y configuración

---

## Caso C. No aparecen documentos
### Revisar
- endpoint de documentos
- permisos de lectura
- existencia física de archivos
- rutas configuradas
- errores en logs

### Rutas relevantes
```text
/var/www/catastro/documentos
```

---

## Caso D. No salen propietarios
### Revisar
- endpoint `/predios/{clave}/propietarios`
- logs
- si afecta a una clave o a varias
- integridad de datos del predio afectado

---

## Caso E. No carga historial
### Revisar
- endpoint `/expediente/{clave}/historial`
- vistas o datos base asociados
- si el problema es general o solo de ciertos predios

---

## Caso F. Hay lentitud
### Revisar
- carga del servidor
- procesos activos
- consultas pesadas
- tráfico anormal
- logs recientes

### Comandos útiles
```bash
top
free -h
df -h
ss -tulpn
```

---

## 7. Qué registrar cuando ocurre una incidencia

Cuando haya una incidencia relevante, registrar al menos:

- fecha y hora
- quién reportó
- módulo afectado
- síntoma observado
- si fue general o puntual
- acciones realizadas
- resultado
- si fue necesario escalar

### Documento recomendado
Registrar en:
```text
docs/bitacora-cambios.md
```

Si surge trabajo futuro:
```text
docs/backlog-tecnico.md
```

---

## 8. Rutina después de cualquier cambio

Si alguien realizó:
- despliegue
- ajuste de configuración
- cambio de DB
- reinicio
- limpieza técnica

conviene validar inmediatamente:

- estado de `catastro-api`
- logs recientes
- ficha predial
- historial
- documentos
- propietarios
- visor si aplica

### Documento de apoyo
- `docs/checklist-produccion.md`

---

## 9. Revisión semanal recomendada

Además de la revisión diaria, una vez por semana conviene verificar:

- espacio en disco
- crecimiento de documentos
- salud básica de servicios
- pendientes técnicos abiertos
- incidentes repetitivos
- si hubo cambios sin documentar

### Comandos útiles
```bash
df -h
systemctl list-units --type=service
journalctl -u catastro-api -n 200 --no-pager
```

---

## 10. Señales de alerta que ameritan escalar

Escalar a revisión técnica o administración más profunda si ocurre cualquiera de estas situaciones:

- el servicio no arranca después de reinicio
- errores repetidos de conexión a base de datos
- múltiples endpoints críticos fallando al mismo tiempo
- pérdida o inaccesibilidad de documentos
- problemas de autenticación generalizados
- lentitud severa persistente
- errores 500 continuos
- cambios recientes sin respaldo conocido
- sospecha de problema de permisos o seguridad

---

## 11. Buenas prácticas de operación diaria

- no reiniciar servicios sin revisar primero el problema
- no modificar `.env` como reacción improvisada
- no borrar archivos del servidor sin respaldo
- no ejecutar cambios SQL en producción sin validación
- registrar incidencias relevantes
- usar claves conocidas para pruebas rápidas
- diferenciar fallas generales de fallas de datos puntuales

---

## 12. Checklist diario breve

### Inicio del día
- [ ] `catastro-api` activo
- [ ] `geonode` activo
- [ ] `geonode-celery` activo
- [ ] puerto de la API disponible
- [ ] sin errores graves recientes en logs

### Validación funcional mínima
- [ ] ficha predial
- [ ] historial
- [ ] documentos
- [ ] propietarios

### Si hubo incidencias
- [ ] registrar en bitácora
- [ ] identificar si requiere escalación
- [ ] crear pendiente si aplica

---

## 13. Documentos de apoyo

Consultar según el caso:

- `README.md`
- `docs/operacion-servidor.md`
- `docs/despliegue.md`
- `docs/checklist-produccion.md`
- `docs/respaldo-y-recuperacion.md`
- `docs/bitacora-cambios.md`
- `docs/manual-admin.md`
- `docs/backlog-tecnico.md`

---

## Resumen

La operación diaria del sistema debe enfocarse en detectar rápido si los componentes críticos siguen disponibles y si los flujos más importantes continúan funcionando:

- API activa
- expedientes accesibles
- documentos disponibles
- propietarios consultables
- historial operativo
- servicios complementarios sanos

Este manual proporciona una rutina sencilla para mantener continuidad operativa y responder con orden ante incidencias comunes.