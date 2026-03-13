import express from "express";
import { 
  obtenerHorariosDisponibles
} from "../controllers/disponibilidadController.js";


import { verificarTokenJWT } from "../middlewares/auth.js";
import { verificarRol } from "../middlewares/roles.js";
const router = express.Router();

// Obtener horarios disponibles para reservar
router.get("/", verificarTokenJWT, verificarRol(1), obtenerHorariosDisponibles);

export default router;