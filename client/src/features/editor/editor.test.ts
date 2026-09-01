import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES, type DesignTemplateKey } from "./data/templates";

describe("DESIGN_TEMPLATES - 设计模板预设 (TDD)", () => {
  it("必须包含核心的 8 大拟真设计模板", () => {
    const keys: DesignTemplateKey[] = [
      "青金火箭",
      "极光翠绿",
      "莓果粉红",
      "深海靛蓝",
      "霓虹幻紫",
      "极简黑白",
      "薄荷青绿",
      "网格暗金",
    ];
    for (const key of keys) {
      expect(DESIGN_TEMPLATES[key]).toBeDefined();
      expect(DESIGN_TEMPLATES[key].name).toBe(key);
      expect(DESIGN_TEMPLATES[key].fg).toBeTruthy();
      expect(DESIGN_TEMPLATES[key].shape).toBeTruthy();
    }
  });

  it("深海靛蓝模板应具备深海蓝渐变与描边特效", () => {
    const blue = DESIGN_TEMPLATES["深海靛蓝"];
    expect(blue.background).toBe("linear");
    expect(blue.strokeEnabled).toBe(true);
    expect(blue.strokeColor).toBe("#60a5fa");
  });

  it("网格暗金模板应配置暗夜背景与网格 pattern", () => {
    const gold = DESIGN_TEMPLATES["网格暗金"];
    expect(gold.pattern).toBe("grid");
    expect(gold.fg).toBe("#facc15");
  });

  it("极简黑白模板应配置高对比纯白纯黑", () => {
    const mono = DESIGN_TEMPLATES["极简黑白"];
    expect(mono.bgColor1).toBe("#ffffff");
    expect(mono.fg).toBe("#0f172a");
  });
});
