import { Request, Response, NextFunction } from "express";
import prisma from "../db/client";
import { AppError } from "../app";

// GET /api/v1/admin/overview
export async function getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // totals
    const [totalProducts, totalUsers, totalOrders, revenueAgg] = await prisma.$transaction([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
    ]);

    const totalRevenue = (revenueAgg._sum.totalPrice ?? 0) as unknown as number;

    // recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: { include: { product: { select: { name: true } } } }, },
    });

    // low stock
    const lowStock = await prisma.product.findMany({ where: { stock: { lt: 5 } }, orderBy: { stock: "asc" }, take: 8 });

    res.status(200).json({
      success: true,
      data: {
        totals: { totalProducts, totalUsers, totalOrders, totalRevenue },
        recentOrders,
        lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/orders
export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const orders = await prisma.order.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true, sku: true } } } }, },
    });

    const total = await prisma.order.count();

    res.status(200).json({ success: true, data: orders, pagination: { total, limit, offset } });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/orders/:id
export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, }, });
    if (!order) throw new AppError("Order not found.", 404);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/users
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const users = await prisma.user.findMany({ take: limit, skip: offset, orderBy: { createdAt: "desc" }, select: { id: true, email: true, role: true, createdAt: true } });
    const total = await prisma.user.count();
    res.status(200).json({ success: true, data: users, pagination: { total, limit, offset } });
  } catch (err) {
    next(err);
  }
}
