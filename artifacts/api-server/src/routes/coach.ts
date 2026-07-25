import { Router } from "express";
import { handleAnalyze, handleCoachChat } from "../services/coach.js";
import { logger } from "../lib/logger.js";

const coachRouter = Router();

coachRouter.post("/coach/chat", async (req, res) => {
  try {
    const { gameId, message, history } = req.body ?? {};
    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ error: "gameId is required" });
      return;
    }
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const result = await handleCoachChat({
      gameId,
      message,
      history: Array.isArray(history) ? history : undefined,
    });

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Coach chat failed");
    res.status(400).json({
      error: err instanceof Error ? err.message : "Coach chat failed",
    });
  }
});

coachRouter.post("/analyze", async (req, res) => {
  try {
    const { gameId, fileName, durationSeconds, observations } = req.body ?? {};
    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ error: "gameId is required" });
      return;
    }

    const result = await handleAnalyze({
      gameId,
      fileName: typeof fileName === "string" ? fileName : undefined,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : undefined,
      observations: Array.isArray(observations) ? observations : undefined,
    });

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Analyze failed");
    res.status(400).json({
      error: err instanceof Error ? err.message : "Analyze failed",
    });
  }
});

export default coachRouter;
