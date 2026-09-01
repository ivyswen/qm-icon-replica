import { describe, expect, it } from "vitest";
import { getTranslation, type Language } from "./index";

describe("i18n - 国际化多语言支持 (TDD)", () => {
  it("支持中文 (ZH) 与英文 (EN) 两套完整文案字典", () => {
    const zh = getTranslation("ZH");
    const en = getTranslation("EN");
    expect(zh).toBeDefined();
    expect(en).toBeDefined();
  });

  it("中文模式下正确返回对应中文文案", () => {
    const t = getTranslation("ZH");
    expect(t.topbar.history).toBe("历史");
    expect(t.topbar.random).toBe("随机");
    expect(t.topbar.download).toBe("下载");
    expect(t.editor.iconShape).toBe("图标形状");
    expect(t.editor.bgDesign).toBe("背景设计");
    expect(t.export.downloadZip).toBe("下载 ZIP 包");
  });

  it("英文模式下正确返回对应英文文案", () => {
    const t = getTranslation("EN");
    expect(t.topbar.history).toBe("History");
    expect(t.topbar.random).toBe("Random");
    expect(t.topbar.download).toBe("Download");
    expect(t.editor.iconShape).toBe("Icon Shape");
    expect(t.editor.bgDesign).toBe("Background");
    expect(t.export.downloadZip).toBe("Download ZIP");
  });
});
