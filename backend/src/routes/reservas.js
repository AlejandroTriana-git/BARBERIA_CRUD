import { Router} from "express";
import { 
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva 
} from "../controllers/reservaController.js";

const router = Router();

// GET /reservas - Obtener todas las reservas
router.get("/", obtenerReservas);

// GET /reservas/:idReserva - Obtener una reserva específica con detalles
router.get("/:idReserva", obtenerReservaPorId);

// POST /reservas - Crear una nueva reserva
router.post("/", crearReserva);

// PUT /reservas/:idReserva - Actualizar una reserva
router.put("/:idReserva", actualizarReserva);

// PUT /reservas/:idReserva - Cancelar una reserva
router.put("/Cancelar/:idReserva", cancelarReserva);

export default router;