import type { WeeklyData } from "../adapters/types";
import type {
  AnalysisResult,
  MetricDelta,
  FunnelStep,
  CampaignRow,
} from "./types";

const ANOMALY_THRESHOLD = 15; // percent WoW swing

function makeDelta(
  label: string,
  current: number,
  previous: number | null,
  format: MetricDelta["format"]
): MetricDelta {
  const delta = previous !== null ? current - previous : null;
  const deltaPercent =
    previous !== null && previous !== 0
      ? ((current - previous) / previous) * 100
      : null;
  const isAnomaly =
    deltaPercent !== null && Math.abs(deltaPercent) >= ANOMALY_THRESHOLD;

  return { label, current, previous, delta, deltaPercent, format, isAnomaly };
}

export function analyzeWeeklyData(
  current: WeeklyData,
  previous: WeeklyData | null
): AnalysisResult {
  const kpis: MetricDelta[] = [];
  const anomalies: string[] = [];

  // Total Spend (Meta)
  if (current.meta) {
    kpis.push(
      makeDelta(
        "Total Ad Spend",
        current.meta.totalSpend,
        previous?.meta?.totalSpend ?? null,
        "currency"
      )
    );
    kpis.push(
      makeDelta(
        "ROAS",
        current.meta.roas,
        previous?.meta?.roas ?? null,
        "ratio"
      )
    );
    kpis.push(
      makeDelta(
        "CAC",
        current.meta.avgCostPerPurchase,
        previous?.meta?.avgCostPerPurchase ?? null,
        "currency"
      )
    );
    kpis.push(
      makeDelta(
        "Avg CPM",
        current.meta.avgCPM,
        previous?.meta?.avgCPM ?? null,
        "currency"
      )
    );
    kpis.push(
      makeDelta(
        "Avg CTR",
        current.meta.avgCTR,
        previous?.meta?.avgCTR ?? null,
        "percent"
      )
    );
  }

  // Revenue (Shopify)
  if (current.shopify) {
    kpis.push(
      makeDelta(
        "Total Revenue",
        current.shopify.totalRevenue,
        previous?.shopify?.totalRevenue ?? null,
        "currency"
      )
    );
    kpis.push(
      makeDelta(
        "Orders",
        current.shopify.totalOrders,
        previous?.shopify?.totalOrders ?? null,
        "number"
      )
    );
    kpis.push(
      makeDelta(
        "AOV",
        current.shopify.averageOrderValue,
        previous?.shopify?.averageOrderValue ?? null,
        "currency"
      )
    );
  }

  // Lifecycle revenue (Klaviyo)
  if (current.klaviyo) {
    kpis.push(
      makeDelta(
        "Lifecycle Revenue",
        current.klaviyo.totalRevenue,
        previous?.klaviyo?.totalRevenue ?? null,
        "currency"
      )
    );
    kpis.push(
      makeDelta(
        "Email Open Rate",
        current.klaviyo.avgOpenRate,
        previous?.klaviyo?.avgOpenRate ?? null,
        "percent"
      )
    );
  }

  // Funnel (GA4)
  const funnel: FunnelStep[] = [];
  if (current.ga4) {
    const g = current.ga4;
    funnel.push({ label: "Landing Page Views", value: g.landingPageViews, rate: null });
    funnel.push({
      label: "Applications",
      value: g.applications,
      rate: g.lpvToApplyRate,
    });
    funnel.push({
      label: "Checkout Starts",
      value: g.checkoutStarts,
      rate: g.applyToCheckoutRate,
    });
    funnel.push({
      label: "Purchases",
      value: g.purchases,
      rate: g.checkoutToPurchaseRate,
    });
  }

  // Campaigns table (Meta)
  const campaigns: CampaignRow[] = (current.meta?.campaigns ?? []).map((c) => ({
    name: c.name,
    spend: c.spend,
    roas: c.roas,
    ctr: c.ctr,
    cpm: c.cpm,
    purchases: c.purchases,
    costPerPurchase: c.costPerPurchase,
  }));

  // Collect anomalies
  for (const kpi of kpis) {
    if (kpi.isAnomaly) {
      const dir = (kpi.deltaPercent ?? 0) > 0 ? "up" : "down";
      anomalies.push(
        `${kpi.label} is ${dir} ${Math.abs(kpi.deltaPercent ?? 0).toFixed(1)}% WoW`
      );
    }
  }

  return {
    kpis,
    funnel,
    campaigns,
    anomalies,
    dataCompleteness: {
      meta: current.meta !== null,
      ga4: current.ga4 !== null,
      shopify: current.shopify !== null,
      klaviyo: current.klaviyo !== null,
    },
  };
}
