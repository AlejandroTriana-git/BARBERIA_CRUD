import { Router } from "express";
import { 
    obtenerBarberos,
    obtenerServiciosPorBarbero, 
    obtenerBarberoPorId,
    crearBarbero,
    actualizarBarbero,
    asignarServiciosBarbero,
    eliminarServicioBarbero,
    obtenerHorariosBarbero,
    gestionarHorarioBarbero,
    eliminarHorarioBarbero
} from "../controllers/barberosController.js";


import { verificarTokenJWT } from "../middleware/auth.js";
import{ verificarRol} from "../middleware/roles.js";

const router = Router();

// Obtener todos los barberos
router.get("/",verificarTokenJWT, verificarRol(1,3), obtenerBarberos);

// Obtener barbero específico
router.get("/:idBarbero", verificarTokenJWT, verificarRol(1,3), obtenerBarberoPorId);

// Obtener servicios de un barbero
router.get("/:idBarbero/servicios",verificarTokenJWT, verificarRol(1,3), obtenerServiciosPorBarbero);

// Crear barbero (admin)
router.post("/", verificarTokenJWT, verificarRol(3),crearBarbero);

// Actualizar barbero
router.put("/:idBarbero",verificarTokenJWT, verificarRol(3), actualizarBarbero);

// Asignar servicios
router.post("/servicios", verificarTokenJWT, verificarRol(3), asignarServiciosBarbero);

// Eliminar servicios
router.delete("/servicios", verificarTokenJWT, verificarRol(3), eliminarServicioBarbero);

// Obtener horarios del barbero
router.get("/:idBarbero/horarios", verificarTokenJWT, verificarRol(3), obtenerHorariosBarbero);

// Crear o actualizar horario
router.post("/horarios", verificarTokenJWT, verificarRol(3), gestionarHorarioBarbero);

// Eliminar horario
router.delete("/horarios/:idHorario", verificarTokenJWT, verificarRol(3), eliminarHorarioBarbero);

export default router;