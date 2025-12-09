import express from "express";
import { 
  obtenerHorariosDisponibles,
  obtenerHorariosBarbero,
  gestionarHorarioBarbero,
  eliminarHorarioBarbero
} from "../controllers/disponibilidadController.js";

const router = express.Router();

// GET /disponibilidad?idBarbero=1&fecha=2025-12-01&servicios=1,2
// Obtener horarios disponibles para reservar
router.get("/", obtenerHorariosDisponibles);



// GET /disponibilidad/barbero/:idBarbero
// Obtener horarios de trabajo de un barbero
router.get("/barbero/:idBarbero", obtenerHorariosBarbero);

// POST /disponibilidad/barbero
// Crear o actualizar horario de trabajo
router.post("/barbero", gestionarHorarioBarbero);

// DELETE /disponibilidad/barbero/:idHorario
// Eliminar un horario específico
router.delete("/barbero/:idHorario", eliminarHorarioBarbero);

export default router;