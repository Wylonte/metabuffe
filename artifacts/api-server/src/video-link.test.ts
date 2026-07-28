import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSupportedVideoLink, parseVideoLink } from "../src/services/video-link.js";

describe("video link parser", () => {
  it("parses youtube watch URLs", () => {
    const parsed = parseVideoLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    assert.equal(parsed?.platform, "youtube");
    assert.equal(parsed?.id, "dQw4w9WgXcQ");
  });

  it("parses youtu.be URLs", () => {
    const parsed = parseVideoLink("https://youtu.be/dQw4w9WgXcQ");
    assert.equal(parsed?.platform, "youtube");
    assert.equal(parsed?.id, "dQw4w9WgXcQ");
  });

  it("parses youtube shorts", () => {
    const parsed = parseVideoLink("https://youtube.com/shorts/abc123XYZ");
    assert.equal(parsed?.platform, "youtube");
    assert.equal(parsed?.id, "abc123XYZ");
  });

  it("parses twitch clips", () => {
    const parsed = parseVideoLink("https://clips.twitch.tv/SomeClipSlug");
    assert.equal(parsed?.platform, "twitch");
    assert.equal(parsed?.id, "SomeClipSlug");
  });

  it("parses twitch VOD URLs", () => {
    const parsed = parseVideoLink("https://www.twitch.tv/videos/1234567890");
    assert.equal(parsed?.platform, "twitch");
    assert.equal(parsed?.id, "1234567890");
  });

  it("parses twitch channel clip URLs", () => {
    const parsed = parseVideoLink("https://www.twitch.tv/shroud/clip/CreativeLightWatercress");
    assert.equal(parsed?.platform, "twitch");
    assert.equal(parsed?.id, "CreativeLightWatercress");
  });

  it("rejects unsupported hosts", () => {
    assert.equal(parseVideoLink("https://example.com/video"), null);
    assert.equal(isSupportedVideoLink("https://example.com/video"), false);
  });
});
