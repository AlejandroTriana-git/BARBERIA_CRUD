# Documentacion Frontend - Barberia CRUD

Esta documentacion esta alineada al comportamiento actual del frontend.

## Roles y vistas

Hay tres roles en la app y cada uno ve rutas diferentes:

- Cliente (`rol = 1`): `/` y `/reservas`
- Barbero (`rol = 2`): `/barbero`
- Administrador (`rol = 3`): `/admin`

Rutas publicas:

- `/login`
- `/register`

---

## Pantalla: Iniciar sesion

Nombre de la pantalla: Iniciar sesion  
Ruta: `/login`  
Objetivo: autenticar usuario y redirigir segun su rol.

API que consume:

- `POST /auth/verificar`

Campos del formulario:

- correo
- contrasena

Que valida:

- que correo y contrasena esten diligenciados
- formato valido de correo

Que debe pasar si todo sale bien:

- guardar token y usuario en `localStorage`
- redirigir al inicio (`/`) y luego `PrivateRoute` ubica por rol si aplica

Que debe pasar si hay error:

- mostrar mensaje claro del backend (credenciales invalidas o cuenta bloqueada)

---

## Pantalla: Registro cliente

Nombre de la pantalla: Registro cliente  
Ruta: `/register`  
Objetivo: crear cuenta de cliente.

API que consume:

- `POST /auth/registrarCliente`

Campos del formulario:

- nombre
- telefono
- email
- contrasena
- confirmarContrasena

Que valida:

- nombre entre 2 y 100 y sin numeros
- telefono de 10 digitos
- email valido
- contrasena fuerte (8+, mayuscula, minuscula, numero y caracter especial)
- confirmacion de contrasena

Que debe pasar si todo sale bien:

- mostrar mensaje de exito
- redirigir a `/login`

Que debe pasar si hay error:

- mostrar mensaje claro del backend o validacion local

---

## Pantalla: Perfil cliente + reservas

Nombre de la pantalla: Inicio cliente  
Ruta: `/`  
Objetivo: mostrar perfil del cliente y su listado de reservas.

API que consume:

- `GET /clientes` (perfil)
- `GET /reservas` (listado)
- `GET /reservas?estado=...` (filtro)
- `GET /reservas/:idReserva/cliente` (detalle)
- `PUT /reservas/:idReserva/cancelar` (cancelar)

Campos / acciones:

- filtro por estado (`pendiente`, `realizadas`, `sin asistir`, `cancelada`)
- accion ver detalle
- accion editar (redirige a `/reservas`)
- accion cancelar (pide motivo)

Que valida:

- para cancelar, exige motivo no vacio
- solo permite editar/cancelar cuando estado es `pendiente`

Que debe pasar si todo sale bien:

- mostrar tabla de reservas del cliente
- en cancelacion exitosa, recargar listado

Que debe pasar si hay error:

- mostrar mensaje claro en pantalla o alerta

---

## Pantalla: Agendar cita

Nombre de la pantalla: Agendar cita  
Ruta: `/reservas`  
Objetivo: crear una reserva nueva y editar reservas pendientes.

API que consume:

- `GET /barberos`
- `GET /barberos/:idBarbero/servicios`
- `GET /disponibilidad?idBarbero=...&fecha=...&servicios=...`
- `POST /reservas`
- `PUT /reservas/:idReserva`
- `GET /reservas/:idReserva/cliente`
- `GET /reservas` (listado inferior)

Campos del formulario:

- barbero
- servicios (uno o varios)
- fecha
- hora
- detalle (opcional)

Que valida:

- que barbero, fecha, hora y al menos un servicio esten diligenciados
- confirmacion final antes de enviar
- fecha minima (hoy) en selector
- validaciones estrictas finales en backend:
- fecha no pasada
- formato `fechaHora` valido
- disponibilidad real y no traslapes
- servicios ofrecidos por el barbero

Que debe pasar si todo sale bien:

- mostrar mensaje de exito
- limpiar formulario
- actualizar listado en la misma vista
- estado inicial de la cita: `pendiente (1)`

Que debe pasar si hay error:

- mostrar mensaje claro al usuario (alerta o mensaje en formulario)

---

## Pantalla: Portal barbero

Nombre de la pantalla: Portal barbero  
Ruta: `/barbero`  
Objetivo: gestionar perfil propio y agenda del barbero.

Subsecciones:

- Mi Perfil
- Mi Agenda

### Seccion Mi Perfil (barbero)

API que consume:

- `POST /usuarios/contrasena`
- `PUT /usuarios/correo`

Campos:

- cambiar contrasena: contrasenaActual, contrasenaNueva, confirmarContrasena
- cambiar email: correoNuevo, contrasena

Que valida:

- coincidencia de contrasena nueva y confirmacion
- contrasena nueva con minimo 8 caracteres (frontend)
- formato email valido

Que debe pasar si todo sale bien:

- mostrar confirmacion de cambio

Que debe pasar si hay error:

- mostrar mensaje claro al usuario

### Seccion Mi Agenda (barbero)

API que consume:

- `GET /reservas/agenda`
- `PUT /reservas/:idReserva/estado`

Acciones:

- ver detalle de reserva
- cambiar estado a `realizado (3)` o `no asistio (2)` cuando esta pendiente

Que valida:

- el cambio de estado solo se ofrece si la reserva esta pendiente
- backend valida que la reserva pertenezca al barbero autenticado

Que debe pasar si todo sale bien:

- mostrar confirmacion
- refrescar agenda

Que debe pasar si hay error:

- mostrar mensaje claro

---

## Pantalla: Panel administrador

Nombre de la pantalla: Panel administrador  
Ruta: `/admin`  
Objetivo: administrar barberos, servicios y clientes; y gestionar perfil propio.

Subsecciones:

- Mi Perfil
- Barberos
- Servicios
- Clientes

### Seccion Mi Perfil (admin)

API que consume:

- `POST /usuarios/contrasena`
- `PUT /usuarios/correo`

Campos:

- cambio de contrasena
- cambio de email

Que valida:

- datos obligatorios y formato email

Que debe pasar si todo sale bien:

- mostrar confirmacion

Que debe pasar si hay error:

- mostrar mensaje claro

### Seccion Barberos (admin)

API que consume:

- `GET /barberos`
- `POST /barberos`
- `PUT /barberos/:idBarbero`
- `GET /barberos/:idBarbero/servicios`
- `POST /barberos/servicios`
- `DELETE /barberos/servicios`
- `GET /barberos/:idBarbero/horarios`
- `POST /barberos/horarios`
- `DELETE /barberos/horarios/:idHorario`

Campos principales:

- crear/editar barbero: nombre, telefono, email (solo creacion)
- asignar servicio
- crear horario: tipo (dia o fecha), dia/fecha, activo, horaInicio, horaFin

Que valida:

- nombre y telefono obligatorios para barbero
- email obligatorio al crear barbero
- en horario activo exige horas
- en horario por dia exige dia
- en horario por fecha exige fecha

Que debe pasar si todo sale bien:

- mostrar exito
- recargar tablas/listas de barberos, servicios o horarios

Que debe pasar si hay error:

- mostrar mensaje claro (modal/alerta)

### Seccion Servicios (admin)

API que consume:

- `GET /servicios`
- `POST /servicios`
- `PUT /servicios/:idServicio`

Campos:

- nombreServicio
- duracion
- costo

Que valida:

- campos obligatorios
- backend valida que no haya valores negativos

Que debe pasar si todo sale bien:

- mostrar exito
- refrescar listado de servicios

Que debe pasar si hay error:

- mostrar mensaje claro

### Seccion Clientes (admin)

API que consume:

- `GET /usuarios` (filtra en frontend solo `nombreRol === "cliente"`)

Objetivo:

- visualizar listado de clientes registrados

Que valida:

- no aplica validacion de formulario (es vista de consulta)

Que debe pasar si todo sale bien:

- mostrar tabla de clientes

Que debe pasar si hay error:

- mostrar mensaje de carga/error

---

## Componente compartido: PerfilUsuario

Este componente se reutiliza en cliente, barbero y administrador:

- Cliente:
- consulta y edita datos de perfil (`GET/PUT /clientes`)
- cambia contrasena y correo (`/usuarios/contrasena`, `/usuarios/correo`)
- Barbero y Administrador:
- no consulta `/clientes`, pero si permite cambiar contrasena y correo

---

## Manejo global de errores y sesion

- Todas las peticiones privadas usan `apiClient` con token JWT.
- Si la API responde `401`, el frontend limpia sesion y redirige a `/login`.
- Mensajes de error priorizan `mensaje`, luego `error`, luego `message`.

---



