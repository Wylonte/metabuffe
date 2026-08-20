import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import {
  handleAnalyze,
  handleAnalyzeFrames,
  handleAnalyzeLink,
  handleAnalyzeVideoFile,
  handleCoachChat,
} from "../services/coach.js";
import { logger } from "../lib/logger.js";
import { gameplayUpload } from "../lib/upload.js";
import { cleanupUpload } from "../lib/upload-storage.js";

const coachRouter = Router();

function parseDurationSeconds(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

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
      durationSeconds: parseDurationSeconds(durationSeconds),
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

coachRouter.post(
  "/analyze/upload",
  (req: Request, res: Response, next: NextFunction) => {
    gameplayUpload.single("video")(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof Error && err.message.includes("File too large")) {
        res.status(413).json({ error: "Video file is too large" });
        return;
      }

      res.status(400).json({
        error: err instanceof Error ? err.message : "Upload failed",
      });
    });
  },
  async (req, res) => {
    const uploadedPath = req.file?.path;

    try {
      const gameId = typeof req.body?.gameId === "string" ? req.body.gameId : "";
      if (!gameId) {
        res.status(400).json({ error: "gameId is required" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "video file is required" });
        return;
      }

      const viewerSide =
        req.body?.viewerSide === "left" || req.body?.viewerSide === "right"
          ? req.body.viewerSide
          : "unknown";

      logger.info(
        {
          gameId,
          fileName: req.file.originalname,
          bytes: req.file.size,
          mimeType: req.file.mimetype,
          viewerSide,
        },
        "Gameplay video received for temporal analysis",
      );

      const result = await handleAnalyzeVideoFile({
        gameId,
        filePath: req.file.path,
        fileName: req.file.originalname,
        durationSeconds: parseDurationSeconds(req.body?.durationSeconds),
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
        viewerSide,
      });

      res.json({
        ...result,
        uploadId: req.file.filename,
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
      });
    } catch (err) {
      logger.error({ err }, "Analyze upload failed");
      res.status(400).json({
        error: err instanceof Error ? err.message : "Analyze upload failed",
      });
    } finally {
      cleanupUpload(uploadedPath);
    }
  },
);

coachRouter.post("/analyze/frames", async (req, res) => {
  try {
    const { gameId, fileName, durationSeconds, fileSizeBytes, frames, viewerSide } =
      req.body ?? {};

    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ error: "gameId is required" });
      return;
    }
    if (!Array.isArray(frames) || frames.length === 0) {
      res.status(400).json({ error: "frames array is required" });
      return;
    }

    logger.info(
      { gameId, frameCount: frames.length, fileName },
      "Gameplay frames received",
    );

    const result = await handleAnalyzeFrames({
      gameId,
      fileName: typeof fileName === "string" ? fileName : undefined,
      durationSeconds: parseDurationSeconds(durationSeconds),
      fileSizeBytes:
        typeof fileSizeBytes === "number" ? fileSizeBytes : undefined,
      frames,
      viewerSide:
        viewerSide === "left" || viewerSide === "right" ? viewerSide : "unknown",
    });

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Analyze frames failed");
    res.status(400).json({
      error: err instanceof Error ? err.message : "Analyze frames failed",
    });
  }
});

coachRouter.post("/analyze/link", async (req, res) => {
  try {
    const { gameId, url, viewerSide } = req.body ?? {};
    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ error: "gameId is required" });
      return;
    }
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "url is required" });
      return;
    }

    logger.info({ gameId, url }, "Gameplay link received");

    const result = await handleAnalyzeLink({
      gameId,
      url,
      viewerSide:
        viewerSide === "left" || viewerSide === "right" ? viewerSide : "unknown",
    });
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Analyze link failed");
    res.status(400).json({
      error: err instanceof Error ? err.message : "Analyze link failed",
    });
  }
});

export default coachRouter;
