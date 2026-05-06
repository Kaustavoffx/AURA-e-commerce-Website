import { Router } from "express";
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/product.controller";
import { authenticateJWT, requireRole } from "../middleware/auth.middleware";

// ============================================================
//  Product Routes — /api/v1/products
// ============================================================

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", authenticateJWT, requireRole("admin"), createProduct);
router.put("/:id", authenticateJWT, requireRole("admin"), updateProduct);
router.delete("/:id", authenticateJWT, requireRole("admin"), deleteProduct);

export default router;
