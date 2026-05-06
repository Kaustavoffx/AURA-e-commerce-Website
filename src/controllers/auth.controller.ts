import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/client";
import { AppError } from "../app";

// ============================================================
//  Auth Controller — Register & Login
// ============================================================

const SALT_ROUNDS  = 12;
const JWT_SECRET   = process.env.JWT_SECRET ?? "CHANGE_ME_IN_PRODUCTION";
const JWT_EXPIRES  = process.env.JWT_EXPIRES_IN ?? "7d";

// ── JWT payload shape ───────────────────────────────────────

export interface JwtPayload {
  sub:  string;   // user ID
  role: string;   // user role
}

// ── Helper: sign a token ────────────────────────────────────

function signToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role } satisfies JwtPayload,
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES }
  );
}

// ============================================================
//  POST /api/v1/auth/register
// ============================================================
//  Body: { email, password, role? }
//  Returns: 201 + user object + JWT
// ============================================================

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: "customer" | "admin" | "vendor";
    };

    // ── Validation ───────────────────────────────
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    // ── Check for existing user ──────────────────
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    // ── Create user ──────────────────────────────
    const passwordHash = await hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role ?? "customer",
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // ── Issue JWT ────────────────────────────────
    const token = signToken(user.id, user.role);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================
//  POST /api/v1/auth/login
// ============================================================
//  Body: { email, password }
//  Returns: 200 + user object + JWT
// ============================================================

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    // ── Validation ───────────────────────────────
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    // ── Look up user ─────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Intentionally vague — don't reveal whether the email exists
      throw new AppError("Invalid email or password.", 401);
    }

    // ── Verify password ──────────────────────────
    const isMatch = await compare(password, user.passwordHash);

    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401);
    }

    // ── Issue JWT ────────────────────────────────
    const token = signToken(user.id, user.role);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id:        user.id,
          email:     user.email,
          role:      user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}
