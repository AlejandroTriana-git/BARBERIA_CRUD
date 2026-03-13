import { Router } from "express";
import {
    obtenerPerfilCliente,
    actualizarPerfilCliente
} from "../controllers/clientesController.js";


import { verificarTokenJWT } from "../middleware/auth.js";
import{ verificarRol} from "../middleware/roles.js";

const router = Router();


//GET /clientes- Obtener perfil Cliente
router.get("/", verificarTokenJWT, verificarRol(1), obtenerPerfilCliente);

//PUT /clientes - Actualizar perfil cliente
router.put("/",verificarTokenJWT, verificarRol(1), actualizarPerfilCliente );
export default router;