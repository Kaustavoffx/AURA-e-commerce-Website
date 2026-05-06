import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

// ============================================================
//  Auth Routes — /api/v1/auth
// ============================================================

const router = Router();

router.post("/register", register);
router.post("/login",    login);

export default router;
