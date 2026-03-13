import {Router} from "express";
import { verificarAuth, registrarCliente } from "../controllers/authController.js";

const router = Router();

router.post("/verificar", verificarAuth);
router.post("/registrarCliente", registrarCliente);

export default router;
