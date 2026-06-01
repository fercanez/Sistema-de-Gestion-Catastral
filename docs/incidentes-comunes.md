# Incidentes comunes

## Propósito

Este documento reúne incidentes frecuentes o plausibles en la operación del Sistema de Gestión Catastral BC, junto con señales típicas, posibles causas y acciones iniciales recomendadas.

Su objetivo es ayudar a:

- responder más rápido ante fallas comunes
- reducir improvisación operativa
- distinguir síntomas de causa probable
- escalar con mejor contexto cuando sea necesario

No reemplaza un diagnóstico técnico profundo, pero sí sirve como guía de primera respuesta.

---

## Cómo usar este documento

Cuando ocurra una falla:

1. identificar el síntoma principal
2. localizar el incidente más parecido en este documento
3. ejecutar la revisión inicial recomendada
4. validar si el problema se resolvió
5. si no se resuelve, escalar con la evidencia recolectada

---

## Incidente 1. La API no responde

### Síntomas
- el sistema “no abre”
- falla cualquier consulta
- los endpoints no responden
- el servicio parece caído

### Revisión inicial
```bash
systemctl status catastro-api --no-pager
journalctl -u catastro-api -n 100 --no-pager
ps aux | grep uvicorn
ss -tulpn | grep 9000
```

### Posibles causas
- servicio detenido
- fallo al arrancar
- error de importación
- variable de entorno rota
- puerto no disponible
- fallo de conexión a base de datos

### Acción inicial recomendada
```bash
systemctl restart catastro-api
systemctl status catastro-api --no-pager
```

### Escalar si
- el servicio no levanta
- reaparece como failed
- hay traceback o error repetitivo en logs

---

## Incidente 2. El login dejó de funcionar

### Síntomas
- no permite iniciar sesión
- devuelve error de autenticación general
- todos los usuarios reportan falla al entrar

### Revisión inicial
- revisar `journalctl` de `catastro-api`
- revisar si hubo cambios recientes en `.env`
- confirmar que `SECRET_KEY` no cambió de forma accidental
- validar si el problema afecta a todos o a un usuario específico

### Posibles causas
- error en autenticación
- `SECRET_KEY` alterada
- expiración/configuración incorrecta de token
- falla en acceso a usuarios o roles
- problema general del backend

### Acción inicial recomendada
- revisar logs
- confirmar servicio activo
- validar si el problema empezó después de un cambio
- si hubo despliegue reciente, revisar bitácora y rollback potencial

### Escalar si
- todos los usuarios están afectados
- hay errores persistentes de JWT o autenticación
- no hay claridad sobre cambios recientes

---

## Incidente 3. Falla la ficha predial

### Síntomas
- la consulta de ficha no devuelve datos
- error al abrir `/padron/{clave}/ficha`
- solo algunas claves fallan

### Revisión inicial
- probar con una clave conocida que antes funcionara
- revisar logs recientes
- confirmar si el problema es general o puntual
- validar si hay errores de consulta a base de datos

### Endpoint crítico
```text
GET /padron/{clave}/ficha
```

### Posibles causas
- problema en consulta del padrón
- clave inexistente o mal capturada
- falla en vista o SQL subyacente
- error de datos específico del predio

### Acción inicial recomendada
- comparar una clave que falla con una que sí responde
- revisar si el problema es de datos o de servicio
- documentar clave afectada

### Escalar si
- fallan muchas claves
- falla toda la ficha predial
- aparecen errores de base o de vista crítica

---

## Incidente 4. No aparece el historial del expediente

### Síntomas
- error en historial
- el módulo de expediente no muestra eventos
- una clave específica no trae línea de tiempo

### Endpoint crítico
```text
GET /expediente/{clave}/historial
```

### Revisión inicial
- probar con otra clave conocida
- revisar logs del backend
- confirmar si el problema es general o puntual
- identificar si el expediente sí carga pero el historial no

### Posibles causas
- falla en vista de historial
- problema en auditoría o datos asociados
- inconsistencia específica de una clave
- error del backend en esa ruta

### Acción inicial recomendada
- validar alcance del problema
- registrar claves afectadas
- revisar si hay cambios recientes en vistas o SQL

### Escalar si
- el historial falla para muchos predios
- coincide con cambios recientes en base de datos
- aparece error repetitivo en logs

---

## Incidente 5. No aparecen documentos del expediente

### Síntomas
- el expediente lista vacío
- error al consultar documentos
- se listan documentos pero no abren
- aparece 404 o error de acceso a archivo

### Endpoint crítico
```text
GET /expediente/{clave}/documentos
```

### Rutas relevantes
```text
/var/www/catastro/documentos
```

### Revisión inicial
- verificar si los archivos existen físicamente
- revisar permisos del directorio
- revisar logs del backend
- confirmar si afecta a un expediente o a todos

### Posibles causas
- archivos faltantes
- permisos incorrectos
- rutas rotas
- lógica de resolución de archivos con error
- problemas tras una copia o limpieza de archivos

### Acción inicial recomendada
- revisar existencia del archivo/directorio
- probar un documento de expediente conocido
- confirmar que el problema no sea solo visual en frontend

### Escalar si
- faltan documentos de forma amplia
- hay sospecha de pérdida real de archivos
- se requiere restauración de respaldo

---

## Incidente 6. No aparecen propietarios de un predio

### Síntomas
- la consulta de propietarios devuelve vacío
- error en `/predios/{clave}/propietarios`
- la ficha muestra predio pero no titularidad correcta

### Endpoint crítico
```text
GET /predios/{clave}/propietarios
```

### Revisión inicial
- probar con otra clave conocida
- revisar logs
- identificar si es problema de datos o general
- contrastar con información de padrón si disponible

### Posibles causas
- inconsistencia en relación propietario-predio
- duplicidad o ausencia de relaciones
- error en consulta SQL
- problema de sincronización de titularidad

### Acción inicial recomendada
- registrar la clave afectada
- probar otro predio
- revisar si el problema se limita a ciertos expedientes

### Escalar si
- el problema es masivo
- se detecta inconsistencia sistemática de titularidad
- coincide con cambios recientes de propietarios

---

## Incidente 7. El sistema está lento

### Síntomas
- respuestas tardan demasiado
- usuarios reportan “se queda pensando”
- algunos módulos responden con retraso

### Revisión inicial
```bash
top
free -h
df -h
ss -tulpn
journalctl -u catastro-api -n 100 --no-pager
```

### Posibles causas
- carga alta del servidor
- falta de memoria
- consultas pesadas
- bloqueo o lentitud en base de datos
- crecimiento de documentos o disco lleno
- tráfico anormal externo

### Acción inicial recomendada
- medir si la lentitud es general o en un módulo específico
- revisar recursos del servidor
- revisar si hubo cambios recientes
- revisar si el problema es constante o intermitente

### Escalar si
- la lentitud persiste
- afecta módulos críticos
- el servidor muestra agotamiento de recursos

---

## Incidente 8. El servicio reinicia pero vuelve a fallar

### Síntomas
- `systemctl restart` aparentemente funciona
- a los pocos segundos el servicio cae otra vez
- estado `failed`

### Revisión inicial
```bash
systemctl status catastro-api --no-pager
journalctl -u catastro-api -n 200 --no-pager
```

### Posibles causas
- error de código
- dependencia faltante
- módulo no encontrado
- `.env` incorrecto
- fallo de conexión a base
- error de sintaxis en cambio reciente

### Acción inicial recomendada
- revisar traceback exacto
- identificar el último cambio realizado
- evaluar rollback si el problema empezó tras despliegue

### Escalar si
- no hay claridad del error
- la recuperación requiere restaurar respaldo
- el problema está ligado a cambios grandes

---

## Incidente 9. GeoNode dejó de responder pero la API sigue activa

### Síntomas
- la API del sistema principal funciona
- funciones o pantallas asociadas a GeoNode fallan
- servicios geoespaciales complementarios no responden

### Revisión inicial
```bash
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Posibles causas
- problema independiente de GeoNode
- servicio o worker detenido
- dependencia geoespacial con falla

### Acción inicial recomendada
- reiniciar servicios GeoNode si corresponde
- validar si el problema realmente impacta al flujo del sistema catastral principal
- no confundirlo con falla general de la API

### Escalar si
- ambos servicios fallan al arrancar
- existe dependencia funcional directa no documentada
- se requiere análisis geoespacial específico

---

## Incidente 10. Cambio reciente rompió el sistema

### Síntomas
- antes funcionaba y dejó de funcionar tras:
  - despliegue
  - cambio de `.env`
  - cambio de DB
  - reinicio
  - limpieza de archivos

### Revisión inicial
- revisar `docs/bitacora-cambios.md`
- revisar `docs/checklist-produccion.md`
- revisar respaldos disponibles
- identificar exactamente qué se cambió

### Posibles causas
- cambio incompleto
- dependencia faltante
- SQL incompatible
- configuración alterada
- archivo faltante
- error humano en despliegue

### Acción inicial recomendada
- validar servicio
- revisar logs
- evaluar rollback rápido si el impacto es alto
- documentar el incidente

### Escalar si
- no está claro el cambio exacto
- se requiere restauración compleja
- el sistema completo está afectado

---

## Incidente 11. Hay errores raros en logs como `Invalid HTTP request received`

### Síntomas
- aparecen requests extraños
- rutas como `/auth1.js`
- mensajes de request inválido
- accesos extraños desde IPs externas

### Interpretación inicial
Esto suele ser tráfico automatizado de internet:
- bots
- scanners
- probes
- intentos de descubrimiento de rutas

### Acción inicial recomendada
- no asumir de inmediato que es una falla de la aplicación
- distinguir entre ruido externo y error funcional real
- revisar si coincide con aumento de carga o ataques repetitivos

### Escalar si
- el tráfico afecta rendimiento
- se repite de forma intensa
- se detectan intentos dirigidos o sospecha de abuso

---

## Incidente 12. Se eliminaron archivos o componentes por error

### Síntomas
- faltan directorios
- faltan documentos
- faltan binarios o unit files
- algo dejó de funcionar tras limpieza manual

### Revisión inicial
- identificar exactamente qué se eliminó
- revisar cuarentena o respaldo
- revisar bitácora reciente
- revisar impacto funcional real

### Acción inicial recomendada
- restaurar desde respaldo o cuarentena
- recargar `systemd` si se afectó un servicio
- validar operación después de restaurar

### Escalar si
- no existe respaldo
- se afectaron documentos críticos
- hubo pérdida de datos no recuperables fácilmente

---

## Datos mínimos a recolectar antes de escalar

Siempre que sea posible, reunir:

- fecha y hora del incidente
- módulo afectado
- clave catastral afectada si aplica
- mensaje exacto de error
- captura o evidencia del síntoma
- resultado de `systemctl status`
- últimos logs relevantes
- cambio reciente más cercano en tiempo
- alcance: uno, varios o todos los usuarios

---

## Comandos rápidos de diagnóstico

### Estado del servicio principal
```bash
systemctl status catastro-api --no-pager
```

### Logs recientes
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Procesos
```bash
ps aux | grep uvicorn
```

### Puerto
```bash
ss -tulpn | grep 9000
```

### Estado de GeoNode
```bash
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

### Recursos del servidor
```bash
top
free -h
df -h
```

---

## Qué registrar después del incidente

Después de atender un incidente relevante, conviene registrar:

- qué pasó
- qué se revisó
- qué se corrigió
- si hubo reinicio o rollback
- si quedó pendiente técnico
- si debe actualizarse documentación

### Documentos relacionados
- `docs/bitacora-cambios.md`
- `docs/backlog-tecnico.md`
- `docs/checklist-produccion.md`
- `docs/manual-operacion-diaria.md`

---

## Resumen

La mayoría de los incidentes comunes del sistema pueden clasificarse en:

- caída del servicio
- falla de autenticación
- fallas de consulta predial
- problemas de historial o documentos
- inconsistencias de propietarios
- lentitud
- efectos de cambios recientes
- ruido o tráfico externo

Tener una guía de respuesta inicial permite reducir tiempo de diagnóstico y escalar con mejor información.