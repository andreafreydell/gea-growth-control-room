import { NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/claude/generate";
import type { AnalysisResult } from "@/lib/analysis/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysis } = body as { analysis: AnalysisResult };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const recommendations = await generateRecommendations(analysis, apiKey);
    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Recommendation generation failed",
      },
      { status: 500 }
    );
  }
}
