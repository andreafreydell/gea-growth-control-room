import Papa from "papaparse";
import type {
  DataAdapter,
  KlaviyoRawRow,
  KlaviyoNormalized,
  ValidationResult,
} from "./types";

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export const klaviyoAdapter: DataAdapter<KlaviyoRawRow, KlaviyoNormalized> = {
  source: "klaviyo",
  requiredColumns: ["flow_name", "revenue"],

  parseCSV(raw: string): KlaviyoRawRow[] {
    const result = Papa.parse<KlaviyoRawRow>(raw, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    return result.data;
  },

  normalize(rows: KlaviyoRawRow[]): KlaviyoNormalized {
    const flows = rows.map((r) => ({
      name: r.flow_name || "Unknown Flow",
      revenue: num(r.revenue),
      recipients: num(r.recipients),
      openRate: num(r.open_rate),
      clickRate: num(r.click_rate),
      conversionRate: num(r.conversion_rate),
    }));

    const totalRevenue = flows.reduce((s, f) => s + f.revenue, 0);
    const totalRecipients = flows.reduce((s, f) => s + f.recipients, 0);
    const count = flows.length || 1;

    return {
      totalRevenue,
      totalRecipients,
      avgOpenRate: flows.reduce((s, f) => s + f.openRate, 0) / count,
      avgClickRate: flows.reduce((s, f) => s + f.clickRate, 0) / count,
      avgConversionRate: flows.reduce((s, f) => s + f.conversionRate, 0) / count,
      flows,
    };
  },

  validate(data: KlaviyoNormalized): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.flows.length === 0) {
      errors.push("No flow data found");
    }
    if (data.totalRevenue === 0) {
      warnings.push("Total lifecycle revenue is $0");
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};
