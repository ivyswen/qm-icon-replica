import AppMark from "@/features/editor/components/AppMark";
import type { ExportDesignState } from "@/features/export";
import type { Background, Shape } from "@/features/editor/model";

export interface PreviewBaseProps {
  shape: Shape;
  fg: string;
  fgType?: "solid" | "gradient";
  fgColor2?: string;
  fgAngle?: number;
  sourceMode?: ExportDesignState["sourceMode"];
  customText?: string;
  fontFamily?: string;
  fontWeight?: number;
  emojiChar?: string;
  customImageDataUrl?: string;
  background: Background;
  bgColor1?: string;
  color2: string;
  bgAngle?: number;
  pattern?: ExportDesignState["pattern"];
  patternOpacity?: number;
  patternSize?: number;
  noise?: number;
  rotation?: number;
  scale?: number;
  dx?: number;
  dy?: number;
  shadow?: boolean;
  shadowPreset?: "none" | "soft" | "hard" | "long";
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowAlpha?: number;
  shadowColor?: string;
  gloss?: "none" | "top" | "bevel";
  innerBorder?: boolean;
  layersVisible?: { fg: boolean; bg: boolean; badge: boolean };
  iconSvg?: string;
  mask?: ExportDesignState["mask"];
  maskRadius?: number;
  maskPad?: number;
  customMask?: string;
  strokeEnabled?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  glowEnabled?: boolean;
  glowBlur?: number;
  glowColor?: string;
  badgeEnabled?: boolean;
  badgeStyle?: "corner" | "bottom" | "dot";
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgePosition?: ExportDesignState["badgePosition"];
  badgeSize?: number;
  appName?: string;
}

/**
 * Android 4 形状对比网格（圆形、Squircle、圆角、方形/当前自定义蒙版）
 */
export function AndroidShapeGrid(props: PreviewBaseProps) {
  const currentMask = props.mask || "squircle";
  const isSpecialMask = !["circle", "squircle", "round", "none"].includes(currentMask);

  const shapes: Array<{ label: string; mask: ExportDesignState["mask"]; radius?: number }> = [
    { label: "圆形", mask: "circle" },
    { label: "Squircle", mask: "squircle", radius: 22 },
    { label: "圆角", mask: "round", radius: props.maskRadius ?? 16 },
    { label: isSpecialMask ? "当前蒙版" : "方形", mask: isSpecialMask ? currentMask : "none" },
  ];

  return (
    <div className="preview-shape-grid">
      {shapes.map((item) => (
        <div key={item.label} className="preview-shape-cell">
          <div className="shape-mark-box">
            <AppMark
              {...props}
              mask={item.mask}
              maskRadius={item.radius ?? props.maskRadius}
              maskPad={props.maskPad}
              customMask={props.customMask}
              shadow={props.shadow}
            />
          </div>
          <span className="shape-cell-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Android 13 主题图标与通知栏 24dp
 */
export function AndroidNotificationBar(props: PreviewBaseProps) {
  const mask = props.mask || "circle";
  return (
    <div className="preview-duo-row">
      <div className="themed-icon-cell">
        <div className="themed-icon-box">
          <AppMark
            {...props}
            mask={mask}
            background="solid"
            bgColor1="#2d333b"
            color2="#2d333b"
            fg="#e6edf3"
            fgType="solid"
            shadow={false}
          />
        </div>
        <span className="shape-cell-label">Android 13 主题图标</span>
      </div>

      <div className="notification-bar-cell">
        <div className="notification-inner">
          <div className="notification-icon">
            <AppMark {...props} mask={mask} shadow={false} />
          </div>
          <div className="notification-content">
            <div className="notif-line notif-title" />
            <div className="notif-line notif-desc" />
          </div>
        </div>
        <span className="shape-cell-label">通知栏 24dp</span>
      </div>
    </div>
  );
}

/**
 * iOS / iPadOS（App Store 1024 + 主屏幕 + iOS 18 深色）
 */
export function IosHomeScreenGrid(props: PreviewBaseProps) {
  const mask = props.mask || "squircle";
  return (
    <div className="preview-ios-grid">
      <div className="preview-shape-cell">
        <div className="shape-mark-box large ios-squircle">
          <AppMark {...props} mask={mask} />
        </div>
        <span className="shape-cell-label">App Store 1024</span>
      </div>

      <div className="ios-springboard-cell">
        <div className="springboard-dock">
          <div className="springboard-icon ios-squircle">
            <AppMark {...props} mask={mask} />
          </div>
          <span className="springboard-name">{props.appName || "My App"}</span>
        </div>
        <span className="shape-cell-label">主屏幕</span>
      </div>

      <div className="preview-shape-cell">
        <div className="shape-mark-box large dark-theme-box ios-squircle">
          <AppMark
            {...props}
            mask={mask}
            background="solid"
            bgColor1="#1c1c1e"
            color2="#1c1c1e"
            fg="#f2f2f7"
            fgType="solid"
          />
        </div>
        <span className="shape-cell-label">iOS 18 深色</span>
      </div>
    </div>
  );
}

/**
 * Web / PWA（favicon 32 + PWA 512 + Maskable 安全区 + OG 社交图 1200×630）
 */
export function WebTabSimulator(props: PreviewBaseProps) {
  const mask = props.mask || "squircle";
  return (
    <div className="preview-web-container">
      <div className="preview-web-grid">
        <div className="browser-tab-preview">
          <div className="browser-tab-pill">
            <div className="tab-favicon">
              <AppMark {...props} mask={props.mask === "none" ? "round" : mask} shadow={false} />
            </div>
            <span className="tab-title">{props.appName || "My App"}</span>
            <span className="tab-close">×</span>
          </div>
          <span className="shape-cell-label">favicon 32</span>
        </div>

        <div className="preview-shape-cell">
          <div className="shape-mark-box large">
            <AppMark {...props} mask={mask} />
          </div>
          <span className="shape-cell-label">PWA 512</span>
        </div>

        <div className="preview-shape-cell">
          <div className="shape-mark-box large maskable-box">
            <AppMark {...props} mask={mask} />
            <div className="maskable-safe-circle" />
          </div>
          <span className="shape-cell-label">Maskable 安全区</span>
        </div>
      </div>

      {/* OG 社交分享图 */}
      <div className="og-social-card">
        <div className="og-inner">
          <div className="og-mark-wrap">
            <AppMark {...props} mask={mask} />
          </div>
          <div className="og-text-wrap">
            <h4 className="og-title">{props.appName || "My App"}</h4>
            <p className="og-subtitle">Made with QM icon</p>
          </div>
        </div>
        <span className="shape-cell-label">OG 社交分享图 1200×630</span>
      </div>
    </div>
  );
}

/**
 * macOS / Windows（macOS Dock 真实磨砂 + Windows 动态磁贴）
 */
export function MacWindowsPreview(props: PreviewBaseProps) {
  const mask = props.mask || "squircle";
  return (
    <div className="preview-desktop-grid">
      <div className="macos-dock-cell">
        <div className="macos-dock-bar">
          <div className="dock-icon-box">
            <AppMark {...props} mask={mask} />
          </div>
        </div>
        <span className="shape-cell-label">macOS Dock</span>
      </div>

      <div className="windows-tile-cell">
        <div className="windows-tile-box">
          <AppMark {...props} mask={mask} shadow={false} />
        </div>
        <span className="shape-cell-label">Windows 磁贴</span>
      </div>
    </div>
  );
}

/**
 * watchOS / Apple TV / 商店卡片
 */
export function WatchAppleTvPreview(props: PreviewBaseProps) {
  const mask = props.mask || "circle";
  return (
    <div className="preview-watch-tv-container">
      <div className="preview-watch-tv-grid">
        <div className="watchos-cell">
          <div className="watchos-box">
            <AppMark {...props} mask={mask} />
          </div>
          <span className="shape-cell-label">watchOS</span>
        </div>

        <div className="apple-tv-cell">
          <div className="apple-tv-box">
            <div className="apple-tv-icon-center">
              <AppMark {...props} mask={props.mask || "none"} shadow={false} />
            </div>
          </div>
          <span className="shape-cell-label">Apple TV</span>
        </div>
      </div>

      {/* App Store 商店卡片 */}
      <div className="store-preview-card">
        <div className="store-card-inner">
          <div className="store-card-mark">
            <AppMark {...props} mask={props.mask || "squircle"} />
          </div>
          <div className="store-card-info">
            <h4 className="store-card-name">{props.appName || "My App"}</h4>
            <div className="store-card-rating">★★★★★ · 免费</div>
            <button className="store-card-btn" type="button">获取</button>
          </div>
        </div>
        <span className="shape-cell-label">商店卡片</span>
      </div>
    </div>
  );
}

export default function PlatformPreview(
  props: PreviewBaseProps & {
    kind: "android" | "ios" | "web" | "mac" | "win" | "watch" | "tv";
    label: string;
  }
) {
  return (
    <div className={`preview-row preview-${props.kind}`}>
      <div className="preview-stage">
        <AppMark {...props} mask={props.mask} />
      </div>
      <div className="preview-meta">
        <span>{props.label}</span>
        <small>
          {props.kind === "android"
            ? "Android 主图标"
            : props.kind === "ios"
              ? "App Store 1024"
              : props.kind === "web"
                ? "favicon 32"
                : props.kind === "mac"
                  ? "macOS 512"
                  : props.kind === "win"
                    ? "ICO 256"
                    : props.kind === "watch"
                      ? "watchOS 80"
                      : "Apple TV 1280"}
        </small>
      </div>
    </div>
  );
}
