export type VideoPlatform = "youtube" | "twitch";

export interface ParsedVideoLink {
  platform: VideoPlatform;
  id: string;
  canonicalUrl: string;
}

export interface VideoLinkMetadata {
  platform: VideoPlatform;
  id: string;
  canonicalUrl: string;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
}

export function parseVideoLink(raw: string): ParsedVideoLink | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    let id = url.searchParams.get("v") ?? undefined;

    if (!id && url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/").filter(Boolean)[1];
    }
    if (!id && url.pathname.startsWith("/live/")) {
      id = url.pathname.split("/").filter(Boolean)[1];
    }
    if (!id && url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/").filter(Boolean)[1];
    }

    if (id) {
      return {
        platform: "youtube",
        id,
        canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (id) {
      return {
        platform: "youtube",
        id,
        canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  if (host === "clips.twitch.tv") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (id) {
      return {
        platform: "twitch",
        id,
        canonicalUrl: `https://clips.twitch.tv/${id}`,
      };
    }
  }

  if (host === "twitch.tv" || host === "m.twitch.tv") {
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] === "videos" && parts[1]) {
      return {
        platform: "twitch",
        id: parts[1],
        canonicalUrl: `https://www.twitch.tv/videos/${parts[1]}`,
      };
    }

    if (parts.length >= 3 && parts[1] === "clip" && parts[2]) {
      return {
        platform: "twitch",
        id: parts[2],
        canonicalUrl: `https://www.twitch.tv/${parts[0]}/clip/${parts[2]}`,
      };
    }
  }

  return null;
}

export function isSupportedVideoLink(raw: string): boolean {
  return parseVideoLink(raw) !== null;
}

async function fetchOEmbed(
  endpoint: string,
  headers?: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(endpoint, { headers });
  if (!response.ok) return null;
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function resolveVideoLinkMetadata(
  link: ParsedVideoLink,
): Promise<VideoLinkMetadata> {
  const oembedUrl =
    link.platform === "youtube"
      ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(link.canonicalUrl)}`
      : `https://api.twitch.tv/oembed?url=${encodeURIComponent(link.canonicalUrl)}`;

  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const headers =
    link.platform === "twitch" && twitchClientId
      ? { "Client-ID": twitchClientId }
      : undefined;

  const data = await fetchOEmbed(oembedUrl, headers);

  return {
    platform: link.platform,
    id: link.id,
    canonicalUrl: link.canonicalUrl,
    title: typeof data?.title === "string" ? data.title : undefined,
    author: typeof data?.author_name === "string" ? data.author_name : undefined,
    thumbnailUrl:
      typeof data?.thumbnail_url === "string" ? data.thumbnail_url : undefined,
  };
}

export async function resolveVideoLink(
  raw: string,
): Promise<VideoLinkMetadata> {
  const parsed = parseVideoLink(raw);
  if (!parsed) {
    throw new Error(
      "Unsupported video link. Paste a YouTube or Twitch clip/VOD URL.",
    );
  }

  return resolveVideoLinkMetadata(parsed);
}
