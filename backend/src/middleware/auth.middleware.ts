import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../app";
import type { JwtPayload } from "../controllers/auth.controller";

// ============================================================
//  Auth Middleware — JWT verification & role guarding
// ============================================================
//  Attaches `req.user` ({ sub, role }) on success.
//  Use `requireRole(...roles)` to restrict by role.
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET ?? "CHANGE_ME_IN_PRODUCTION";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ── Verify JWT and attach payload to req.user ───────────────

export function authenticateJWT(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required. Please provide a valid token.", 401);
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid or expired token.", 401));
    } else {
      next(err);
    }
  }
}

// ── Role-based access control ───────────────────────────────
//  Usage:  router.get("/admin", authenticateJWT, requireRole("admin"), handler)

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to access this resource.", 403)
      );
    }

    next();
  };
}
