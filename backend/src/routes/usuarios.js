import { Router } from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  crearHashToken,
  verificarToken
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);

//Proceso hash (verificación)

router.post("/hash", crearHashToken);
router.post("/verificar", verificarToken)


router.put("/:idCliente", actualizarUsuario);
router.delete("/:idCliente", eliminarUsuario);

export default router;