import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  buildBudgetMovesPrompt,
  buildCreativeAnglesPrompt,
  buildLifecycleExperimentsPrompt,
  buildExecSummaryPrompt,
} from "./prompts";
import { enforceBannedWords } from "./voice";
import type { AnalysisResult } from "../analysis/types";
import type {
  BudgetMove,
  CreativeAngle,
  LifecycleExperiment,
  Recommendations,
} from "../store";

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

async function callClaude(
  client: Anthropic,
  userPrompt: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateRecommendations(
  analysis: AnalysisResult,
  apiKey: string
): Promise<Recommendations> {
  const client = new Anthropic({ apiKey });
  const analysisJson = JSON.stringify(analysis, null, 2);

  // Generate budget moves, creative angles, and lifecycle experiments in parallel
  const [budgetRaw, creativeRaw, lifecycleRaw] = await Promise.all([
    callClaude(client, buildBudgetMovesPrompt(analysisJson)),
    callClaude(client, buildCreativeAnglesPrompt(analysisJson)),
    callClaude(client, buildLifecycleExperimentsPrompt(analysisJson)),
  ]);

  const budgetMoves: BudgetMove[] = parseJSON<
    { action: string; target: string; rationale: string; amount?: string }[]
  >(budgetRaw).map((m) => ({
    id: makeId(),
    action: m.action as BudgetMove["action"],
    target: enforceBannedWords(m.target),
    rationale: enforceBannedWords(m.rationale),
    amount: m.amount || undefined,
  }));

  const creativeAngles: CreativeAngle[] = parseJSON<
    {
      angle: string;
      targetAudience: string;
      format: string;
      rationale: string;
    }[]
  >(creativeRaw).map((a) => ({
    id: makeId(),
    angle: enforceBannedWords(a.angle),
    targetAudience: enforceBannedWords(a.targetAudience),
    format: a.format,
    rationale: enforceBannedWords(a.rationale),
  }));

  const lifecycleExperiments: LifecycleExperiment[] = parseJSON<
    {
      name: string;
      hypothesis: string;
      channel: string;
      metricToWatch: string;
    }[]
  >(lifecycleRaw).map((e) => ({
    id: makeId(),
    name: enforceBannedWords(e.name),
    hypothesis: enforceBannedWords(e.hypothesis),
    channel: e.channel as LifecycleExperiment["channel"],
    metricToWatch: e.metricToWatch,
  }));

  // Generate exec summary using all the above
  const execRaw = await callClaude(
    client,
    buildExecSummaryPrompt(
      analysisJson,
      JSON.stringify(budgetMoves),
      JSON.stringify(creativeAngles),
      JSON.stringify(lifecycleExperiments)
    )
  );

  const execData = parseJSON<{ execSummary: string; risks: string }>(execRaw);

  return {
    budgetMoves,
    creativeAngles,
    lifecycleExperiments,
    execSummary: enforceBannedWords(execData.execSummary),
    risks: enforceBannedWords(execData.risks),
  };
}
