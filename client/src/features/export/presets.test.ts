import { describe, expect, it } from "vitest";
import { buildZipPlan, PLATFORM_PRESETS, getPlatformConfigFiles, type ExportPlatform } from "./export";

describe("export system - 平台尺寸与 ZIP 规划 (TDD)", () => {
  it("PLATFORM_PRESETS 包含 Android, iOS, Web, macOS, Windows 等全平台预设", () => {
    const platforms = Object.keys(PLATFORM_PRESETS);
    expect(platforms).toContain("android");
    expect(platforms).toContain("ios");
    expect(platforms).toContain("web");
    expect(platforms).toContain("macos");
    expect(platforms).toContain("windows");
  });

  it("buildZipPlan 可以根据选定平台正确生成文件目录计划与计数", () => {
    const selected: ExportPlatform[] = ["android", "ios", "web", "windows"];
    const plan = buildZipPlan(selected);
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some((entry) => entry.platform === "android")).toBe(true);
    expect(plan.some((entry) => entry.platform === "ios")).toBe(true);
    expect(plan.some((entry) => entry.platform === "web")).toBe(true);
    expect(plan.some((entry) => entry.platform === "windows")).toBe(true);

    const winEntries = plan.filter((entry) => entry.platform === "windows");
    expect(winEntries.length).toBe(6);
    expect(winEntries[0].files.some((f) => f.endsWith(".ico"))).toBe(true);
  });

  it("getPlatformConfigFiles 正确包含 Windows 多尺寸 icon.ico 与 Web favicon.ico", () => {
    const winConfigs = getPlatformConfigFiles("windows");
    expect(winConfigs).toContain("Windows/icon.ico");

    const webConfigs = getPlatformConfigFiles("web");
    expect(webConfigs).toContain("Web-PWA/favicon/favicon.ico");
    expect(webConfigs).toContain("Web-PWA/manifest.json");
  });
});

