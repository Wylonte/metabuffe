export interface AnalyzeResult {
  grade: string;
  archetype: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  conceptsUsed: string[];
}

export async function requestGameplayAnalysis(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
}): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Analyze API ${response.status}`);
  }

  return (await response.json()) as AnalyzeResult;
}
