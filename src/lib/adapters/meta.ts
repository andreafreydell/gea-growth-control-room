import Papa from "papaparse";
import type {
  DataAdapter,
  MetaRawRow,
  MetaNormalized,
  ValidationResult,
} from "./types";

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export const metaAdapter: DataAdapter<MetaRawRow, MetaNormalized> = {
  source: "meta",
  requiredColumns: [
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "purchases",
    "purchase_value",
  ],

  parseCSV(raw: string): MetaRawRow[] {
    const result = Papa.parse<MetaRawRow>(raw, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    return result.data;
  },

  normalize(rows: MetaRawRow[]): MetaNormalized {
    const campaigns = rows.map((r) => {
      const spend = num(r.spend);
      const purchaseValue = num(r.purchase_value);
      return {
        name: r.campaign_name || "Unknown",
        spend,
        impressions: num(r.impressions),
        clicks: num(r.clicks),
        cpm: num(r.cpm),
        ctr: num(r.ctr),
        cpc: num(r.cpc),
        purchases: num(r.purchases),
        purchaseValue,
        costPerPurchase: num(r.cost_per_purchase),
        roas: spend > 0 ? purchaseValue / spend : 0,
      };
    });

    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalPurchases = campaigns.reduce((s, c) => s + c.purchases, 0);
    const totalPurchaseValue = campaigns.reduce(
      (s, c) => s + c.purchaseValue,
      0
    );

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      avgCPM: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
      avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
      totalPurchases,
      totalPurchaseValue,
      avgCostPerPurchase: totalPurchases > 0 ? totalSpend / totalPurchases : 0,
      roas: totalSpend > 0 ? totalPurchaseValue / totalSpend : 0,
      campaigns,
    };
  },

  validate(data: MetaNormalized): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.campaigns.length === 0) {
      errors.push("No campaign data found");
    }
    if (data.totalSpend === 0) {
      warnings.push("Total spend is $0 — check data");
    }
    if (data.totalPurchaseValue === 0) {
      warnings.push("No purchase revenue recorded");
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};
