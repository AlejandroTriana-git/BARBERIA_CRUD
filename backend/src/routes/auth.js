import {Router} from "express";
import { verificarToken } from "../controllers/authController.js";

const router = Router();

router.post("/verificar", verificarToken);

export default router;
