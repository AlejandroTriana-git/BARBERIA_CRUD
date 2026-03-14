import { Router} from "express";
import {
    obtenerServicios,
    obtenerServicioPorId,
    crearServicio,
    actualizarServicio
} from "../controllers/servicioController.js"; 


import { verificarTokenJWT } from "../middleware/auth.js";
import { verificarRol } from "../middleware/roles.js";


const router = Router();


// GET /servicios - Obtener todos los servicios
router.get("/", verificarTokenJWT ,verificarRol(3), obtenerServicios);

// GET /servicios/:idServicio - Obtener un servicio específico
router.get("/:idServicio", verificarTokenJWT ,verificarRol(3), obtenerServicioPorId);


//POST /servicios - Crear servicios
router.post("/", verificarTokenJWT ,verificarRol(3), crearServicio);

//PUT /servicios/:idServicio - Actualizar servicio
router.put("/:idServicio", verificarTokenJWT ,verificarRol(3), actualizarServicio);



export default router;