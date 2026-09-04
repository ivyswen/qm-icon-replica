/**
 * 经典预设调色板（12 色）
 */
export const PRESET_SWATCHES = [
  "#ffffff", // 白
  "#111827", // 墨黑
  "#ef4444", // 红
  "#f97316", // 橙
  "#f59e0b", // 琥珀黄
  "#eab308", // 柠檬黄
  "#10b981", // 翠绿
  "#06b6d4", // 青蓝
  "#3b82f6", // 宝蓝
  "#6366f1", // 靛蓝
  "#8b5cf6", // 紫罗兰
  "#64748b", // 冷灰
];

function hexToRgb(hex: string): [number, number, number] {
  let c = (hex || "#ffffff").replace("#", "").trim();
  if (c.length === 3)
    c = c
      .split("")
      .map(x => x + x)
      .join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const [r1, g1, b1] = hexToRgb(fgHex);
  const [r2, g2, b2] = hexToRgb(bgHex);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 10) / 10;
}
