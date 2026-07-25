import {
  getCoachFallback,
  getCoachWelcome,
  getCompatCoachReply,
  getQuickQuestions,
  retrieve,
} from "@workspace/game-knowledge";

export interface CoachChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachChatResult {
  reply: string;
  conceptsUsed: string[];
  source: "llm" | "knowledge" | "canned" | "offline";
}

export async function sendCoachMessage(input: {
  gameId: string;
  message: string;
  history?: CoachChatMessage[];
}): Promise<CoachChatResult> {
  if (import.meta.env.VITE_COACH_MOCK === "true") {
    return offlineCoachReply(input.gameId, input.message);
  }

  try {
    const response = await fetch("/api/coach/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Coach API ${response.status}`);
    }

    return (await response.json()) as CoachChatResult;
  } catch {
    return offlineCoachReply(input.gameId, input.message);
  }
}

function offlineCoachReply(gameId: string, message: string): CoachChatResult {
  const canned = getCompatCoachReply(gameId, message);
  if (canned) {
    return {
      reply: canned,
      conceptsUsed: retrieve(gameId, message).matchedConceptIds,
      source: "canned",
    };
  }

  const retrieved = retrieve(gameId, message);
  if (retrieved.concepts.length > 0) {
    const top = retrieved.concepts[0];
    return {
      reply: [top.definition, top.whyItWorks].filter(Boolean).join("\n\n"),
      conceptsUsed: retrieved.matchedConceptIds,
      source: "offline",
    };
  }

  return {
    reply: getCoachFallback(gameId),
    conceptsUsed: [],
    source: "offline",
  };
}

export { getCoachWelcome, getQuickQuestions };
