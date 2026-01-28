import { Router } from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  crearHashToken,
  verificarToken
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);

//Proceso hash (verificación)

router.post("/hash", crearHashToken);



router.put("/:idCliente", actualizarUsuario);
router.delete("/:idCliente", desactivarUsuario);

export default router;