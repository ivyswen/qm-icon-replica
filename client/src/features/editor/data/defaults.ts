import type { Background, Shape } from "@/features/editor/model";
import type { ExportDesignState } from "@/features/export";
import { BUILTIN_ICONS } from "@/features/icons/data/builtinIcons";

export const HISTORY_STORAGE_KEY = "qm-icon-replica-history-v1";
export const DRAFT_STORAGE_KEY = "qm-icon-replica-draft-v1";

export type SourceMode = "clipart" | "logo" | "text" | "emoji" | "image" | "svg";

export type SavedDraftState = ExportDesignState & {
  updatedAt?: number;
};

export interface MaskOption {
  id: "squircle" | "round" | "circle" | "none" | "hex" | "star" | "diamond" | "triangle" | "teardrop" | "shield" | "custom";
  labelZh: string;
  labelEn: string;
}

export const MASK_OPTIONS: MaskOption[] = [
  { id: "squircle", labelZh: "iOS 超椭圆", labelEn: "iOS Squircle" },
  { id: "round", labelZh: "圆角矩形", labelEn: "Rounded Rect" },
  { id: "circle", labelZh: "圆形", labelEn: "Circle" },
  { id: "none", labelZh: "全出血", labelEn: "Full Bleed" },
  { id: "hex", labelZh: "六边形", labelEn: "Hexagon" },
  { id: "star", labelZh: "星形", labelEn: "Star" },
  { id: "diamond", labelZh: "菱形", labelEn: "Diamond" },
  { id: "triangle", labelZh: "三角", labelEn: "Triangle" },
  { id: "teardrop", labelZh: "水滴", labelEn: "Teardrop" },
  { id: "shield", labelZh: "盾牌", labelEn: "Shield" },
  { id: "custom", labelZh: "自定义", labelEn: "Custom" },
];

export const FONTS_LIST = [
  { id: "Inter, sans-serif", name: "Inter" },
  { id: "'Noto Sans SC', sans-serif", name: "Noto Sans SC" },
  { id: "'Noto Serif SC', serif", name: "Noto Serif SC" },
  { id: "'Bebas Neue', sans-serif", name: "Bebas Neue" },
  { id: "'Lobster', cursive", name: "Lobster" },
  { id: "'Pacifico', cursive", name: "Pacifico" },
  { id: "'Righteous', cursive", name: "Righteous" },
  { id: "'Comfortaa', cursive", name: "Comfortaa" },
  { id: "'Orbitron', sans-serif", name: "Orbitron" },
  { id: "'Caveat', cursive", name: "Caveat" },
  { id: "'Abril Fatface', cursive", name: "Abril Fatface" },
  { id: "'Press Start 2P', monospace", name: "Press Start 2P" },
  { id: "'ZCOOL KuaiLe', cursive", name: "ZCOOL KuaiLe" },
  { id: "'Ma Shan Zheng', cursive", name: "Ma Shan Zheng" },
  { id: "Georgia, serif", name: "Georgia" },
  { id: "'Arial Black', sans-serif", name: "Arial Black" },
  { id: "'Courier New', monospace", name: "Courier New" },
];

export interface GradientPreset {
  name: string;
  color1: string;
  color2: string;
  angle: number;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: "青金晨光", color1: "#2dd4bf", color2: "#eab308", angle: 135 },
  { name: "极光嫩绿", color1: "#10b981", color2: "#84cc16", angle: 135 },
  { name: "莓果粉红", color1: "#f43f5e", color2: "#fb7185", angle: 135 },
  { name: "深海靛蓝", color1: "#1e3a8a", color2: "#3b82f6", angle: 135 },
  { name: "霓虹幻紫", color1: "#8b5cf6", color2: "#d946ef", angle: 135 },
  { name: "薄荷青蓝", color1: "#06b6d4", color2: "#10b981", angle: 135 },
  { name: "墨石冷青", color1: "#0f172a", color2: "#0d9488", angle: 135 },
  { name: "日落金橙", color1: "#f59e0b", color2: "#fef08a", angle: 135 },
  { name: "天际浅蓝", color1: "#38bdf8", color2: "#818cf8", angle: 135 },
  { name: "草木亮绿", color1: "#84cc16", color2: "#22c55e", angle: 135 },
  { name: "暖阳橙金", color1: "#f97316", color2: "#fbbf24", angle: 135 },
  { name: "碧湖苍翠", color1: "#047857", color2: "#065f46", angle: 135 },
  { name: "暗夜碳黑", color1: "#1e293b", color2: "#0f172a", angle: 135 },
  { name: "暮光青蓝", color1: "#0284c7", color2: "#0d9488", angle: 135 },
  { name: "晚霞紫金", color1: "#7c3aed", color2: "#f59e0b", angle: 135 },
  { name: "金属冷银", color1: "#64748b", color2: "#e2e8f0", angle: 135 },
];

export const PATTERN_OPTIONS = [
  { id: "none", label: "无" },
  { id: "dots", label: "波点" },
  { id: "stripes", label: "条纹" },
  { id: "grid", label: "网格" },
  { id: "checker", label: "棋盘" },
  { id: "waves", label: "波浪" },
  { id: "cross", label: "十字" },
] as const;

export const DEFAULT_DESIGN_DRAFT: SavedDraftState = {
  sourceMode: "clipart",
  customText: "QM",
  emojiChar: "🚀",
  customSvgCode: "",
  customImageDataUrl: "",
  shape: "spark",
  fg: "#0f766e",
  fgType: "solid",
  fgColor2: "#3b82f6",
  fgAngle: 90,
  background: "linear",
  bgColor1: "#dceee9",
  color2: "#f59e0b",
  bgAngle: 135,
  pattern: "none",
  noise: 0,
  scale: 60,
  dx: 0,
  dy: 0,
  rotation: 0,
  shadow: true,
  appName: "QM Icon",
  size: 512,
  mask: "none",
  maskRadius: 22,
  maskPad: 0,
  customMask: "M50 0 L100 100 L0 100 Z",
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
};

export function readSavedDraft(): SavedDraftState {
  if (typeof window === "undefined") return DEFAULT_DESIGN_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return DEFAULT_DESIGN_DRAFT;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_DESIGN_DRAFT;
    return { ...DEFAULT_DESIGN_DRAFT, ...parsed };
  } catch {
    return DEFAULT_DESIGN_DRAFT;
  }
}

export function saveSavedDraft(draft: SavedDraftState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: Date.now() }));
  } catch {
    // 忽略私有模式或容量受限异常
  }
}

export function clearSavedDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // 忽略异常
  }
}

export const BASE_SHAPE_OPTIONS: Array<{ id: Shape; label: string }> = [
  { id: "spark", label: "闪光" },
  { id: "circle", label: "圆形" },
  { id: "diamond", label: "菱形" },
  { id: "hex", label: "六边形" },
  { id: "heart", label: "爱心" },
];

export const SHAPE_OPTIONS: Array<{ id: Shape; label: string }> = [
  ...BASE_SHAPE_OPTIONS,
  ...BUILTIN_ICONS.map((i) => ({ id: i.n, label: i.label })),
];

export const RANDOM_COLORS = ["#0f766e", "#2563eb", "#b45309", "#7c3aed", "#334155", "#16a34a", "#e11d48", "#0891b2"];

export const BACKGROUND_OPTIONS: Array<{ id: Background; label: string }> = [
  { id: "solid", label: "纯色" },
  { id: "linear", label: "线性" },
  { id: "radial", label: "径向" },
  { id: "conic", label: "锥形" },
  { id: "image", label: "图片" },
  { id: "transparent", label: "透明" },
];

export const EXPORT_PLATFORM_LABELS = [
  ["android", "Android"],
  ["ios", "iOS"],
  ["web", "Web/PWA"],
  ["macos", "macOS + ICNS"],
  ["windows", "Windows + ICO"],
] as const;

