// ✅ Canonical unit definitions used by editor + view
export const UNIT_SYSTEMS = {
  metric: {
    count: ["pcs", "btl"],
    volume: ["ml", "l"],
    weight: ["g", "kg"]
  },
  us: {
    count: ["pcs", "btl"],
    volume: ["tsp", "tbsp", "cup"],
    weight: ["oz", "lb"]
  }
};

/* ================= TO BASE ================= */
// Converts display units → base units (ml / g)
export function toBase(quantity, unit) {
  if (quantity == null || unit == null) {
    return { quantity: 0, unit: "" };
  }

  const q = Number(quantity) || 0;

  switch (unit) {
    // Volume → ml
    case "tsp":
      return { quantity: q * 5, unit: "ml" };
    case "tbsp":
      return { quantity: q * 15, unit: "ml" };
    case "cup":
      return { quantity: q * 240, unit: "ml" };
    case "l":
      return { quantity: q * 1000, unit: "ml" };
    case "ml":
      return { quantity: q, unit: "ml" };

    // Weight → g
    case "oz":
      return { quantity: q * 28.35, unit: "g" };
    case "lb":
      return { quantity: q * 453.6, unit: "g" };
    case "kg":
      return { quantity: q * 1000, unit: "g" };
    case "g":
      return { quantity: q, unit: "g" };

    default:
      return { quantity: q, unit };
  }
}

/* ================= FROM BASE ================= */
// Converts base units (ml / g) → display units
export function fromBase(quantity, unit, system = "metric") {
  if (quantity == null || unit == null) {
    return { quantity: 0, unit: "" };
  }

  const q = Number(quantity) || 0;

  if (system === "us") {
    if (unit === "ml") {
      if (q >= 240) return { quantity: +(q / 240).toFixed(2), unit: "cup" };
      if (q >= 15) return { quantity: +(q / 15).toFixed(2), unit: "tbsp" };
      return { quantity: +(q / 5).toFixed(2), unit: "tsp" };
    }

    if (unit === "g") {
      if (q >= 453) return { quantity: +(q / 453.6).toFixed(2), unit: "lb" };
      return { quantity: +(q / 28.35).toFixed(2), unit: "oz" };
    }
  }

  // Metric display
  if (unit === "ml" && q >= 1000) {
    return { quantity: +(q / 1000).toFixed(2), unit: "l" };
  }

  if (unit === "g" && q >= 1000) {
    return { quantity: +(q / 1000).toFixed(2), unit: "kg" };
  }

  return { quantity: q, unit };
}