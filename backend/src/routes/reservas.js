import { Router} from "express";
import { 
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva,
  agendaBarbero
} from "../controllers/reservaController.js";

import { verificarTokenJWT } from "../middlewares/auth.js";
import { verificarRol } from "../middlewares/roles.js";

const router = Router();

// GET /reservas - Obtener todas las reservas
router.get("/", verificarTokenJWT, verificarRol(1), obtenerReservas);

// GET /reservas/:idReserva - Obtener una reserva específica con detalles
router.get("/:idReserva", verificarTokenJWT, verificarRol(1), obtenerReservaPorId);

// POST /reservas - Crear una nueva reserva
router.post("/", verificarTokenJWT, verificarRol(1), crearReserva);

// PUT /reservas/:idReserva - Actualizar una reserva
router.put("/:idReserva", verificarTokenJWT, verificarRol(1), actualizarReserva);

// PUT /reservas/:idReserva - Cancelar una reserva
router.put("/:idReserva/cancelar", verificarTokenJWT, verificarRol(1), cancelarReserva);

//GET /reservas/:idBarbero - Obtener la agenda del barbero
 router.get("/barbero/:idBarbero", verificarTokenJWT, verificarRol(2), agendaBarbero);


export default router;