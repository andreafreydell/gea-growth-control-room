import {
  createDatabases,
  createWeeklyReportPage,
  createCreativeBriefPage,
  createLifecycleExperimentPage,
} from "./client";
import type { Recommendations } from "../store";
import type { AnalysisResult } from "../analysis/types";

interface PublishConfig {
  notionApiKey: string;
  parentPageId: string;
  weekOf: string;
}

interface PublishResult {
  success: boolean;
  databaseIds: {
    weeklyReport: string;
    creativeBriefs: string;
    lifecycleExperiments: string;
  };
  pageUrls: string[];
  errors: string[];
}

function buildPaidSummary(analysis: AnalysisResult): string {
  const spend = analysis.kpis.find((k) => k.label === "Total Ad Spend");
  const roas = analysis.kpis.find((k) => k.label === "ROAS");
  const cac = analysis.kpis.find((k) => k.label === "CAC");

  const parts: string[] = [];
  if (spend) {
    parts.push(
      `Total spend: $${spend.current.toFixed(2)}${
        spend.deltaPercent !== null
          ? ` (${spend.deltaPercent > 0 ? "+" : ""}${spend.deltaPercent.toFixed(1)}% WoW)`
          : ""
      }`
    );
  }
  if (roas) {
    parts.push(`ROAS: ${roas.current.toFixed(2)}x`);
  }
  if (cac) {
    parts.push(`CAC: $${cac.current.toFixed(2)}`);
  }

  return parts.join(". ") || "NEEDS_DATA";
}

function buildSiteSummary(analysis: AnalysisResult): string {
  if (analysis.funnel.length === 0) return "NEEDS_DATA";

  return analysis.funnel
    .map((step) =>
      step.rate !== null
        ? `${step.label}: ${step.value.toLocaleString()} (${step.rate.toFixed(1)}% conv)`
        : `${step.label}: ${step.value.toLocaleString()}`
    )
    .join(" → ");
}

function buildLifecycleSummary(analysis: AnalysisResult): string {
  const rev = analysis.kpis.find((k) => k.label === "Lifecycle Revenue");
  const openRate = analysis.kpis.find((k) => k.label === "Email Open Rate");

  const parts: string[] = [];
  if (rev) {
    parts.push(`Lifecycle revenue: $${rev.current.toFixed(2)}`);
  }
  if (openRate) {
    parts.push(`Avg open rate: ${openRate.current.toFixed(1)}%`);
  }

  return parts.join(". ") || "NEEDS_DATA";
}

function buildBudgetMovesText(recs: Recommendations): string {
  return recs.budgetMoves
    .map(
      (m) =>
        `[${m.action.toUpperCase()}] ${m.target}: ${m.rationale}${m.amount ? ` (${m.amount})` : ""}`
    )
    .join("\n\n");
}

export async function publishToNotion(
  config: PublishConfig,
  analysis: AnalysisResult,
  recommendations: Recommendations,
  existingDbIds?: {
    weeklyReport: string;
    creativeBriefs: string;
    lifecycleExperiments: string;
  }
): Promise<PublishResult> {
  const errors: string[] = [];
  const pageUrls: string[] = [];

  const notionConfig = {
    apiKey: config.notionApiKey,
    parentPageId: config.parentPageId,
  };

  // Step 1: Create or reuse databases
  let dbIds = existingDbIds;
  if (!dbIds) {
    try {
      dbIds = await createDatabases(notionConfig);
    } catch (e) {
      return {
        success: false,
        databaseIds: { weeklyReport: "", creativeBriefs: "", lifecycleExperiments: "" },
        pageUrls: [],
        errors: [`Failed to create databases: ${e instanceof Error ? e.message : String(e)}`],
      };
    }
  }

  // Step 2: Create creative brief pages (up to 2)
  const creativeBriefIds: string[] = [];
  const briefsToCreate = recommendations.creativeAngles.slice(0, 2);
  for (const angle of briefsToCreate) {
    try {
      const page = await createCreativeBriefPage(
        notionConfig,
        dbIds.creativeBriefs,
        {
          name: angle.angle,
          weekOf: config.weekOf,
          angle: angle.angle,
          rationale: angle.rationale,
          targetAudience: angle.targetAudience,
          format: angle.format,
        }
      );
      creativeBriefIds.push(page.id);
      if (page.url) pageUrls.push(page.url);
    } catch (e) {
      errors.push(
        `Failed to create creative brief: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  // Step 3: Create lifecycle experiment pages (up to 3)
  for (const exp of recommendations.lifecycleExperiments.slice(0, 3)) {
    try {
      const page = await createLifecycleExperimentPage(
        notionConfig,
        dbIds.lifecycleExperiments,
        {
          name: exp.name,
          weekOf: config.weekOf,
          hypothesis: exp.hypothesis,
          channel: exp.channel,
          metricToWatch: exp.metricToWatch,
        }
      );
      if (page.url) pageUrls.push(page.url);
    } catch (e) {
      errors.push(
        `Failed to create lifecycle experiment: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  // Step 4: Create weekly report page
  try {
    const reportPage = await createWeeklyReportPage(
      notionConfig,
      dbIds.weeklyReport,
      {
        weekOf: config.weekOf,
        execSummary: recommendations.execSummary,
        paidSummary: buildPaidSummary(analysis),
        siteSummary: buildSiteSummary(analysis),
        lifecycleSummary: buildLifecycleSummary(analysis),
        budgetMoves: buildBudgetMovesText(recommendations),
        risks: recommendations.risks,
        creativeBriefIds,
      }
    );
    if (reportPage.url) pageUrls.unshift(reportPage.url);
  } catch (e) {
    errors.push(
      `Failed to create weekly report: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  return {
    success: errors.length === 0,
    databaseIds: dbIds,
    pageUrls,
    errors,
  };
}
