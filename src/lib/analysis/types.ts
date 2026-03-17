export interface MetricDelta {
  label: string;
  current: number;
  previous: number | null;
  delta: number | null;
  deltaPercent: number | null;
  format: "currency" | "number" | "percent" | "ratio";
  isAnomaly: boolean;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate: number | null;
}

export interface CampaignRow {
  name: string;
  spend: number;
  roas: number;
  ctr: number;
  cpm: number;
  purchases: number;
  costPerPurchase: number;
}

export interface AnalysisResult {
  kpis: MetricDelta[];
  funnel: FunnelStep[];
  campaigns: CampaignRow[];
  anomalies: string[];
  dataCompleteness: {
    meta: boolean;
    ga4: boolean;
    shopify: boolean;
    klaviyo: boolean;
  };
}
