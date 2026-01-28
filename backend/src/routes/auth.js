import {Router} from "express";
import { verificarToken } from "../controllers/authController";

const router = Router();

router.post("/verificar", verificarToken);

export default router;
