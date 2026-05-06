-- ============================================================
--  E-Commerce Database Schema
--  PostgreSQL 15+  •  Highly Normalized  •  UUID Primary Keys
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid() (PG 13+)

-- ── Custom Types ────────────────────────────────────────────

CREATE TYPE user_role    AS ENUM ('customer', 'admin', 'vendor');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- ============================================================
--  1. USERS
-- ============================================================
--  Stores account credentials and role.
--  Email is the unique login identifier.
-- ============================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role    NOT NULL DEFAULT 'customer',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_users_email   UNIQUE (email),
    CONSTRAINT ck_users_email   CHECK  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Fast look-ups by email (login flow)
CREATE INDEX idx_users_email ON users (email);

-- ============================================================
--  2. PRODUCTS
-- ============================================================
--  SKU is the merchant-facing unique identifier.
--  `attributes` (JSONB) holds flexible, schema-less data such
--  as color, size, weight, material — indexed with GIN.
-- ============================================================

CREATE TABLE products (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    sku             VARCHAR(100)  NOT NULL,
    name            VARCHAR(255)  NOT NULL,
    price           NUMERIC(12,2) NOT NULL,
    stock           INTEGER       NOT NULL DEFAULT 0,
    attributes      JSONB         NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_products_sku    UNIQUE (sku),
    CONSTRAINT ck_products_price  CHECK  (price >= 0),
    CONSTRAINT ck_products_stock  CHECK  (stock >= 0)
);

-- GIN index for fast JSONB containment / key-exists queries
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);

-- B-tree for sorting / filtering by name
CREATE INDEX idx_products_name ON products (name);

-- ============================================================
--  3. ORDERS
-- ============================================================
--  Each order belongs to exactly one user.
--  ON DELETE RESTRICT prevents accidental user deletion while
--  orders still reference them (audit trail integrity).
-- ============================================================

CREATE TABLE orders (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL,
    total_price     NUMERIC(14,2) NOT NULL,
    status          order_status  NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT ck_orders_total_price CHECK (total_price >= 0)
);

-- Query orders by user
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Filter / dashboard by status
CREATE INDEX idx_orders_status  ON orders (status);

-- ============================================================
--  4. ORDER_ITEMS  (junction / line-item table)
-- ============================================================
--  Links orders ↔ products with a snapshot of the price at the
--  time of purchase (`historical_price`), so future product
--  price changes never corrupt past order records.
--
--  CASCADE rules:
--    • order deleted  → its line items are deleted (no orphans)
--    • product deleted → RESTRICT (preserve order history)
-- ============================================================

CREATE TABLE order_items (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID          NOT NULL,
    product_id        UUID          NOT NULL,
    historical_price  NUMERIC(12,2) NOT NULL,
    quantity          INTEGER       NOT NULL,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT ck_order_items_price    CHECK (historical_price >= 0),
    CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),

    -- Prevent duplicate product entries within the same order
    CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id)
);

-- Retrieve all items for an order
CREATE INDEX idx_order_items_order_id   ON order_items (order_id);

-- Look up every order that contains a given product
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- ============================================================
--  Auto-update `updated_at` trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
