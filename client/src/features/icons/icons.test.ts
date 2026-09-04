import { describe, expect, it } from "vitest";
import {
  getBuiltinIcons,
  getDefaultStarterIcons,
  getQueryCandidates,
} from "./api";
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
    expect(rocketHits.some(i => i.name === "rocket")).toBe(true);

    const musicHits = getBuiltinIcons("音乐");
    expect(musicHits.some(i => i.name === "music")).toBe(true);

    const phoneHits = getBuiltinIcons("手机");
    expect(phoneHits.some(i => i.name === "phone")).toBe(true);
  });

  it("首屏 starter icons 集合包含 64 个离线图标与 52 个在线精选图标", () => {
    const starter = getDefaultStarterIcons();
    expect(starter.length).toBe(116);
    expect(starter.some(i => i.isBuiltin)).toBe(true);
    expect(starter.some(i => !i.isBuiltin)).toBe(true);
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
    expect(singleSvg).toContain('font-size="58"');
    expect(singleSvg).toContain(">智</text>");

    const doubleSvg = createTextSvg("QM");
    expect(doubleSvg).toContain('font-size="46"');
    expect(doubleSvg).toContain(">QM</text>");
  });

  it("图标多级缓存：支持写入、读取、清空与变更订阅", async () => {
    const { setCachedIcon, getCachedIcon, clearIconCache, subscribeIconCache } =
      await import("./api");
    clearIconCache();

    let notifiedId = "";
    let notifiedBody = "";
    const unsub = subscribeIconCache((id, data) => {
      notifiedId = id;
      notifiedBody = data.body;
    });

    setCachedIcon("test:icon-a", {
      body: '<path d="M0 0"/>',
      viewBox: "0 0 24 24",
    });
    expect(notifiedId).toBe("test:icon-a");
    expect(notifiedBody).toBe('<path d="M0 0"/>');

    const cached = getCachedIcon("test:icon-a");
    expect(cached).toBeDefined();
    expect(cached?.viewBox).toBe("0 0 24 24");

    unsub();
    setCachedIcon("test:icon-b", {
      body: '<path d="M1 1"/>',
      viewBox: "0 0 32 32",
    });
    // unsub 后通知不再触发
    expect(notifiedId).toBe("test:icon-a");

    clearIconCache();
    expect(getCachedIcon("test:icon-a")).toBeUndefined();
  });

  it("fetchIconDetail 优先命中已缓存数据并直接组装 SVG", async () => {
    const { setCachedIcon, fetchIconDetail, clearIconCache } = await import(
      "./api"
    );
    clearIconCache();

    setCachedIcon("simple-icons:skillshare", {
      body: '<path d="M10 10" fill="currentColor"/>',
      viewBox: "0 0 24 24",
    });

    const result = await fetchIconDetail("simple-icons:skillshare");
    expect(result.viewBox).toBe("0 0 24 24");
    expect(result.svg).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
    );
    expect(result.svg).toContain('<path d="M10 10"');
  });

  it("内置几何图形 BASE_SHAPES 能正确解析为 SVG", async () => {
    const { fetchIconDetail } = await import("./api");
    const spark = await fetchIconDetail("spark");
    expect(spark.viewBox).toBe("0 0 100 100");
    expect(spark.svg).toContain("M50 7");
  });

  it("真实在线检索与批量预取：搜索 'skil' 并解析真实矢量而非三角形", async () => {
    const { searchIconify, batchFetchIconData, getCachedIcon, clearIconCache } =
      await import("./api");
    clearIconCache();
    const results = await searchIconify("skil", 10);
    expect(results.length).toBeGreaterThan(0);
    const skillshare = results.find(i => i.id.includes("skillshare"));
    expect(skillshare).toBeDefined();

    if (skillshare) {
      await batchFetchIconData([skillshare.id]);
      const cached = getCachedIcon(skillshare.id);
      expect(cached).toBeDefined();
      expect(cached?.viewBox).toBeTruthy();
      expect(cached?.body).toBeTruthy();
      // 验证获取到的是真正的复杂矢量路径，而不是硬编码三角形
      expect(cached?.body?.includes("M12 2L2 22h20L12 2z")).toBe(false);
      expect(cached?.body?.length).toBeGreaterThan(100);
    }
  }, 20000);
});
