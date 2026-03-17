import { NextResponse } from "next/server";
import { analyzeWeeklyData } from "@/lib/analysis/metrics";
import type { WeeklyData } from "@/lib/adapters/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentWeek, previousWeek } = body as {
      currentWeek: WeeklyData;
      previousWeek: WeeklyData | null;
    };

    const result = analyzeWeeklyData(currentWeek, previousWeek);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
