export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataAdapter<TRaw, TNormalized> {
  source: DataSource;
  requiredColumns: string[];
  parseCSV(raw: string): TRaw[];
  normalize(rows: TRaw[]): TNormalized;
  validate(data: TNormalized): ValidationResult;
}

export type DataSource = "meta" | "ga4" | "shopify" | "klaviyo";

// --- Meta Ads ---
export interface MetaRawRow {
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  cpm: string;
  ctr: string;
  cpc: string;
  purchases: string;
  purchase_value: string;
  cost_per_purchase: string;
  [key: string]: string;
}

export interface MetaNormalized {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCPM: number;
  avgCTR: number;
  avgCPC: number;
  totalPurchases: number;
  totalPurchaseValue: number;
  avgCostPerPurchase: number;
  roas: number;
  campaigns: {
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    cpm: number;
    ctr: number;
    cpc: number;
    purchases: number;
    purchaseValue: number;
    costPerPurchase: number;
    roas: number;
  }[];
}

// --- GA4 ---
export interface GA4RawRow {
  event_name: string;
  event_count: string;
  [key: string]: string;
}

export interface GA4Normalized {
  landingPageViews: number;
  applications: number;
  checkoutStarts: number;
  purchases: number;
  lpvToApplyRate: number;
  applyToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallConversionRate: number;
}

// --- Shopify ---
export interface ShopifyRawRow {
  total_sales: string;
  total_orders: string;
  average_order_value: string;
  returning_customer_rate: string;
  online_store_sessions: string;
  online_store_conversion_rate: string;
  [key: string]: string;
}

export interface ShopifyNormalized {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  returningCustomerRate: number;
  sessions: number;
  conversionRate: number;
}

// --- Klaviyo ---
export interface KlaviyoRawRow {
  flow_name: string;
  revenue: string;
  recipients: string;
  open_rate: string;
  click_rate: string;
  conversion_rate: string;
  [key: string]: string;
}

export interface KlaviyoNormalized {
  totalRevenue: number;
  totalRecipients: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgConversionRate: number;
  flows: {
    name: string;
    revenue: number;
    recipients: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }[];
}

// --- Combined weekly data ---
export interface WeeklyData {
  weekOf: string;
  meta: MetaNormalized | null;
  ga4: GA4Normalized | null;
  shopify: ShopifyNormalized | null;
  klaviyo: KlaviyoNormalized | null;
}
