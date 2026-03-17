import {
  WEEKLY_REPORT_SCHEMA,
  CREATIVE_BRIEFS_SCHEMA,
  LIFECYCLE_EXPERIMENTS_SCHEMA,
} from "./schemas";

interface NotionConfig {
  apiKey: string;
  parentPageId: string;
}

interface DatabaseIds {
  weeklyReport: string;
  creativeBriefs: string;
  lifecycleExperiments: string;
}

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

async function notionFetch(
  path: string,
  config: NotionConfig,
  body?: Record<string, unknown>
) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }

  return res.json();
}

function richText(content: string) {
  // Notion rich_text has a 2000 char limit per block
  const chunks: { type: "text"; text: { content: string } }[] = [];
  for (let i = 0; i < content.length; i += 2000) {
    chunks.push({
      type: "text",
      text: { content: content.slice(i, i + 2000) },
    });
  }
  return chunks.length > 0
    ? chunks
    : [{ type: "text" as const, text: { content: "" } }];
}

export async function createDatabases(
  config: NotionConfig
): Promise<DatabaseIds> {
  const parent = { type: "page_id", page_id: config.parentPageId };

  const [weeklyReport, creativeBriefs, lifecycleExperiments] =
    await Promise.all([
      notionFetch("/databases", config, {
        parent,
        title: [{ type: "text", text: { content: "GEA Weekly Growth Report" } }],
        properties: {
          Name: { title: {} },
          ...WEEKLY_REPORT_SCHEMA,
        },
      }),
      notionFetch("/databases", config, {
        parent,
        title: [{ type: "text", text: { content: "GEA Creative Briefs" } }],
        properties: CREATIVE_BRIEFS_SCHEMA,
      }),
      notionFetch("/databases", config, {
        parent,
        title: [
          { type: "text", text: { content: "GEA Lifecycle Experiments" } },
        ],
        properties: LIFECYCLE_EXPERIMENTS_SCHEMA,
      }),
    ]);

  return {
    weeklyReport: weeklyReport.id,
    creativeBriefs: creativeBriefs.id,
    lifecycleExperiments: lifecycleExperiments.id,
  };
}

export async function createCreativeBriefPage(
  config: NotionConfig,
  dbId: string,
  brief: {
    name: string;
    weekOf: string;
    angle: string;
    rationale: string;
    targetAudience: string;
    format: string;
  }
) {
  return notionFetch("/pages", config, {
    parent: { database_id: dbId },
    properties: {
      Name: { title: richText(brief.name) },
      "Week Of": { date: { start: brief.weekOf } },
      Angle: { rich_text: richText(brief.angle) },
      Rationale: { rich_text: richText(brief.rationale) },
      "Target Audience": { select: { name: brief.targetAudience } },
      Format: { select: { name: brief.format } },
      Status: { select: { name: "Draft" } },
    },
  });
}

export async function createLifecycleExperimentPage(
  config: NotionConfig,
  dbId: string,
  experiment: {
    name: string;
    weekOf: string;
    hypothesis: string;
    channel: string;
    metricToWatch: string;
  }
) {
  return notionFetch("/pages", config, {
    parent: { database_id: dbId },
    properties: {
      Name: { title: richText(experiment.name) },
      "Week Of": { date: { start: experiment.weekOf } },
      Hypothesis: { rich_text: richText(experiment.hypothesis) },
      Channel: { select: { name: experiment.channel } },
      "Metric to Watch": { rich_text: richText(experiment.metricToWatch) },
      Status: { select: { name: "Proposed" } },
    },
  });
}

export async function createWeeklyReportPage(
  config: NotionConfig,
  dbId: string,
  report: {
    weekOf: string;
    execSummary: string;
    paidSummary: string;
    siteSummary: string;
    lifecycleSummary: string;
    budgetMoves: string;
    risks: string;
    creativeBriefIds: string[];
  }
) {
  const properties: Record<string, unknown> = {
    Name: {
      title: richText(`Week of ${report.weekOf}`),
    },
    "Week Of": { date: { start: report.weekOf } },
    "Exec Summary": { rich_text: richText(report.execSummary) },
    "Paid Summary": { rich_text: richText(report.paidSummary) },
    "Site Summary": { rich_text: richText(report.siteSummary) },
    "Lifecycle Summary": { rich_text: richText(report.lifecycleSummary) },
    "Budget Moves": { rich_text: richText(report.budgetMoves) },
    Risks: { rich_text: richText(report.risks) },
  };

  return notionFetch("/pages", config, {
    parent: { database_id: dbId },
    properties,
  });
}
