export interface CatalogProductLike {
  id: string;
  sku: string;
  name: string;
  price: string | number;
  stock: number;
  attributes?: Record<string, unknown>;
}

const DEFAULT_SWATCHES = [
  "from-slate-900 via-slate-700 to-slate-300",
  "from-zinc-900 via-neutral-700 to-stone-300",
  "from-stone-900 via-amber-900 to-amber-200",
  "from-cyan-950 via-sky-900 to-indigo-300",
  "from-emerald-950 via-teal-900 to-lime-200",
  "from-rose-950 via-fuchsia-900 to-rose-200",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const match = value.find((item) => typeof item === "string" && item.trim());
    return typeof match === "string" ? match : null;
  }
  return null;
}

export function formatMoney(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getProductCategory(product: CatalogProductLike): string {
  const attributes = product.attributes ?? {};
  return (
    firstString(attributes.category) ??
    firstString(attributes.collection) ??
    firstString(attributes.type) ??
    firstString(attributes.brand) ??
    "General"
  );
}

export function getProductSummary(product: CatalogProductLike): string {
  const attributes = product.attributes ?? {};
  const values = [
    firstString(attributes.brand),
    firstString(attributes.material),
    firstString(attributes.display),
    firstString(attributes.connectivity),
    firstString(attributes.storage),
    firstString(attributes.capacity),
  ].filter(Boolean) as string[];

  return values.slice(0, 3).join(" · ");
}

export function getProductHighlights(product: CatalogProductLike): string[] {
  const attributes = product.attributes ?? {};
  return Object.entries(attributes)
    .filter(([key, value]) => key !== "category" && key !== "collection" && key !== "brand" && value !== null && value !== undefined)
    .slice(0, 3)
    .map(([key, value]) => {
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join(" / ");
      return key;
    })
    .filter((value) => Boolean(value));
}

export function getProductPalette(product: CatalogProductLike): string {
  const index = hashSeed(`${product.sku}:${product.name}`) % DEFAULT_SWATCHES.length;
  return DEFAULT_SWATCHES[index];
}

export function getProductBadge(product: CatalogProductLike): string {
  if (product.stock <= 0) return "Sold out";
  if (product.stock < 10) return "Low stock";
  return "In stock";
}

export function getProductAccent(product: CatalogProductLike): string {
  return getProductCategory(product).slice(0, 1).toUpperCase();
}