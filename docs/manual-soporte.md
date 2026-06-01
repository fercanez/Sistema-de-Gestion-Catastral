# Manual de soporte

## Propósito

Este documento describe una guía práctica de soporte para el Sistema de Gestión Catastral BC, enfocada en atención inicial, clasificación de incidencias, validación básica y escalación ordenada.

Su objetivo es ayudar a personal de soporte a:

- recibir reportes con mejor información
- distinguir entre problema funcional, técnico o de datos
- aplicar revisiones iniciales seguras
- canalizar correctamente cada incidente
- dejar trazabilidad de atención

No sustituye procedimientos institucionales formales de mesa de ayuda, pero sí ofrece una base operativa útil.

---

## Perfil al que va dirigido

Este manual está pensado para:

- soporte de primer nivel
- soporte técnico básico
- personal operativo con responsabilidad de atención inicial
- supervisión funcional con tareas de seguimiento

---

## Alcance del soporte de primer nivel

El soporte de primer nivel normalmente debe poder:

- recibir y documentar el reporte
- validar si el sistema está disponible
- distinguir si la falla es general o puntual
- confirmar si afecta a un usuario, un módulo o a todos
- aplicar revisiones básicas no destructivas
- escalar con evidencia suficiente

### No debería hacer sin autorización o conocimiento suficiente
- modificar base de datos
- cambiar `.env`
- desplegar código
- borrar archivos
- alterar servicios sin validación mínima
- modificar permisos o roles sin proceso autorizado

---

## 1. Recepción del reporte

Cuando un usuario diga que “algo no funciona”, el soporte debe obtener información mínima.

### Preguntas recomendadas
- ¿Qué módulo o pantalla está fallando?
- ¿Qué estaba intentando hacer?
- ¿Desde cuándo ocurre?
- ¿Le pasa solo a usted o también a otros usuarios?
- ¿Afecta una sola clave catastral o varias?
- ¿Aparece algún mensaje exacto de error?
- ¿Hubo algún cambio reciente conocido?
- ¿Puede compartir captura de pantalla o evidencia?

### Datos importantes a registrar
- fecha y hora
- usuario o área que reporta
- módulo afectado
- clave catastral si aplica
- mensaje o síntoma exacto
- impacto estimado

---

## 2. Clasificación inicial del incidente

Una vez recibido el reporte, intentar clasificarlo en una de estas categorías:

### A. Acceso/autenticación
Ejemplos:
- no entra al sistema
- login falla
- token expirado o acceso denegado

### B. Consulta predial
Ejemplos:
- no carga ficha
- no encuentra predio
- no muestra información esperada

### C. Expediente/documentos
Ejemplos:
- no carga historial
- no aparecen documentos
- un archivo no abre

### D. Propietarios
Ejemplos:
- no aparecen propietarios
- aparece propietario incorrecto
- no actualiza datos de persona

### E. Movimientos
Ejemplos:
- no deja capturar
- no deja aplicar
- no cambia estatus

### F. Catálogos/administración
Ejemplos:
- problemas con usuarios
- roles
- calles
- colonias
- catálogos auxiliares

### G. Disponibilidad/infraestructura
Ejemplos:
- sistema caído
- lentitud general
- error generalizado

### H. Datos puntuales
Ejemplos:
- solo falla una clave
- solo falta un expediente
- un predio tiene datos incorrectos

---

## 3. Validación mínima del sistema

Si el soporte tiene acceso operativo al servidor o a monitoreo básico, puede revisar lo siguiente.

### Estado del servicio principal
```bash
systemctl status catastro-api --no-pager
```

### Logs recientes
```bash
journalctl -u catastro-api -n 100 --no-pager
```

### Proceso activo
```bash
ps aux | grep uvicorn
```

### Puerto esperado
```bash
ss -tulpn | grep 9000
```

### Servicios complementarios
```bash
systemctl status geonode --no-pager
systemctl status geonode-celery --no-pager
```

---

## 4. Validaciones funcionales rápidas

Para confirmar si el problema es general o específico, usar una clave conocida y probar rutas críticas.

### Endpoints críticos observados
```text
GET /padron/{clave}/ficha
GET /expediente/{clave}/historial
GET /expediente/{clave}/documentos
GET /predios/{clave}/propietarios
```

### Objetivo
Determinar si:
- todo está fallando
- solo falla un módulo
- solo falla una clave o expediente
- el problema parece ser de datos y no de infraestructura

---

## 5. Manejo por tipo de incidencia

## Caso 1. “No entra al sistema”
### Revisar
- si el servicio está arriba
- si otros usuarios también fallan
- si hubo cambio reciente
- si es problema general de login o solo de una cuenta

### Acción inicial
- validar servicio
- revisar logs
- pedir mensaje exacto
- verificar si afecta a todos o solo a uno

### Escalar a
- administración/autenticación si es cuenta específica
- técnico si es falla general del backend

---

## Caso 2. “No carga la ficha”
### Revisar
- si falla una clave o varias
- si otros módulos sí funcionan
- si el endpoint de ficha responde para otra clave

### Acción inicial
- probar una clave conocida
- registrar la clave afectada
- revisar si el problema es de datos o general

### Escalar a
- soporte técnico/datos si el problema es puntual
- técnico general si falla para muchos casos

---

## Caso 3. “No aparecen documentos”
### Revisar
- si se listan pero no abren
- si no se listan en absoluto
- si afecta a un expediente o a varios
- si hubo cambios recientes en archivos o servidor

### Acción inicial
- probar expediente conocido
- registrar expediente afectado
- revisar si el problema es visual o real

### Escalar a
- técnico/documental si hay problema de archivos
- backend si hay falla de ruta o lógica

---

## Caso 4. “No aparecen propietarios”
### Revisar
- si el problema es solo de una clave
- si la ficha sí carga
- si otros predios sí muestran propietarios

### Acción inicial
- probar otra clave
- registrar la clave afectada
- revisar si parece inconsistencia de datos

### Escalar a
- equipo funcional/datos si es caso puntual
- backend si es masivo

---

## Caso 5. “Está lento”
### Revisar
- si la lentitud es general
- si afecta solo cierto módulo
- si comenzó después de un cambio
- si el servidor muestra alta carga

### Acción inicial
- validar recursos básicos
- revisar logs
- registrar hora y acciones del usuario

### Escalar a
- técnico/infraestructura si hay saturación o degradación general

---

## 6. Recolección mínima de evidencia

Antes de escalar, reunir si es posible:

- nombre del usuario o área
- fecha y hora
- módulo afectado
- clave catastral o expediente
- mensaje exacto
- captura de pantalla
- resultado de pruebas básicas
- si el problema es general o puntual
- cambio reciente asociado, si existe

Esto reduce retrabajo y acelera diagnóstico.

---

## 7. Cuándo escalar inmediatamente

Escalar sin intentar más allá de validaciones básicas si ocurre cualquiera de estas situaciones:

- el servicio principal está caído
- el servicio no arranca después de reinicio
- fallan múltiples módulos críticos
- hay errores repetidos de base de datos
- hay sospecha de pérdida de documentos
- hay problema general de autenticación
- existe riesgo de integridad de datos
- hubo un cambio reciente grande y el sistema quedó inestable
- hay sospecha de incidente de seguridad

---

## 8. Qué no hacer durante soporte inicial

- no ejecutar cambios SQL improvisados
- no modificar `.env`
- no cambiar roles sin autorización
- no borrar archivos
- no hacer limpieza del servidor
- no dar por hecho que “es la base” sin evidencia
- no reiniciar repetidamente servicios sin revisar logs

---

## 9. Registro del incidente

Toda incidencia relevante debería dejar huella mínima.

### Registrar en
```text
docs/bitacora-cambios.md
```

### Si genera trabajo futuro
Agregar o vincular a:
```text
docs/backlog-tecnico.md
```

### Datos mínimos de registro
- fecha/hora
- descripción
- impacto
- acciones realizadas
- resultado
- escalación sí/no

---

## 10. Cierre del incidente

Antes de cerrar una atención, confirmar:

- que el usuario ya puede operar
- que el problema fue resuelto o acotado
- que quedó documentado lo realizado
- que si hubo workaround, también quedó registrado
- que si persiste trabajo técnico, quedó en backlog o escalado

---

## 11. Flujo resumido de soporte

### Paso 1
Recibir reporte y pedir datos concretos.

### Paso 2
Clasificar:
- acceso
- ficha
- expediente
- propietarios
- movimientos
- infraestructura
- datos puntuales

### Paso 3
Aplicar revisión mínima:
- servicio
- logs
- endpoint crítico
- alcance del problema

### Paso 4
Decidir:
- se resolvió
- requiere seguimiento
- requiere escalación

### Paso 5
Registrar en bitácora si fue relevante.

---

## 12. Checklist rápido de soporte

### Al recibir el reporte
- [ ] obtener módulo afectado
- [ ] obtener clave catastral si aplica
- [ ] obtener mensaje exacto
- [ ] confirmar alcance del problema

### Validación inicial
- [ ] revisar si `catastro-api` está activo
- [ ] revisar logs recientes
- [ ] probar si el problema es general o puntual
- [ ] validar una clave conocida si aplica

### Antes de escalar
- [ ] juntar evidencia mínima
- [ ] documentar qué se revisó
- [ ] identificar si hubo cambio reciente
- [ ] clasificar el incidente

---

## 13. Documentos de apoyo

Consultar según necesidad:

- `docs/manual-operacion-diaria.md`
- `docs/manual-admin.md`
- `docs/incidentes-comunes.md`
- `docs/checklist-produccion.md`
- `docs/bitacora-cambios.md`
- `docs/backlog-tecnico.md`
- `docs/operacion-servidor.md`

---

## Resumen

El soporte efectivo depende de tres cosas:

1. recopilar bien el reporte
2. distinguir rápido si la falla es general o puntual
3. escalar con evidencia clara y útil

Este manual proporciona una base simple y ordenada para hacer soporte inicial sin improvisación y con menor riesgo.