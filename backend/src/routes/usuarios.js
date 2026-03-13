import { Router } from "express";
import {
  obtenerUsuarios,
  actualizarContraseña,
  actualizarCorreo
  
} from "../controllers/usuariosController.js";


import { verificarTokenJWT } from "../middleware/auth.js";
import{ verificarRol} from "../middleware/roles.js";

const router = Router();


//GET /usuarios obtenerUusarios
router.get("/", verificarTokenJWT, verificarRol(3), obtenerUsuarios);

//POST /usuarios/contraseña
router.post("/contraseña", verificarTokenJWT, actualizarContraseña);

//PUT /usuarios/correo
router.put("/correo",verificarTokenJWT, actualizarCorreo );
export default router;