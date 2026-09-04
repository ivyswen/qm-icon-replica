import { describe, expect, it } from "vitest";
import {
  createEmojiSvg,
  createImageSvg,
  parseRawSvgInput,
  HOT_EMOJIS,
  EMOJI_CATEGORIES,
} from "./emoji";

describe("Emoji 与扩展素材工具套件", () => {
  it("EMOJI_CATEGORIES 应该包含 8 大分类且每类至少 30 个 Emoji", () => {
    expect(EMOJI_CATEGORIES.length).toBe(8);
    const categoryIds = EMOJI_CATEGORIES.map(c => c.id);
    expect(categoryIds).toEqual([
      "popular",
      "smileys",
      "animals",
      "food",
      "activities",
      "travel",
      "objects",
      "symbols",
    ]);
    for (const cat of EMOJI_CATEGORIES) {
      expect(cat.emojis.length).toBeGreaterThanOrEqual(30);
    }
  });

  it("HOT_EMOJIS 应该包含 50 个以上热门表情", () => {
    expect(HOT_EMOJIS.length).toBeGreaterThanOrEqual(50);
    expect(HOT_EMOJIS).toContain("🚀");
    expect(HOT_EMOJIS).toContain("⚡");
  });

  it("createEmojiSvg 应该生成包含 text 和 emoji 的标准 SVG", () => {
    const svg = createEmojiSvg("🚀");
    expect(svg).toContain("<svg");
    expect(svg).toContain("<text");
    expect(svg).toContain("🚀");
    expect(svg).toContain("font-family");
  });

  it("createImageSvg 应该生成包含 image 标签的嵌入式 SVG", () => {
    const svg = createImageSvg(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
    );
    expect(svg).toContain("<image");
    expect(svg).toContain(
      'href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="'
    );
  });

  it("parseRawSvgInput 能够正确解析完整 SVG 与单个路径 d", () => {
    const rawSvg = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
    expect(parseRawSvgInput(rawSvg).svg).toContain("<circle");

    const pathOnly = "M12 2L2 22h20L12 2z";
    const parsedPath = parseRawSvgInput(pathOnly);
    expect(parsedPath.svg).toContain("<path");
    expect(parsedPath.svg).toContain(pathOnly);
  });
});
