import { describe, expect, it } from "vitest";
import { getBuiltinIcons, getDefaultStarterIcons, getQueryCandidates } from "./api";
import { BUILTIN_ICONS, ICON_QUERY_ALIASES } from "./data/builtinIcons";

describe("icons system - 图标检索与别名展开 (TDD)", () => {
  it("内置 64 个图标完整加载且每个图标均有合法的 d 路径", () => {
    expect(BUILTIN_ICONS.length).toBeGreaterThanOrEqual(64);
    for (const icon of BUILTIN_ICONS) {
      expect(icon.n).toBeTruthy();
      expect(icon.label).toBeTruthy();
      expect(icon.d).toBeTruthy();
      expect(icon.d.length).toBeGreaterThan(10);
    }
  });

  it("中文关键词搜索可精确匹配内置图标（如 '火箭', '音乐', '手机'）", () => {
    const rocketHits = getBuiltinIcons("火箭");
    expect(rocketHits.some((i) => i.name === "rocket")).toBe(true);

    const musicHits = getBuiltinIcons("音乐");
    expect(musicHits.some((i) => i.name === "music")).toBe(true);

    const phoneHits = getBuiltinIcons("手机");
    expect(phoneHits.some((i) => i.name === "phone")).toBe(true);
  });

  it("首屏 starter icons 集合包含 64 个离线图标与 52 个在线精选图标", () => {
    const starter = getDefaultStarterIcons();
    expect(starter.length).toBe(116);
    expect(starter.some((i) => i.isBuiltin)).toBe(true);
    expect(starter.some((i) => !i.isBuiltin)).toBe(true);
  });

  it("中文别名字典能将中文转换为英文查询词", () => {
    const candidates = getQueryCandidates("音乐");
    expect(candidates).toContain("music");
  });

  it("createTextSvg 支持空文本、单字、多字并自适应字号", async () => {
    const { createTextSvg } = await import("./textIcon");
    const emptySvg = createTextSvg("");
    expect(emptySvg).toContain("<text");
    expect(emptySvg).toContain("></text>");

    const singleSvg = createTextSvg("智");
    expect(singleSvg).toContain("font-size=\"58\"");
    expect(singleSvg).toContain(">智</text>");

    const doubleSvg = createTextSvg("QM");
    expect(doubleSvg).toContain("font-size=\"46\"");
    expect(doubleSvg).toContain(">QM</text>");
  });
});

