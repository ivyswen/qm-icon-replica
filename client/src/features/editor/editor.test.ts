import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES, type DesignTemplateKey } from "./data/templates";

describe("DESIGN_TEMPLATES - 设计模板预设 (TDD)", () => {
  it("必须包含核心的 8 大官方设计模板", () => {
    const keys: DesignTemplateKey[] = [
      "清响",
      "林野",
      "珊瑚",
      "钴夜",
      "莓紫",
      "墨白",
      "青玻",
      "金夜",
    ];
    for (const key of keys) {
      expect(DESIGN_TEMPLATES[key]).toBeDefined();
      expect(DESIGN_TEMPLATES[key].name).toBe(key);
      expect(DESIGN_TEMPLATES[key].fg).toBeTruthy();
      expect(DESIGN_TEMPLATES[key].shape).toBeTruthy();
    }
  });

  it("钴夜模板应具备深海蓝渐变与描边特效", () => {
    const blue = DESIGN_TEMPLATES["钴夜"];
    expect(blue.background).toBe("linear");
    expect(blue.strokeEnabled).toBe(true);
    expect(blue.strokeColor).toBe("#60a5fa");
  });

  it("金夜模板应配置暗夜背景与网格 pattern", () => {
    const gold = DESIGN_TEMPLATES["金夜"];
    expect(gold.pattern).toBe("grid");
    expect(gold.fg).toBe("#facc15");
  });

  it("墨白模板应配置高对比纯白纯黑", () => {
    const mono = DESIGN_TEMPLATES["墨白"];
    expect(mono.bgColor1).toBe("#ffffff");
    expect(mono.fg).toBe("#0f172a");
  });
});
