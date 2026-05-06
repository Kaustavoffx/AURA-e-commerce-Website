import { Request, Response, NextFunction } from "express";
import prisma from "../db/client";
import { AppError } from "../app";
import { Prisma } from "../generated/prisma/client";

// ============================================================
//  Product Catalog Controller (Public)
// ============================================================

// ── GET /api/v1/products ────────────────────────────────────
//  Query params:
//   - limit: max items to return (default 10, max 100)
//   - offset: items to skip (default 0)
//   - search: keyword search against name or SKU
// ────────────────────────────────────────────────────────────

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { limit = "10", offset = "0", search } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = parseInt(offset as string, 10);

    // ── Pagination Validation ────────────────
    if (isNaN(take) || take < 1 || take > 100) {
      throw new AppError("Invalid limit. Must be between 1 and 100.", 400);
    }
    if (isNaN(skip) || skip < 0) {
      throw new AppError("Invalid offset. Must be 0 or greater.", 400);
    }

    // ── Build Query Filters ──────────────────
    const where: Prisma.ProductWhereInput = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku:  { contains: search, mode: "insensitive" } },
      ];
    }

    // ── Execute Transaction (Count + Fetch) ──
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/products/:id ────────────────────────────────
//  Params: id (UUID)
// ────────────────────────────────────────────────────────────

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Prevent Prisma from throwing a 500 on malformed UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new AppError("Invalid product ID format.", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/products (Admin Only) ──────────────────────

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sku, name, price, stock, attributes } = req.body;

    if (!sku || !name || price === undefined) {
      throw new AppError("SKU, name, and price are required.", 400);
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      throw new AppError("A product with this SKU already exists.", 409);
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        price,
        stock: stock ?? 0,
        attributes: attributes ?? {},
      },
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/v1/products/:id (Admin Only) ───────────────────

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { sku, name, price, stock, attributes } = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new AppError("Invalid product ID format.", 400);
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Product not found.", 404);
    }

    if (sku && sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku } });
      if (skuConflict) {
        throw new AppError("A product with this SKU already exists.", 409);
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(sku && { sku }),
        ...(name && { name }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(attributes && { attributes }),
      },
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/v1/products/:id (Admin Only) ────────────────

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new AppError("Invalid product ID format.", 400);
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Product not found.", 404);
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      data: null,
      message: "Product deleted successfully.",
    });
  } catch (err: any) {
    // P2003 handles foreign key constraint failures (e.g. from order_items with RESTRICT)
    if (err.code === "P2003") {
      next(new AppError("Cannot delete product because it is referenced in one or more orders.", 409));
    } else {
      next(err);
    }
  }
}
