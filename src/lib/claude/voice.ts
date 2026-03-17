export const BANNED_WORDS = [
  "synergy",
  "synergize",
  "leverage",
  "leveraging",
  "disrupt",
  "disruption",
  "disruptive",
  "pivot",
  "pivoting",
  "game-changer",
  "game-changing",
  "paradigm",
  "paradigm shift",
  "circle back",
  "move the needle",
  "low-hanging fruit",
  "boil the ocean",
  "deep dive",
  "touch base",
  "bandwidth",
  "holistic",
  "robust",
  "scalable",
  "cutting-edge",
  "bleeding-edge",
  "best-in-class",
  "world-class",
  "next-level",
  "north star",
  "ecosystem",
  "thought leader",
  "value-add",
  "net-net",
];

export const GEA_VOICE_RULES = `
Voice guidelines for GEA Growth Control Room outputs:
- Be direct and specific. Lead with the metric, then the implication.
- Use plain English. If a marketer wouldn't say it in a meeting, don't write it.
- Confidence without hype. State what the data shows, not what you hope.
- Short sentences. Each recommendation should be scannable in under 10 seconds.
- Always cite the specific numbers that support your recommendation.
- Never use these words: ${BANNED_WORDS.join(", ")}
`;

export function enforceBannedWords(text: string): string {
  let cleaned = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "___");
  }
  return cleaned;
}
