import app from "./app.js";
import { logger } from "./lib/logger.js";

// Vercel invokes the exported Express app as a serverless function.
export default app;

// Long-running hosts (Replit, local `node dist/index.mjs`) still listen on PORT.
if (!process.env.VERCEL) {
  const rawPort = process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}
