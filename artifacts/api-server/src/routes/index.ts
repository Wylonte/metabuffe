import { Router } from "express";
import healthRouter from "./health.js";
import videoRouter from "./video.js";

const router = Router();

router.use(healthRouter);
router.use(videoRouter);

export default router;
