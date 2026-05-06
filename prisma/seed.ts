import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { hash } from "bcrypt";

// ============================================================
//  Database Seed Script — E-Commerce Application
// ============================================================
//  Run:  npx prisma db seed
//  Or:   npx ts-node-dev prisma/seed.ts
//
//  Creates:
//   • 2 Users  (1 Admin, 1 Customer) with bcrypt-hashed passwords
//   • 15 Products with rich JSONB attributes
// ============================================================

const SALT_ROUNDS = 12;

// ── Prisma client (standalone — not the app singleton) ──────

function createSeedClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// ── User seed data ──────────────────────────────────────────

async function seedUsers(prisma: PrismaClient) {
  console.log("👤 Seeding users…");

  const adminHash    = await hash("Admin@123!", SALT_ROUNDS);
  const customerHash = await hash("Customer@123!", SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {},
    create: {
      email:        "admin@ecommerce.com",
      passwordHash: adminHash,
      role:         "admin",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "jane.doe@example.com" },
    update: {},
    create: {
      email:        "jane.doe@example.com",
      passwordHash: customerHash,
      role:         "customer",
    },
  });

  console.log(`   ✅ Admin    → ${admin.email}  (id: ${admin.id})`);
  console.log(`   ✅ Customer → ${customer.email}  (id: ${customer.id})`);

  return { admin, customer };
}

// ── Product seed data ───────────────────────────────────────

interface ProductSeed {
  sku:        string;
  name:       string;
  price:      number;
  stock:      number;
  attributes: Record<string, unknown>;
}

const products: ProductSeed[] = [
  {
    sku: "ELEC-LAPTOP-001",
    name: "ProBook Ultra 15\" Laptop",
    price: 1299.99,
    stock: 45,
    attributes: {
      brand: "ProBook",
      category: "Electronics",
      cpu: "Intel Core i7-13700H",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      display: "15.6\" FHD IPS",
      weight: "1.8kg",
      color: "Space Grey",
    },
  },
  {
    sku: "ELEC-PHONE-002",
    name: "Galaxy Nova X Smartphone",
    price: 899.00,
    stock: 120,
    attributes: {
      brand: "Galaxy",
      category: "Electronics",
      display: "6.7\" AMOLED 120Hz",
      chipset: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      camera: "200MP + 12MP + 10MP",
      battery: "5000mAh",
      color: "Phantom Black",
    },
  },
  {
    sku: "ELEC-HEADPH-003",
    name: "SoundWave Pro Headphones",
    price: 249.99,
    stock: 200,
    attributes: {
      brand: "SoundWave",
      category: "Electronics",
      type: "Over-Ear",
      connectivity: "Bluetooth 5.3",
      noiseCancellation: true,
      batteryLife: "40 hours",
      weight: "250g",
      color: "Midnight Blue",
    },
  },
  {
    sku: "CLTH-JACKET-004",
    name: "Alpine Waterproof Jacket",
    price: 189.50,
    stock: 75,
    attributes: {
      brand: "TrailMaster",
      category: "Clothing",
      material: "Gore-Tex Pro",
      waterproofRating: "28,000mm",
      sizes: ["S", "M", "L", "XL", "XXL"],
      color: "Forest Green",
      gender: "Unisex",
    },
  },
  {
    sku: "CLTH-SNKR-005",
    name: "UrbanStep Runner Sneakers",
    price: 129.00,
    stock: 300,
    attributes: {
      brand: "UrbanStep",
      category: "Footwear",
      material: "Knit Upper / EVA Sole",
      sizes: [7, 8, 9, 10, 11, 12],
      color: "White / Neon Green",
      gender: "Men",
      weight: "310g per shoe",
    },
  },
  {
    sku: "HOME-COFMKR-006",
    name: "BrewMaster Espresso Machine",
    price: 549.99,
    stock: 30,
    attributes: {
      brand: "BrewMaster",
      category: "Home & Kitchen",
      type: "Automatic Espresso",
      pressure: "19 bar",
      waterTank: "2.5L",
      grinder: "Built-in Ceramic Burr",
      color: "Brushed Steel",
      warranty: "2 years",
    },
  },
  {
    sku: "HOME-VACUUM-007",
    name: "CleanBot X1 Robot Vacuum",
    price: 399.00,
    stock: 55,
    attributes: {
      brand: "CleanBot",
      category: "Home & Kitchen",
      suction: "6000Pa",
      battery: "5200mAh",
      runtime: "180 minutes",
      navigation: "LiDAR",
      smartHome: ["Alexa", "Google Home"],
      dustbin: "400ml",
    },
  },
  {
    sku: "ELEC-WATCH-008",
    name: "ChronoFit Smartwatch Ultra",
    price: 349.00,
    stock: 90,
    attributes: {
      brand: "ChronoFit",
      category: "Wearables",
      display: "1.9\" AMOLED Always-On",
      sensors: ["Heart Rate", "SpO2", "GPS", "Altimeter"],
      waterResistance: "100m",
      batteryLife: "14 days",
      os: "WearOS 5",
      strapMaterial: "Titanium",
    },
  },
  {
    sku: "ELEC-TABLET-009",
    name: "PixelPad Pro 12.9\" Tablet",
    price: 799.00,
    stock: 60,
    attributes: {
      brand: "PixelPad",
      category: "Electronics",
      display: "12.9\" Liquid Retina XDR",
      chipset: "M2",
      ram: "8GB",
      storage: "128GB",
      stylus: "PixelPen 2 compatible",
      weight: "682g",
    },
  },
  {
    sku: "SPRT-YOGA-010",
    name: "ZenFlex Premium Yoga Mat",
    price: 59.99,
    stock: 500,
    attributes: {
      brand: "ZenFlex",
      category: "Sports & Fitness",
      material: "Natural Rubber + PU",
      thickness: "6mm",
      dimensions: "183cm x 68cm",
      nonSlip: true,
      ecoFriendly: true,
      color: "Sage Green",
    },
  },
  {
    sku: "HOME-LAMP-011",
    name: "LumiGlow Smart LED Desk Lamp",
    price: 79.99,
    stock: 150,
    attributes: {
      brand: "LumiGlow",
      category: "Home & Office",
      brightness: "1200 lux",
      colorTemperature: "2700K–6500K",
      dimLevels: 10,
      smartHome: ["Alexa", "Google Home", "HomeKit"],
      usbPorts: 2,
      material: "Aluminium",
    },
  },
  {
    sku: "ELEC-SPKR-012",
    name: "BassCore 360 Portable Speaker",
    price: 149.99,
    stock: 180,
    attributes: {
      brand: "BassCore",
      category: "Electronics",
      output: "30W",
      drivers: "2x full-range + passive radiator",
      connectivity: "Bluetooth 5.3 / AUX / USB-C",
      waterproof: "IP67",
      batteryLife: "24 hours",
      weight: "780g",
      color: "Obsidian Black",
    },
  },
  {
    sku: "CLTH-BKPK-013",
    name: "VoyageR Anti-Theft Backpack",
    price: 99.95,
    stock: 220,
    attributes: {
      brand: "VoyageR",
      category: "Bags & Accessories",
      capacity: "28L",
      laptopCompartment: "Up to 16\"",
      material: "600D Ripstop Nylon",
      features: ["Hidden Zippers", "RFID Pocket", "USB Charging Port"],
      waterResistant: true,
      color: "Charcoal",
    },
  },
  {
    sku: "HOME-KETTLE-014",
    name: "SwiftBoil Electric Gooseneck Kettle",
    price: 69.99,
    stock: 110,
    attributes: {
      brand: "SwiftBoil",
      category: "Home & Kitchen",
      capacity: "1.0L",
      material: "304 Stainless Steel",
      temperatureControl: true,
      presets: ["Green Tea 80°C", "Coffee 92°C", "Boil 100°C"],
      display: "LED",
      color: "Matte Black",
    },
  },
  {
    sku: "ELEC-CHARGER-015",
    name: "PowerSurge 100W GaN Charger",
    price: 59.99,
    stock: 400,
    attributes: {
      brand: "PowerSurge",
      category: "Electronics",
      totalOutput: "100W",
      ports: { "USB-C": 2, "USB-A": 1 },
      technology: "GaN III",
      foldablePlug: true,
      weight: "120g",
      certifications: ["USB-IF", "MFi", "CE", "FCC"],
    },
  },
];

async function seedProducts(prisma: PrismaClient) {
  console.log("\n📦 Seeding products…");

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const result = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku:        p.sku,
        name:       p.name,
        price:      p.price,
        stock:      p.stock,
        attributes: p.attributes as Prisma.InputJsonValue,
      },
    });

    // Check if it was freshly created (createdAt ≈ now)
    const isNew = Date.now() - new Date(result.createdAt).getTime() < 5000;
    if (isNew) {
      created++;
      console.log(`   ✅ ${result.name}  ($${p.price})  [${p.sku}]`);
    } else {
      skipped++;
    }
  }

  console.log(`   → ${created} created, ${skipped} already existed.`);
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  const prisma = createSeedClient();

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   🌱  E-Commerce Database Seeder        ║");
  console.log("╚══════════════════════════════════════════╝\n");

  try {
    await seedUsers(prisma);
    await seedProducts(prisma);

    console.log("\n✅ Seed complete!\n");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected.");
  }
}

main();
