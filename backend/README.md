# API Backend - Barberia CRUD

## Base URL

`http://localhost:3000`

## Autenticacion

- Las rutas protegidas requieren encabezado `Authorization: Bearer <token>`.
- Roles usados en el backend:
- `1`: cliente
- `2`: barbero
- `3`: administrador

## Rutas

### 1. Verificar autenticacion

1. Nombre: Verificar autenticacion
2. URL: `http://localhost:3000/auth/verificar`
3. Metodo: `POST`
4. Que hace: Inicia sesion, valida correo y contrasena, controla intentos fallidos y devuelve un JWT.
5. Que recibe:

```json
{
  "correo": "cliente@correo.com",
  "contrasena": "123456"
}
```

6. Que responde:

```json
{
  "message": "Verificacion exitosa",
  "tokenWeb": "jwt",
  "JWT_EXPIRES_IN": "8h",
  "user": {
    "idUsuario": 1,
    "rol": 1,
    "idPerfil": 5
  }
}
```

### 2. Registrar cliente

1. Nombre: Registrar cliente
2. URL: `http://localhost:3000/auth/registrarCliente`
3. Metodo: `POST`
4. Que hace: Crea un usuario con rol cliente y su perfil en la tabla `cliente`.
5. Que recibe:

```json
{
  "nombreCliente": "Jose",
  "telefonoCliente": "3001234567",
  "correoUsuario": "jose@correo.com",
  "contrasena": "123456"
}
```

6. Que responde:

```json
{
  "message": "Cliente registrado correctamente"
}
```

### 3. Obtener usuarios

1. Nombre: Obtener usuarios
2. URL: `http://localhost:3000/usuarios`
3. Metodo: `GET`
4. Que hace: Lista los usuarios del sistema con nombre, rol y correo.
5. Que responde:

```json
[
  {
    "idUsuario": 1,
    "nombreRol": "cliente",
    "nombre": "Jose",
    "correoUsuario": "jose@correo.com"
  }
]
```

### 4. Actualizar contrasena

1. Nombre: Actualizar contrasena
2. URL: `http://localhost:3000/usuarios/contraseña`
3. Metodo: `POST`
4. Que hace: Cambia la contrasena del usuario autenticado.
5. Que recibe:

```json
{
  "contrasenaAntigua": "123456",
  "contrasenaNueva": "654321"
}
```

6. Que responde:

```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

### 5. Actualizar correo

1. Nombre: Actualizar correo
2. URL: `http://localhost:3000/usuarios/correo`
3. Metodo: `PUT`
4. Que hace: Cambia el correo del usuario autenticado luego de validar la contrasena.
5. Que recibe:

```json
{
  "correoNuevo": "nuevo@correo.com",
  "contrasena": "123456"
}
```

6. Que responde:

```json
{
  "mensaje": "Correo actualizado correctamente"
}
```

### 6. Obtener barberos

1. Nombre: Obtener barberos
2. URL: `http://localhost:3000/barberos`
3. Metodo: `GET`
4. Que hace: Lista todos los barberos registrados.
5. Que responde:

```json
[
  {
    "idBarbero": 1,
    "nombreBarbero": "Carlos",
    "telefonoBarbero": "3001112233"
  }
]
```

### 7. Obtener barbero por ID

1. Nombre: Obtener barbero por ID
2. URL: `http://localhost:3000/barberos/:idBarbero`
3. Metodo: `GET`
4. Que hace: Devuelve la informacion de un barbero especifico.
5. Que responde:

```json
{
  "idBarbero": 1,
  "idUsuario": 7,
  "nombreBarbero": "Carlos",
  "telefonoBarbero": "3001112233"
}
```

### 8. Obtener servicios de un barbero

1. Nombre: Obtener servicios de un barbero
2. URL: `http://localhost:3000/barberos/:idBarbero/servicios`
3. Metodo: `GET`
4. Que hace: Lista los servicios asignados a un barbero.
5. Que responde:

```json
[
  {
    "idServicio": 1,
    "nombreServicio": "Corte clasico",
    "duracion": 30,
    "costo": 15000,
    "puntuacion": null
  }
]
```

### 9. Crear barbero

1. Nombre: Crear barbero
2. URL: `http://localhost:3000/barberos`
3. Metodo: `POST`
4. Que hace: Crea un usuario con rol barbero y genera una contrasena temporal.
5. Que recibe:

```json
{
  "nombreBarbero": "Carlos",
  "telefonoBarbero": "3001112233",
  "correoUsuario": "carlos@correo.com"
}
```

6. Que responde:

```json
{
  "message": "Barbero creado correctamente",
  "contrasenaTemporal": "ab12cd34"
}
```

### 10. Actualizar barbero

1. Nombre: Actualizar barbero
2. URL: `http://localhost:3000/barberos/:idBarbero`
3. Metodo: `PUT`
4. Que hace: Actualiza nombre y/o telefono de un barbero.
5. Que recibe:

```json
{
  "nombreBarbero": "Carlos Gomez",
  "telefonoBarbero": "3009998877"
}
```

6. Que responde:

```json
{
  "message": "Barbero actualizado correctamente"
}
```

### 11. Asignar servicios a barbero

1. Nombre: Asignar servicios a barbero
2. URL: `http://localhost:3000/barberos/servicios`
3. Metodo: `POST`
4. Que hace: Relaciona uno o varios servicios con un barbero.
5. Que recibe:

```json
{
  "idBarbero": 1,
  "servicios": [1, 2, 3]
}
```

6. Que responde:

```json
{
  "message": "Servicios asignados correctamente"
}
```

### 12. Eliminar servicios de barbero

1. Nombre: Eliminar servicios de barbero
2. URL: `http://localhost:3000/barberos/servicios`
3. Metodo: `DELETE`
4. Que hace: Elimina una o varias relaciones entre un barbero y sus servicios.
5. Que recibe:

```json
{
  "idBarbero": 1,
  "servicios": [2, 3]
}
```

6. Que responde:

```json
{
  "message": "Servicios eliminados correctamente"
}
```

### 13. Obtener horarios de un barbero

1. Nombre: Obtener horarios de un barbero
2. URL: `http://localhost:3000/barberos/:idBarbero/horarios`
3. Metodo: `GET`
4. Que hace: Consulta los horarios configurados de un barbero.
5. Que responde:

```json
[
  {
    "idBarbero_Horario": 1,
    "idBarbero": 1,
    "diaSemana": 1,
    "fechaEspecifica": null,
    "horaInicio": "08:00:00",
    "horaFin": "18:00:00",
    "activo": 1
  }
]
```

### 14. Crear o actualizar horario de barbero

1. Nombre: Crear o actualizar horario de barbero
2. URL: `http://localhost:3000/barberos/horarios`
3. Metodo: `POST`
4. Que hace: Crea o actualiza un horario semanal o una excepcion para un barbero.
5. Que recibe:

```json
{
  "idBarbero": 1,
  "diaSemana": 1,
  "horaInicio": "08:00:00",
  "horaFin": "18:00:00",
  "activo": 1
}
```

6. Que responde:

```json
{
  "message": "Horario configurado exitosamente"
}
```

### 15. Eliminar horario de barbero

1. Nombre: Eliminar horario de barbero
2. URL: `http://localhost:3000/barberos/horarios/:idHorario`
3. Metodo: `DELETE`
4. Que hace: Elimina un horario especifico de un barbero.
5. Que responde:

```json
{
  "message": "Horario eliminado exitosamente"
}
```

### 16. Obtener servicios

1. Nombre: Obtener servicios
2. URL: `http://localhost:3000/servicios`
3. Metodo: `GET`
4. Que hace: Lista todos los servicios registrados.
5. Que responde:

```json
[
  {
    "idServicio": 1,
    "nombreServicio": "Corte clasico",
    "duracion": 30,
    "costo": 15000
  }
]
```

### 17. Obtener servicio por ID

1. Nombre: Obtener servicio por ID
2. URL: `http://localhost:3000/servicios/:idServicio`
3. Metodo: `GET`
4. Que hace: Consulta un servicio especifico.
5. Que responde:

```json
{
  "idServicio": 1,
  "nombreServicio": "Corte clasico",
  "duracion": 30,
  "costo": 15000
}
```

### 18. Crear servicio

1. Nombre: Crear servicio
2. URL: `http://localhost:3000/servicios`
3. Metodo: `POST`
4. Que hace: Crea un servicio nuevo.
5. Que recibe:

```json
{
  "nombreServicio": "Corte clasico",
  "duracion": 30,
  "costo": 15000
}
```

6. Que responde:

```json
{
  "message": "Servicio creado correctamente",
  "idServicio": 11
}
```

### 19. Actualizar servicio

1. Nombre: Actualizar servicio
2. URL: `http://localhost:3000/servicios/:idServicio`
3. Metodo: `PUT`
4. Que hace: Actualiza el nombre, duracion y/o costo de un servicio.
5. Que recibe:

```json
{
  "nombreServicio": "Corte premium",
  "duracion": 45,
  "costo": 25000
}
```

6. Que responde:

```json
{
  "message": "Servicio actualizado correctamente"
}
```

### 20. Obtener reservas del cliente

1. Nombre: Obtener reservas del cliente
2. URL: `http://localhost:3000/reservas`
3. Metodo: `GET`
4. Que hace: Lista las reservas del cliente autenticado. Acepta el filtro opcional `?estado=pendiente`, `cancelada`, `sin asistir` o `realizadas`.
5. Que responde:

```json
[
  {
    "idReserva": 11,
    "idBarbero": 2,
    "fechaReserva": "2026-03-25T14:00:00.000Z",
    "detalleReserva": null,
    "estadoReserva": 1,
    "nombreBarbero": "Carlos"
  }
]
```

### 21. Obtener reserva por ID

1. Nombre: Obtener reserva por ID
2. URL: `http://localhost:3000/reservas/:idReserva/cliente`
3. Metodo: `GET`
4. Que hace: Devuelve el detalle de una reserva del cliente, junto con sus servicios y metadatos de edicion.
5. Que responde:

```json
{
  "idReserva": 11,
  "idCliente": 5,
  "idBarbero": 2,
  "fechaReserva": "2026-03-25T14:00:00.000Z",
  "detalleReserva": null,
  "estadoReserva": 1,
  "nombreBarbero": "Carlos",
  "servicios": [
    {
      "idServicio": 1,
      "nombreServicio": "Corte clasico",
      "duracion": 30,
      "costo": 15000
    }
  ],
  "permisos": {
    "editarFecha": true,
    "editarHora": true,
    "editarDetalles": true,
    "editarServicios": false,
    "editarBarbero": false
  },
  "mensajes": {
    "edicion": "Solo puedes cambiar la fecha/hora y los detalles de la reserva",
    "servicios": "Para cambiar servicios o barbero, debes cancelar esta reserva y crear una nueva"
  }
}
```

### 22. Crear reserva

1. Nombre: Crear reserva
2. URL: `http://localhost:3000/reservas`
3. Metodo: `POST`
4. Que hace: Crea una reserva validando barbero, servicios, fecha, horario disponible y reservas existentes.
5. Que recibe:

```json
{
  "idBarbero": 2,
  "fechaHora": "2026-03-25 14:00:00",
  "servicios": [1, 2]
}
```

6. Que responde:

```json
{
  "ok": true,
  "idReserva": 11
}
```

### 23. Actualizar reserva

1. Nombre: Actualizar reserva
2. URL: `http://localhost:3000/reservas/:idReserva`
3. Metodo: `PUT`
4. Que hace: Actualiza la fecha y/o el detalle de una reserva, siempre que falten mas de 24 horas.
5. Que recibe:

```json
{
  "fecha": "2026-03-26 16:00:00",
  "detalle": "Sin locion"
}
```

6. Que responde:

```json
{
  "message": "Reserva actualizada exitosamente"
}
```

### 24. Cancelar reserva

1. Nombre: Cancelar reserva
2. URL: `http://localhost:3000/reservas/:idReserva/cancelar`
3. Metodo: `PUT`
4. Que hace: Cancela una reserva si aun esta pendiente y faltan mas de 24 horas.
5. Que recibe:

```json
{
  "motivo": "No podre asistir"
}
```

6. Que responde:

```json
{
  "message": "Reserva cancelada exitosamente"
}
```

### 25. Obtener agenda del barbero

1. Nombre: Obtener agenda del barbero
2. URL: `http://localhost:3000/reservas/agenda`
3. Metodo: `GET`
4. Que hace: Lista la agenda del barbero autenticado con cliente, servicios, duracion total y costo total.
5. Que responde:

```json
[
  {
    "idReserva": 11,
    "nombreCliente": "Jose",
    "fechaReserva": "2026-03-25T14:00:00.000Z",
    "detalleReserva": null,
    "servicios": "Corte clasico, Barba",
    "duracionTotal": 60,
    "costoTotal": 30000
  }
]
```

### 26. Obtener horarios disponibles

1. Nombre: Obtener horarios disponibles
2. URL: `http://localhost:3000/disponibilidad?idBarbero=2&fecha=2026-03-25&servicios=1,2`
3. Metodo: `GET`
4. Que hace: Calcula los horarios disponibles para reservar segun el barbero, la fecha, los servicios y las reservas ya existentes.
5. Que responde:

```json
{
  "duracionTotal": 60,
  "horariosDisponibles": ["08:00", "09:00", "10:30"],
  "horarioTrabajo": {
    "inicio": "08:00:00",
    "fin": "18:00:00",
    "dia": 3,
    "esExcepcion": false
  }
}
```

### 27. Obtener perfil del cliente

1. Nombre: Obtener perfil del cliente
2. URL: `http://localhost:3000/clientes`
3. Metodo: `GET`
4. Que hace: Devuelve el perfil del cliente autenticado.
5. Que responde:

```json
{
  "nombreCliente": "Jose",
  "telefonoCliente": "3001234567",
  "correoUsuario": "jose@correo.com"
}
```

### 28. Actualizar perfil del cliente

1. Nombre: Actualizar perfil del cliente
2. URL: `http://localhost:3000/clientes`
3. Metodo: `PUT`
4. Que hace: Actualiza el nombre y/o telefono del cliente autenticado.
5. Que recibe:

```json
{
  "nombreCliente": "Jose Gomez",
  "telefonoCliente": "3009998877"
}
```

6. Que responde:

```json
{
  "message": "Perfil actualizado correctamente"
}
```
