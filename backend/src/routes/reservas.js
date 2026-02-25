import { Router} from "express";
import { 
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva 
} from "../controllers/reservaController.js";

import { verificarTokenJWT } from "../middleware/auth.js";

const router = Router();

// GET /reservas - Obtener todas las reservas
router.get("/", verificarTokenJWT, obtenerReservas);

// GET /reservas/:idReserva - Obtener una reserva específica con detalles
router.get("/:idReserva", verificarTokenJWT, obtenerReservaPorId);

// POST /reservas - Crear una nueva reserva
router.post("/", verificarTokenJWT, crearReserva);

// PUT /reservas/:idReserva - Actualizar una reserva
router.put("/:idReserva", verificarTokenJWT, actualizarReserva);

// PUT /reservas/:idReserva - Cancelar una reserva
router.put("/Cancelar/:idReserva", verificarTokenJWT, cancelarReserva);

export default router;