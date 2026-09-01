import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  readSavedDraft,
  saveSavedDraft,
  clearSavedDraft,
  DEFAULT_DESIGN_DRAFT,
  DRAFT_STORAGE_KEY,
  type SavedDraftState,
} from "./data/defaults";

describe("editor draft storage - 本地草稿自动持久化测试", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = String(value);
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    // @ts-expect-error mock window
    globalThis.window = {
      localStorage: mockLocalStorage,
    };
  });

  afterEach(() => {
    // @ts-expect-error cleanup window
    delete globalThis.window;
  });

  it("当 localStorage 为空时，应返回完整的 DEFAULT_DESIGN_DRAFT 默认参数", () => {
    const draft = readSavedDraft();
    expect(draft).toEqual(DEFAULT_DESIGN_DRAFT);
    expect(draft.shape).toBe("spark");
    expect(draft.fg).toBe("#0f766e");
  });

  it("当存储了有效草稿时，应能完整读取并恢复所有参数", () => {
    const customDraft: SavedDraftState = {
      ...DEFAULT_DESIGN_DRAFT,
      shape: "heart",
      fg: "#ff0055",
      fgType: "gradient",
      fgColor2: "#9900ff",
      rotation: 45,
      scale: 120,
      appName: "Awesome App",
    };

    saveSavedDraft(customDraft);
    const readBack = readSavedDraft();

    expect(readBack.shape).toBe("heart");
    expect(readBack.fg).toBe("#ff0055");
    expect(readBack.fgType).toBe("gradient");
    expect(readBack.fgColor2).toBe("#9900ff");
    expect(readBack.rotation).toBe(45);
    expect(readBack.scale).toBe(120);
    expect(readBack.appName).toBe("Awesome App");
    expect(readBack.updatedAt).toBeDefined();
  });

  it("当本地数据残缺或部分字段缺失时，应能平滑合并默认值，不破坏应用状态", () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ shape: "circle", fg: "#123456" }));
    const readBack = readSavedDraft();

    expect(readBack.shape).toBe("circle");
    expect(readBack.fg).toBe("#123456");
    expect(readBack.scale).toBe(DEFAULT_DESIGN_DRAFT.scale);
    expect(readBack.mask).toBe(DEFAULT_DESIGN_DRAFT.mask);
  });

  it("当本地 JSON 格式损坏时，应捕获异常并降级回退默认值", () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, "invalid-json-string{");
    const readBack = readSavedDraft();
    expect(readBack).toEqual(DEFAULT_DESIGN_DRAFT);
  });

  it("clearSavedDraft 应能彻底清理本地草稿", () => {
    saveSavedDraft({ ...DEFAULT_DESIGN_DRAFT, shape: "diamond" });
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeTruthy();

    clearSavedDraft();
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(readSavedDraft()).toEqual(DEFAULT_DESIGN_DRAFT);
  });
});
