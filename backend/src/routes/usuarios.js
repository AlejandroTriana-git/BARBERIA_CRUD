import { Router } from "express";
import {
  obtenerUsuarios,
  actualizarContraseña,
  actualizarCorreo
  
} from "../controllers/usuariosController.js";


import { verificarTokenJWT } from "../middleware/auth.js";
import{ verificarRol} from "../middleware/roles.js";

const router = Router();


//GET /usuarios obtenerUsuarios
router.get("/", verificarTokenJWT, verificarRol(3), obtenerUsuarios);

//POST /usuarios/contrasena
router.post("/contrasena", verificarTokenJWT,verificarRol(1,2,3), actualizarContraseña);

//PUT /usuarios/correo
router.put("/correo",verificarTokenJWT, verificarRol(1,2,3), actualizarCorreo );
export default router;