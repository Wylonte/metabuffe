/** Client-side check before calling the API (server validates fully). */
export function isSupportedVideoLink(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be"
    ) {
      return true;
    }

    if (
      host === "twitch.tv" ||
      host === "m.twitch.tv" ||
      host === "clips.twitch.tv"
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
