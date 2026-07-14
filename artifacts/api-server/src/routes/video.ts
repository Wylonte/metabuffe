import { Router } from "express";
import https from "https";
import http from "http";
import { logger } from "../lib/logger.js";

const videoRouter = Router();

/** Real MP4 bytes (Dropbox dl=1 returns an HTML interstitial). */
const TRAILER_URL =
  "https://media.githubusercontent.com/media/Wylonte/metabuffe/main/artifacts/metabuffed/public/trailer.mp4";

// Stream the trailer through the server, forwarding Range headers so
// the browser can seek and the <video> element works correctly.
videoRouter.get("/video/trailer", (req, res) => {
  const upstreamHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "video/mp4, video/*, */*",
  };
  if (req.headers.range) {
    upstreamHeaders["Range"] = req.headers.range as string;
  }

  const fetch = (url: string, hops = 6): void => {
    if (hops === 0) {
      res.status(502).end("Too many redirects");
      return;
    }

    const lib = url.startsWith("https") ? https : http;
    const parsed = new URL(url);

    const proxyReq = lib.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: upstreamHeaders,
      },
      (proxyRes) => {
        const status = proxyRes.statusCode ?? 502;

        if ([301, 302, 303, 307, 308].includes(status) && proxyRes.headers.location) {
          proxyReq.destroy();
          const next = proxyRes.headers.location.startsWith("http")
            ? proxyRes.headers.location
            : new URL(proxyRes.headers.location, url).toString();
          fetch(next, hops - 1);
          return;
        }

        const upstreamType = String(proxyRes.headers["content-type"] || "");
        if (upstreamType.includes("text/html")) {
          proxyRes.resume();
          logger.error({ status, upstreamType, url }, "Trailer upstream returned HTML");
          if (!res.headersSent) res.status(502).end("Invalid trailer upstream");
          return;
        }

        const send: Record<string, string> = {
          "Content-Type":
            upstreamType.includes("octet-stream") || !upstreamType
              ? "video/mp4"
              : upstreamType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        };
        if (proxyRes.headers["content-length"])
          send["Content-Length"] = proxyRes.headers["content-length"] as string;
        if (proxyRes.headers["content-range"])
          send["Content-Range"] = proxyRes.headers["content-range"] as string;

        res.writeHead(status, send);
        proxyRes.pipe(res, { end: true });
        proxyRes.on("error", (err) => {
          logger.error({ err }, "Video proxy upstream error");
        });
      },
    );

    proxyReq.on("error", (err) => {
      logger.error({ err }, "Video proxy request error");
      if (!res.headersSent) res.status(502).end("Proxy error");
    });

    proxyReq.end();
  };

  fetch(TRAILER_URL);
});

export default videoRouter;
