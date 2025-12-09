import { Router } from "express";
import { 
    obtenerBarberos,
    obtenerServiciosPorBarbero, 
    obtenerBarberoPorId
} from "../controllers/barberosController.js";

const router = Router ();

// GET /barberos - Obtener todos los barberos
router.get("/", obtenerBarberos);

// GET /barberos/:idBarbero - Obtener un barbero específico
router.get("/:idBarbero", obtenerBarberoPorId);

// GET /barberos/:idBarbero/servicios - Obtener servicios de un barbero
router.get("/:idBarbero/servicios", obtenerServiciosPorBarbero);

export default router;