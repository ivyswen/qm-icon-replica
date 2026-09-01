import AppMark from "@/features/editor/components/AppMark";
import type { ExportDesignState } from "@/features/export";
import type { Background, Shape } from "@/features/editor/model";

interface PreviewBaseProps {
  iconSvg?: string;
  shape: Shape;
  fg: string;
  fgType?: "solid" | "gradient";
  fgColor2?: string;
  fgAngle?: number;
  background: Background;
  bgColor1?: string;
  color2: string;
  bgAngle?: number;
  rotation: number;
  scale: number;
  dx: number;
  dy: number;
  shadow: boolean;
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
  badgeText?: string;
  badgeColor?: string;
  badgePosition?: ExportDesignState["badgePosition"];
  appName?: string;
}

/**
 * Android 4 形状对比网格（圆形、Squircle、圆角、方形）
 */
export function AndroidShapeGrid(props: PreviewBaseProps) {
  const shapes: Array<{ label: string; mask: ExportDesignState["mask"]; radius?: number }> = [
    { label: "圆形", mask: "circle" },
    { label: "Squircle", mask: "none" },
    { label: "圆角", mask: "squircle", radius: 16 },
    { label: "方形", mask: "squircle", radius: 0 },
  ];

  return (
    <div className="preview-shape-grid">
      {shapes.map((item) => (
        <div key={item.label} className="preview-shape-cell">
          <div className="shape-mark-box">
            <AppMark {...props} mask={item.mask} maskRadius={item.radius ?? props.maskRadius} shadow={props.shadow} />
          </div>
          <span className="shape-cell-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Android 13 主题图标与桌面通知横条
 */
export function AndroidNotificationBar(props: PreviewBaseProps) {
  return (
    <div className="preview-duo-row">
      <div className="themed-icon-cell">
        <div className="themed-icon-box">
          <AppMark
            {...props}
            mask="circle"
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
            <AppMark {...props} mask="circle" shadow={false} />
          </div>
          <div className="notification-content">
            <div className="notif-line notif-title" />
            <div className="notif-line notif-desc" />
          </div>
        </div>
        <span className="shape-cell-label">桌面通知 24dp</span>
      </div>
    </div>
  );
}

/**
 * iOS 主屏幕桌面拟真与 iOS 18 深色图标
 */
export function IosHomeScreenGrid(props: PreviewBaseProps) {
  return (
    <div className="preview-ios-grid">
      <div className="preview-shape-cell">
        <div className="shape-mark-box large">
          <AppMark {...props} mask="none" />
        </div>
        <span className="shape-cell-label">App Store 1024</span>
      </div>

      <div className="ios-springboard-cell">
        <div className="springboard-dock">
          <div className="springboard-icon">
            <AppMark {...props} mask="none" />
          </div>
          <span className="springboard-name">{props.appName || "My App"}</span>
          <div className="springboard-dots">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
        <span className="shape-cell-label">主屏幕</span>
      </div>

      <div className="preview-shape-cell">
        <div className="shape-mark-box large dark-theme-box">
          <AppMark
            {...props}
            mask="none"
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
 * Web 拟真浏览器标签页预览
 */
export function WebTabSimulator(props: PreviewBaseProps) {
  return (
    <div className="preview-web-grid">
      <div className="browser-tab-preview">
        <div className="browser-tab-pill">
          <div className="tab-favicon">
            <AppMark {...props} mask="squircle" maskRadius={4} shadow={false} />
          </div>
          <span className="tab-title">{props.appName || "My App"}</span>
          <span className="tab-close">×</span>
        </div>
        <span className="shape-cell-label">favicon 32</span>
      </div>

      <div className="preview-shape-cell">
        <div className="shape-mark-box large">
          <AppMark {...props} mask="none" />
        </div>
        <span className="shape-cell-label">PWA 512</span>
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
  const isCircle = props.mask === "circle" || props.kind === "watch";

  return (
    <div className={`preview-row preview-${props.kind} ${isCircle ? "preview-circle" : ""}`}>
      <div className="preview-stage">
        <AppMark {...props} mask={isCircle ? "circle" : props.mask} />
      </div>
      <div className="preview-meta">
        <span>{props.label}</span>
        <small>
          {props.kind === "android"
            ? isCircle
              ? "ic_launcher_round 192"
              : "Android 13 主图标"
            : props.kind === "ios"
              ? "App Store 1024"
              : props.kind === "web"
                ? isCircle
                  ? "Web 圆形 192"
                  : "favicon 32"
                : props.kind === "mac"
                  ? "macOS 512"
                  : props.kind === "win"
                    ? "ICO 256"
                    : props.kind === "watch"
                      ? "watchOS 圆形 80"
                      : "Apple TV 1280"}
        </small>
      </div>
    </div>
  );
}
