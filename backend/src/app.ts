import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectRedis, disconnectRedis } from "./db/redis";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";

// ──────────────────────────────────────────────
//  Custom error class for operational errors
// ──────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ──────────────────────────────────────────────
//  Standardized JSON error envelope
// ──────────────────────────────────────────────

interface ErrorResponseBody {
  success: false;
  error: {
    message: string;
    statusCode: number;
    /** Only included when NODE_ENV !== "production" */
    stack?: string;
  };
}

// ──────────────────────────────────────────────
//  App factory
// ──────────────────────────────────────────────

function createApp(): express.Express {
  const app = express();

  // ── Security headers ────────────────────────
  app.use(helmet());

  // ── CORS ────────────────────────────────────
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://original-gilt.vercel.app",
      ],
      credentials: true,
    })
  );

  // ── Body parsing ───────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── Request logging ────────────────────────
  const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
  app.use(morgan(logFormat));

  // ── Simple root check ──────────────────────
  app.get("/", (_req: Request, res: Response) => {
    res.send("Backend working");
  });

  // ── Health check ───────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // ── API routes ─────────────────────────────
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/products", productRoutes);
  app.use("/api/v1/cart", cartRoutes);
  app.use("/api/v1/orders", orderRoutes);

  // ── 404 handler ────────────────────────────
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError("Resource not found", 404));
  });

  // ── Global error handler ───────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message =
      err instanceof AppError && err.isOperational
        ? err.message
        : "Internal server error";

    const body: ErrorResponseBody = {
      success: false,
      error: {
        message,
        statusCode,
      },
    };

    // Expose stack trace only in non-production environments
    if (process.env.NODE_ENV !== "production") {
      body.error.stack = err.stack;
    }

    // Log unexpected (non-operational) errors for observability
    if (!(err instanceof AppError) || !err.isOperational) {
      console.error("💥 Unhandled error:", err);
    }

    res.status(statusCode).json(body);
  });

  return app;
}

// ──────────────────────────────────────────────
//  Server bootstrap
// ──────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const app = createApp();

async function bootstrap(): Promise<void> {
  // Connect to Redis before accepting HTTP traffic
  try {
    await connectRedis();
  } catch {
    console.warn("⚠️  Redis unavailable — server will start without cache.");
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   Health check: /health\n`);
  });

  // ── Graceful shutdown ────────────────────────

  async function shutdown(signal: string): Promise<void> {
    console.log(`\n⏳ ${signal} received — shutting down gracefully…`);

    // 1. Stop accepting new connections
    server.close(() => console.log("✅ HTTP server closed."));

    // 2. Drain Redis
    await disconnectRedis();

    // 3. Exit
    process.exit(0);
  }

  // Force-kill after 10 s if connections won't drain
  function forceShutdown(signal: string): void {
    void shutdown(signal);
    setTimeout(() => {
      console.error("❌ Forcing shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  }

  process.on("SIGINT", () => forceShutdown("SIGINT"));
  process.on("SIGTERM", () => forceShutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    forceShutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
    forceShutdown("uncaughtException");
  });
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap failed:", err);
  process.exit(1);
});

export default app;
