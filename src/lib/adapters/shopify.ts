import Papa from "papaparse";
import type {
  DataAdapter,
  ShopifyRawRow,
  ShopifyNormalized,
  ValidationResult,
} from "./types";

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export const shopifyAdapter: DataAdapter<ShopifyRawRow, ShopifyNormalized> = {
  source: "shopify",
  requiredColumns: ["total_sales", "total_orders"],

  parseCSV(raw: string): ShopifyRawRow[] {
    const result = Papa.parse<ShopifyRawRow>(raw, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    return result.data;
  },

  normalize(rows: ShopifyRawRow[]): ShopifyNormalized {
    // Shopify exports often have a single summary row or multiple daily rows
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalSessions = 0;
    let aovSum = 0;
    let returningSum = 0;
    let conversionSum = 0;

    for (const row of rows) {
      totalRevenue += num(row.total_sales);
      totalOrders += num(row.total_orders);
      totalSessions += num(row.online_store_sessions);
      aovSum += num(row.average_order_value);
      returningSum += num(row.returning_customer_rate);
      conversionSum += num(row.online_store_conversion_rate);
    }

    const count = rows.length || 1;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : aovSum / count,
      returningCustomerRate: returningSum / count,
      sessions: totalSessions,
      conversionRate: conversionSum / count,
    };
  },

  validate(data: ShopifyNormalized): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.totalRevenue === 0 && data.totalOrders === 0) {
      errors.push("No revenue or order data found");
    }
    if (data.totalOrders > 0 && data.totalRevenue === 0) {
      warnings.push("Orders found but revenue is $0 — check data");
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};
