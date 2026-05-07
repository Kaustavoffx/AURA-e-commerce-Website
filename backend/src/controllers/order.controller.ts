import { Request, Response, NextFunction } from "express";
import prisma from "../db/client";
import redis from "../db/redis";
import { AppError } from "../app";
import { processMockPayment } from "../utils/payment";
import { clearCart } from "./cart.controller";
import { OrderStatus } from "../generated/prisma/client";

// ============================================================
//  Order Controller (Checkout & Management)
// ============================================================

// ── Internal Helpers ────────────────────────────────────────

function getCartKey(userId: string): string {
  return `cart:${userId}`;
}

// ── POST /api/v1/orders/checkout (Days 16 & 17) ─────────────
//  Body: { cardNumber: string }
//  Executes cart retrieval, stock validation, mock payment,
//  and an atomic Prisma transaction to create the order.
// ────────────────────────────────────────────────────────────

export async function checkout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);
    
    const userId = req.user.sub;
    const { cardNumber } = req.body;

    if (!cardNumber || typeof cardNumber !== "string") {
      throw new AppError("A valid credit card number is required.", 400);
    }

    // 1. Retrieve the cart from Redis
    const key = getCartKey(userId);
    const rawCart = await redis.hGetAll(key);
    const productIds = Object.keys(rawCart);

    if (productIds.length === 0) {
      throw new AppError("Your cart is empty.", 400);
    }

    // 2. Fetch products and verify stock / calculate server-side totals
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new AppError("One or more products in your cart no longer exist.", 400);
    }

    let calculatedTotal = 0;
    const orderItemsData: any[] = [];

    for (const prod of products) {
      const quantity = parseInt(rawCart[prod.id], 10);
      
      if (prod.stock < quantity) {
        throw new AppError(
          `Insufficient stock for ${prod.name}. Available: ${prod.stock}, Requested: ${quantity}`,
          400
        );
      }

      const lineTotal = Number(prod.price) * quantity;
      calculatedTotal += lineTotal;

      orderItemsData.push({
        productId: prod.id,
        quantity,
        historicalPrice: prod.price, // Lock in the price
      });
    }

    // 3. Process Mock Payment
    let transactionId: string;
    try {
      transactionId = await processMockPayment(cardNumber, calculatedTotal);
    } catch (paymentErr: any) {
      throw new AppError(paymentErr.message || "Payment processing failed.", 400);
    }

    // 4. Atomic Order Creation (Prisma $transaction)
    const order = await prisma.$transaction(async (tx) => {
      // Create master Order record and OrderItems simultaneously
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.pending,
          totalPrice: calculatedTotal,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock for each product atomically
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // 5. Cart Purge (best effort)
    // Do not fail a successful order if Redis cart purge fails.
    try {
      await clearCart(userId);
    } catch (clearErr) {
      console.warn(`Cart clear failed after successful checkout for user ${userId}:`, clearErr);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: {
        transactionId,
        order,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/orders (Day 18) ─────────────────────────────
//  Fetches all orders for the authenticated user.
// ────────────────────────────────────────────────────────────

export async function getUserOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError("Authentication required.", 401);

    const orders = await prisma.order.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/v1/orders/:id/status (Day 18) ──────────────────
//  Administrative endpoint to transition order state.
// ────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    // Basic state machine logic to prevent transitioning out of terminal states
    const terminalStates: OrderStatus[] = [
      OrderStatus.delivered,
      OrderStatus.cancelled,
      OrderStatus.refunded,
    ];

    if (terminalStates.includes(order.status) && !terminalStates.includes(status as OrderStatus)) {
      throw new AppError(
        `Cannot update order status from a terminal state (${order.status}).`,
        400
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated.",
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
}
