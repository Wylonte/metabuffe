import { Router } from "express";
import healthRouter from "./health.js";
import videoRouter from "./video.js";
import coachRouter from "./coach.js";

const router = Router();

router.use(healthRouter);
router.use(videoRouter);
router.use(coachRouter);

export default router;
