import type { Background, Shape } from "@/features/editor/model";
import { BUILTIN_ICONS } from "@/features/icons/data/builtinIcons";

export const HISTORY_STORAGE_KEY = "qm-icon-replica-history-v1";
export const DRAFT_STORAGE_KEY = "qm-icon-replica-draft-v1";

export type SourceMode = "clipart" | "logo" | "text" | "emoji" | "image" | "svg";

export interface SavedDraftState {
  sourceMode: SourceMode;
  customText: string;
  emojiChar?: string;
  customSvgCode?: string;
  customImageDataUrl?: string;
  shape: Shape;
  iconId?: string;
  iconSvg?: string;
  fg: string;
  fgType: "solid" | "gradient";
  fgColor2: string;
  fgAngle: number;
  background: Background;
  bgColor1: string;
  color2: string;
  bgAngle: number;
  scale: number;
  dx: number;
  dy: number;
  rotation: number;
  shadow: boolean;
  appName: string;
  size: number;
  mask: "none" | "squircle" | "circle" | "hex" | "custom";
  maskRadius: number;
  maskPad: number;
  customMask: string;
  strokeEnabled: boolean;
  strokeWidth: number;
  strokeColor: string;
  glowEnabled: boolean;
  glowBlur: number;
  glowColor: string;
  badgeEnabled: boolean;
  badgeText: string;
  badgeColor: string;
  badgePosition: "top-right" | "bottom-right" | "bottom-left";
  updatedAt?: number;
}

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

