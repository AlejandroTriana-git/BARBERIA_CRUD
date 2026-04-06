# API Backend - Barberia CRUD

Documentacion actualizada segun la implementacion real del backend (`src/routes` + `src/controllers`).

## Base URL

`http://localhost:3000`

## CORS

El backend permite origen unicamente desde:

`http://localhost:3002`

## Autenticacion y roles

- Las rutas protegidas requieren `Authorization: Bearer <token>`.
- JWT expira en `8h`.
- Roles:
- `1`: cliente
- `2`: barbero
- `3`: administrador

## Validaciones estrictas activas

Estas validaciones estan implementadas en `src/utils/validaciones.js` y usadas por varios controladores:

- Email:
- Formato valido
- Maximo 100 caracteres
- Telefono:
- Exactamente 10 digitos (se ignoran caracteres no numericos antes de validar)
- Nombre:
- Obligatorio
- Longitud entre 2 y 100 caracteres
- Contrasena fuerte:
- Minimo 8 caracteres
- Al menos 1 mayuscula
- Al menos 1 minuscula
- Al menos 1 numero
- Al menos 1 caracter especial
- Fecha (`YYYY-MM-DD`) valida para disponibilidad
- Regla de 24 horas para actualizar/cancelar reservas

## Reglas generales de respuesta de error

Segun endpoint, los errores pueden venir como `error`, `message` o `mensaje`.

---

## Endpoints

## 1) Auth

### POST `/auth/verificar` (publico)

Inicia sesion, aplica control de intentos fallidos y bloqueo temporal.

Body:

```json
{
  "correo": "cliente@correo.com",
  "contraseña": "Abc12345!"
}
```

Respuesta exitosa (200):

```json
{
  "message": "Verificación exitosa",
  "tokenWeb": "jwt",
  "JWT_EXPIRES_IN": "8h",
  "user": {
    "idUsuario": 1,
    "rol": 1,
    "idPerfil": 5,
    "email": "cliente@correo.com"
  }
}
```

### POST `/auth/registrarCliente` (publico)

Registra usuario rol cliente + perfil de cliente.

Body:

```json
{
  "nombreCliente": "Jose",
  "telefonoCliente": "3001234567",
  "correoUsuario": "jose@correo.com",
  "contraseña": "Abc12345!"
}
```

Respuesta (201):

```json
{
  "message": "Cliente registrado correctamente"
}
```

## 2) Usuarios

### GET `/usuarios` (rol 3)

Lista usuarios.

### POST `/usuarios/contrasena` (roles 1, 2, 3)

Actualiza contrasena del usuario autenticado.

Body:

```json
{
  "contraseñaAntigua": "Actual123!",
  "contraseñaNueva": "Nueva123!"
}
```

### PUT `/usuarios/correo` (roles 1, 2, 3)

Actualiza correo del usuario autenticado, validando contrasena actual.

Body:

```json
{
  "correoNuevo": "nuevo@correo.com",
  "contraseña": "Actual123!"
}
```

## 3) Barberos

### GET `/barberos` (roles 1, 3)

Lista barberos.

### GET `/barberos/:idBarbero` (roles 1, 3)

Obtiene barbero por id.

### GET `/barberos/:idBarbero/servicios` (roles 1, 3)

Servicios asignados al barbero.

### POST `/barberos` (rol 3)

Crea barbero (usuario rol 2) y retorna `contraseñaTemporal`.

Body:

```json
{
  "nombreBarbero": "Carlos",
  "telefonoBarbero": "3001112233",
  "correoUsuario": "carlos@correo.com"
}
```

### PUT `/barberos/:idBarbero` (rol 3)

Actualiza barbero.

Nota importante del comportamiento actual: aunque el mensaje dice "al menos un campo", la validacion actual exige que `nombreBarbero` y `telefonoBarbero` sean validos cuando se invoca el endpoint.

Body recomendado:

```json
{
  "nombreBarbero": "Carlos Gomez",
  "telefonoBarbero": "3009998877"
}
```

### POST `/barberos/servicios` (rol 3)

Asigna servicios al barbero.

```json
{
  "idBarbero": 1,
  "servicios": [1, 2, 3]
}
```

### DELETE `/barberos/servicios` (rol 3)

Elimina relaciones servicio-barbero.

```json
{
  "idBarbero": 1,
  "servicios": [2, 3]
}
```

### GET `/barberos/:idBarbero/horarios` (rol 3)

Obtiene horarios configurados del barbero.

### POST `/barberos/horarios` (rol 3)

Crea o actualiza horario semanal o excepcion de fecha.

Reglas:

- Debe enviar `idBarbero`.
- Debe enviar solo uno entre `diaSemana` o `fechaEspecifica`.
- Si `activo = 1`, `horaInicio` y `horaFin` son obligatorios y `horaInicio < horaFin`.
- Si `activo = 0`, `horaInicio` y `horaFin` deben ir en `null`.

Ejemplo:

```json
{
  "idBarbero": 1,
  "diaSemana": 1,
  "horaInicio": "08:00:00",
  "horaFin": "18:00:00",
  "activo": 1
}
```

### DELETE `/barberos/horarios/:idHorario` (rol 3)

Elimina horario por `idBarbero_Horario`.

## 4) Servicios

Todos los endpoints de servicios son solo rol administrador (`3`).

### GET `/servicios`

### GET `/servicios/:idServicio`

### POST `/servicios`

Crea servicio.

```json
{
  "nombreServicio": "Corte clasico",
  "duracion": 30,
  "costo": 15000
}
```

Regla: `duracion` y `costo` no pueden ser negativos.

### PUT `/servicios/:idServicio`

Actualiza servicio por `COALESCE`.

Regla: si se envian `duracion` o `costo`, no pueden ser negativos.

## 5) Reservas

Estados usados:

- `0`: cancelada
- `1`: pendiente
- `2`: no asistio
- `3`: realizada

### GET `/reservas` (rol 1)

Reservas del cliente autenticado (`idPerfil`) con filtro opcional `?estado=pendiente|cancelada|sin asistir|realizadas`.

### GET `/reservas/:idReserva/cliente` (roles 1, 2)

Obtiene reserva por id + servicios + metadata para frontend.

### POST `/reservas` (rol 1)

Crea reserva validando disponibilidad, horario, servicios del barbero, traslapes y fecha no pasada.

Body:

```json
{
  "idBarbero": 2,
  "fechaHora": "2026-03-25 14:00:00",
  "servicios": [1, 2]
}
```

`fechaHora` debe enviarse en formato `YYYY-MM-DD HH:mm:ss`.

### PUT `/reservas/:idReserva` (rol 1)

Actualiza `fechaReserva` y/o `detalleReserva`.

Body:

```json
{
  "fecha": "2026-03-26 16:00:00",
  "detalle": "Sin locion"
}
```

Regla activa: solo permite cambios si faltan mas de 24 horas para la reserva.

### PUT `/reservas/:idReserva/cancelar` (rol 1)

Cancela reserva (estado `0`) y guarda motivo en `cancelacionreserva`.

Body:

```json
{
  "motivo": "No podre asistir"
}
```

Reglas activas:

- Debe estar en estado pendiente (`1`).
- Deben faltar mas de 24 horas.

### GET `/reservas/agenda` (rol 2)

Agenda del barbero autenticado con cliente, servicios, duracion y costo total.

### PUT `/reservas/:idReserva/estado` (rol 2)

Barbero cambia estado de la reserva.

Body:

```json
{
  "estado": 2
}
```

Valores permitidos:

- `2` (no asistio)
- `3` (realizada)

## 6) Disponibilidad

### GET `/disponibilidad` (rol 1)

Consulta horarios posibles para reservar.

Query params obligatorios:

- `idBarbero`
- `fecha` (formato `YYYY-MM-DD`)
- `servicios` (csv: por ejemplo `1,2`)

Ejemplo:

`/disponibilidad?idBarbero=2&fecha=2026-03-25&servicios=1,2`

Respuesta:

```json
{
  "duracionTotal": 60,
  "horariosDisponibles": ["08:00", "08:30", "09:00"],
  "horarioTrabajo": {
    "inicio": "08:00:00",
    "fin": "18:00:00",
    "dia": 3,
    "esExcepcion": false
  }
}
```

## 7) Clientes

### GET `/clientes` (rol 1)

Obtiene perfil del cliente autenticado.

### PUT `/clientes` (rol 1)

Actualiza perfil cliente.

Nota importante del comportamiento actual: aunque el endpoint indica que puede actualizar uno u otro campo, la validacion actual exige que `nombreCliente` y `telefonoCliente` sean validos cuando se invoca.

Body recomendado:

```json
{
  "nombreCliente": "Jose Gomez",
  "telefonoCliente": "3009998877"
}
```

---

## Variables de entorno esperadas

Backend usa:

- `PORT` (opcional, por defecto `3000`)
- `JWT_SECRET`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

