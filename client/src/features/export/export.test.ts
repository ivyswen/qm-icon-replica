import { describe, expect, it } from "vitest";
import { createSvgMarkup, type ExportDesignState } from "./export";

describe("createSvgMarkup - 前景渐变与控制能力 (TDD)", () => {
  const baseState: ExportDesignState = {
    shape: "spark",
    fg: "#0f766e",
    fgType: "solid",
    fgColor2: "#3b82f6",
    fgAngle: 90,
    background: "linear",
    bgColor1: "#dceee9",
    color2: "#f59e0b",
    bgAngle: 135,
    rotation: 0,
    scale: 60,
    dx: 0,
    dy: 0,
    appName: "TestApp",
    size: 512,
    mask: "none",
    maskRadius: 22,
    maskPad: 0,
    customMask: "",
    strokeEnabled: false,
    strokeWidth: 2,
    strokeColor: "#ffffff",
    glowEnabled: false,
    glowBlur: 8,
    glowColor: "#0f766e",
    badgeEnabled: false,
    badgeText: "✓",
    badgeColor: "#0f766e",
    badgePosition: "top-right",
    shadow: true,
  };

  it("当 fgType 为 solid 时，图标 group 或 fill 应该为单色 fg", () => {
    const svg = createSvgMarkup({
      ...baseState,
      fgType: "solid",
      fg: "#ff0000",
    });
    expect(svg).toContain('color="#ff0000"');
    expect(svg).not.toContain('id="icon-fg-gradient"');
  });

  it("当 fgType 为 gradient 时，生成的 SVG defs 必须包含 icon-fg-gradient 并且使用 fg 和 fgColor2", () => {
    const svg = createSvgMarkup({
      ...baseState,
      fgType: "gradient",
      fg: "#ff0055",
      fgColor2: "#00aaff",
      fgAngle: 45,
    });
    expect(svg).toContain('id="icon-fg-gradient"');
    expect(svg).toContain('stop-color="#ff0055"');
    expect(svg).toContain('stop-color="#00aaff"');
    expect(svg).toContain('fill="url(#icon-fg-gradient)"');
  });

  it("背景渐变角度 bgAngle 应该根据角度正确计算 linearGradient 的坐标", () => {
    const svg135 = createSvgMarkup({
      ...baseState,
      background: "linear",
      bgAngle: 135,
      bgColor1: "#111111",
      color2: "#222222",
    });
    expect(svg135).toContain('id="bg-linear"');
    expect(svg135).toContain('x1="15%" y1="15%" x2="85%" y2="85%"');
    expect(svg135).toContain('stop-color="#111111"');
    expect(svg135).toContain('stop-color="#222222"');

    const svg90 = createSvgMarkup({
      ...baseState,
      background: "linear",
      bgAngle: 90,
      bgColor1: "#111111",
      color2: "#222222",
    });
    expect(svg90).toContain('x1="0%" y1="50%" x2="100%" y2="50%"');
  });

  it("支持超大缩放范围（如 200%）与偏移量（dx, dy），transform 保持在 50+dx, 50+dy 和 scale/60", () => {
    const svg = createSvgMarkup({
      ...baseState,
      scale: 200,
      dx: 25,
      dy: -15,
      rotation: 45,
    });
    expect(svg).toContain("translate(75 35) rotate(45)");
    expect(svg).toContain("scale(3.3333333333333335)");
  });

  it("mask 为 circle 时，必须生成圆形的 clipPath 并应用在全局剪裁图层中", () => {
    const svgCircle = createSvgMarkup({
      ...baseState,
      mask: "circle",
      maskPad: 0,
    });
    expect(svgCircle).toContain('<circle cx="50" cy="50" r="50"');
    expect(svgCircle).toContain('clip-path="url(#app-clip)"');
  });

  it("当设置 pattern 为 dots 或 grid 时，导出的 SVG 必须包含对应的 pattern 定义与填充图层", () => {
    const svgDots = createSvgMarkup({ ...baseState, pattern: "dots" });
    expect(svgDots).toContain('id="bg-pattern"');
    expect(svgDots).toContain('fill="url(#bg-pattern)"');

    const svgGrid = createSvgMarkup({ ...baseState, pattern: "grid" });
    expect(svgGrid).toContain('id="bg-pattern"');
    expect(svgGrid).toContain('fill="url(#bg-pattern)"');
  });

  it("支持多种几何形状蒙版（star, diamond, triangle, teardrop, round 等）", () => {
    const svgStar = createSvgMarkup({ ...baseState, mask: "star" });
    expect(svgStar).toContain('<polygon points="50,4');
    expect(svgStar).toContain('clip-path="url(#app-clip)"');

    const svgDiamond = createSvgMarkup({ ...baseState, mask: "diamond" });
    expect(svgDiamond).toContain('transform="rotate(45 50 50)"');

    const svgTriangle = createSvgMarkup({ ...baseState, mask: "triangle" });
    expect(svgTriangle).toContain('<polygon points="50,6 95,94 5,94"');

    const svgTeardrop = createSvgMarkup({ ...baseState, mask: "teardrop" });
    expect(svgTeardrop).toContain('<path d="M50 6');
  });
});
