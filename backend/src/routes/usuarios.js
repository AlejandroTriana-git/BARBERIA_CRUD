import { Router } from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  crearHashToken
} from "../controllers/usuariosController.js";


import { verificarTokenJWT } from "../middleware/auth.js";


//poner la verificacionJWT en contraseñaCmabiar y cambiar correo
const router = Router();

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);

//Proceso hash (verificación)

router.post("/hash", crearHashToken);



router.put("/:idCliente", actualizarUsuario);
router.delete("/:idCliente", desactivarUsuario);

export default router;