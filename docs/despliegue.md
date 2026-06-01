# Despliegue

## Propósito

Este documento describe el despliegue operativo del Sistema de Gestión Catastral BC, con base en la estructura observada en el servidor y en el comportamiento actual de la API.

Su objetivo es servir como guía práctica para:

- ubicar componentes principales
- entender cómo corre la aplicación
- reiniciar servicios
- actualizar el código desplegado
- validar que el sistema siga funcionando después de cambios

---

## Visión general del despliegue

El sistema se ejecuta actualmente como una aplicación backend FastAPI desplegada en Linux y administrada con `systemd`.

La aplicación se ejecuta con:

- Python
- entorno virtual
- Uvicorn
- servicio `catastro-api.service`

Además, el servidor conserva componentes separados como:

- GeoNode
- archivos estáticos del visor
- documentos del sistema

---

## Rutas principales observadas

### Código desplegado de la API
```text
/opt/catastro_api
```

### Entorno virtual de la API
```text
/opt/catastro_api/venv
```

### Visor / archivos estáticos
```text
/var/www/catastro
```

### Documentos del sistema
```text
/var/www/catastro/documentos
```

### Servicio systemd
```text
/etc/systemd/system/catastro-api.service
```

---

## Proceso de ejecución

La ejecución observada del backend es:

```bash
/opt/catastro_api/venv/bin/python3 /opt/catastro_api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 9000
```

Esto indica que:

- la aplicación corre con Uvicorn
- expone servicio en el puerto `9000`
- usa el entorno virtual local del proyecto
- se ejecuta desde el código desplegado en `/opt/catastro_api`

---

## Servicio principal

### Nombre
```text
catastro-api.service
```

### Función
- iniciar la API al arrancar el servidor
- mantener la API corriendo
- reiniciarla en caso necesario
- integrarla al control operativo de Linux

### Ver estado
```bash
systemctl status catastro-api --no-pager
```

### Reiniciar servicio
```bash
systemctl restart catastro-api
```

### Detener servicio
```bash
systemctl stop catastro-api
```

### Iniciar servicio
```bash
systemctl start catastro-api
```

### Habilitar al arranque
```bash
systemctl enable catastro-api
```

---

## Variables de entorno y configuración

El proyecto usa configuración por variables de entorno, cargadas desde `.env` mediante `python-dotenv`.

Variables observadas:
- `SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### Recomendaciones
- no versionar el archivo `.env`
- conservar `.env.example` como referencia
- respaldar valores productivos antes de cualquier cambio
- no cambiar `SECRET_KEY` en producción sin evaluar el impacto sobre autenticación

---

## Proceso sugerido de despliegue manual

> Nota: en el estado observado, el servidor parece operar con despliegue manual y no con pipeline automatizado.

### Flujo sugerido

1. respaldar configuración relevante
2. respaldar código desplegado actual
3. copiar cambios al directorio `/opt/catastro_api`
4. validar dependencias del entorno virtual
5. reiniciar `catastro-api`
6. verificar logs
7. probar endpoints críticos

---

## Respaldo previo al despliegue

Antes de actualizar, conviene generar un respaldo básico del código actual:

```bash
cp -a /opt/catastro_api /opt/catastro_api_backup_$(date +%Y%m%d_%H%M%S)
```

Si el respaldo completo es muy pesado, al menos respaldar:

- `.env`
- `main.py`
- `config.py`
- `database.py`
- `routers/`
- `auth/`

---

## Actualización del código

La actualización puede hacerse por copia manual del proyecto al directorio operativo.

### Recomendaciones
- evitar editar directamente en caliente sin respaldo
- conservar un histórico mínimo de backups
- si el cambio es grande, preparar copia temporal y luego reemplazar
- verificar permisos de archivos después de copiar

---

## Dependencias Python

Si cambian las dependencias del proyecto, actualizar dentro del entorno virtual:

```bash
source /opt/catastro_api/venv/bin/activate
pip install -r /opt/catastro_api/requirements.txt
deactivate
```

### Recomendación
Antes de instalar, revisar:
- contenido de `requirements.txt`
- compatibilidad con el entorno actual
- necesidad real de actualizar paquetes en producción

---

## Reinicio después del despliegue

Una vez actualizados archivos o dependencias:

```bash
systemctl restart catastro-api
```

Luego validar:

```bash
systemctl status catastro-api --no-pager
```

---

## Validación posterior al despliegue

Después de reiniciar, se recomienda probar al menos:

### 1. estado del servicio
```bash
systemctl status catastro-api --no-pager
```

### 2. logs recientes
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### 3. endpoints críticos
Validar consultas funcionales como:
- ficha de padrón
- historial de expediente
- documentos
- propietarios por predio

Ejemplos funcionales observados:
- `/padron/{clave}/ficha`
- `/expediente/{clave}/historial`
- `/expediente/{clave}/documentos`
- `/predios/{clave}/propietarios`

### 4. comportamiento del visor
Si aplica, validar que el visor siga cargando recursos estáticos:
- HTML
- CSS
- JavaScript
- documentos
- imágenes

---

## Logs y diagnóstico

### Ver últimos eventos de la API
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Seguir logs en vivo
```bash
journalctl -u catastro-api -f
```

### Qué revisar en logs
- errores al arrancar
- fallas de conexión a base de datos
- errores de importación de módulos
- problemas con variables de entorno
- rutas 500
- excepciones de autenticación
- errores de permisos de archivos

---

## Validaciones de conectividad

Si la API no responde, revisar:

### Puerto escuchando
```bash
ss -tulpn | grep 9000
```

### Proceso activo
```bash
ps aux | grep uvicorn
```

### Estado del servicio
```bash
systemctl status catastro-api --no-pager
```

---

## Riesgos comunes en despliegue

### 1. Dependencias incompletas
Si `requirements.txt` no refleja las dependencias reales, el servicio puede fallar al reiniciar.

### 2. Variables de entorno incorrectas
Un `.env` incompleto o incorrecto puede impedir:
- conexión a base de datos
- firma de JWT
- arranque del sistema

### 3. Cambios directos sin respaldo
Modificar archivos productivos sin copia previa complica rollback.

### 4. Permisos de archivos
Si se copian archivos con permisos incorrectos, la API o el visor podrían fallar.

### 5. Cambios estructurales en base de datos
Si el código asume nuevas columnas, tablas o vistas y no existen en producción, aparecerán errores funcionales.

---

## Estrategia mínima de rollback

Si un despliegue falla:

1. detener el servicio si es necesario
2. restaurar el respaldo previo
3. reiniciar `catastro-api`
4. revisar logs
5. validar endpoints críticos

Ejemplo:

```bash
systemctl stop catastro-api
rm -rf /opt/catastro_api
mv /opt/catastro_api_backup_YYYYMMDD_HHMMSS /opt/catastro_api
systemctl start catastro-api
```

> Ajustar el nombre real del backup antes de ejecutar.

---

## Buenas prácticas recomendadas

### Corto plazo
- mantener respaldos previos a cada cambio
- documentar cada despliegue
- validar endpoints críticos después de reiniciar
- evitar cambios grandes sin prueba previa

### Mediano plazo
- mantener una copia Git controlada del proyecto en servidor o entorno de staging
- separar claramente código fuente y despliegue operativo
- establecer una rutina de rollback simple

### Largo plazo
- definir un flujo de despliegue reproducible
- automatizar validaciones
- documentar versiones y cambios por despliegue
- incorporar ambiente de pruebas o staging

---

## Relación con otros componentes del servidor

El despliegue de la API debe entenderse separado de:

### GeoNode
Servicios detectados:
- `geonode.service`
- `geonode-celery.service`

### Visor/documentos
Rutas:
- `/var/www/catastro`
- `/var/www/catastro/documentos`

### Componentes retirados
QCarta fue retirado del servidor y no forma parte del despliegue actual del sistema catastral.

---

## Checklist rápido de despliegue

Antes:
- [ ] respaldar `/opt/catastro_api`
- [ ] respaldar `.env`
- [ ] revisar `requirements.txt`
- [ ] confirmar cambios de base de datos necesarios

Durante:
- [ ] copiar código actualizado
- [ ] actualizar dependencias si aplica
- [ ] revisar permisos

Después:
- [ ] reiniciar `catastro-api`
- [ ] revisar `systemctl status`
- [ ] revisar `journalctl`
- [ ] probar endpoints críticos
- [ ] validar visor/documentos si aplica

---

## Resumen

El despliegue actual del sistema es manual y está basado en:

- código en `/opt/catastro_api`
- entorno virtual local
- ejecución con Uvicorn
- administración con `systemd`

La operación es funcional y suficiente para producción, pero conviene seguir madurando el proceso hacia un esquema más controlado, reproducible y documentado.