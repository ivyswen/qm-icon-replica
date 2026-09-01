import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES, type DesignTemplateKey } from "./data/templates";

describe("DESIGN_TEMPLATES - 设计模板预设 (TDD)", () => {
  it("必须包含核心与扩展的 9 大设计模板", () => {
    const keys: DesignTemplateKey[] = [
      "清爽薄荷",
      "暖阳渐变",
      "墨色印章",
      "赛博霓虹",
      "深邃星空",
      "极简暗黑",
      "活力蜜桃",
      "极客终端",
      "皇家曜金",
    ];
    for (const key of keys) {
      expect(DESIGN_TEMPLATES[key]).toBeDefined();
      expect(DESIGN_TEMPLATES[key].name).toBe(key);
      expect(DESIGN_TEMPLATES[key].fg).toBeTruthy();
      expect(DESIGN_TEMPLATES[key].shape).toBeTruthy();
    }
  });

  it("赛博霓虹模板应具备渐变前景与青蓝/紫色调发光特效", () => {
    const neon = DESIGN_TEMPLATES["赛博霓虹"];
    expect(neon.fgType).toBe("gradient");
    expect(neon.glowEnabled).toBe(true);
    expect(neon.glowColor).toBe("#00f0ff");
  });

  it("深邃星空模板应配置星辰图形与径向/深空渐变背景", () => {
    const galaxy = DESIGN_TEMPLATES["深邃星空"];
    expect(galaxy.shape).toBe("star");
    expect(galaxy.background).toBe("radial");
    expect(galaxy.glowEnabled).toBe(true);
  });

  it("极客终端模板应配置代码符号与黑客绿发光", () => {
    const terminal = DESIGN_TEMPLATES["极客终端"];
    expect(terminal.shape).toBe("code");
    expect(terminal.fg).toBe("#22c55e");
    expect(terminal.glowEnabled).toBe(true);
  });
});
