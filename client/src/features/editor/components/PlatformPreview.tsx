import AppMark from "@/features/editor/components/AppMark";
import type { ExportDesignState } from "@/features/export";
import type { Background, Shape } from "@/features/editor/model";

export default function PlatformPreview({
  iconSvg,
  kind,
  label,
  shape,
  fg,
  fgType = "solid",
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
  shadow,
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
}: {
  iconSvg?: string;
  kind: "android" | "ios" | "web" | "mac" | "win" | "watch" | "tv";
  label: string;
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
}) {
  const isCircle = mask === "circle" || kind === "watch";

  return (
    <div className={`preview-row preview-${kind} ${isCircle ? "preview-circle" : ""}`}>
      <div className="preview-stage">
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
          mask={isCircle ? "circle" : mask}
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
      <div className="preview-meta">
        <span>{label}</span>
        <small>
          {kind === "android"
            ? isCircle
              ? "ic_launcher_round 192"
              : "Android 13 主图标"
            : kind === "ios"
              ? "App Store 1024"
              : kind === "web"
                ? isCircle
                  ? "Web 圆形 192"
                  : "favicon 32"
                : kind === "mac"
                  ? "macOS 512"
                  : kind === "win"
                    ? "ICO 256"
                    : kind === "watch"
                      ? "watchOS 圆形 80"
                      : "Apple TV 1280"}
        </small>
      </div>
    </div>
  );
}
