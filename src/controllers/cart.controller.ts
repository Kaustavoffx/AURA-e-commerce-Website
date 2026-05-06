import { Request, Response, NextFunction } from "express";
import redis from "../db/redis";
import prisma from "../db/client";
import { AppError } from "../app";

// ============================================================
//  Cart Controller
//  Uses Redis Hashes: Key = cart:{userId}, Field = {productId}, Value = {quantity}
// ============================================================

// ── Internal Utilities ──────────────────────────────────────

function getCartKey(userId: string): string {
  return `cart:${userId}`;
}

export async function clearCart(userId: string): Promise<void> {
  // Day 14: Internally exported utility (not an HTTP endpoint).
  // Purges the user's cart hash from Redis entirely.
  try {
    await redis.del(getCartKey(userId));
  } catch (err) {
    console.error(`Failed to clear cart for user ${userId}`, err);
    throw new Error("Failed to clear cart in Redis.");
  }
}

// ── POST /api/v1/cart (Day 11) ──────────────────────────────
//  Body: { productId: string, quantity?: number }
//  Adds or increments quantity in Redis using HINCRBY.
// ────────────────────────────────────────────────────────────

export async function addToCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);

    const { productId, quantity = 1 } = req.body;
    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      throw new AppError("Valid productId and positive quantity are required.", 400);
    }

    // Verify product exists in DB before adding to cart
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    const key = getCartKey(req.user.sub);

    // HINCRBY atomically increments the value of the field
    const newQuantity = await redis.hIncrBy(key, productId, quantity);

    res.status(200).json({
      success: true,
      data: {
        productId,
        quantity: newQuantity,
      },
      message: "Item added to cart.",
    });
  } catch (err) {
    // Handle Redis connection failure implicitly, or we could specifically check for Redis errors here.
    // The global error handler will catch disconnected errors.
    next(err);
  }
}

// ── PUT /api/v1/cart/:productId (Day 12) ────────────────────
//  Body: { quantity: number }
//  Explicitly sets the quantity in Redis using HSET.
// ────────────────────────────────────────────────────────────

export async function updateCartQuantity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);

    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new AppError("Positive quantity is required.", 400);
    }

    const key = getCartKey(req.user.sub);

    // HSET overwrites the exact value
    await redis.hSet(key, productId, quantity.toString());

    res.status(200).json({
      success: true,
      data: {
        productId,
        quantity,
      },
      message: "Cart quantity updated.",
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/v1/cart/:productId (Day 12) ─────────────────
//  Completely removes a line item using HDEL.
// ────────────────────────────────────────────────────────────

export async function removeFromCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);

    const { productId } = req.params;
    const key = getCartKey(req.user.sub);

    // HDEL completely removes the field from the hash
    const deletedCount = await redis.hDel(key, productId);

    if (deletedCount === 0) {
      throw new AppError("Item not found in cart.", 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Item removed from cart.",
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/cart (Day 13) ───────────────────────────────
//  Fetches raw cart from Redis (HGETALL) and hydrates it
//  by querying PostgreSQL via Prisma.
// ────────────────────────────────────────────────────────────

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);

    const key = getCartKey(req.user.sub);

    // 1. Fetch raw cart data from Redis Hash
    // Example: { "prod-1-uuid": "2", "prod-2-uuid": "1" }
    const rawCart = await redis.hGetAll(key);

    const productIds = Object.keys(rawCart);

    if (productIds.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          items: [],
          totalPrice: "0.00",
        },
      });
      return;
    }

    // 2. Fetch the actual product details from PostgreSQL
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        sku: true,
      },
    });

    // 3. Hydrate the cart
    let grandTotal = 0;
    const hydratedItems = products.map((prod) => {
      const quantity = parseInt(rawCart[prod.id], 10);
      const lineTotal = Number(prod.price) * quantity;
      
      grandTotal += lineTotal;

      return {
        product: prod,
        quantity,
        lineTotal: lineTotal.toFixed(2),
        // Add a warning if they've requested more than is in stock
        inStock: prod.stock >= quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        items: hydratedItems,
        totalPrice: grandTotal.toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
}
