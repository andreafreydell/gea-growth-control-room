import Papa from "papaparse";
import type {
  DataAdapter,
  GA4RawRow,
  GA4Normalized,
  ValidationResult,
} from "./types";

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[,%]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

const EVENT_MAP: Record<string, keyof Pick<GA4Normalized, "landingPageViews" | "applications" | "checkoutStarts" | "purchases">> = {
  landing_page_view: "landingPageViews",
  page_view: "landingPageViews",
  lpv: "landingPageViews",
  apply: "applications",
  application: "applications",
  begin_checkout: "checkoutStarts",
  checkout_start: "checkoutStarts",
  purchase: "purchases",
};

export const ga4Adapter: DataAdapter<GA4RawRow, GA4Normalized> = {
  source: "ga4",
  requiredColumns: ["event_name", "event_count"],

  parseCSV(raw: string): GA4RawRow[] {
    const result = Papa.parse<GA4RawRow>(raw, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    return result.data;
  },

  normalize(rows: GA4RawRow[]): GA4Normalized {
    const counts: Record<string, number> = {
      landingPageViews: 0,
      applications: 0,
      checkoutStarts: 0,
      purchases: 0,
    };

    for (const row of rows) {
      const eventKey = row.event_name?.toLowerCase().trim();
      const mapped = EVENT_MAP[eventKey];
      if (mapped) {
        counts[mapped] += num(row.event_count);
      }
    }

    const lpv = counts.landingPageViews;
    const apply = counts.applications;
    const checkout = counts.checkoutStarts;
    const purchase = counts.purchases;

    return {
      landingPageViews: lpv,
      applications: apply,
      checkoutStarts: checkout,
      purchases: purchase,
      lpvToApplyRate: lpv > 0 ? (apply / lpv) * 100 : 0,
      applyToCheckoutRate: apply > 0 ? (checkout / apply) * 100 : 0,
      checkoutToPurchaseRate: checkout > 0 ? (purchase / checkout) * 100 : 0,
      overallConversionRate: lpv > 0 ? (purchase / lpv) * 100 : 0,
    };
  },

  validate(data: GA4Normalized): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
      data.landingPageViews === 0 &&
      data.applications === 0 &&
      data.checkoutStarts === 0 &&
      data.purchases === 0
    ) {
      errors.push("No event data found — check CSV column mapping");
    }
    if (data.landingPageViews === 0 && data.purchases > 0) {
      warnings.push("Purchases found but no landing page views — funnel may be incomplete");
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};
