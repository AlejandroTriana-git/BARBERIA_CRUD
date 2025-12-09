import { Router} from "express";
import {
    obtenerServicios,
    obtenerServicioPorId 
} from "../controllers/servicioController.js"; 


const router = Router();


// GET /servicios - Obtener todos los servicios
router.get("/", obtenerServicios);

// GET /servicios/:idServicio - Obtener un servicio específico
router.get("/:idServicio", obtenerServicioPorId);

export default router;