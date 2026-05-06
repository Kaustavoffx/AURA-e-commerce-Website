import { Router } from "express";
import {
  checkout,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticateJWT, requireRole } from "../middleware/auth.middleware";

// ============================================================
//  Order Routes — /api/v1/orders
// ============================================================

const router = Router();

// ── Protected Routes (Authenticated Users) ──────────────────
router.use(authenticateJWT);

router.post("/checkout", checkout);
router.get("/", getUserOrders);

// ── Admin Routes ────────────────────────────────────────────
router.put("/:id/status", requireRole("admin"), updateOrderStatus);

export default router;
