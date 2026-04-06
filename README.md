# BARBERIA CRUD - Guia Rapida de Instalacion y Pruebas

Este README raiz esta pensado para que cualquier persona pueda levantar el proyecto y probarlo completo (frontend + backend + base de datos).

## 1) Estructura del proyecto

- `backend/`: API Node.js + Express + MySQL
- `frontend/`: app React
- `Base_Datos_Usada.sql`: script de base de datos

Documentacion especifica:

- `backend/README.md` (endpoints, roles y validaciones backend)
- `frontend/README.md` (pantallas y flujos por rol)

---

## 2) Requisitos previos

- Node.js 18+ (recomendado)
- npm
- MySQL 8+ (o compatible)

---

## 3) Clonar e instalar dependencias

Debes instalar dependencias porque `node_modules` no se versiona (esta ignorado por `.gitignore`).

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## 4) Base de datos

### 4.1 Importar estructura

Importa el archivo `Base_Datos_Usada.sql` en tu MySQL (Workbench o consola).

El script crea la base `mydb` y todas las tablas necesarias.

### 4.2 Seed de datos de prueba (copiar/pegar y ejecutar)

Despues de importar, ejecuta estas queries para tener usuarios, servicios, horarios y relaciones listos para probar de inmediato:

```sql
USE mydb;

-- Roles base
INSERT INTO rol (idRol, nombreRol)
VALUES
  (1, 'cliente'),
  (2, 'barbero'),
  (3, 'administrador')
ON DUPLICATE KEY UPDATE nombreRol = VALUES(nombreRol);

-- Usuarios de prueba (passwords ya hasheados con bcrypt)
-- Admin:   admin@barberia.com   / Admin123!
-- Barbero: barbero@barberia.com / Barbero123!
-- Cliente: cliente@barberia.com / Cliente123!
INSERT INTO usuario (idUsuario, idRol, correoUsuario, contraseñaUsuario)
VALUES
  (1001, 3, 'admin@barberia.com', '$2b$10$LgvtaP8eOd6nrA3sXO/Y1OC5GDfNQJeoU0nHMb4fU3Tw4Yo.QRIbm'),
  (1002, 2, 'barbero@barberia.com', '$2b$10$CK4orkQSLMPz9le/UwURaO8xi1KEphnNwRII4XOuggDc87aaIZ8la'),
  (1003, 1, 'cliente@barberia.com', '$2b$10$JBf20KEEkXTeAbNXHnSX1emnkSIVS/UYMP8WyfkgWc3Y67k0qcoNq')
ON DUPLICATE KEY UPDATE
  idRol = VALUES(idRol),
  correoUsuario = VALUES(correoUsuario),
  contraseñaUsuario = VALUES(contraseñaUsuario);

-- Perfiles
INSERT INTO barbero (idBarbero, idUsuario, nombreBarbero, telefonoBarbero, activoBarbero)
VALUES (2001, 1002, 'Barbero Demo', '3001112233', 1)
ON DUPLICATE KEY UPDATE
  nombreBarbero = VALUES(nombreBarbero),
  telefonoBarbero = VALUES(telefonoBarbero),
  activoBarbero = VALUES(activoBarbero);

INSERT INTO cliente (idCliente, idUsuario, nombreCliente, telefonoCliente, activoCliente)
VALUES (3001, 1003, 'Cliente Demo', '3001234567', 1)
ON DUPLICATE KEY UPDATE
  nombreCliente = VALUES(nombreCliente),
  telefonoCliente = VALUES(telefonoCliente),
  activoCliente = VALUES(activoCliente);

-- Servicios
INSERT INTO servicio (idServicio, nombreServicio, duracion, costo)
VALUES
  (4001, 'Corte clasico', 30, 15000),
  (4002, 'Barba', 30, 12000),
  (4003, 'Corte premium', 45, 25000)
ON DUPLICATE KEY UPDATE
  nombreServicio = VALUES(nombreServicio),
  duracion = VALUES(duracion),
  costo = VALUES(costo);

-- Servicios del barbero
INSERT INTO barbero_servicio (idBarbero, idServicio)
VALUES
  (2001, 4001),
  (2001, 4002),
  (2001, 4003)
ON DUPLICATE KEY UPDATE idServicio = VALUES(idServicio);

-- Horario semanal (lunes a viernes 08:00 - 18:00)
INSERT INTO barbero_horario (idBarbero, diaSemana, fechaEspecifica, horaInicio, horaFin, activo)
VALUES
  (2001, 1, NULL, '08:00:00', '18:00:00', 1),
  (2001, 2, NULL, '08:00:00', '18:00:00', 1),
  (2001, 3, NULL, '08:00:00', '18:00:00', 1),
  (2001, 4, NULL, '08:00:00', '18:00:00', 1),
  (2001, 5, NULL, '08:00:00', '18:00:00', 1)
ON DUPLICATE KEY UPDATE
  horaInicio = VALUES(horaInicio),
  horaFin = VALUES(horaFin),
  activo = VALUES(activo);
```

### 4.3 Queries utiles de verificacion

```sql
USE mydb;

SELECT idUsuario, idRol, correoUsuario FROM usuario ORDER BY idUsuario;
SELECT * FROM barbero ORDER BY idBarbero;
SELECT * FROM cliente ORDER BY idCliente;
SELECT idServicio, nombreServicio, duracion, costo FROM servicio ORDER BY idServicio;
SELECT * FROM barbero_servicio ORDER BY idBarbero, idServicio;
SELECT idBarbero, diaSemana, fechaEspecifica, horaInicio, horaFin, activo
FROM barbero_horario
ORDER BY idBarbero, diaSemana, fechaEspecifica;
```

---

## 5) Variables de entorno

### Backend (`backend/.env`)

El archivo `.env` esta ignorado por `.gitignore` (no se sube al repo).  
Crea `backend/.env` con este contenido:

```env
PORT=3000
JWT_SECRET=tu_clave_jwt_segura
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=mydb
```

### Frontend (`frontend/.env.local`, opcional)

Si quieres forzar URL de API:

```env
REACT_APP_API_URL=http://localhost:3000
```

---

## 6) Ejecutar el proyecto

Abre dos terminales.

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Espera la respuesta: Backend esperado en: `http://localhost:3000`

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

La app esta pensada para trabajar en puerto `3002` (el backend permite CORS a `http://localhost:3002`).
Si React no abre en 3002, en PowerShell puedes forzarlo con:

```powershell
$env:PORT=3002
npm start
```

---

## 7) Credenciales de prueba

- Administrador:
- correo: `admin@barberia.com`
- contrasena: `Admin123!`

- Barbero:
- correo: `barbero@barberia.com`
- contrasena: `Barbero123!`

- Cliente:
- correo: `cliente@barberia.com`
- contrasena: `Cliente123!`

---

## 8) Checklist rapido de pruebas

### Cliente

1. Iniciar sesion con cliente.
2. Ir a `/reservas`.
3. Crear reserva seleccionando barbero, servicios, fecha y hora.
4. Verificar que aparece en listado con estado `Pendiente`.
5. Probar ver detalle, editar y cancelar (con motivo).

### Barbero

1. Iniciar sesion con barbero.
2. Ir a `/barbero` > `Mi Agenda`.
3. Abrir una reserva pendiente y marcar `Realizada` o `No asistio`.

### Administrador

1. Iniciar sesion con admin.
2. Ir a `/admin`.
3. Probar CRUD basico de barberos y servicios.
4. Probar asignar servicios y horarios a un barbero.

---

## 9) Sobre `.gitignore`

El repo ignora archivos sensibles o pesados, por ejemplo:

- `node_modules`
- `.env`
- logs y builds

Por eso, cuando alguien clona el proyecto:

- debe ejecutar `npm install` en `backend` y `frontend`
- debe crear su propio archivo `.env` en `backend` (y opcionalmente en `frontend`)

---

## 10) Documentacion detallada por modulo

- Backend: ver `backend/README.md`
- Frontend: ver `frontend/README.md`

