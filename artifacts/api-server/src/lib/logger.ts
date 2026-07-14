import { pino } from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = Boolean(process.env.VERCEL);

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  // Avoid pino-pretty worker threads on Vercel / production.
  ...(isProduction || isVercel
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
