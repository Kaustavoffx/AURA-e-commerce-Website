import { Router } from "express";
import {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCart,
} from "../controllers/cart.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

// ============================================================
//  Cart Routes — /api/v1/cart
//  All routes require a valid JWT.
// ============================================================

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authenticateJWT);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);

export default router;
