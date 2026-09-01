import { useId } from "react";
import type { ExportDesignState } from "@/features/export";
import type { Background, Shape } from "@/features/editor/model";
import { BUILTIN_ICONS } from "@/features/icons/data/builtinIcons";

function angleToCoordinates(angleInDegrees: number = 90) {
  const rad = ((angleInDegrees % 360) * Math.PI) / 180;
  const x1 = Math.round(50 - Math.cos(rad) * 50);
  const y1 = Math.round(50 - Math.sin(rad) * 50);
  const x2 = Math.round(50 + Math.cos(rad) * 50);
  const y2 = Math.round(50 + Math.sin(rad) * 50);
  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

export default function AppMark({
  shape,
  fg,
  fgType = "solid",
  fgColor2,
  fgAngle = 90,
  background,
  bgColor1,
  color2,
  bgAngle = 135,
  rotation,
  scale,
  dx,
  dy,
  shadow,
  iconSvg,
  mask = "none",
  maskRadius = 22,
  maskPad = 0,
  customMask = "",
  strokeEnabled = false,
  strokeWidth = 2,
  strokeColor = "#ffffff",
  glowEnabled = false,
  glowBlur = 8,
  glowColor = "#0f766e",
  badgeEnabled = false,
  badgeText = "✓",
  badgeColor = "#0f766e",
  badgePosition = "top-right",
}: {
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
  badgeText?: string;
  badgeColor?: string;
  badgePosition?: ExportDesignState["badgePosition"];
}) {
  const uid = useId().replace(/:/g, "");
  const startBg = bgColor1 || (background === "image" ? "#dceee9" : "#dceee9");
  const backgroundStyle =
    background === "transparent"
      ? { backgroundImage: "conic-gradient(#e5e7eb 25%, #fff 0 50%, #e5e7eb 0 75%, #fff 0)" }
      : background === "solid"
        ? { background: bgColor1 || "#f6f7fa" }
        : background === "radial"
          ? { background: `radial-gradient(circle at 25% 20%, ${color2}, ${bgColor1 || "#f6f7fa"} 72%)` }
          : background === "conic"
            ? { background: `conic-gradient(from ${bgAngle}deg, ${color2}, ${bgColor1 || "#f6f7fa"}, ${color2})` }
            : background === "image"
              ? { background: `linear-gradient(${bgAngle}deg, ${startBg} 0%, #ffffff 48%, ${color2 || "#fff2d6"} 100%)` }
              : { background: `linear-gradient(${bgAngle}deg, ${startBg} 0%, #f8fafc 53%, ${color2} 100%)` };

  const pad = Math.max(0, Math.min(35, maskPad));
  const innerSize = 100 - pad * 2;
  const clipPath =
    mask === "circle" ? (
      <circle cx="50" cy="50" r={50 - pad} />
    ) : mask === "hex" ? (
      <path d={`M50 ${pad} ${100 - pad} ${pad + 20} ${100 - pad} ${100 - pad - 20} 50 ${100 - pad} ${pad} ${100 - pad - 20} ${pad} ${pad + 20}Z`} />
    ) : mask === "custom" && customMask.trim() ? (
      <path d={customMask} />
    ) : mask === "none" ? null : (
      <rect x={pad} y={pad} width={innerSize} height={innerSize} rx={Math.max(4, Math.min(46, maskRadius))} />
    );

  const isFgGradient = fgType === "gradient";
  const fgPaint = isFgGradient ? `url(#${uid}-fg-gradient)` : "currentColor";
  const fgCoords = angleToCoordinates(fgAngle);

  const remoteViewBox = iconSvg?.match(/viewBox=["']([^"']+)["']/i)?.[1] || "0 0 24 24";
  const remoteOpeningEnd = iconSvg ? iconSvg.indexOf(">") + 1 : -1;
  const remoteClosingStart = iconSvg ? iconSvg.lastIndexOf("</svg>") : -1;
  const remoteInner = iconSvg && remoteOpeningEnd > 0 && remoteClosingStart > remoteOpeningEnd ? iconSvg.slice(remoteOpeningEnd, remoteClosingStart) : "";
  const builtinIcon = BUILTIN_ICONS.find((i) => i.n === shape);

  const iconTransform = `translate(${50 + dx} ${50 + dy}) rotate(${rotation}) scale(${scale / 60}) translate(-50 -50)`;
  const svgStyle = {
    color: fg,
    filter: shadow ? "drop-shadow(0 12px 10px rgb(15 23 42 / .22))" : undefined,
  };
  const badgePositionMap = { "top-right": [80, 20], "bottom-right": [80, 80], "bottom-left": [20, 80] } as const;
  const [badgeX, badgeY] = badgePositionMap[badgePosition];

  return (
    <div className="app-mark" style={backgroundStyle}>
      <svg viewBox="0 0 100 100" className="mark-svg" style={svgStyle} aria-label="预览图标">
        <defs>
          {clipPath && <clipPath id={`${uid}-mask`}>{clipPath}</clipPath>}
          {isFgGradient && (
            <linearGradient id={`${uid}-fg-gradient`} x1={fgCoords.x1} y1={fgCoords.y1} x2={fgCoords.x2} y2={fgCoords.y2}>
              <stop offset="0%" stopColor={fg} />
              <stop offset="100%" stopColor={fgColor2 || fg} />
            </linearGradient>
          )}
          {glowEnabled && (
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation={Math.max(1, glowBlur / 2)} floodColor={glowColor} floodOpacity=".8" />
            </filter>
          )}
        </defs>
        <g
          transform={iconTransform}
          clipPath={clipPath ? `url(#${uid}-mask)` : undefined}
          filter={glowEnabled ? `url(#${uid}-glow)` : undefined}
          stroke={strokeEnabled ? strokeColor : undefined}
          strokeWidth={strokeEnabled ? strokeWidth / 4 : undefined}
          paintOrder="stroke fill"
          fill={fgPaint}
        >
          {iconSvg ? (
            <svg x="15" y="15" width="70" height="70" viewBox={remoteViewBox} dangerouslySetInnerHTML={{ __html: remoteInner }} />
          ) : builtinIcon ? (
            <svg x="15" y="15" width="70" height="70" viewBox="0 0 24 24">
              <path d={builtinIcon.d} fill={fgPaint} fillRule={builtinIcon.fr} />
            </svg>
          ) : (
            <>
              {shape === "spark" && <path d="M50 7 60 39 93 50 60 61 50 94 40 61 7 50 40 39Z" fill={fgPaint} />}
              {shape === "circle" && <circle cx="50" cy="50" r="34" fill={fgPaint} />}
              {shape === "diamond" && <rect x="19" y="19" width="62" height="62" rx="12" transform="rotate(45 50 50)" fill={fgPaint} />}
              {shape === "hex" && <path d="M50 11 84 30v40L50 89 16 70V30Z" fill={fgPaint} />}
              {shape === "heart" && <path d="M50 82 18 49c-13-15-3-36 14-36 9 0 16 5 18 13 3-8 10-13 19-13 17 0 27 21 14 36Z" fill={fgPaint} />}
            </>
          )}
        </g>
        {badgeEnabled && (
          <g className="badge-mark">
            <circle cx={badgeX} cy={badgeY} r="10" fill={badgeColor} stroke="#fff" strokeWidth="2" />
            <text x={badgeX} y={badgeY + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
              {badgeText || "✓"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
