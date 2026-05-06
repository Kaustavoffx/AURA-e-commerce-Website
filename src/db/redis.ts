import { createClient, type RedisClientType } from "redis";

// ──────────────────────────────────────────────
//  Redis Client — Highly Available Connection
// ──────────────────────────────────────────────
//  • Exponential back-off retry with jitter
//  • Comprehensive event listeners for observability
//  • Lazy-connect: call `connectRedis()` once at server boot
//  • Singleton export for use across Express controllers
// ──────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const MAX_RETRIES = 10;
const BASE_DELAY_MS = 500;     // initial retry wait
const MAX_DELAY_MS  = 30_000;  // cap at 30 s

// ── Retry strategy ──────────────────────────────────────────
//  Uses truncated exponential back-off + random jitter so that
//  multiple app instances don't hammer Redis at the same instant.

function retryStrategy(retries: number, cause: Error): number | Error {
  if (retries >= MAX_RETRIES) {
    console.error(
      `❌ Redis: exhausted ${MAX_RETRIES} reconnection attempts. Giving up.`,
      cause.message
    );
    return new Error("Redis max retries reached");
  }

  const exponential = Math.min(BASE_DELAY_MS * 2 ** retries, MAX_DELAY_MS);
  const jitter      = Math.random() * BASE_DELAY_MS;
  const delay       = Math.round(exponential + jitter);

  console.warn(
    `⏳ Redis: reconnect attempt ${retries + 1}/${MAX_RETRIES} in ${delay}ms — ${cause.message}`
  );

  return delay;
}

// ── Client creation ─────────────────────────────────────────

const redis: RedisClientType = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: retryStrategy,
    connectTimeout: 10_000,   // 10 s connect timeout
  },
});

// ── Event listeners ─────────────────────────────────────────

redis.on("connect", () => {
  console.log("🔌 Redis: TCP connection established.");
});

redis.on("ready", () => {
  console.log("✅ Redis: client ready — accepting commands.");
});

redis.on("reconnecting", () => {
  console.warn("🔄 Redis: reconnecting…");
});

redis.on("end", () => {
  console.log("🛑 Redis: connection closed.");
});

redis.on("error", (err: Error) => {
  // Logged but NOT thrown — the retry strategy handles recovery.
  console.error("💥 Redis error:", err.message);
});

// ── Bootstrap helper ────────────────────────────────────────
//  Call once from your server entry-point (app.ts).
//  Resolves when the client is ready; rejects only if the
//  initial connection cannot be established.

export async function connectRedis(): Promise<void> {
  if (redis.isOpen) return;

  try {
    await redis.connect();
    console.log(`✅ Redis: connected to ${REDIS_URL}`);
  } catch (err) {
    console.error("❌ Redis: initial connection failed.", err);
    throw err;
  }
}

// ── Graceful shutdown helper ────────────────────────────────
//  Call from your SIGINT / SIGTERM handler so in-flight
//  commands drain before the process exits.

export async function disconnectRedis(): Promise<void> {
  if (!redis.isOpen) return;

  try {
    await redis.quit();       // graceful — waits for pending replies
    console.log("✅ Redis: disconnected gracefully.");
  } catch (err) {
    console.error("⚠️  Redis: error during disconnect, forcing.", err);
    await redis.disconnect(); // hard close
  }
}

export default redis;
