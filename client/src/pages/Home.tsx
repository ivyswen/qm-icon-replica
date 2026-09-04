/*
 * QM icon — 专业级跨平台图标设计工作站
 * 100% 像素级对齐 https://icon.qiaomu.ai/
 */
import {
  ArrowLeftRight,
  ChevronDown,
  Download,
  Eye,
  FileCode,
  Globe2,
  HelpCircle,
  History,
  Image as ImageIcon,
  Layers,
  Moon,
  MoreHorizontal,
  Palette,
  PanelLeft,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Search,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Smile,
  Sun,
  Type,
  Undo2,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { getTranslation, type Language } from "@/features/i18n";
import { calculateContrastRatio, PRESET_SWATCHES } from "@/lib/color";
import {
  buildZipPlan,
  exportFormat,
  exportZip,
  getPlatformConfigFiles,
  type ExportDesignState,
  type ExportFormat,
  type ExportPlatform,
} from "@/features/export";
import {
  fetchIconDetail,
  getBuiltinIcons,
  getDefaultStarterIcons,
  searchIconify,
  getCachedIcon,
  batchFetchIconData,
  IconThumb,
  HOT_EMOJIS,
  EMOJI_CATEGORIES,
  BUILTIN_ICONS,
  BRAND_STARTER,
  type IconSearchItem,
} from "@/features/icons";
import {
  HISTORY_STORAGE_KEY,
  RANDOM_COLORS,
  GRADIENT_PRESETS,
  PATTERN_OPTIONS,
  MASK_OPTIONS,
  FONTS_LIST,
  readSavedDraft,
  saveSavedDraft,
  clearSavedDraft,
  DEFAULT_DESIGN_DRAFT,
  type SourceMode,
} from "@/features/editor/data/defaults";
import {
  DESIGN_TEMPLATES,
  type DesignTemplateKey,
} from "@/features/editor/data/templates";
import {
  ControlGroup,
  Segmented,
  SliderField,
} from "@/features/editor/components/EditorPrimitives";
import AppMark from "@/features/editor/components/AppMark";
import PlatformPreview, {
  AndroidShapeGrid,
  AndroidNotificationBar,
  IosHomeScreenGrid,
  WebTabSimulator,
  MacWindowsPreview,
  WatchAppleTvPreview,
} from "@/features/editor/components/PlatformPreview";
import TopBar from "@/features/editor/components/TopBar";
import type {
  Background,
  PreviewPlatform as Platform,
  SavedSnapshot,
  Shape,
} from "@/features/editor/model";

function readSavedHistory(): SavedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(HISTORY_STORAGE_KEY) || "[]"
    );
    return Array.isArray(parsed) ? parsed.slice(0, 30) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const [lang, setLang] = useState<Language>("ZH");
  const t = getTranslation(lang);

  const initialDraft = useMemo(() => readSavedDraft(), []);

  // 弹窗状态
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [fileListOpen, setFileListOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // 画布预览环境（浅色 / 深色 / 棋盘格）
  const [canvasBg, setCanvasBg] = useState<"light" | "dark" | "checker">(
    "light"
  );

  // 素材来源与排版
  const [shape, setShape] = useState<Shape>(initialDraft.shape);
  const [iconId, setIconId] = useState<string | undefined>(initialDraft.iconId);
  const [iconSvg, setIconSvg] = useState<string | undefined>(
    initialDraft.iconSvg
  );
  const [sourceMode, setSourceMode] = useState<SourceMode>(
    initialDraft.sourceMode || "clipart"
  );
  const [sourceMoreOpen, setSourceMoreOpen] = useState(false);
  const [customText, setCustomText] = useState(initialDraft.customText || "A");
  const [fontFamily, setFontFamily] = useState(
    initialDraft.fontFamily || "Inter, sans-serif"
  );
  const [fontWeight, setFontWeight] = useState(initialDraft.fontWeight || 800);
  const [textTransform, setTextTransform] = useState<
    "none" | "arc-up" | "arc-down"
  >(initialDraft.textTransform || "none");
  const [textArc, setTextArc] = useState(initialDraft.textArc || 30);
  const [emojiChar, setEmojiChar] = useState(initialDraft.emojiChar || "🚀");
  const [emojiCategory, setEmojiCategory] = useState<string>("popular");
  const [emojiSearch, setEmojiSearch] = useState<string>("");
  const [customSvgCode, setCustomSvgCode] = useState(
    initialDraft.customSvgCode || ""
  );
  const [customImageDataUrl, setCustomImageDataUrl] = useState(
    initialDraft.customImageDataUrl || ""
  );
  const [imageMonochrome, setImageMonochrome] = useState(
    initialDraft.imageMonochrome || false
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);

  // 搜索
  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [iconResults, setIconResults] = useState<IconSearchItem[]>(() =>
    getDefaultStarterIcons()
  );
  const [iconSearching, setIconSearching] = useState(false);
  const [iconSearchError, setIconSearchError] = useState("");

  // 前景颜色与渐变
  const [fg, setFg] = useState(initialDraft.fg);
  const [fgType, setFgType] = useState<"solid" | "gradient">(
    initialDraft.fgType || "solid"
  );
  const [fgColor2, setFgColor2] = useState(initialDraft.fgColor2 || "#3b82f6");
  const [fgAngle, setFgAngle] = useState(initialDraft.fgAngle ?? 90);

  // 变换
  const [scale, setScale] = useState(initialDraft.scale ?? 60);
  const [dx, setDx] = useState(initialDraft.dx ?? 0);
  const [dy, setDy] = useState(initialDraft.dy ?? 0);
  const [rotation, setRotation] = useState(initialDraft.rotation ?? 0);

  // 背景设计
  const [background, setBackground] = useState<Background>(
    initialDraft.background || "linear"
  );
  const [bgColor1, setBgColor1] = useState(initialDraft.bgColor1 || "#2dd4bf");
  const [color2, setColor2] = useState(initialDraft.color2 || "#eab308");
  const [bgAngle, setBgAngle] = useState(initialDraft.bgAngle ?? 135);
  const [pattern, setPattern] = useState<ExportDesignState["pattern"]>(
    initialDraft.pattern || "none"
  );
  const [patternOpacity, setPatternOpacity] = useState(
    initialDraft.patternOpacity ?? 20
  );
  const [patternSize, setPatternSize] = useState(
    initialDraft.patternSize ?? 14
  );
  const [noise, setNoise] = useState<number>(initialDraft.noise ?? 0);

  // 高级 - 形状蒙版
  const [mask, setMask] = useState<ExportDesignState["mask"]>(
    initialDraft.mask || "squircle"
  );
  const [maskRadius, setMaskRadius] = useState(initialDraft.maskRadius ?? 22);
  const [maskPad, setMaskPad] = useState(initialDraft.maskPad ?? 0);
  const [customMask, setCustomMask] = useState(
    initialDraft.customMask || "M50 0 L100 100 L0 100 Z"
  );

  // 高级 - 图层特效
  const [layersVisible, setLayersVisible] = useState<{
    fg: boolean;
    bg: boolean;
    badge: boolean;
  }>(initialDraft.layersVisible || { fg: true, bg: true, badge: true });
  const [shadow, setShadow] = useState(initialDraft.shadow ?? true);
  const [shadowPreset, setShadowPreset] = useState<
    "none" | "soft" | "hard" | "long"
  >(initialDraft.shadowPreset || "soft");
  const [shadowOffsetX, setShadowOffsetX] = useState(
    initialDraft.shadowOffsetX ?? 0
  );
  const [shadowOffsetY, setShadowOffsetY] = useState(
    initialDraft.shadowOffsetY ?? 4
  );
  const [shadowBlur, setShadowBlur] = useState(initialDraft.shadowBlur ?? 10);
  const [shadowAlpha, setShadowAlpha] = useState(
    initialDraft.shadowAlpha ?? 30
  );
  const [shadowColor, setShadowColor] = useState(
    initialDraft.shadowColor || "#000000"
  );
  const [strokeEnabled, setStrokeEnabled] = useState(
    initialDraft.strokeEnabled ?? false
  );
  const [strokeWidth, setStrokeWidth] = useState(initialDraft.strokeWidth ?? 2);
  const [strokeColor, setStrokeColor] = useState(
    initialDraft.strokeColor || "#ffffff"
  );
  const [glowEnabled, setGlowEnabled] = useState(
    initialDraft.glowEnabled ?? false
  );
  const [glowBlur, setGlowBlur] = useState(initialDraft.glowBlur ?? 8);
  const [glowColor, setGlowColor] = useState(
    initialDraft.glowColor || "#0f766e"
  );
  const [gloss, setGloss] = useState<"none" | "top" | "bevel">(
    initialDraft.gloss || "none"
  );
  const [innerBorder, setInnerBorder] = useState(
    initialDraft.innerBorder ?? false
  );

  // 高级 - 徽章 / 角标
  const [badgeEnabled, setBadgeEnabled] = useState(
    initialDraft.badgeEnabled ?? false
  );
  const [badgeStyle, setBadgeStyle] = useState<"corner" | "bottom" | "dot">(
    initialDraft.badgeStyle || "corner"
  );
  const [badgeText, setBadgeText] = useState(initialDraft.badgeText || "NEW");
  const [badgeBg, setBadgeBg] = useState(initialDraft.badgeBg || "#ef4444");
  const [badgeColor, setBadgeColor] = useState(
    initialDraft.badgeColor || "#ffffff"
  );
  const [badgePosition, setBadgePosition] = useState<
    ExportDesignState["badgePosition"]
  >(initialDraft.badgePosition || "top-right");
  const [badgeSize, setBadgeSize] = useState(initialDraft.badgeSize ?? 30);

  // 应用名称与导出
  const [appName, setAppName] = useState(initialDraft.appName || "My App");
  const [platform, setPlatform] = useState<Platform>("all");
  const [format, setFormat] = useState<ExportFormat>("PNG");
  const [size, setSize] = useState(initialDraft.size || 1024);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ExportPlatform[]>([
    "android",
    "ios",
    "web",
    "macos",
    "windows",
  ]);
  const [customSizes, setCustomSizes] = useState<number[]>([512]);
  const [customSizeInput, setCustomSizeInput] = useState<number>(512);

  // 历史与移动端面板
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [savedHistory, setSavedHistory] =
    useState<SavedSnapshot[]>(readSavedHistory);

  // 对比度计算
  const contrastRatio = useMemo(
    () => calculateContrastRatio(fg, bgColor1 || "#f8fafc"),
    [fg, bgColor1]
  );

  // 获取当前状态
  const getCurrentState = (): ExportDesignState => ({
    shape,
    iconId,
    iconSvg,
    sourceMode,
    customText,
    fontFamily,
    fontWeight,
    textTransform,
    textArc,
    emojiChar,
    customSvgCode,
    customImageDataUrl,
    imageMonochrome,
    fg,
    fgType,
    fgColor2,
    fgAngle,
    background,
    bgColor1,
    color2,
    bgAngle,
    pattern,
    patternOpacity,
    patternSize,
    noise,
    rotation,
    scale,
    dx,
    dy,
    appName,
    size,
    mask,
    maskRadius,
    maskPad,
    customMask,
    strokeEnabled,
    strokeWidth,
    strokeColor,
    glowEnabled,
    glowBlur,
    glowColor,
    shadow,
    shadowPreset,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
    shadowAlpha,
    shadowColor,
    gloss,
    innerBorder,
    layersVisible,
    badgeEnabled,
    badgeStyle,
    badgeText,
    badgeBg,
    badgeColor,
    badgePosition,
    badgeSize,
  });

  // 保存快照至历史
  const saveState = () => {
    setUndoStack(states => [
      ...states.slice(-19),
      JSON.stringify(getCurrentState()),
    ]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(states => states.slice(0, -1));
    setRedoStack(states => [...states, JSON.stringify(getCurrentState())]);
    restoreSnapshot(JSON.parse(last), false);
    toast.success(lang === "ZH" ? "已撤销" : "Undo");
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(states => states.slice(0, -1));
    setUndoStack(states => [...states, JSON.stringify(getCurrentState())]);
    restoreSnapshot(JSON.parse(next), false);
    toast.success(lang === "ZH" ? "已重做" : "Redo");
  };

  const restoreSnapshot = (
    snapshot: Partial<ExportDesignState>,
    showMsg = true
  ) => {
    if (snapshot.shape !== undefined) setShape(snapshot.shape);
    setIconId(snapshot.iconId);
    setIconSvg(snapshot.iconSvg);
    if (snapshot.sourceMode) setSourceMode(snapshot.sourceMode);
    if (snapshot.customText !== undefined) setCustomText(snapshot.customText);
    if (snapshot.fontFamily) setFontFamily(snapshot.fontFamily);
    if (snapshot.fontWeight) setFontWeight(snapshot.fontWeight);
    if (snapshot.textTransform) setTextTransform(snapshot.textTransform);
    if (snapshot.textArc !== undefined) setTextArc(snapshot.textArc);
    if (snapshot.emojiChar) setEmojiChar(snapshot.emojiChar);
    if (snapshot.customSvgCode !== undefined)
      setCustomSvgCode(snapshot.customSvgCode);
    if (snapshot.customImageDataUrl !== undefined)
      setCustomImageDataUrl(snapshot.customImageDataUrl);
    if (snapshot.imageMonochrome !== undefined)
      setImageMonochrome(snapshot.imageMonochrome);
    if (snapshot.fg) setFg(snapshot.fg);
    if (snapshot.fgType) setFgType(snapshot.fgType);
    if (snapshot.fgColor2) setFgColor2(snapshot.fgColor2);
    if (snapshot.fgAngle !== undefined) setFgAngle(snapshot.fgAngle);
    if (snapshot.background) setBackground(snapshot.background);
    if (snapshot.bgColor1) setBgColor1(snapshot.bgColor1);
    if (snapshot.color2) setColor2(snapshot.color2);
    if (snapshot.bgAngle !== undefined) setBgAngle(snapshot.bgAngle);
    if (snapshot.pattern !== undefined) setPattern(snapshot.pattern);
    if (snapshot.patternOpacity !== undefined)
      setPatternOpacity(snapshot.patternOpacity);
    if (snapshot.patternSize !== undefined)
      setPatternSize(snapshot.patternSize);
    if (snapshot.noise !== undefined) setNoise(snapshot.noise);
    if (snapshot.rotation !== undefined) setRotation(snapshot.rotation);
    if (snapshot.scale !== undefined) setScale(snapshot.scale);
    if (snapshot.dx !== undefined) setDx(snapshot.dx);
    if (snapshot.dy !== undefined) setDy(snapshot.dy);
    if (snapshot.appName) setAppName(snapshot.appName);
    if (snapshot.size) setSize(snapshot.size);
    if (snapshot.mask) setMask(snapshot.mask);
    if (snapshot.maskRadius !== undefined) setMaskRadius(snapshot.maskRadius);
    if (snapshot.maskPad !== undefined) setMaskPad(snapshot.maskPad);
    if (snapshot.customMask) setCustomMask(snapshot.customMask);
    if (snapshot.strokeEnabled !== undefined)
      setStrokeEnabled(snapshot.strokeEnabled);
    if (snapshot.strokeWidth !== undefined)
      setStrokeWidth(snapshot.strokeWidth);
    if (snapshot.strokeColor) setStrokeColor(snapshot.strokeColor);
    if (snapshot.glowEnabled !== undefined)
      setGlowEnabled(snapshot.glowEnabled);
    if (snapshot.glowBlur !== undefined) setGlowBlur(snapshot.glowBlur);
    if (snapshot.glowColor) setGlowColor(snapshot.glowColor);
    if (snapshot.shadow !== undefined) setShadow(snapshot.shadow);
    if (snapshot.shadowPreset) setShadowPreset(snapshot.shadowPreset);
    if (snapshot.shadowOffsetX !== undefined)
      setShadowOffsetX(snapshot.shadowOffsetX);
    if (snapshot.shadowOffsetY !== undefined)
      setShadowOffsetY(snapshot.shadowOffsetY);
    if (snapshot.shadowBlur !== undefined) setShadowBlur(snapshot.shadowBlur);
    if (snapshot.shadowAlpha !== undefined)
      setShadowAlpha(snapshot.shadowAlpha);
    if (snapshot.shadowColor) setShadowColor(snapshot.shadowColor);
    if (snapshot.gloss) setGloss(snapshot.gloss);
    if (snapshot.innerBorder !== undefined)
      setInnerBorder(snapshot.innerBorder);
    if (snapshot.layersVisible) setLayersVisible(snapshot.layersVisible);
    if (snapshot.badgeEnabled !== undefined)
      setBadgeEnabled(snapshot.badgeEnabled);
    if (snapshot.badgeStyle) setBadgeStyle(snapshot.badgeStyle);
    if (snapshot.badgeText) setBadgeText(snapshot.badgeText);
    if (snapshot.badgeBg) setBadgeBg(snapshot.badgeBg);
    if (snapshot.badgeColor) setBadgeColor(snapshot.badgeColor);
    if (snapshot.badgePosition) setBadgePosition(snapshot.badgePosition);
    if (snapshot.badgeSize !== undefined) setBadgeSize(snapshot.badgeSize);

    if (showMsg) {
      toast.success(lang === "ZH" ? "已恢复设计快照" : "Restored snapshot");
    }
  };

  const resetToDefault = () => {
    saveState();
    clearSavedDraft();
    restoreSnapshot(DEFAULT_DESIGN_DRAFT, false);
    toast.success(
      lang === "ZH" ? "已重置为默认设计" : "Reset to default design"
    );
  };

  const saveToHistory = () => {
    const snapshot: SavedSnapshot = {
      ...getCurrentState(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt: Date.now(),
    };
    setSavedHistory(items => [snapshot, ...items].slice(0, 30));
    toast.success(lang === "ZH" ? "已存入历史记录" : "Saved to history");
  };

  const randomize = () => {
    saveState();
    const colors = RANDOM_COLORS;
    const nextIcon =
      BUILTIN_ICONS[Math.floor(Math.random() * BUILTIN_ICONS.length)];
    const nextFg = colors[Math.floor(Math.random() * colors.length)];
    const nextColor2 = colors[(colors.indexOf(nextFg) + 2) % colors.length];
    const nextBg1 = colors[(colors.indexOf(nextFg) + 4) % colors.length];
    setShape(nextIcon.n);
    setIconId(undefined);
    setIconSvg(undefined);
    setFg(nextFg);
    setBgColor1(nextBg1);
    setColor2(nextColor2);
    setBgAngle(Math.floor(Math.random() * 360));
    toast.success(
      lang === "ZH"
        ? `已随机生成：${nextIcon.label}`
        : `Randomized: ${nextIcon.n}`
    );
  };

  const swapBgColors = () => {
    saveState();
    const temp = bgColor1;
    setBgColor1(color2);
    setColor2(temp);
    toast.success(lang === "ZH" ? "已交换背景色" : "Swapped background colors");
  };

  const randomPalette = () => {
    saveState();
    const c1 = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    const c2 =
      RANDOM_COLORS[(RANDOM_COLORS.indexOf(c1) + 3) % RANDOM_COLORS.length];
    setBgColor1(c1);
    setColor2(c2);
    toast.success(
      lang === "ZH" ? "已生成随机配色" : "Generated random palette"
    );
  };

  const applyTemplate = (key: DesignTemplateKey) => {
    saveState();
    const preset = DESIGN_TEMPLATES[key];
    if (preset.fg) setFg(preset.fg);
    if (preset.fgType) setFgType(preset.fgType);
    if (preset.fgColor2) setFgColor2(preset.fgColor2);
    if (preset.fgAngle !== undefined) setFgAngle(preset.fgAngle);
    if (preset.background) setBackground(preset.background);
    if (preset.bgColor1) setBgColor1(preset.bgColor1);
    if (preset.color2) setColor2(preset.color2);
    if (preset.bgAngle !== undefined) setBgAngle(preset.bgAngle);
    if (preset.pattern !== undefined) setPattern(preset.pattern);
    if (preset.noise !== undefined) setNoise(preset.noise);
    if (preset.mask) setMask(preset.mask);
    if (preset.maskRadius !== undefined) setMaskRadius(preset.maskRadius);
    if (preset.shadow !== undefined) setShadow(preset.shadow);
    if (preset.glowEnabled !== undefined) setGlowEnabled(preset.glowEnabled);
    if (preset.glowBlur !== undefined) setGlowBlur(preset.glowBlur);
    if (preset.glowColor) setGlowColor(preset.glowColor);
    if (preset.strokeEnabled !== undefined)
      setStrokeEnabled(preset.strokeEnabled);
    if (preset.strokeWidth !== undefined) setStrokeWidth(preset.strokeWidth);
    if (preset.strokeColor) setStrokeColor(preset.strokeColor);
    toast.success(
      lang === "ZH"
        ? `已应用「${key}」设计风格（保留当前图标）`
        : `Applied style: ${key} (icon preserved)`
    );
  };

  const download = () => {
    void exportFormat(getCurrentState(), format)
      .then(() =>
        toast.success(
          lang === "ZH" ? `${format} 已下载` : `${format} downloaded`
        )
      )
      .catch(() =>
        toast.error(lang === "ZH" ? "导出失败，请重试" : "Export failed")
      );
  };

  const downloadZip = () => {
    setZipProgress(20);
    const state = getCurrentState();
    exportZip(state, selectedPlatforms)
      .then(({ platformCount, fileCount }) => {
        setZipProgress(100);
        setTimeout(() => setZipProgress(0), 1000);
        toast.success(
          lang === "ZH" ? "ZIP 图标包已下载" : "ZIP Package Downloaded",
          {
            description:
              lang === "ZH"
                ? `${platformCount} 个平台 · ${fileCount} 个文件，已按平台目录整理`
                : `${platformCount} platforms · ${fileCount} files`,
          }
        );
      })
      .catch(() => {
        setZipProgress(0);
        toast.error(
          lang === "ZH" ? "ZIP 导出失败，请重试" : "ZIP export failed"
        );
      });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success(t.topbar.shareCopied))
        .catch(() => toast.success(t.topbar.shareCopied));
    } else {
      toast.success(t.topbar.shareCopied);
    }
  };

  // 全局快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement)?.tagName || ""
      );

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToHistory();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        download();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setHistoryOpen(true);
        return;
      }

      if (!isInput) {
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          randomize();
        } else if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          setCanvasBg(cur =>
            cur === "light" ? "dark" : cur === "dark" ? "checker" : "light"
          );
        } else if (e.key === "?") {
          e.preventDefault();
          setHelpOpen(true);
        } else if (["1", "2", "3", "4", "5", "6"].includes(e.key)) {
          const bgMap: Background[] = [
            "solid",
            "linear",
            "radial",
            "conic",
            "image",
            "transparent",
          ];
          const selected = bgMap[parseInt(e.key, 10) - 1];
          if (selected) {
            saveState();
            setBackground(selected);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // 图标搜索
  useEffect(() => {
    if (sourceMode !== "clipart") return;
    const trimmed = search.trim();
    if (!trimmed) {
      setIconResults(getDefaultStarterIcons());
      setIconSearching(false);
      setIconSearchError("");
      return;
    }

    const localHits = getBuiltinIcons(trimmed);
    if (localHits.length > 0) {
      setIconResults(localHits);
    }
    setIconSearching(true);
    setIconSearchError("");

    const timer = setTimeout(async () => {
      try {
        const results = await searchIconify(trimmed, 72);
        setIconResults(results.length > 0 ? results : localHits);
        if (results.length > 0) {
          const onlineIds = results.filter(i => !i.isBuiltin).map(i => i.id);
          if (onlineIds.length > 0) {
            batchFetchIconData(onlineIds).catch(() => {});
          }
        }
        if (results.length === 0 && localHits.length === 0) {
          setIconSearchError(
            lang === "ZH"
              ? "未找到匹配图标，建议尝试相近关键词"
              : "No icons found"
          );
        }
      } catch {
        if (localHits.length === 0) {
          setIconSearchError(
            lang === "ZH"
              ? "在线搜索不可用，已展示内置图标库"
              : "Online search unavailable, showing built-in icons"
          );
          setIconResults(getBuiltinIcons());
        }
      } finally {
        setIconSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, sourceMode, lang]);

  // 选择搜索图标
  const selectIcon = async (item: IconSearchItem) => {
    saveState();
    if (item.isBuiltin) {
      setShape(item.id);
      setIconId(undefined);
      setIconSvg(undefined);
      toast.success(
        lang === "ZH"
          ? `已应用内置图标：${item.label || item.name}`
          : `Applied icon: ${item.name}`
      );
      return;
    }

    // 优先从缓存立即载入，消除网络等待
    const cached = getCachedIcon(item.id);
    if (cached && cached.body) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cached.viewBox}">${cached.body}</svg>`;
      setIconId(item.id);
      setIconSvg(svg);
      setShape(item.id);
      toast.success(
        lang === "ZH" ? `已载入 ${item.name}` : `Loaded ${item.name}`
      );
      return;
    }

    setIconSearching(true);
    setIconSearchError("");
    try {
      const detail = await fetchIconDetail(item.id);
      setIconId(item.id);
      setIconSvg(detail.svg);
      setShape(item.id);
      toast.success(
        lang === "ZH" ? `已载入 ${item.name}` : `Loaded ${item.name}`
      );
    } catch {
      setIconSearchError(
        lang === "ZH" ? "图标加载失败，请重试" : "Failed to load icon"
      );
      toast.error(
        lang === "ZH"
          ? "图标加载失败，请检查网络"
          : "Icon load failed, check network"
      );
    } finally {
      setIconSearching(false);
    }
  };

  // 自动防抖持久化
  useEffect(() => {
    const timer = setTimeout(() => {
      const s = getCurrentState();
      saveSavedDraft({
        ...s,
        customText: s.customText || "A",
        sourceMode: s.sourceMode || "clipart",
      });
    }, 300);
    return () => clearTimeout(timer);
  });

  // 导出配置 JSON
  const exportConfigJson = () => {
    const jsonStr = JSON.stringify(getCurrentState(), null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qm-icon-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ZH" ? "已导出配置 JSON" : "Exported config JSON");
  };

  // 导入配置 JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        saveState();
        restoreSnapshot(parsed);
        toast.success(
          lang === "ZH" ? "已导入并应用配置 JSON" : "Imported config JSON"
        );
      } catch {
        toast.error(
          lang === "ZH" ? "JSON 格式有误，导入失败" : "Invalid JSON file"
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 过滤后的 Emoji
  const filteredEmojis = useMemo(() => {
    const cat = EMOJI_CATEGORIES.find(c => c.id === emojiCategory);
    const list = cat ? cat.emojis : EMOJI_CATEGORIES[0]?.emojis || [];
    if (emojiSearch.trim()) {
      return list.filter(char => char.includes(emojiSearch.trim()));
    }
    return list;
  }, [emojiCategory, emojiSearch]);

  const currentState = getCurrentState();
  const filePlan = useMemo(
    () => buildZipPlan(selectedPlatforms),
    [selectedPlatforms]
  );
  const allFilesList = useMemo(() => {
    const list: string[] = [];
    filePlan.forEach(p => {
      p.files.forEach(f => list.push(f));
    });
    return list;
  }, [filePlan]);

  return (
    <div className={`workbench ${dark ? "dark-mode" : ""}`}>
      <TopBar
        dark={dark}
        lang={lang}
        onHistory={() => setHistoryOpen(true)}
        onRandom={randomize}
        onShare={handleShare}
        onLanguage={() => setLang(l => (l === "ZH" ? "EN" : "ZH"))}
        onHelp={() => setHelpOpen(true)}
        onDownload={download}
        onTheme={() => toggleTheme?.()}
      />

      <div className="workspace">
        <aside className="panel left">
          {/* ① 图标形状 */}
          <details className="acc" open>
            <summary>
              <i className="dot d1" />
              <span>{t.editor.iconShape}</span>
            </summary>
            <div className="acc-body">
              {/* 分段器 */}
              <div className="source-picker">
                <div className="seg source-main">
                  <button
                    className={sourceMode === "clipart" ? "active" : ""}
                    onClick={() => {
                      saveState();
                      setSourceMode("clipart");
                    }}
                  >
                    图形
                  </button>
                  <button
                    className={sourceMode === "text" ? "active" : ""}
                    onClick={() => {
                      saveState();
                      setSourceMode("text");
                    }}
                  >
                    文本
                  </button>
                  <div className="source-more-wrap">
                    <button
                      className={`source-more-btn ${["emoji", "image", "logo", "svg"].includes(sourceMode) ? "active" : ""}`}
                      onClick={() => setSourceMoreOpen(!sourceMoreOpen)}
                      title="选择更多图标类型"
                    >
                      {sourceMode === "emoji"
                        ? "Emoji"
                        : sourceMode === "image"
                          ? "图片"
                          : sourceMode === "logo"
                            ? "Logo"
                            : sourceMode === "svg"
                              ? "SVG"
                              : "..."}
                    </button>
                    {sourceMoreOpen && (
                      <div className="source-menu">
                        <button
                          onClick={() => {
                            saveState();
                            setSourceMode("emoji");
                            setSourceMoreOpen(false);
                          }}
                        >
                          <Smile size={13} /> Emoji
                        </button>
                        <button
                          onClick={() => {
                            saveState();
                            setSourceMode("image");
                            setSourceMoreOpen(false);
                          }}
                        >
                          <ImageIcon size={13} /> 图片
                        </button>
                        <button
                          onClick={() => {
                            saveState();
                            setSourceMode("logo");
                            setSourceMoreOpen(false);
                          }}
                        >
                          <Palette size={13} /> Logo
                        </button>
                        <button
                          onClick={() => {
                            saveState();
                            setSourceMode("svg");
                            setSourceMoreOpen(false);
                          }}
                        >
                          <FileCode size={13} /> SVG
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 图形模式 */}
              {sourceMode === "clipart" && (
                <div className="src-page">
                  <input
                    type="text"
                    className="input"
                    placeholder="搜索 2w+ 图标或符号（支持中文）…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="clip-grid">
                    {iconResults.map(item => (
                      <button
                        key={item.id}
                        className={
                          shape === item.id || iconId === item.id
                            ? "active"
                            : ""
                        }
                        onClick={() => selectIcon(item)}
                        title={
                          item.label
                            ? `${item.name} (${item.label})`
                            : item.name
                        }
                      >
                        <IconThumb item={item} size={20} />
                      </button>
                    ))}
                  </div>
                  {iconSearchError && (
                    <div className="net-hint">{iconSearchError}</div>
                  )}
                </div>
              )}

              {/* 文本模式 */}
              {sourceMode === "text" && (
                <div className="src-page">
                  <div className="field">
                    <label>
                      <span>文字内容</span>
                      <small>支持换行</small>
                    </label>
                    <textarea
                      className="input"
                      rows={2}
                      value={customText}
                      onChange={e => {
                        saveState();
                        setCustomText(e.target.value);
                      }}
                    />
                  </div>
                  <div className="field">
                    <label>字体</label>
                    <select
                      className="input"
                      value={fontFamily}
                      onChange={e => {
                        saveState();
                        setFontFamily(e.target.value);
                      }}
                    >
                      {FONTS_LIST.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>字重</label>
                    <div className="seg small">
                      {[400, 500, 700, 800, 900].map(w => (
                        <button
                          key={w}
                          className={fontWeight === w ? "active" : ""}
                          onClick={() => {
                            saveState();
                            setFontWeight(w);
                          }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>文字变形</label>
                    <div className="seg small">
                      {(["none", "arc-up", "arc-down"] as const).map(t => (
                        <button
                          key={t}
                          className={textTransform === t ? "active" : ""}
                          onClick={() => {
                            saveState();
                            setTextTransform(t);
                          }}
                        >
                          {t === "none"
                            ? "无"
                            : t === "arc-up"
                              ? "上弧"
                              : "下弧"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {textTransform !== "none" && (
                    <div className="field">
                      <label>
                        <span>弧度</span>
                        <output>{textArc}°</output>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="90"
                        value={textArc}
                        onChange={e => setTextArc(parseInt(e.target.value, 10))}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Emoji 模式 */}
              {sourceMode === "emoji" && (
                <div className="src-page">
                  <input
                    type="text"
                    className="input"
                    placeholder="搜索 Emoji…"
                    value={emojiSearch}
                    onChange={e => setEmojiSearch(e.target.value)}
                  />
                  <div className="chip-row">
                    {EMOJI_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className={`chip ${emojiCategory === cat.id ? "active" : ""}`}
                        onClick={() => setEmojiCategory(cat.id)}
                      >
                        {lang === "ZH" ? cat.labelZh : cat.labelEn}
                      </button>
                    ))}
                  </div>
                  <div className="clip-grid emoji">
                    {filteredEmojis.map((eChar, idx) => (
                      <button
                        key={idx}
                        className={emojiChar === eChar ? "active" : ""}
                        onClick={() => {
                          saveState();
                          setEmojiChar(eChar);
                        }}
                      >
                        {eChar}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 图片模式 */}
              {sourceMode === "image" && (
                <div className="src-page">
                  <div
                    className="drop"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = evt => {
                          saveState();
                          setCustomImageDataUrl(evt.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p>
                      <b>点击上传</b>或拖拽图片到此处
                    </p>
                    <small>PNG / JPG / SVG / WebP，建议透明背景</small>
                  </div>
                  {customImageDataUrl && (
                    <div style={{ marginTop: 8 }}>
                      <div className="field">
                        <label>重新着色</label>
                        <div className="seg small">
                          <button
                            className={!imageMonochrome ? "active" : ""}
                            onClick={() => setImageMonochrome(false)}
                          >
                            原图
                          </button>
                          <button
                            className={imageMonochrome ? "active" : ""}
                            onClick={() => setImageMonochrome(true)}
                          >
                            单色化
                          </button>
                        </div>
                      </div>
                      <button
                        className="btn ghost small"
                        style={{ marginTop: 6 }}
                        onClick={() => setCustomImageDataUrl("")}
                      >
                        移除图片
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SVG 模式 */}
              {sourceMode === "svg" && (
                <div className="src-page">
                  <div className="field">
                    <label>粘贴 SVG 代码</label>
                    <textarea
                      className="input mono"
                      rows={4}
                      value={customSvgCode}
                      onChange={e => setCustomSvgCode(e.target.value)}
                      placeholder='<svg viewBox="0 0 24 24"><path d="..."/></svg>'
                    />
                  </div>
                  <button
                    className="btn ghost small"
                    onClick={() => {
                      if (!customSvgCode.trim()) return;
                      saveState();
                      setIconSvg(customSvgCode);
                      toast.success("已解析并应用 SVG 代码");
                    }}
                  >
                    解析并应用
                  </button>
                </div>
              )}

              {/* Logo 模式 */}
              {sourceMode === "logo" && (
                <div className="src-page">
                  <input
                    type="text"
                    className="input"
                    placeholder="搜索品牌 Logo（如 github, apple, react）…"
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                  />
                  <div className="clip-grid">
                    {BRAND_STARTER.map(n => {
                      const brandItem = {
                        id: `simple-icons:${n}`,
                        prefix: "simple-icons",
                        name: n,
                        collection: "Simple Icons",
                      };
                      return (
                        <button
                          key={n}
                          className={
                            shape === brandItem.id || iconId === brandItem.id
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            saveState();
                            selectIcon(brandItem);
                          }}
                          title={n}
                        >
                          <IconThumb item={brandItem} size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="sep" />

              {/* 图标颜色 */}
              <div className="field">
                <label>图标颜色</label>
                <div className="seg small">
                  <button
                    className={fgType === "solid" ? "active" : ""}
                    onClick={() => {
                      saveState();
                      setFgType("solid");
                    }}
                  >
                    单色
                  </button>
                  <button
                    className={fgType === "gradient" ? "active" : ""}
                    onClick={() => {
                      saveState();
                      setFgType("gradient");
                    }}
                  >
                    渐变
                  </button>
                </div>
              </div>

              <div className="color-row">
                <input
                  type="color"
                  value={fg}
                  onChange={e => setFg(e.target.value)}
                />
                {fgType === "gradient" && (
                  <input
                    type="color"
                    value={fgColor2}
                    onChange={e => setFgColor2(e.target.value)}
                  />
                )}
                <span className="swatches">
                  {PRESET_SWATCHES.map(hex => (
                    <i
                      key={hex}
                      style={{ backgroundColor: hex }}
                      onClick={() => {
                        saveState();
                        setFg(hex);
                      }}
                    />
                  ))}
                </span>
              </div>

              <hr className="sep" />

              {/* 变换控制器 */}
              <div className="field">
                <label>
                  <span>缩放</span>
                  <output>{scale}%</output>
                </label>
                <input
                  type="range"
                  min="15"
                  max="130"
                  value={scale}
                  onChange={e => setScale(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>
                    <span>X 偏移</span>
                    <output>{dx}</output>
                  </label>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={dx}
                    onChange={e => setDx(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="field">
                  <label>
                    <span>Y 偏移</span>
                    <output>{dy}</output>
                  </label>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={dy}
                    onChange={e => setDy(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>

              <div className="field">
                <label>
                  <span>旋转</span>
                  <output>{rotation}°</output>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={e => setRotation(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="btn-row">
                <button
                  className="btn ghost small"
                  onClick={() => {
                    saveState();
                    setRotation(r => r - 90);
                  }}
                >
                  ↺ −90°
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    saveState();
                    setRotation(r => r + 90);
                  }}
                >
                  ↻ +90°
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    saveState();
                    setScale(s => -s);
                  }}
                >
                  翻转
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    saveState();
                    setScale(60);
                    setDx(0);
                    setDy(0);
                    setRotation(0);
                  }}
                >
                  重置
                </button>
              </div>
            </div>
          </details>

          {/* ② 背景设计 */}
          <details className="acc" open>
            <summary>
              <i className="dot d2" />
              <span>{t.editor.bgDesign}</span>
            </summary>
            <div className="acc-body">
              <div className="seg wrap">
                {(
                  [
                    "solid",
                    "linear",
                    "radial",
                    "conic",
                    "image",
                    "transparent",
                  ] as const
                ).map(bg => (
                  <button
                    key={bg}
                    className={background === bg ? "active" : ""}
                    onClick={() => {
                      saveState();
                      setBackground(bg);
                    }}
                  >
                    {bg === "solid"
                      ? "纯色"
                      : bg === "linear"
                        ? "线性"
                        : bg === "radial"
                          ? "径向"
                          : bg === "conic"
                            ? "锥形"
                            : bg === "image"
                              ? "图片"
                              : "透明"}
                  </button>
                ))}
              </div>

              {/* 渐变预设 */}
              <div className="field">
                <label>渐变预设</label>
                <div className="grad-presets">
                  {GRADIENT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      style={{
                        background: `linear-gradient(${p.angle}deg, ${p.color1}, ${p.color2})`,
                      }}
                      onClick={() => {
                        saveState();
                        setBgColor1(p.color1);
                        setColor2(p.color2);
                        setBgAngle(p.angle);
                        setBackground("linear");
                      }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>

              {/* 颜色 1 与 颜色 2 */}
              <div className="field">
                <label>颜色 1</label>
                <div className="color-row">
                  <input
                    type="color"
                    value={bgColor1}
                    onChange={e => setBgColor1(e.target.value)}
                  />
                  <span className="swatches">
                    {PRESET_SWATCHES.map(hex => (
                      <i
                        key={hex}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          saveState();
                          setBgColor1(hex);
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>

              <div className="field">
                <label>颜色 2</label>
                <div className="color-row">
                  <input
                    type="color"
                    value={color2}
                    onChange={e => setColor2(e.target.value)}
                  />
                  <span className="swatches">
                    {PRESET_SWATCHES.map(hex => (
                      <i
                        key={hex}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          saveState();
                          setColor2(hex);
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>

              <div className="field">
                <label>
                  <span>渐变角度</span>
                  <output>{bgAngle}°</output>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={bgAngle}
                  onChange={e => setBgAngle(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="btn-row">
                <button className="btn ghost small" onClick={swapBgColors}>
                  ⇄ 交换
                </button>
                <button className="btn ghost small" onClick={randomPalette}>
                  随机配色
                </button>
              </div>

              <hr className="sep" />

              {/* 图案纹理叠加 */}
              <div className="field">
                <label>图案纹理叠加</label>
                <div className="texture-grid">
                  {PATTERN_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={pattern === opt.id ? "active" : ""}
                      onClick={() => {
                        saveState();
                        setPattern(opt.id as any);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {pattern !== "none" && (
                <div className="field-row">
                  <div className="field">
                    <label>
                      <span>强度</span>
                      <output>{patternOpacity}%</output>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={patternOpacity}
                      onChange={e =>
                        setPatternOpacity(parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>
                      <span>大小</span>
                      <output>{patternSize}</output>
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="32"
                      value={patternSize}
                      onChange={e =>
                        setPatternSize(parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="field">
                <label>
                  <span>噪点</span>
                  <output>{noise}%</output>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={noise}
                  onChange={e => setNoise(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </details>

          {/* ③ 设计模板 */}
          <details className="acc" open>
            <summary>
              <i className="dot d6" />
              <span>{t.editor.designTemplates}</span>
            </summary>
            <div className="acc-body">
              <div className="preset-grid">
                {(Object.keys(DESIGN_TEMPLATES) as DesignTemplateKey[]).map(
                  key => {
                    const item = DESIGN_TEMPLATES[key];
                    return (
                      <button
                        key={key}
                        className="template-icon-card"
                        onClick={() => applyTemplate(key)}
                        title={`${item.name} · ${item.description}`}
                      >
                        <AppMark
                          shape={item.shape || "rocket"}
                          fg={item.fg || "#ffffff"}
                          fgType={item.fgType || "solid"}
                          fgColor2={item.fgColor2}
                          fgAngle={item.fgAngle}
                          background={item.background || "linear"}
                          bgColor1={item.bgColor1}
                          color2={item.color2 || "#eab308"}
                          bgAngle={item.bgAngle ?? 135}
                          pattern={item.pattern}
                          noise={item.noise}
                          rotation={item.rotation ?? 0}
                          scale={item.scale ?? 60}
                          dx={item.dx ?? 0}
                          dy={item.dy ?? 0}
                          shadow={item.shadow ?? true}
                          mask={item.mask || "squircle"}
                          maskRadius={item.maskRadius ?? 22}
                          strokeEnabled={item.strokeEnabled}
                          strokeWidth={item.strokeWidth}
                          strokeColor={item.strokeColor}
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </details>

          {/* ④ 高级设置 */}
          <details className="acc advanced-shell" open>
            <summary>
              <i className="dot d4" />
              <span>{t.editor.advanced}</span>
            </summary>
            <div className="acc-body advanced-body">
              {/* (1) 形状蒙版 */}
              <details className="mini-acc" open>
                <summary>
                  <i className="dot d3" />
                  <span>形状蒙版</span>
                </summary>
                <div className="acc-body">
                  <div className="shape-grid">
                    {MASK_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        className={mask === opt.id ? "active" : ""}
                        onClick={() => {
                          saveState();
                          setMask(opt.id);
                        }}
                      >
                        {opt.labelZh}
                      </button>
                    ))}
                  </div>

                  <div className="field">
                    <label>
                      <span>外边距（透明留白）</span>
                      <output>{maskPad}%</output>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={maskPad}
                      onChange={e => setMaskPad(parseInt(e.target.value, 10))}
                    />
                  </div>

                  {mask === "custom" && (
                    <div className="field">
                      <label>
                        <span>自定义 SVG 蒙版</span>
                        <small>viewBox 0 0 100 100</small>
                      </label>
                      <textarea
                        className="input mono"
                        rows={2}
                        value={customMask}
                        onChange={e => setCustomMask(e.target.value)}
                      />
                      <button
                        className="btn ghost small"
                        style={{ marginTop: 6 }}
                        onClick={() => toast.success("已应用自定义蒙版")}
                      >
                        应用自定义蒙版
                      </button>
                    </div>
                  )}

                  <p className="hint">
                    蒙版作用于 Web / 桌面图标与中央画布；Android 与 iOS
                    导出按平台规范自动处理。
                  </p>
                </div>
              </details>

              {/* (2) 图层特效 */}
              <details className="mini-acc" open>
                <summary>
                  <i className="dot d4" />
                  <span>图层特效</span>
                </summary>
                <div className="acc-body">
                  <div className="field">
                    <label>图层可见性</label>
                    <div className="btn-row layer-row">
                      <button
                        className={`chip ${layersVisible.fg ? "active" : ""}`}
                        onClick={() =>
                          setLayersVisible(l => ({ ...l, fg: !l.fg }))
                        }
                      >
                        {layersVisible.fg ? "☑" : "☐"} 前景
                      </button>
                      <button
                        className={`chip ${layersVisible.bg ? "active" : ""}`}
                        onClick={() =>
                          setLayersVisible(l => ({ ...l, bg: !l.bg }))
                        }
                      >
                        {layersVisible.bg ? "☑" : "☐"} 背景
                      </button>
                      <button
                        className={`chip ${layersVisible.badge ? "active" : ""}`}
                        onClick={() =>
                          setLayersVisible(l => ({ ...l, badge: !l.badge }))
                        }
                      >
                        {layersVisible.badge ? "☑" : "☐"} 徽章
                      </button>
                    </div>
                  </div>

                  <hr className="sep" />

                  <div className="field">
                    <label>阴影</label>
                    <div className="seg">
                      {(["none", "soft", "hard", "long"] as const).map(s => (
                        <button
                          key={s}
                          className={shadowPreset === s ? "active" : ""}
                          onClick={() => {
                            saveState();
                            setShadowPreset(s);
                            setShadow(s !== "none");
                          }}
                        >
                          {s === "none"
                            ? "无"
                            : s === "soft"
                              ? "柔和"
                              : s === "hard"
                                ? "硬边"
                                : "长投影"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {shadowPreset !== "none" && (
                    <div>
                      <div className="field-row">
                        <div className="field">
                          <label>
                            <span>X</span>
                            <output>{shadowOffsetX}</output>
                          </label>
                          <input
                            type="range"
                            min="-30"
                            max="30"
                            value={shadowOffsetX}
                            onChange={e =>
                              setShadowOffsetX(parseInt(e.target.value, 10))
                            }
                          />
                        </div>
                        <div className="field">
                          <label>
                            <span>Y</span>
                            <output>{shadowOffsetY}</output>
                          </label>
                          <input
                            type="range"
                            min="-30"
                            max="30"
                            value={shadowOffsetY}
                            onChange={e =>
                              setShadowOffsetY(parseInt(e.target.value, 10))
                            }
                          />
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>
                            <span>模糊</span>
                            <output>{shadowBlur}</output>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            value={shadowBlur}
                            onChange={e =>
                              setShadowBlur(parseInt(e.target.value, 10))
                            }
                          />
                        </div>
                        <div className="field">
                          <label>
                            <span>透明度</span>
                            <output>{shadowAlpha}%</output>
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="90"
                            value={shadowAlpha}
                            onChange={e =>
                              setShadowAlpha(parseInt(e.target.value, 10))
                            }
                          />
                        </div>
                      </div>
                      <div className="color-row">
                        <input
                          type="color"
                          value={shadowColor}
                          onChange={e => setShadowColor(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <hr className="sep" />

                  <div className="field">
                    <label>
                      <span>描边</span>
                      <input
                        type="checkbox"
                        checked={strokeEnabled}
                        onChange={e => setStrokeEnabled(e.target.checked)}
                      />
                    </label>
                  </div>

                  <div className="field">
                    <label>
                      <span>发光</span>
                      <input
                        type="checkbox"
                        checked={glowEnabled}
                        onChange={e => setGlowEnabled(e.target.checked)}
                      />
                    </label>
                  </div>

                  <hr className="sep" />

                  <div className="field">
                    <label>整体光泽</label>
                    <div className="seg small">
                      {(["none", "top", "bevel"] as const).map(g => (
                        <button
                          key={g}
                          className={gloss === g ? "active" : ""}
                          onClick={() => {
                            saveState();
                            setGloss(g);
                          }}
                        >
                          {g === "none"
                            ? "无"
                            : g === "top"
                              ? "顶部高光"
                              : "斜面光"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>
                      <span>内边框细线</span>
                      <input
                        type="checkbox"
                        checked={innerBorder}
                        onChange={e => setInnerBorder(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </details>

              {/* (3) 徽章 / 角标 */}
              <details className="mini-acc" open>
                <summary>
                  <i className="dot d5" />
                  <span>徽章 / 角标</span>
                </summary>
                <div className="acc-body">
                  <div className="field">
                    <label>
                      <span>启用徽章</span>
                      <input
                        type="checkbox"
                        checked={badgeEnabled}
                        onChange={e => setBadgeEnabled(e.target.checked)}
                      />
                    </label>
                  </div>

                  {badgeEnabled && (
                    <div>
                      <div className="field">
                        <label>样式</label>
                        <div className="seg small">
                          <button
                            className={badgeStyle === "corner" ? "active" : ""}
                            onClick={() => setBadgeStyle("corner")}
                          >
                            角标
                          </button>
                          <button
                            className={badgeStyle === "bottom" ? "active" : ""}
                            onClick={() => setBadgeStyle("bottom")}
                          >
                            底部横条
                          </button>
                          <button
                            className={badgeStyle === "dot" ? "active" : ""}
                            onClick={() => setBadgeStyle("dot")}
                          >
                            圆点
                          </button>
                        </div>
                      </div>

                      <div className="field">
                        <label>徽章文字</label>
                        <input
                          type="text"
                          className="input"
                          value={badgeText}
                          onChange={e => setBadgeText(e.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>位置</label>
                        <div className="seg pos-4">
                          <button
                            className={
                              badgePosition === "top-left" ? "active" : ""
                            }
                            onClick={() => setBadgePosition("top-left")}
                          >
                            ◤
                          </button>
                          <button
                            className={
                              badgePosition === "top-right" ? "active" : ""
                            }
                            onClick={() => setBadgePosition("top-right")}
                          >
                            ◥
                          </button>
                          <button
                            className={
                              badgePosition === "bottom-left" ? "active" : ""
                            }
                            onClick={() => setBadgePosition("bottom-left")}
                          >
                            ◣
                          </button>
                          <button
                            className={
                              badgePosition === "bottom-right" ? "active" : ""
                            }
                            onClick={() => setBadgePosition("bottom-right")}
                          >
                            ◢
                          </button>
                        </div>
                      </div>

                      <div className="field">
                        <label>
                          <span>大小</span>
                          <output>{badgeSize}%</output>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={badgeSize}
                          onChange={e =>
                            setBadgeSize(parseInt(e.target.value, 10))
                          }
                        />
                      </div>

                      <div className="field-row">
                        <div className="field">
                          <label>底色</label>
                          <input
                            type="color"
                            value={badgeBg}
                            onChange={e => setBadgeBg(e.target.value)}
                          />
                        </div>
                        <div className="field">
                          <label>文字色</label>
                          <input
                            type="color"
                            value={badgeColor}
                            onChange={e => setBadgeColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </details>
        </aside>

        {/* 中央主工作区 */}
        <section className="stage">
          <div className="stage-toolbar">
            <div className="seg small">
              <button
                className={canvasBg === "light" ? "active" : ""}
                onClick={() => setCanvasBg("light")}
              >
                浅色
              </button>
              <button
                className={canvasBg === "dark" ? "active" : ""}
                onClick={() => setCanvasBg("dark")}
              >
                深色
              </button>
              <button
                className={canvasBg === "checker" ? "active" : ""}
                onClick={() => setCanvasBg("checker")}
              >
                棋盘格
              </button>
            </div>
            <span className="contrast-pill good">
              对比度 {contrastRatio}:1 {contrastRatio >= 3 ? "✓" : "!"}
            </span>
          </div>

          <div className={`stage-canvas-wrap ${canvasBg}`}>
            <div className="main-canvas-shadow">
              <AppMark {...currentState} />
            </div>
          </div>

          <div className="stage-info">1024 × 1024 px · 实时渲染</div>

          <div className="stage-actions">
            <button className="btn ghost small" onClick={undo} title="Ctrl+Z">
              <Undo2 size={13} />
              <span>撤销</span>
            </button>
            <button
              className="btn ghost small"
              onClick={redo}
              title="Ctrl+Shift+Z"
            >
              <Redo2 size={13} />
              <span>重做</span>
            </button>
            <button className="btn ghost small" onClick={resetToDefault}>
              <RotateCcw size={13} />
              <span>重置全部</span>
            </button>
            <button
              className="btn ghost small"
              onClick={saveToHistory}
              title="Ctrl+S"
            >
              <Save size={13} />
              <span>存入历史</span>
            </button>
          </div>

          <div className="appname-row">
            <label>应用名称</label>
            <input
              type="text"
              className="input"
              value={appName}
              onChange={e => {
                saveState();
                setAppName(e.target.value);
              }}
            />
          </div>
        </section>

        {/* 右侧多平台仿真栏 */}
        <aside className="panel right">
          <div className="chip-row pv-filter">
            {(["all", "mobile", "desktop", "web"] as const).map(p => (
              <button
                key={p}
                className={`chip ${platform === p ? "active" : ""}`}
                onClick={() => setPlatform(p)}
              >
                {p === "all"
                  ? "全部"
                  : p === "mobile"
                    ? "移动端"
                    : p === "desktop"
                      ? "电脑端"
                      : "网页端"}
              </button>
            ))}
          </div>

          {/* Android */}
          {(platform === "all" || platform === "mobile") && (
            <details className="pv-card" open>
              <summary>Android</summary>
              <div className="pv-row">
                <AndroidShapeGrid {...currentState} />
              </div>
              <div className="pv-row">
                <AndroidNotificationBar {...currentState} />
              </div>
            </details>
          )}

          {/* iOS / iPadOS */}
          {(platform === "all" || platform === "mobile") && (
            <details className="pv-card" open>
              <summary>iOS / iPadOS</summary>
              <div className="pv-row">
                <IosHomeScreenGrid {...currentState} />
              </div>
            </details>
          )}

          {/* Web / PWA */}
          {(platform === "all" || platform === "web") && (
            <details className="pv-card" open>
              <summary>Web / PWA</summary>
              <WebTabSimulator {...currentState} />
            </details>
          )}

          {/* macOS / Windows */}
          {(platform === "all" || platform === "desktop") && (
            <details className="pv-card" open>
              <summary>macOS / Windows</summary>
              <MacWindowsPreview {...currentState} />
            </details>
          )}

          {/* watchOS / Apple TV */}
          {(platform === "all" || platform === "mobile") && (
            <details className="pv-card" open>
              <summary>watchOS / Apple TV</summary>
              <WatchAppleTvPreview {...currentState} />
            </details>
          )}
        </aside>
      </div>

      {/* 底部全局导出栏 */}
      <footer className="export-bar">
        <div className="exp-group">
          <b>平台</b>
          {(
            [
              { id: "android", label: "Android" },
              { id: "ios", label: "iOS" },
              { id: "web", label: "Web/PWA" },
              { id: "macos", label: "macOS + ICNS" },
              { id: "windows", label: "Windows + ICO" },
            ] as const
          ).map(item => (
            <label key={item.id} className="check mini">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(item.id)}
                onChange={() => {
                  setSelectedPlatforms(list =>
                    list.includes(item.id)
                      ? list.filter(p => p !== item.id)
                      : [...list, item.id]
                  );
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="exp-group">
          <b>附加格式</b>
          <label className="check mini">
            <input type="checkbox" checked disabled />
            <span>PNG</span>
          </label>
          <label className="check mini">
            <input
              type="checkbox"
              checked={format === "WebP"}
              onChange={e => setFormat(e.target.checked ? "WebP" : "PNG")}
            />
            <span>WebP</span>
          </label>
          <label className="check mini">
            <input
              type="checkbox"
              checked={format === "SVG"}
              onChange={e => setFormat(e.target.checked ? "SVG" : "PNG")}
            />
            <span>SVG</span>
          </label>
        </div>

        <div className="exp-group">
          <b>自定义尺寸</b>
          <input
            type="number"
            className="input tiny"
            value={customSizeInput}
            onChange={e =>
              setCustomSizeInput(parseInt(e.target.value, 10) || 512)
            }
          />
          <button
            className="btn ghost small"
            onClick={() => {
              if (
                customSizeInput > 0 &&
                !customSizes.includes(customSizeInput)
              ) {
                setCustomSizes(s => [...s, customSizeInput]);
              }
            }}
          >
            +
          </button>
          <span className="size-chips">
            {customSizes.map(sz => (
              <span
                key={sz}
                className="chip mini"
                onClick={() => setCustomSizes(s => s.filter(x => x !== sz))}
                title="点击删除"
              >
                {sz} ×
              </span>
            ))}
          </span>
        </div>

        <div className="exp-group grow" />

        <div className="exp-group">
          <button className="btn ghost" onClick={() => setFileListOpen(true)}>
            <Eye size={13} />
            <span>文件列表</span>
          </button>
          <button className="btn primary" onClick={downloadZip}>
            <Download size={13} />
            <span>下载 ZIP 包</span>
          </button>
        </div>
      </footer>

      {/* 弹窗 1：导出文件树清单 */}
      {fileListOpen && (
        <dialog className="modal-dialog" open>
          <div className="modal-content">
            <h2>导出资源包</h2>
            <div className="file-tree mono">
              {allFilesList.map((file, idx) => (
                <div key={idx} className="file-tree-item">
                  {file}
                </div>
              ))}
            </div>
            {zipProgress > 0 && (
              <div className="progress">
                <div style={{ width: `${zipProgress}%` }} />
                <span>正在渲染…</span>
              </div>
            )}
            <div className="dlg-actions">
              <button
                className="btn ghost"
                onClick={() => setFileListOpen(false)}
              >
                关闭
              </button>
              <button className="btn primary" onClick={downloadZip}>
                生成并下载 ZIP
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* 弹窗 2：历史记录 */}
      {historyOpen && (
        <dialog className="modal-dialog" open>
          <div className="modal-content">
            <h2>历史记录</h2>
            {savedHistory.length === 0 ? (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  padding: "16px 0",
                }}
              >
                暂无历史。点击画布下方「存入历史」或按 Ctrl+S 保存当前设计。
              </p>
            ) : (
              <div className="preset-grid history">
                {savedHistory.map(item => (
                  <button
                    key={item.id}
                    className="template-icon-card"
                    onClick={() => {
                      restoreSnapshot(item);
                      setHistoryOpen(false);
                    }}
                    title={`保存于 ${new Date(item.savedAt).toLocaleTimeString()}`}
                  >
                    <AppMark {...item} />
                  </button>
                ))}
              </div>
            )}
            <div className="dlg-actions">
              <button className="btn ghost small" onClick={exportConfigJson}>
                导出配置 JSON
              </button>
              <button
                className="btn ghost small"
                onClick={() => jsonImportInputRef.current?.click()}
              >
                导入配置 JSON
              </button>
              <input
                ref={jsonImportInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportJson}
              />
              <button
                className="btn ghost small danger"
                onClick={() => {
                  setSavedHistory([]);
                  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
                  toast.success("已清空历史记录");
                }}
              >
                清空
              </button>
              <span className="grow" />
              <button
                className="btn ghost"
                onClick={() => setHistoryOpen(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* 弹窗 3：快捷键指南 */}
      {helpOpen && (
        <dialog className="modal-dialog" open>
          <div className="modal-content">
            <h2>快捷键</h2>
            <table className="kbd-table">
              <tbody>
                <tr>
                  <td>
                    <kbd>Ctrl/⌘ + Z</kbd>
                  </td>
                  <td>撤销</td>
                  <td>
                    <kbd>Ctrl/⌘ + Shift + Z</kbd>
                  </td>
                  <td>重做</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl/⌘ + S</kbd>
                  </td>
                  <td>存入历史</td>
                  <td>
                    <kbd>Ctrl/⌘ + E</kbd>
                  </td>
                  <td>导出下载</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl/⌘ + H</kbd>
                  </td>
                  <td>历史记录</td>
                  <td>
                    <kbd>R</kbd>
                  </td>
                  <td>随机灵感</td>
                </tr>
                <tr>
                  <td>
                    <kbd>1 – 6</kbd>
                  </td>
                  <td>切换面板</td>
                  <td>
                    <kbd>D</kbd>
                  </td>
                  <td>深 / 浅画布环境</td>
                </tr>
              </tbody>
            </table>
            <div className="dlg-actions">
              <button className="btn ghost" onClick={() => setHelpOpen(false)}>
                关闭
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
