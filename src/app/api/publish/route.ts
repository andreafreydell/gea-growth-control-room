import { NextResponse } from "next/server";
import { publishToNotion } from "@/lib/notion/publish";
import type { AnalysisResult } from "@/lib/analysis/types";
import type { Recommendations } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysis, recommendations, weekOf, existingDbIds } = body as {
      analysis: AnalysisResult;
      recommendations: Recommendations;
      weekOf: string;
      existingDbIds?: {
        weeklyReport: string;
        creativeBriefs: string;
        lifecycleExperiments: string;
      };
    };

    const notionApiKey = process.env.NOTION_API_KEY;
    const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

    if (!notionApiKey || !parentPageId) {
      return NextResponse.json(
        { error: "NOTION_API_KEY and NOTION_PARENT_PAGE_ID must be configured in .env.local" },
        { status: 500 }
      );
    }

    const result = await publishToNotion(
      { notionApiKey, parentPageId, weekOf },
      analysis,
      recommendations,
      existingDbIds
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    );
  }
}
