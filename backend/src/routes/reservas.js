import { Router} from "express";
import { 
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva 
} from "../controllers/reservaController.js";

import { verificarToken } from "../middleware/auth.js";

const router = Router();

// GET /reservas - Obtener todas las reservas
router.get("/", verificarToken, obtenerReservas);

// GET /reservas/:idReserva - Obtener una reserva específica con detalles
router.get("/:idReserva", verificarToken, obtenerReservaPorId);

// POST /reservas - Crear una nueva reserva
router.post("/", verificarToken, crearReserva);

// PUT /reservas/:idReserva - Actualizar una reserva
router.put("/:idReserva", verificarToken, actualizarReserva);

// PUT /reservas/:idReserva - Cancelar una reserva
router.put("/Cancelar/:idReserva", verificarToken, cancelarReserva);

export default router;