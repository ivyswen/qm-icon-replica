/*
 * QM icon 复刻提醒：这是一个高密度、浅色、工具型工作站，不加入营销页结构。
 * 布局以顶部工具栏、左控制栏、中央画布、右预览栏、底部导出栏为核心。
 */
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Files,
  FlipHorizontal,
  Globe2,
  HelpCircle,
  History,
  Info,
  Keyboard,
  Layers,
  Minus,
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
  Sparkles,
  Sun,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { getTranslation, type Language } from "@/features/i18n";
import { calculateContrastRatio, PRESET_SWATCHES } from "@/lib/color";
import { buildZipPlan, exportFormat, exportZip, getPlatformConfigFiles, type ExportDesignState, type ExportFormat, type ExportPlatform } from "@/features/export";
import {
  fetchIconDetail,
  fetchIconSvg,
  getBuiltinIcons,
  getDefaultStarterIcons,
  searchIconify,
  createTextSvg,
  BUILTIN_ICONS,
  BRAND_STARTER,
  type IconSearchItem,
} from "@/features/icons";
import {
  HISTORY_STORAGE_KEY,
  RANDOM_COLORS,
  SHAPE_OPTIONS,
  readSavedDraft,
  saveSavedDraft,
  clearSavedDraft,
  DEFAULT_DESIGN_DRAFT,
} from "@/features/editor/data/defaults";
import { DESIGN_TEMPLATES, type DesignTemplateKey } from "@/features/editor/data/templates";
import { ControlGroup, Segmented, SliderField, TinyColor, Toggle } from "@/features/editor/components/EditorPrimitives";
import AppMark from "@/features/editor/components/AppMark";
import PlatformPreview, {
  AndroidShapeGrid,
  AndroidNotificationBar,
  IosHomeScreenGrid,
  WebTabSimulator,
} from "@/features/editor/components/PlatformPreview";
import TopBar from "@/features/editor/components/TopBar";
import type { Background, PreviewPlatform as Platform, SavedSnapshot, Shape } from "@/features/editor/model";

function readSavedHistory(): SavedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
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

  const [helpOpen, setHelpOpen] = useState(false);
  const [canvasBg, setCanvasBg] = useState<"light" | "dark" | "checker">("light");

  const [shape, setShape] = useState<Shape>(initialDraft.shape);
  const [iconId, setIconId] = useState<string | undefined>(initialDraft.iconId);
  const [iconSvg, setIconSvg] = useState<string | undefined>(initialDraft.iconSvg);
  const [sourceMode, setSourceMode] = useState<"clipart" | "logo" | "text">(initialDraft.sourceMode);
  const [customText, setCustomText] = useState(initialDraft.customText);
  const [iconResults, setIconResults] = useState<IconSearchItem[]>(() => getDefaultStarterIcons());
  const [iconSearching, setIconSearching] = useState(false);
  const [iconSearchError, setIconSearchError] = useState("");

  // 前景颜色与渐变控制
  const [fg, setFg] = useState(initialDraft.fg);
  const [fgType, setFgType] = useState<"solid" | "gradient">(initialDraft.fgType);
  const [fgColor2, setFgColor2] = useState(initialDraft.fgColor2);
  const [fgAngle, setFgAngle] = useState(initialDraft.fgAngle);

  // 背景设计控制
  const [background, setBackground] = useState<Background>(initialDraft.background);
  const [bgColor1, setBgColor1] = useState(initialDraft.bgColor1);
  const [color2, setColor2] = useState(initialDraft.color2);
  const [bgAngle, setBgAngle] = useState(initialDraft.bgAngle);

  const [scale, setScale] = useState(initialDraft.scale);
  const [dx, setDx] = useState(initialDraft.dx);
  const [dy, setDy] = useState(initialDraft.dy);
  const [rotation, setRotation] = useState(initialDraft.rotation);
  const [shadow, setShadow] = useState(initialDraft.shadow);
  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [appName, setAppName] = useState(initialDraft.appName);
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [savedHistory, setSavedHistory] = useState<SavedSnapshot[]>(readSavedHistory);
  const [format, setFormat] = useState<ExportFormat>("PNG");
  const [size, setSize] = useState(initialDraft.size);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ExportPlatform[]>(["android", "ios", "web", "macos", "windows"]);
  const [zipPreviewOpen, setZipPreviewOpen] = useState(false);
  const [zipTreeExpanded, setZipTreeExpanded] = useState(true);
  const [zipFileFilter, setZipFileFilter] = useState<"all" | "PNG" | "WebP" | "SVG" | "ICO" | "config">("all");
  const [mask, setMask] = useState<ExportDesignState["mask"]>(initialDraft.mask);
  const [maskRadius, setMaskRadius] = useState(initialDraft.maskRadius);
  const [maskPad, setMaskPad] = useState(initialDraft.maskPad);
  const [customMask, setCustomMask] = useState(initialDraft.customMask);
  const [strokeEnabled, setStrokeEnabled] = useState(initialDraft.strokeEnabled);
  const [strokeWidth, setStrokeWidth] = useState(initialDraft.strokeWidth);
  const [strokeColor, setStrokeColor] = useState(initialDraft.strokeColor);
  const [glowEnabled, setGlowEnabled] = useState(initialDraft.glowEnabled);
  const [glowBlur, setGlowBlur] = useState(initialDraft.glowBlur);
  const [glowColor, setGlowColor] = useState(initialDraft.glowColor);
  const [badgeEnabled, setBadgeEnabled] = useState(initialDraft.badgeEnabled);
  const [badgeText, setBadgeText] = useState(initialDraft.badgeText);
  const [badgeColor, setBadgeColor] = useState(initialDraft.badgeColor);
  const [badgePosition, setBadgePosition] = useState<ExportDesignState["badgePosition"]>(initialDraft.badgePosition);

  const contrastRatio = useMemo(() => calculateContrastRatio(fg, bgColor1 || "#f8fafc"), [fg, bgColor1]);

  const zipPlan = useMemo(() => buildZipPlan(selectedPlatforms), [selectedPlatforms]);
  const zipConfigFiles = useMemo(
    () => Array.from(new Set(selectedPlatforms.flatMap((platform) => getPlatformConfigFiles(platform, appName)))),
    [selectedPlatforms, appName]
  );
  const zipFileMatches = (file: string) =>
    zipFileFilter === "all" || zipFileFilter === "config"
      ? zipFileFilter === "config"
        ? !/\.(png|webp|svg|ico)$/i.test(file)
        : true
      : file.toLowerCase().endsWith(`.${zipFileFilter.toLowerCase()}`);
  const filteredZipPlan = useMemo(
    () => zipPlan.map((entry) => ({ ...entry, files: entry.files.filter(zipFileMatches) })).filter((entry) => entry.files.length > 0),
    [zipPlan, zipFileFilter]
  );
  const filteredConfigFiles = useMemo(() => zipConfigFiles.filter(zipFileMatches), [zipConfigFiles, zipFileFilter]);
  const filteredIconFileCount = filteredZipPlan.reduce((count, entry) => count + entry.files.length, 0);
  const filteredFileCount = filteredIconFileCount + filteredConfigFiles.length + (zipFileFilter === "all" ? 1 : 0);

  // 图形模式下的智能搜索（本地 64+ 内置秒显 + 2w+ Iconify 在线库检索）
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
        if (results.length === 0 && localHits.length === 0) {
          setIconSearchError(lang === "ZH" ? "未找到匹配图标，建议尝试相近关键词" : "No icons found, try similar keywords");
        }
      } catch {
        if (localHits.length === 0) {
          setIconSearchError(lang === "ZH" ? "在线搜索不可用，已展示内置图标库" : "Online search unavailable, showing built-in icons");
          setIconResults(getBuiltinIcons());
        }
      } finally {
        setIconSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, sourceMode, lang]);

  // Logo 模式下的搜索
  useEffect(() => {
    if (sourceMode !== "logo") return;
    const trimmed = brandSearch.trim();
    if (!trimmed) {
      setIconResults(
        BRAND_STARTER.map((n) => ({
          id: `simple-icons:${n}`,
          prefix: "simple-icons",
          name: n,
          collection: "Simple Icons",
        }))
      );
      setIconSearching(false);
      return;
    }

    setIconSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchIconify(trimmed, 48, "simple-icons");
        setIconResults(results);
      } catch {
        setIconSearchError(lang === "ZH" ? "Logo 搜索不可用，请检查网络" : "Logo search unavailable, check network");
      } finally {
        setIconSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brandSearch, sourceMode, lang]);

  const selectIcon = async (item: IconSearchItem) => {
    saveState();
    if (item.isBuiltin) {
      setShape(item.id);
      setIconId(undefined);
      setIconSvg(undefined);
      toast.success(lang === "ZH" ? `已应用内置图标：${item.label || item.name}` : `Applied icon: ${item.name}`);
      return;
    }

    setIconSearching(true);
    setIconSearchError("");
    try {
      const detail = await fetchIconDetail(item.id);
      setIconId(item.id);
      setIconSvg(detail.svg);
      setShape(item.id);
      toast.success(lang === "ZH" ? `已载入 ${item.name}` : `Loaded ${item.name}`);
    } catch {
      setIconSearchError(lang === "ZH" ? "图标加载失败，请重试" : "Failed to load icon");
      toast.error(lang === "ZH" ? "图标加载失败，请检查网络" : "Icon load failed, check network");
    } finally {
      setIconSearching(false);
    }
  };

  const getCurrentState = (): ExportDesignState => ({
    shape,
    iconId,
    iconSvg,
    fg,
    fgType,
    fgColor2,
    fgAngle,
    background,
    bgColor1,
    color2,
    bgAngle,
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
    badgeEnabled,
    badgeText,
    badgeColor,
    badgePosition,
    shadow,
  });

  const restoreSnapshot = (snapshot: SavedSnapshot) => {
    setShape(snapshot.shape);
    setIconId(snapshot.iconId);
    setIconSvg(snapshot.iconSvg);
    setFg(snapshot.fg);
    setFgType(snapshot.fgType || "solid");
    setFgColor2(snapshot.fgColor2 || "#3b82f6");
    setFgAngle(snapshot.fgAngle ?? 90);
    setBackground(snapshot.background);
    setBgColor1(snapshot.bgColor1 || "#dceee9");
    setColor2(snapshot.color2);
    setBgAngle(snapshot.bgAngle ?? 135);
    setRotation(snapshot.rotation);
    setScale(snapshot.scale);
    setDx(snapshot.dx);
    setDy(snapshot.dy);
    setAppName(snapshot.appName);
    setSize(snapshot.size);
    setMask(snapshot.mask || "none");
    setMaskRadius(snapshot.maskRadius ?? 22);
    setMaskPad(snapshot.maskPad ?? 0);
    setCustomMask(snapshot.customMask || "M50 0 L100 100 L0 100 Z");
    setStrokeEnabled(snapshot.strokeEnabled ?? false);
    setStrokeWidth(snapshot.strokeWidth ?? 2);
    setStrokeColor(snapshot.strokeColor || "#ffffff");
    setGlowEnabled(snapshot.glowEnabled ?? false);
    setGlowBlur(snapshot.glowBlur ?? 8);
    setGlowColor(snapshot.glowColor || "#0f766e");
    setBadgeEnabled(snapshot.badgeEnabled ?? false);
    setBadgeText(snapshot.badgeText || "✓");
    setBadgeColor(snapshot.badgeColor || "#0f766e");
    setBadgePosition(snapshot.badgePosition || "top-right");
    setShadow(snapshot.shadow ?? true);
    setHistoryOpen(false);
    toast.success(lang === "ZH" ? "已恢复历史设计" : "Restored history snapshot");
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(savedHistory));
    } catch {
      toast.error(lang === "ZH" ? "历史记录无法写入浏览器存储" : "Failed to write history to local storage");
    }
  }, [savedHistory, lang]);

  // 自动防抖持久化当前设计草稿到本地存储（300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSavedDraft({
        sourceMode,
        customText,
        shape,
        iconId,
        iconSvg,
        fg,
        fgType,
        fgColor2,
        fgAngle,
        background,
        bgColor1,
        color2,
        bgAngle,
        scale,
        dx,
        dy,
        rotation,
        shadow,
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
        badgeEnabled,
        badgeText,
        badgeColor,
        badgePosition,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    sourceMode,
    customText,
    shape,
    iconId,
    iconSvg,
    fg,
    fgType,
    fgColor2,
    fgAngle,
    background,
    bgColor1,
    color2,
    bgAngle,
    scale,
    dx,
    dy,
    rotation,
    shadow,
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
    badgeEnabled,
    badgeText,
    badgeColor,
    badgePosition,
  ]);

  const resetToDefault = () => {
    saveState();
    clearSavedDraft();
    const def = DEFAULT_DESIGN_DRAFT;
    setSourceMode(def.sourceMode);
    setCustomText(def.customText);
    setShape(def.shape);
    setIconId(undefined);
    setIconSvg(undefined);
    setFg(def.fg);
    setFgType(def.fgType);
    setFgColor2(def.fgColor2);
    setFgAngle(def.fgAngle);
    setBackground(def.background);
    setBgColor1(def.bgColor1);
    setColor2(def.color2);
    setBgAngle(def.bgAngle);
    setScale(def.scale);
    setDx(def.dx);
    setDy(def.dy);
    setRotation(def.rotation);
    setShadow(def.shadow);
    setAppName(def.appName);
    setSize(def.size);
    setMask(def.mask);
    setMaskRadius(def.maskRadius);
    setMaskPad(def.maskPad);
    setCustomMask(def.customMask);
    setStrokeEnabled(def.strokeEnabled);
    setStrokeWidth(def.strokeWidth);
    setStrokeColor(def.strokeColor);
    setGlowEnabled(def.glowEnabled);
    setGlowBlur(def.glowBlur);
    setGlowColor(def.glowColor);
    setBadgeEnabled(def.badgeEnabled);
    setBadgeText(def.badgeText);
    setBadgeColor(def.badgeColor);
    setBadgePosition(def.badgePosition);
    toast.success(lang === "ZH" ? "已重置为默认设计" : "Reset to default design");
  };

  const saveState = () => {
    setUndoStack((states) => [...states.slice(-9), JSON.stringify(getCurrentState())]);
    setRedoStack([]);
  };

  const saveToHistory = () => {
    const snapshot: SavedSnapshot = { ...getCurrentState(), id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, savedAt: Date.now() };
    setSavedHistory((items) => [snapshot, ...items].slice(0, 20));
    toast.success(lang === "ZH" ? "已存入浏览器历史" : "Saved snapshot to browser history");
  };

  const randomize = () => {
    const colors = RANDOM_COLORS;
    const nextIcon = BUILTIN_ICONS[Math.floor(Math.random() * BUILTIN_ICONS.length)];
    const nextFg = colors[Math.floor(Math.random() * colors.length)];
    const nextColor2 = colors[(colors.indexOf(nextFg) + 2) % colors.length];
    const nextBg1 = colors[(colors.indexOf(nextFg) + 4) % colors.length];
    saveState();
    setShape(nextIcon.n);
    setIconId(undefined);
    setIconSvg(undefined);
    setFg(nextFg);
    setBgColor1(nextBg1);
    setColor2(nextColor2);
    toast.success(lang === "ZH" ? `已随机生成：${nextIcon.label} 方案` : `Randomized: ${nextIcon.n}`);
  };

  const applyTemplate = (key: DesignTemplateKey) => {
    saveState();
    const preset = DESIGN_TEMPLATES[key];
    if (preset.shape) setShape(preset.shape);
    if (preset.fg) setFg(preset.fg);
    if (preset.fgType) setFgType(preset.fgType);
    if (preset.fgColor2) setFgColor2(preset.fgColor2);
    if (preset.fgAngle !== undefined) setFgAngle(preset.fgAngle);
    if (preset.background) setBackground(preset.background);
    if (preset.bgColor1) setBgColor1(preset.bgColor1);
    if (preset.color2) setColor2(preset.color2);
    if (preset.bgAngle !== undefined) setBgAngle(preset.bgAngle);
    if (preset.scale !== undefined) setScale(preset.scale);
    if (preset.rotation !== undefined) setRotation(preset.rotation);
    if (preset.mask) setMask(preset.mask);
    if (preset.maskRadius !== undefined) setMaskRadius(preset.maskRadius);
    if (preset.shadow !== undefined) setShadow(preset.shadow);
    if (preset.glowEnabled !== undefined) setGlowEnabled(preset.glowEnabled);
    if (preset.glowBlur !== undefined) setGlowBlur(preset.glowBlur);
    if (preset.glowColor) setGlowColor(preset.glowColor);
    if (preset.strokeEnabled !== undefined) setStrokeEnabled(preset.strokeEnabled);
    if (preset.strokeWidth !== undefined) setStrokeWidth(preset.strokeWidth);
    if (preset.strokeColor) setStrokeColor(preset.strokeColor);
    setIconId(undefined);
    setIconSvg(undefined);
    toast.success(lang === "ZH" ? `已应用「${key}」设计模板` : `Applied preset: ${key}`);
  };

  const swapBgColors = () => {
    saveState();
    const temp = bgColor1;
    setBgColor1(color2);
    setColor2(temp);
    toast.success(lang === "ZH" ? "已交换背景渐变色" : "Swapped background gradient");
  };

  const randomPalette = () => {
    saveState();
    const c1 = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    const c2 = RANDOM_COLORS[(RANDOM_COLORS.indexOf(c1) + 3) % RANDOM_COLORS.length];
    setBgColor1(c1);
    setColor2(c2);
    toast.success(lang === "ZH" ? "已生成随机背景配色" : "Generated random palette");
  };

  const download = () => {
    void exportFormat(getCurrentState(), format)
      .then(() => toast.success(lang === "ZH" ? `${format} 已下载` : `${format} downloaded`))
      .catch(() => toast.error(lang === "ZH" ? "导出失败，请重试" : "Export failed"));
  };

  const openZipPreview = () => setZipPreviewOpen(true);

  const downloadZip = () => {
    void exportZip(getCurrentState(), selectedPlatforms)
      .then(({ platformCount, fileCount }) =>
        toast.success(lang === "ZH" ? "ZIP 图标包已下载" : "ZIP Package Downloaded", {
          description: lang === "ZH" ? `${platformCount} 个平台 · ${fileCount} 个文件，已按平台目录整理` : `${platformCount} platforms · ${fileCount} files`,
        })
      )
      .catch(() => toast.error(lang === "ZH" ? "ZIP 导出失败，请重试" : "ZIP export failed"));
  };

  const toggleExportPlatform = (platformId: ExportPlatform) => {
    setSelectedPlatforms((platforms) =>
      platforms.includes(platformId) ? platforms.filter((item) => item !== platformId) : [...platforms, platformId]
    );
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

  const filteredPreview = (group: Platform) => platform === "all" || platform === group;

  return (
    <div className={`workbench ${dark ? "dark-mode" : ""}`}>
      <TopBar
        dark={dark}
        lang={lang}
        onHistory={() => setHistoryOpen(true)}
        onRandom={randomize}
        onShare={handleShare}
        onLanguage={() => {
          const next = lang === "ZH" ? "EN" : "ZH";
          setLang(next);
          toast.success(next === "EN" ? "Switched to English" : "已切换为中文");
        }}
        onHelp={() => setHelpOpen(true)}
        onDownload={download}
        onTheme={() => toggleTheme?.()}
      />

      <div className="workspace">
        <button className="mobile-panel-toggle left-toggle" onClick={() => setMobileLeft(!mobileLeft)} aria-label="打开设置面板">
          <PanelLeft size={16} />
        </button>
        <aside className={`settings-panel ${mobileLeft ? "mobile-open" : ""}`}>
          <div className="panel-mobile-head">
            <strong>{t.editor.designControls}</strong>
            <button onClick={() => setMobileLeft(false)}>
              <X size={15} />
            </button>
          </div>
          <ControlGroup title={t.editor.iconShape} tone="teal">
            <Segmented
              value={sourceMode === "clipart" ? t.editor.clipart : sourceMode === "logo" ? t.editor.logo : t.editor.text}
              options={[t.editor.clipart, t.editor.logo, t.editor.text]}
              onChange={(value) => {
                if (value === t.editor.logo) {
                  setSourceMode("logo");
                  setIconResults(
                    BRAND_STARTER.map((n) => ({
                      id: `simple-icons:${n}`,
                      prefix: "simple-icons",
                      name: n,
                      collection: "Simple Icons",
                    }))
                  );
                } else if (value === t.editor.text) {
                  setSourceMode("text");
                  setShape("text");
                  setIconId(undefined);
                  setIconSvg(createTextSvg(customText));
                } else {
                  setSourceMode("clipart");
                  setIconResults(getDefaultStarterIcons());
                }
              }}
            />

            {sourceMode === "clipart" && (
              <>
                <div className="search-box">
                  <Search size={13} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t.editor.searchPlaceholder}
                  />
                  {search && (
                    <button className="icon-clear" onClick={() => setSearch("")} aria-label="清空搜索">
                      <X size={11} />
                    </button>
                  )}
                  <span className="search-submit" aria-label="搜索状态">
                    {iconSearching ? "…" : "⌕"}
                  </span>
                </div>
                {iconSearchError && <div className="icon-search-error">{iconSearchError}</div>}

                <div className="clip-grid">
                  {iconResults.map((item) => {
                    const isSelected = (!iconSvg && shape === item.id) || iconId === item.id;
                    return (
                      <button
                        key={item.id}
                        className={isSelected ? "active" : ""}
                        onClick={() => void selectIcon(item)}
                        title={item.label ? `${item.label} (${item.name})` : item.id}
                      >
                        {item.isBuiltin && item.d ? (
                          <svg viewBox="0 0 24 24">
                            <path d={item.d} fill="currentColor" fillRule={item.fr} />
                          </svg>
                        ) : (
                          <img
                            src={`https://api.iconify.design/${item.prefix}/${item.name}.svg?color=%23808080`}
                            loading="lazy"
                            alt={item.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = "0.2";
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {sourceMode === "logo" && (
              <>
                <div className="search-box">
                  <Search size={13} />
                  <input
                    value={brandSearch}
                    onChange={(event) => setBrandSearch(event.target.value)}
                    placeholder={t.editor.brandSearchPlaceholder}
                  />
                  {brandSearch && (
                    <button className="icon-clear" onClick={() => setBrandSearch("")} aria-label="清空搜索">
                      <X size={11} />
                    </button>
                  )}
                  <span className="search-submit" aria-label="搜索状态">
                    {iconSearching ? "…" : "⌕"}
                  </span>
                </div>
                {iconSearchError && <div className="icon-search-error">{iconSearchError}</div>}
                <div className="clip-grid">
                  {iconResults.map((item) => {
                    const isSelected = iconId === item.id;
                    return (
                      <button
                        key={item.id}
                        className={isSelected ? "active" : ""}
                        onClick={() => void selectIcon(item)}
                        title={item.name}
                      >
                        <img
                          src={`https://api.iconify.design/${item.prefix}/${item.name}.svg?color=%23808080`}
                          loading="lazy"
                          alt={item.name}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {sourceMode === "text" && (
              <div className="text-mode-box" style={{ padding: "8px 0" }}>
                <div className="field-label">{t.editor.textContent}</div>
                <div className="search-box">
                  <input
                    type="text"
                    value={customText}
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomText(val);
                      setShape("text");
                      setIconId(undefined);
                      setIconSvg(createTextSvg(val));
                    }}
                    placeholder={t.editor.textPlaceholder}
                  />
                  {customText && (
                    <button
                      className="icon-clear"
                      onClick={() => {
                        setCustomText("");
                        setShape("text");
                        setIconId(undefined);
                        setIconSvg(createTextSvg(""));
                      }}
                      aria-label="清空文本"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="field-label">{t.editor.iconColor}</div>
            <Segmented
              value={fgType === "gradient" ? t.editor.gradient : t.editor.solid}
              options={[t.editor.solid, t.editor.gradient]}
              onChange={(value) => {
                saveState();
                const nextType = value === t.editor.gradient ? "gradient" : "solid";
                setFgType(nextType);
                toast.success(nextType === "gradient" ? (lang === "ZH" ? "已开启图标渐变" : "Enabled gradient icon") : (lang === "ZH" ? "已切换为单色图标" : "Switched to solid icon"));
              }}
            />

            {fgType === "solid" ? (
              <>
                <TinyColor
                  value={fg}
                  onChange={(value) => {
                    saveState();
                    setFg(value);
                  }}
                />
                <div className="swatch-bar">
                  {PRESET_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      className={`swatch-circle ${fg.toLowerCase() === hex.toLowerCase() ? "active" : ""}`}
                      style={{ backgroundColor: hex }}
                      onClick={() => {
                        saveState();
                        setFg(hex);
                      }}
                      title={hex}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="color-pair">
                  <TinyColor
                    value={fg}
                    onChange={(value) => {
                      saveState();
                      setFg(value);
                    }}
                  />
                  <TinyColor
                    value={fgColor2}
                    onChange={(value) => {
                      saveState();
                      setFgColor2(value);
                    }}
                  />
                </div>
                <SliderField label={t.editor.iconGradientAngle} value={fgAngle} min={0} max={360} suffix="°" onChange={setFgAngle} />
                <div className="quick-actions">
                  <button
                    onClick={() => {
                      saveState();
                      const temp = fg;
                      setFg(fgColor2);
                      setFgColor2(temp);
                      toast.success(lang === "ZH" ? "已交换图标渐变色" : "Swapped icon colors");
                    }}
                  >
                    {t.editor.swapIconGradient}
                  </button>
                </div>
              </>
            )}

            <SliderField label={t.editor.scale} value={scale} min={10} max={250} suffix="%" onChange={setScale} />
            <div className="dual-sliders">
              <SliderField label={t.editor.xOffset} value={dx} min={-60} max={60} onChange={setDx} />
              <SliderField label={t.editor.yOffset} value={dy} min={-60} max={60} onChange={setDy} />
            </div>
            <SliderField label={t.editor.rotation} value={rotation} min={-180} max={180} suffix="°" onChange={setRotation} />
            <div className="quick-actions-grid">
              <button onClick={() => setRotation((value) => value - 90)}>
                <RotateCcw size={12} />−90°
              </button>
              <button onClick={() => setRotation((value) => value + 90)}>
                <RotateCw size={12} />+90°
              </button>
              <button onClick={() => setDx((value) => -value)}>
                <FlipHorizontal size={12} />{t.editor.flip}
              </button>
              <button
                onClick={() => {
                  setScale(60);
                  setDx(0);
                  setDy(0);
                  setRotation(0);
                }}
              >
                <RotateCcw size={12} />{t.editor.reset}
              </button>
            </div>
          </ControlGroup>

          <ControlGroup title={t.editor.bgDesign} tone="amber" defaultOpen>
            <Segmented
              value={
                background === "solid"
                  ? t.editor.pureColor
                  : background === "linear"
                    ? t.editor.linear
                    : background === "radial"
                      ? t.editor.radial
                      : background === "conic"
                        ? t.editor.conic
                        : background === "image"
                          ? t.editor.image
                          : t.editor.transparent
              }
              options={[t.editor.pureColor, t.editor.linear, t.editor.radial, t.editor.conic, t.editor.image, t.editor.transparent]}
              onChange={(value) =>
                setBackground(
                  value === t.editor.pureColor
                    ? "solid"
                    : value === t.editor.linear
                      ? "linear"
                      : value === t.editor.radial
                        ? "radial"
                        : value === t.editor.conic
                          ? "conic"
                          : value === t.editor.image
                            ? "image"
                            : "transparent"
                )
              }
            />
            {background === "solid" ? (
              <>
                <TinyColor
                  value={bgColor1}
                  onChange={(val) => {
                    saveState();
                    setBgColor1(val);
                  }}
                />
                <div className="quick-actions">
                  <button onClick={randomPalette}>
                    <Sparkles size={12} />{t.editor.randomPalette}
                  </button>
                </div>
              </>
            ) : background === "transparent" ? null : (
              <>
                <div className="color-pair">
                  <TinyColor
                    value={bgColor1}
                    onChange={(val) => {
                      saveState();
                      setBgColor1(val);
                    }}
                  />
                  <TinyColor
                    value={color2}
                    onChange={(val) => {
                      saveState();
                      setColor2(val);
                    }}
                  />
                </div>
                {background !== "radial" && (
                  <SliderField label={t.editor.gradientAngle} value={bgAngle} min={0} max={360} suffix="°" onChange={setBgAngle} />
                )}
                <div className="quick-actions">
                  <button onClick={randomPalette}>
                    <Sparkles size={12} />{t.editor.randomPalette}
                  </button>
                  <button onClick={swapBgColors}>{t.editor.swapGradient}</button>
                </div>
              </>
            )}
          </ControlGroup>

          <ControlGroup title={t.editor.designTemplates} tone="amber" defaultOpen={false}>
            <div className="template-list">
              {(Object.keys(DESIGN_TEMPLATES) as DesignTemplateKey[]).map((key) => {
                const item = DESIGN_TEMPLATES[key];
                return (
                  <button key={key} onClick={() => applyTemplate(key)} title={item.description}>
                    <span className={`template-thumb ${item.theme}`} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </ControlGroup>

          <ControlGroup title={t.editor.advanced} tone="slate" defaultOpen={false}>
            <div className="subheading">
              <SlidersHorizontal size={13} />{t.editor.shapeMask}
            </div>
            <Segmented
              value={
                mask === "none"
                  ? t.editor.none
                  : mask === "squircle"
                    ? t.editor.squircle
                    : mask === "circle"
                      ? t.editor.circle
                      : mask === "hex"
                        ? t.editor.hex
                        : t.editor.custom
              }
              options={[t.editor.none, t.editor.squircle, t.editor.circle, t.editor.hex, t.editor.custom]}
              onChange={(value) =>
                setMask(
                  value === t.editor.none
                    ? "none"
                    : value === t.editor.squircle
                      ? "squircle"
                      : value === t.editor.circle
                        ? "circle"
                        : value === t.editor.hex
                          ? "hex"
                          : "custom"
                )
              }
            />
            <SliderField label={t.editor.radius} value={maskRadius} min={0} max={50} suffix="%" onChange={setMaskRadius} />
            <SliderField label={t.editor.padding} value={maskPad} min={0} max={30} suffix="%" onChange={setMaskPad} />
            <textarea value={customMask} onChange={(event) => setCustomMask(event.target.value)} placeholder="M50 0 L100 100 L0 100 Z" />
            <button
              className="outline-action"
              onClick={() => {
                setMask("custom");
                toast.success(lang === "ZH" ? "自定义蒙版已应用" : "Custom mask applied");
              }}
            >
              {t.editor.applyCustomMask}
            </button>
            <div className="subheading">
              <Palette size={13} />{t.editor.layerEffects}
            </div>
            <div className="effect-pills">
              <button
                className={!shadow && !strokeEnabled && !glowEnabled ? "active" : ""}
                onClick={() => {
                  setShadow(false);
                  setStrokeEnabled(false);
                  setGlowEnabled(false);
                }}
              >
                {t.editor.none}
              </button>
              <button
                className={shadow && !strokeEnabled ? "active" : ""}
                onClick={() => {
                  setShadow(true);
                  setStrokeEnabled(false);
                  setGlowEnabled(false);
                }}
              >
                {t.editor.soft}
              </button>
              <button
                className={strokeEnabled && !glowEnabled ? "active" : ""}
                onClick={() => {
                  setShadow(false);
                  setStrokeEnabled(true);
                  setGlowEnabled(false);
                }}
              >
                {t.editor.hardEdge}
              </button>
              <button
                className={shadow && glowEnabled ? "active" : ""}
                onClick={() => {
                  setShadow(true);
                  setGlowEnabled(true);
                }}
              >
                {t.editor.longShadow}
              </button>
            </div>
            <Toggle label={t.editor.stroke} checked={strokeEnabled} onChange={setStrokeEnabled} />
            {strokeEnabled && (
              <>
                <SliderField label={t.editor.strokeWidth} value={strokeWidth} min={1} max={8} suffix="px" onChange={setStrokeWidth} />
                <TinyColor value={strokeColor} onChange={setStrokeColor} />
              </>
            )}
            <Toggle label={t.editor.glow} checked={glowEnabled} onChange={setGlowEnabled} />
            {glowEnabled && (
              <>
                <SliderField label={t.editor.glowBlur} value={glowBlur} min={1} max={24} suffix="px" onChange={setGlowBlur} />
                <TinyColor value={glowColor} onChange={setGlowColor} />
              </>
            )}
            <Toggle label={t.editor.badge} checked={badgeEnabled} onChange={setBadgeEnabled} />
            {badgeEnabled && (
              <>
                <div className="badge-input-row">
                  <input value={badgeText} onChange={(event) => setBadgeText(event.target.value.slice(0, 2))} placeholder="✓" />
                  <TinyColor value={badgeColor} onChange={setBadgeColor} />
                </div>
                <Segmented
                  value={badgePosition === "top-right" ? t.editor.badgeTopRight : badgePosition === "bottom-right" ? t.editor.badgeBottomRight : t.editor.badgeBottomLeft}
                  options={[t.editor.badgeTopRight, t.editor.badgeBottomRight, t.editor.badgeBottomLeft]}
                  onChange={(value) =>
                    setBadgePosition(
                      value === t.editor.badgeTopRight
                        ? "top-right"
                        : value === t.editor.badgeBottomRight
                          ? "bottom-right"
                          : "bottom-left"
                    )
                  }
                />
              </>
            )}
          </ControlGroup>
        </aside>

        <main className="canvas-workspace">
          <div className="canvas-toolbar">
            <Segmented
              value={canvasBg === "dark" ? t.canvas.dark : canvasBg === "checker" ? t.canvas.checker : t.canvas.light}
              options={[t.canvas.light, t.canvas.dark, t.canvas.checker]}
              onChange={(value) =>
                setCanvasBg(value === t.canvas.dark ? "dark" : value === t.canvas.checker ? "checker" : "light")
              }
            />
            <span className="contrast-badge" title="基于前景色与背景色的相对亮度计算">
              {lang === "ZH" ? `对比度 ${contrastRatio}:1 ✓` : `Contrast ${contrastRatio}:1 ✓`}
            </span>
          </div>
          <div
            className="canvas-wrap"
            style={{
              background:
                canvasBg === "dark"
                  ? "#0f172a"
                  : canvasBg === "checker"
                    ? "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px"
                    : "transparent",
            }}
          >
            <div className="canvas-shadow">
              <AppMark
                shape={shape}
                iconSvg={iconSvg}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
              />
            </div>
          </div>
          <div className="canvas-size-spec">1024 × 1024 px · 实时渲染</div>
          <div className="canvas-actions-bar">
            <button
              onClick={() => {
                if (undoStack.length === 0) return;
                const last = undoStack[undoStack.length - 1];
                setRedoStack((states) => [...states, JSON.stringify(getCurrentState())]);
                setUndoStack((states) => states.slice(0, -1));
                try {
                  const parsed = JSON.parse(last);
                  restoreSnapshot({ ...parsed, id: "undo", savedAt: Date.now() });
                } catch {
                  // fallback
                }
              }}
            >
              <Undo2 size={12} />{t.canvas.undo}
            </button>
            <button
              onClick={() => {
                if (redoStack.length === 0) return;
                const last = redoStack[redoStack.length - 1];
                setUndoStack((states) => [...states, JSON.stringify(getCurrentState())]);
                setRedoStack((states) => states.slice(0, -1));
                try {
                  const parsed = JSON.parse(last);
                  restoreSnapshot({ ...parsed, id: "redo", savedAt: Date.now() });
                } catch {
                  // fallback
                }
              }}
            >
              <Redo2 size={12} />{t.canvas.redo}
            </button>
            <button
              onClick={() => {
                restoreSnapshot({ ...DEFAULT_DESIGN_DRAFT, id: "reset", savedAt: Date.now() });
                toast.success(lang === "ZH" ? "已重置全部设置" : "Reset all settings");
              }}
            >
              <RotateCcw size={12} />{lang === "ZH" ? "重置全部" : "Reset All"}
            </button>
            <button onClick={saveToHistory}>
              <Save size={12} />{t.canvas.saveToHistory}
            </button>
          </div>
          <label className="app-name-field">
            <span>{t.canvas.appName}</span>
            <input value={appName} onChange={(event) => setAppName(event.target.value)} />
          </label>
        </main>

        <button className="mobile-panel-toggle right-toggle" onClick={() => setMobileRight(!mobileRight)} aria-label="打开预览面板">
          <Files size={16} />
        </button>
        <aside className={`preview-panel ${mobileRight ? "mobile-open" : ""}`}>
          <div className="panel-mobile-head">
            <strong>{t.preview.platformPreview}</strong>
            <button onClick={() => setMobileRight(false)}>
              <X size={15} />
            </button>
          </div>
          <div className="platform-filters">
            <button className={platform === "all" ? "active" : ""} onClick={() => setPlatform("all")}>
              {t.preview.all}
            </button>
            <button className={platform === "mobile" ? "active" : ""} onClick={() => setPlatform("mobile")}>
              {t.preview.mobile}
            </button>
            <button className={platform === "desktop" ? "active" : ""} onClick={() => setPlatform("desktop")}>
              {t.preview.desktop}
            </button>
            <button className={platform === "web" ? "active" : ""} onClick={() => setPlatform("web")}>
              {t.preview.web}
            </button>
          </div>
          {filteredPreview("mobile") && (
            <section className="preview-section">
              <div className="preview-section-title">
                <strong>Android</strong>
                <ChevronUp size={13} />
              </div>
              <AndroidShapeGrid
                iconSvg={iconSvg}
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
              />
              <AndroidNotificationBar
                iconSvg={iconSvg}
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
              />
            </section>
          )}
          {filteredPreview("mobile") && (
            <section className="preview-section">
              <div className="preview-section-title">
                <strong>iOS / iPadOS</strong>
                <ChevronUp size={13} />
              </div>
              <IosHomeScreenGrid
                iconSvg={iconSvg}
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
                appName={appName}
              />
            </section>
          )}
          {filteredPreview("web") && (
            <section className="preview-section">
              <div className="preview-section-title">
                <strong>Web / PWA</strong>
                <ChevronUp size={13} />
              </div>
              <WebTabSimulator
                iconSvg={iconSvg}
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
                appName={appName}
              />
            </section>
          )}
          {filteredPreview("desktop") && (
            <section className="preview-section">
              <div className="preview-section-title">
                <strong>macOS / Windows</strong>
                <ChevronUp size={13} />
              </div>
              <PlatformPreview
                iconSvg={iconSvg}
                kind="mac"
                label="macOS"
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
              />
              <PlatformPreview
                iconSvg={iconSvg}
                kind="win"
                label="Windows"
                shape={shape}
                fg={fg}
                fgType={fgType}
                fgColor2={fgColor2}
                fgAngle={fgAngle}
                background={background}
                bgColor1={bgColor1}
                color2={color2}
                bgAngle={bgAngle}
                rotation={rotation}
                scale={scale}
                dx={dx}
                dy={dy}
                shadow={shadow}
                mask={mask}
                maskRadius={maskRadius}
                maskPad={maskPad}
                customMask={customMask}
                strokeEnabled={strokeEnabled}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                glowEnabled={glowEnabled}
                glowBlur={glowBlur}
                glowColor={glowColor}
                badgeEnabled={badgeEnabled}
                badgeText={badgeText}
                badgeColor={badgeColor}
                badgePosition={badgePosition}
              />
            </section>
          )}
          <section className="preview-section tv-section">
            <div className="preview-section-title">
              <strong>watchOS / Apple TV</strong>
              <ChevronUp size={13} />
            </div>
            <PlatformPreview
              iconSvg={iconSvg}
              kind="watch"
              label={lang === "ZH" ? "watchOS 圆形表盘" : "watchOS Round"}
              shape={shape}
              fg={fg}
              fgType={fgType}
              fgColor2={fgColor2}
              fgAngle={fgAngle}
              background={background}
              bgColor1={bgColor1}
              color2={color2}
              bgAngle={bgAngle}
              rotation={rotation}
              scale={scale}
              dx={dx}
              dy={dy}
              shadow={shadow}
              mask="circle"
              maskRadius={50}
              maskPad={maskPad}
              customMask={customMask}
              strokeEnabled={strokeEnabled}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              glowEnabled={glowEnabled}
              glowBlur={glowBlur}
              glowColor={glowColor}
              badgeEnabled={badgeEnabled}
              badgeText={badgeText}
              badgeColor={badgeColor}
              badgePosition={badgePosition}
            />
            <PlatformPreview
              iconSvg={iconSvg}
              kind="tv"
              label="Apple TV"
              shape={shape}
              fg={fg}
              fgType={fgType}
              fgColor2={fgColor2}
              fgAngle={fgAngle}
              background={background}
              bgColor1={bgColor1}
              color2={color2}
              bgAngle={bgAngle}
              rotation={rotation}
              scale={scale}
              dx={dx}
              dy={dy}
              shadow={shadow}
              mask={mask}
              maskRadius={maskRadius}
              maskPad={maskPad}
              customMask={customMask}
              strokeEnabled={strokeEnabled}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              glowEnabled={glowEnabled}
              glowBlur={glowBlur}
              glowColor={glowColor}
              badgeEnabled={badgeEnabled}
              badgeText={badgeText}
              badgeColor={badgeColor}
              badgePosition={badgePosition}
            />
          </section>
        </aside>
      </div>

      {historyOpen && (
        <div className="history-overlay" role="dialog" aria-modal="true" aria-label={t.history.title}>
          <button className="history-backdrop" onClick={() => setHistoryOpen(false)} aria-label="关闭历史记录" />
          <section className="history-drawer">
            <div className="history-drawer-head">
              <div>
                <strong>{t.history.title}</strong>
                <small>{t.history.subtitle}</small>
              </div>
              <button onClick={() => setHistoryOpen(false)}>
                <X size={16} />
              </button>
            </div>
            {savedHistory.length === 0 ? (
              <div className="history-empty">
                <History size={22} />
                <span>{t.history.emptyTitle}</span>
                <small>{t.history.emptyDesc}</small>
              </div>
            ) : (
              <div className="history-list">
                {savedHistory.map((snapshot) => (
                  <button className="history-item" key={snapshot.id} onClick={() => restoreSnapshot(snapshot)}>
                    <span className="history-mini-mark">
                      <AppMark
                        shape={snapshot.shape}
                        iconSvg={snapshot.iconSvg}
                        fg={snapshot.fg}
                        fgType={snapshot.fgType}
                        fgColor2={snapshot.fgColor2}
                        fgAngle={snapshot.fgAngle}
                        background={snapshot.background}
                        bgColor1={snapshot.bgColor1}
                        color2={snapshot.color2}
                        bgAngle={snapshot.bgAngle}
                        rotation={snapshot.rotation}
                        scale={snapshot.scale}
                        dx={snapshot.dx}
                        dy={snapshot.dy}
                        shadow={snapshot.shadow ?? true}
                        mask={snapshot.mask}
                        maskRadius={snapshot.maskRadius}
                        maskPad={snapshot.maskPad}
                        customMask={snapshot.customMask}
                        strokeEnabled={snapshot.strokeEnabled}
                        strokeWidth={snapshot.strokeWidth}
                        strokeColor={snapshot.strokeColor}
                        glowEnabled={snapshot.glowEnabled}
                        glowBlur={snapshot.glowBlur}
                        glowColor={snapshot.glowColor}
                        badgeEnabled={snapshot.badgeEnabled}
                        badgeText={snapshot.badgeText}
                        badgeColor={snapshot.badgeColor}
                        badgePosition={snapshot.badgePosition}
                      />
                    </span>
                    <span className="history-item-copy">
                      <strong>{snapshot.appName || (lang === "ZH" ? "未命名图标" : "Untitled Icon")}</strong>
                      <small>
                        {new Date(snapshot.savedAt).toLocaleString(lang === "ZH" ? "zh-CN" : "en-US", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {snapshot.size} × {snapshot.size}
                      </small>
                    </span>
                    <ChevronDown size={14} />
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {savedHistory.length > 0 && (
                <button
                  className="clear-history"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSavedHistory([]);
                    toast.success(lang === "ZH" ? "历史记录已清空" : "History cleared");
                  }}
                >
                  {t.history.clear}
                </button>
              )}
              <button
                className="clear-history"
                style={{ flex: 1, color: "var(--soft-ink)" }}
                onClick={() => {
                  resetToDefault();
                  setHistoryOpen(false);
                }}
              >
                {lang === "ZH" ? "重置默认设计" : "Reset Default"}
              </button>
            </div>
          </section>
        </div>
      )}

      {helpOpen && (
        <div className="zip-preview-backdrop" onMouseDown={() => setHelpOpen(false)}>
          <section className="zip-preview-panel" style={{ maxWidth: 540 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="zip-preview-head">
              <div>
                <span className="eyebrow">HELP & WORKFLOW</span>
                <h2>{t.help.title}</h2>
                <p>{t.help.subtitle}</p>
              </div>
              <button className="icon-only" onClick={() => setHelpOpen(false)} aria-label="关闭说明">
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, fontSize: 12, lineHeight: 1.6, color: "var(--soft-ink)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Palette size={16} style={{ color: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>{t.help.feature1Title}</strong>
                  {t.help.feature1Desc}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Sparkles size={16} style={{ color: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>{t.help.feature2Title}</strong>
                  {t.help.feature2Desc}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Layers size={16} style={{ color: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>{t.help.feature3Title}</strong>
                  {t.help.feature3Desc}
                </div>
              </div>
            </div>
            <div className="zip-preview-foot">
              <button className="zip-button" style={{ width: "100%" }} onClick={() => setHelpOpen(false)}>
                {t.help.close}
              </button>
            </div>
          </section>
        </div>
      )}

      {zipPreviewOpen && (
        <div className="zip-preview-backdrop" onMouseDown={() => setZipPreviewOpen(false)}>
          <section className="zip-preview-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div className="zip-preview-head">
              <div>
                <span className="eyebrow">EXPORT PACKAGE</span>
                <h2>ZIP 图标包预览</h2>
                <p>
                  {new Set(zipPlan.map((entry) => entry.platform)).size} 个平台 · {filteredFileCount} 个文件 · 按平台目录整理
                </p>
              </div>
              <button className="icon-only" onClick={() => setZipPreviewOpen(false)} aria-label="关闭预览">
                <X size={16} />
              </button>
            </div>
            <div className="zip-preview-summary">
              <div>
                <strong>{filteredIconFileCount}</strong>
                <span>图标文件</span>
              </div>
              <div>
                <strong>{filteredConfigFiles.length}</strong>
                <span>配置文件</span>
              </div>
              <div>
                <strong>{new Set(filteredZipPlan.map((entry) => entry.pixels)).size}</strong>
                <span>尺寸层级</span>
              </div>
            </div>
            <div className="zip-preview-controls">
              <div className="zip-expand-actions">
                <button className={zipTreeExpanded ? "active" : ""} onClick={() => setZipTreeExpanded(true)}>
                  全部展开
                </button>
                <button className={!zipTreeExpanded ? "active" : ""} onClick={() => setZipTreeExpanded(false)}>
                  全部收起
                </button>
              </div>
              <div className="zip-filter-pills">
                {(
                  [
                    ["all", "全部"],
                    ["PNG", "PNG"],
                    ["WebP", "WebP"],
                    ["SVG", "SVG"],
                    ["ICO", "ICO"],
                    ["config", "配置"],
                  ] as [typeof zipFileFilter, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    className={zipFileFilter === value ? "active" : ""}
                    onClick={() => setZipFileFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="zip-tree">
              {Array.from(new Set(filteredZipPlan.map((entry) => entry.platform))).map((platform) => {
                const entries = filteredZipPlan.filter((entry) => entry.platform === platform);
                return (
                  <div className="zip-tree-group" key={platform}>
                    <div className="zip-tree-title">
                      <span className="tree-dot" />
                      {entries[0]?.platformLabel}
                      <small>{entries.length} 个尺寸</small>
                    </div>
                    {zipTreeExpanded &&
                      entries.map((entry) => (
                        <div className="zip-tree-entry" key={`${entry.platform}-${entry.pixels}-${entry.variantLabel}`}>
                          <span className="tree-branch" />
                          <div>
                            <strong>
                              {entry.variantLabel} · {entry.pixels}px
                            </strong>
                            <small>{entry.files.map((file) => file.split("/").pop()).join(" · ")}</small>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
              {filteredConfigFiles.length > 0 && (
                <div className="zip-tree-group config-group">
                  <div className="zip-tree-title">
                    <span className="tree-dot amber-dot" />平台配置
                    <small>{filteredConfigFiles.length} 个文件</small>
                  </div>
                  {zipTreeExpanded &&
                    filteredConfigFiles.map((file) => (
                      <div className="zip-tree-entry" key={file}>
                        <span className="tree-branch" />
                        <div>
                          <strong>{file.split("/").pop()}</strong>
                          <small>{file}</small>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="zip-preview-foot">
              <button className="outline-action" onClick={() => setZipPreviewOpen(false)}>
                返回编辑
              </button>
              <button
                className="zip-button"
                onClick={() => {
                  setZipPreviewOpen(false);
                  downloadZip();
                }}
              >
                <Download size={13} />确认下载 ZIP
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="export-bar">
        <div className="export-options">
          <span className="export-label">{t.export.platform}</span>
          {(
            [
              ["android", "Android"],
              ["ios", "iOS"],
              ["web", "Web/PWA"],
              ["macos", "macOS + ICNS"],
              ["windows", "Windows + ICO"],
            ] as [ExportPlatform, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              className={`check-pill ${selectedPlatforms.includes(id) ? "checked" : ""}`}
              onClick={() => toggleExportPlatform(id)}
              aria-pressed={selectedPlatforms.includes(id)}
            >
              {selectedPlatforms.includes(id) ? "✓ " : "○ "}
              {label}
            </button>
          ))}
        </div>
        <div className="format-options">
          <span className="export-label">{lang === "ZH" ? "附加格式" : "Extra Format"}</span>
          <button className={`check-pill ${format === "PNG" ? "checked" : ""}`} onClick={() => setFormat("PNG")}>
            {format === "PNG" ? "✓ " : "○ "}PNG
          </button>
          <button className={`check-pill ${format === "WebP" ? "checked" : ""}`} onClick={() => setFormat("WebP")}>
            {format === "WebP" ? "✓ " : "○ "}WebP
          </button>
          <button className={`check-pill ${format === "SVG" ? "checked" : ""}`} onClick={() => setFormat("SVG")}>
            {format === "SVG" ? "✓ " : "○ "}SVG
          </button>
          <button className={`check-pill ${format === "ICO" ? "checked" : ""}`} onClick={() => setFormat("ICO")}>
            {format === "ICO" ? "✓ " : "○ "}ICO
          </button>
          <span className="export-label size-label">{t.export.customSize}</span>
          <button className="minus-size" onClick={() => setSize((value) => Math.max(16, value - 64))} title="减少 64px">
            <Minus size={13} />
          </button>
          <input
            type="number"
            value={size}
            min={16}
            max={4096}
            onChange={(event) => setSize(Number(event.target.value))}
          />
          <button className="plus-size" onClick={() => setSize((value) => Math.min(4096, value + 64))} title="增加 64px">
            <Plus size={13} />
          </button>
          <button className="single-download-btn" onClick={download} title={lang === "ZH" ? `下载当前 ${format} 图标 (${size}px)` : `Download ${format} icon (${size}px)`}>
            <Download size={12} />
            {lang === "ZH" ? `下载 ${format}` : `Download ${format}`}
          </button>
        </div>
        <div className="export-actions-right">
          <button className="file-list-btn" onClick={openZipPreview} title={t.export.fileList}>
            <Eye size={13} />
            {lang === "ZH" ? "文件列表" : "Files"}
          </button>
          <button className="zip-button" onClick={openZipPreview}>
            <Download size={13} />
            {t.export.downloadZip}
          </button>
        </div>
      </footer>
    </div>
  );
}
