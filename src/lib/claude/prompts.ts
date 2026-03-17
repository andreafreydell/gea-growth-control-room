import { GEA_VOICE_RULES } from "./voice";

export const SYSTEM_PROMPT = `You are GEA's growth strategist AI. You analyze weekly marketing, site, and lifecycle data to produce actionable recommendations.

${GEA_VOICE_RULES}

Critical rules:
1. Budget moves must be conservative: never reallocate more than 20% of total weekly spend in one week unless CAC is catastrophic (>3x target CAC).
2. Use leading signals (CTR, CPM, CAC trend) combined with site conversion signals (LPV→Apply, Apply→Checkout, Checkout→Member).
3. When data is insufficient for a recommendation, output "NEEDS_DATA" instead of guessing.
4. Every recommendation MUST cite the specific metric deltas that justify it, in plain English.
5. Return valid JSON only. No markdown, no code fences.`;

export function buildBudgetMovesPrompt(analysisJson: string): string {
  return `Given this weekly analysis data:
${analysisJson}

Generate exactly 3 budget moves. Each must be one of: keep, scale, or cut.
For each, specify the target (campaign or channel), rationale citing specific metrics, and optional reallocation amount.

Conservative rule: never recommend moving more than 20% of total weekly spend unless CAC exceeds 3x the average.

Return JSON array:
[{"action": "keep|scale|cut", "target": "string", "rationale": "string", "amount": "string or null"}]`;
}

export function buildCreativeAnglesPrompt(analysisJson: string): string {
  return `Given this weekly analysis data:
${analysisJson}

Generate exactly 5 creative angles to test next week. Each should be a specific ad concept, not a vague idea.
Include target audience, ad format, and rationale tied to this week's data.

Return JSON array:
[{"angle": "string", "targetAudience": "string", "format": "string", "rationale": "string"}]`;
}

export function buildLifecycleExperimentsPrompt(analysisJson: string): string {
  return `Given this weekly analysis data:
${analysisJson}

Generate exactly 3 lifecycle experiments to run next week.
Each must have a specific hypothesis, channel (Email, SMS, or Push), and a metric to watch.

Return JSON array:
[{"name": "string", "hypothesis": "string", "channel": "Email|SMS|Push", "metricToWatch": "string"}]`;
}

export function buildExecSummaryPrompt(
  analysisJson: string,
  budgetMoves: string,
  creativeAngles: string,
  lifecycleExperiments: string
): string {
  return `Given this weekly analysis and recommendations:

ANALYSIS:
${analysisJson}

BUDGET MOVES:
${budgetMoves}

CREATIVE ANGLES:
${creativeAngles}

LIFECYCLE EXPERIMENTS:
${lifecycleExperiments}

Write a brief executive summary (3-5 sentences) covering:
1. Overall performance this week vs last
2. The single biggest opportunity
3. The single biggest risk

Also write a one-sentence risks summary.

Return JSON:
{"execSummary": "string", "risks": "string"}`;
}
