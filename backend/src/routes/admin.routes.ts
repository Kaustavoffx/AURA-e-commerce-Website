import { Router } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.middleware";
import { getOverview, listOrders, getOrder, listUsers } from "../controllers/admin.controller";

const router = Router();

// Secure all admin routes
router.use(authenticateJWT);
router.use(requireRole("admin"));

router.get("/overview", getOverview);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.get("/users", listUsers);

export default router;
