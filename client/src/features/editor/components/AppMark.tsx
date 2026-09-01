import { useId } from "react";
import type { ExportDesignState } from "@/features/export";
import type { Background, Shape } from "@/features/editor/model";
import { BUILTIN_ICONS } from "@/features/icons/data/builtinIcons";

function angleToCoordinates(angleInDegrees: number = 90) {
  const rad = ((angleInDegrees % 360) * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const x1 = Math.round(50 - sin * 50);
  const y1 = Math.round(50 + cos * 50);
  const x2 = Math.round(50 + sin * 50);
  const y2 = Math.round(50 - cos * 50);
  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

export default function AppMark({
  shape,
  fg,
  fgType = "solid",
  fgColor2,
  fgAngle = 90,
  sourceMode,
  customText,
  fontFamily,
  fontWeight,
  emojiChar,
  customImageDataUrl,
  background,
  bgColor1,
  color2,
  bgAngle = 135,
  pattern = "none",
  patternOpacity = 20,
  patternSize = 14,
  noise = 0,
  rotation = 0,
  scale = 60,
  dx = 0,
  dy = 0,
  shadow = true,
  shadowPreset = "soft",
  shadowOffsetX = 0,
  shadowOffsetY = 4,
  shadowBlur = 10,
  shadowAlpha = 30,
  shadowColor = "#000000",
  gloss = "none",
  innerBorder = false,
  layersVisible = { fg: true, bg: true, badge: true },
  iconSvg,
  mask = "squircle",
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
  badgeStyle = "corner",
  badgeText = "NEW",
  badgeBg = "#ef4444",
  badgeColor = "#ffffff",
  badgePosition = "top-right",
  badgeSize = 30,
}: {
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
}) {
  const uid = useId().replace(/:/g, "");
  const pad = Math.max(0, Math.min(30, maskPad));
  const innerSize = 100 - pad * 2;

  // 11 种几何蒙版
  const clipPath =
    mask === "circle" ? (
      <circle cx="50" cy="50" r={50 - pad} />
    ) : mask === "round" ? (
      <rect x={pad} y={pad} width={innerSize} height={innerSize} rx="16" ry="16" />
    ) : mask === "star" ? (
      <polygon points={`50,${pad + 4} ${63 - pad * 0.2},${35 + pad * 0.1} ${96 - pad},${36 + pad * 0.1} ${69 - pad * 0.3},${56 - pad * 0.1} ${79 - pad * 0.4},${90 - pad} 50,${70 - pad * 0.4} ${21 + pad * 0.4},${90 - pad} ${31 + pad * 0.3},${56 - pad * 0.1} ${4 + pad},${36 + pad * 0.1} ${37 + pad * 0.2},${35 + pad * 0.1}`} />
    ) : mask === "diamond" ? (
      <rect x={20 + pad * 0.6} y={20 + pad * 0.6} width={60 - pad * 1.2} height={60 - pad * 1.2} rx="8" transform="rotate(45 50 50)" />
    ) : mask === "triangle" ? (
      <polygon points={`50,${pad + 6} ${95 - pad},${94 - pad} ${5 + pad},${94 - pad}`} />
    ) : mask === "teardrop" ? (
      <path d={`M50 ${pad + 6} C50 ${pad + 6} ${92 - pad} ${45 + pad * 0.5} ${92 - pad} ${68 - pad * 0.5} A${42 - pad} ${42 - pad} 0 0 1 ${8 + pad} ${68 - pad * 0.5} C${8 + pad} ${45 + pad * 0.5} 50 ${pad + 6} 50 ${pad + 6} Z`} />
    ) : mask === "hex" ? (
      <path d={`M50 ${pad} ${100 - pad} ${pad + 20} ${100 - pad} ${100 - pad - 20} 50 ${100 - pad} ${pad} ${100 - pad - 20} ${pad} ${pad + 20}Z`} />
    ) : mask === "shield" ? (
      <path d={`M50 ${pad + 4} L${92 - pad} ${pad + 18} C${92 - pad} ${65 - pad * 0.5} 50 ${96 - pad} 50 ${96 - pad} C50 ${96 - pad} ${8 + pad} ${65 - pad * 0.5} ${8 + pad} ${pad + 18} Z`} />
    ) : mask === "custom" && customMask.trim() ? (
      <path d={customMask} />
    ) : mask === "none" ? null : (
      <rect x={pad} y={pad} width={innerSize} height={innerSize} rx={Math.max(4, Math.min(46, maskRadius))} ry={Math.max(4, Math.min(46, maskRadius))} />
    );

  const isFgGradient = fgType === "gradient";
  const fgPaint = isFgGradient ? `url(#${uid}-fg-gradient)` : (fg || "currentColor");
  const fgCoords = angleToCoordinates(fgAngle);

  const showBg = layersVisible?.bg !== false;
  const showFg = layersVisible?.fg !== false;
  const showBadge = badgeEnabled && layersVisible?.badge !== false;

  const bgCoords = angleToCoordinates(bgAngle);
  const startBg = bgColor1 || "#dceee9";
  const pSize = patternSize || 14;
  const pOpacity = (patternOpacity || 20) / 100;

  // 阴影参数
  const sPreset = shadowPreset ?? (shadow ? "soft" : "none");
  const sX = shadowOffsetX ?? (sPreset === "soft" ? 0 : sPreset === "hard" ? 4 : sPreset === "long" ? 12 : 0);
  const sY = shadowOffsetY ?? (sPreset === "soft" ? 4 : sPreset === "hard" ? 6 : sPreset === "long" ? 14 : 0);
  const sBlur = shadowBlur ?? (sPreset === "soft" ? 10 : sPreset === "hard" ? 0 : sPreset === "long" ? 8 : 0);
  const sAlpha = (shadowAlpha ?? (sPreset === "none" ? 0 : 30)) / 100;
  const sColor = shadowColor || "#000000";

  const remoteViewBox = iconSvg?.match(/viewBox=["']([^"']+)["']/i)?.[1] || "0 0 24 24";
  const remoteOpeningEnd = iconSvg ? iconSvg.indexOf(">") + 1 : -1;
  const remoteClosingStart = iconSvg ? iconSvg.lastIndexOf("</svg>") : -1;
  const remoteInner = iconSvg && remoteOpeningEnd > 0 && remoteClosingStart > remoteOpeningEnd ? iconSvg.slice(remoteOpeningEnd, remoteClosingStart) : "";
  const builtinIcon = BUILTIN_ICONS.find((i) => i.n === shape);

  const iconTransform = `translate(${50 + dx} ${50 + dy}) rotate(${rotation}) scale(${scale / 60}) translate(-50 -50)`;

  // 3 种徽章形态
  const bSize = badgeSize || 30;
  const bPos = badgePosition || "top-right";

  return (
    <div className="app-mark">
      <svg viewBox="0 0 100 100" className="mark-svg" aria-label="应用图标预览">
        <defs>
          {clipPath && <clipPath id={`${uid}-mask`}>{clipPath}</clipPath>}

          {/* 前景渐变 */}
          {isFgGradient && (
            <linearGradient id={`${uid}-fg-gradient`} x1={fgCoords.x1} y1={fgCoords.y1} x2={fgCoords.x2} y2={fgCoords.y2}>
              <stop offset="0%" stopColor={fg} />
              <stop offset="100%" stopColor={fgColor2 || fg} />
            </linearGradient>
          )}

          {/* 背景渐变 */}
          <linearGradient id={`${uid}-bg-linear`} x1={bgCoords.x1} y1={bgCoords.y1} x2={bgCoords.x2} y2={bgCoords.y2}>
            <stop offset="0%" stopColor={startBg} />
            <stop offset="53%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
          <radialGradient id={`${uid}-bg-radial`} cx="25%" cy="20%" r="80%">
            <stop offset="0%" stopColor={color2} />
            <stop offset="72%" stopColor={startBg} />
          </radialGradient>
          <linearGradient id={`${uid}-bg-conic`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color2} />
            <stop offset="50%" stopColor={startBg} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
          <linearGradient id={`${uid}-bg-image`} x1={bgCoords.x1} y1={bgCoords.y1} x2={bgCoords.x2} y2={bgCoords.y2}>
            <stop offset="0%" stopColor={startBg} />
            <stop offset="48%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={color2 || "#fff2d6"} />
          </linearGradient>

          {/* 光泽定义 */}
          <linearGradient id={`${uid}-top-gloss`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="51%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-bevel-gloss`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* 7 种图案纹理定义 */}
          {pattern === "dots" && (
            <pattern id={`${uid}-pattern`} width={pSize} height={pSize} patternUnits="userSpaceOnUse">
              <circle cx={pSize / 2} cy={pSize / 2} r={pSize / 8} fill={`rgba(255,255,255,${pOpacity})`} />
            </pattern>
          )}
          {pattern === "stripes" && (
            <pattern id={`${uid}-pattern`} width={pSize} height={pSize} patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2={pSize} stroke={`rgba(255,255,255,${pOpacity})`} strokeWidth={pSize / 4} />
            </pattern>
          )}
          {pattern === "grid" && (
            <pattern id={`${uid}-pattern`} width={pSize} height={pSize} patternUnits="userSpaceOnUse">
              <path d={`M ${pSize} 0 L 0 0 0 ${pSize}`} fill="none" stroke={`rgba(255,255,255,${pOpacity})`} strokeWidth="1" />
            </pattern>
          )}
          {pattern === "checker" && (
            <pattern id={`${uid}-pattern`} width={pSize * 1.2} height={pSize * 1.2} patternUnits="userSpaceOnUse">
              <rect width={pSize * 0.6} height={pSize * 0.6} fill={`rgba(255,255,255,${pOpacity})`} />
              <rect x={pSize * 0.6} y={pSize * 0.6} width={pSize * 0.6} height={pSize * 0.6} fill={`rgba(255,255,255,${pOpacity})`} />
            </pattern>
          )}
          {pattern === "waves" && (
            <pattern id={`${uid}-pattern`} width={pSize * 1.5} height={pSize * 0.75} patternUnits="userSpaceOnUse">
              <path d={`M 0 ${pSize * 0.375} Q ${pSize * 0.375} 0 ${pSize * 0.75} ${pSize * 0.375} T ${pSize * 1.5} ${pSize * 0.375}`} fill="none" stroke={`rgba(255,255,255,${pOpacity})`} strokeWidth="1.5" />
            </pattern>
          )}
          {pattern === "cross" && (
            <pattern id={`${uid}-pattern`} width={pSize} height={pSize} patternUnits="userSpaceOnUse">
              <path d={`M${pSize / 2} ${pSize / 5} v${pSize * 0.6} M${pSize / 5} ${pSize / 2} h${pSize * 0.6}`} stroke={`rgba(255,255,255,${pOpacity})`} strokeWidth="1.5" />
            </pattern>
          )}

          {/* 噪点滤镜 */}
          {noise > 0 && (
            <filter id={`${uid}-noise`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
            </filter>
          )}

          {/* 阴影滤镜 */}
          {sPreset !== "none" && (sBlur > 0 || sX !== 0 || sY !== 0) && (
            <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx={sX} dy={sY} stdDeviation={sBlur / 2} floodColor={sColor} floodOpacity={sAlpha} />
            </filter>
          )}

          {/* 发光滤镜 */}
          {glowEnabled && (
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation={Math.max(1, glowBlur / 2)} floodColor={glowColor} floodOpacity=".8" />
            </filter>
          )}
        </defs>

        <g clipPath={clipPath ? `url(#${uid}-mask)` : undefined}>
          {/* 背景填充层 */}
          {showBg && background !== "transparent" && (
            <rect
              width="100%"
              height="100%"
              fill={
                background === "solid"
                  ? bgColor1 || "#f6f7fa"
                  : background === "radial"
                    ? `url(#${uid}-bg-radial)`
                    : background === "conic"
                      ? `url(#${uid}-bg-conic)`
                      : background === "image"
                        ? `url(#${uid}-bg-image)`
                        : `url(#${uid}-bg-linear)`
              }
            />
          )}

          {/* 顶部高光 / 斜面光 */}
          {showBg && gloss === "top" && (
            <rect width="100%" height="100%" fill={`url(#${uid}-top-gloss)`} style={{ mixBlendMode: "screen" }} />
          )}
          {showBg && gloss === "bevel" && (
            <rect width="100%" height="100%" fill={`url(#${uid}-bevel-gloss)`} style={{ mixBlendMode: "overlay" }} />
          )}

          {/* 图案纹理 */}
          {showBg && pattern && pattern !== "none" && (
            <rect width="100%" height="100%" fill={`url(#${uid}-pattern)`} />
          )}

          {/* 噪点磨砂 */}
          {showBg && noise > 0 && (
            <rect
              width="100%"
              height="100%"
              filter={`url(#${uid}-noise)`}
              opacity={Math.min(1, noise / 100)}
              style={{ mixBlendMode: "overlay" }}
            />
          )}

          {/* 1px 内边框细线 */}
          {showBg && innerBorder && (
            <rect
              x={pad + 1}
              y={pad + 1}
              width={innerSize - 2}
              height={innerSize - 2}
              rx={Math.max(2, maskRadius - 1)}
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />
          )}

          {/* 前景图标层 */}
          {showFg && (
            <g transform="translate(50 50) scale(0.5) translate(-50 -50)">
              <g
                color={fg}
                fill={fgPaint}
                transform={iconTransform}
                filter={glowEnabled ? `url(#${uid}-glow)` : sPreset !== "none" ? `url(#${uid}-shadow)` : undefined}
                stroke={strokeEnabled ? strokeColor : undefined}
                strokeWidth={strokeEnabled ? strokeWidth / 4 : undefined}
                paintOrder="stroke fill"
              >
                {sourceMode === "text" && customText ? (
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily={fontFamily || "Inter, sans-serif"}
                    fontWeight={fontWeight || 800}
                    fontSize={customText.split("\n").length > 1 ? 28 : 42}
                    fill={fgPaint}
                  >
                    {customText.split("\n").map((l, idx) => (
                      <tspan key={idx} x="50" dy={idx === 0 ? 0 : 30}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                ) : sourceMode === "emoji" && emojiChar ? (
                  <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="46">
                    {emojiChar}
                  </text>
                ) : sourceMode === "image" && customImageDataUrl ? (
                  <image href={customImageDataUrl} x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet" />
                ) : iconSvg ? (
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
            </g>
          )}

          {/* 3 种徽章形态 */}
          {showBadge && (
            <>
              {badgeStyle === "corner" && (
                <g className="badge-corner">
                  <polygon
                    points={
                      bPos === "top-right"
                        ? `100,0 ${100 - bSize * 1.5},0 100,${bSize * 1.5}`
                        : bPos === "top-left"
                          ? `0,0 ${bSize * 1.5},0 0,${bSize * 1.5}`
                          : bPos === "bottom-left"
                            ? `0,100 ${bSize * 1.5},100 0,${100 - bSize * 1.5}`
                            : `100,100 ${100 - bSize * 1.5},100 100,${100 - bSize * 1.5}`
                    }
                    fill={badgeBg}
                  />
                  <text
                    x={
                      bPos === "top-right" || bPos === "bottom-right"
                        ? 100 - bSize * 0.45
                        : bSize * 0.45
                    }
                    y={
                      bPos === "top-right" || bPos === "top-left"
                        ? bSize * 0.55
                        : 100 - bSize * 0.55
                    }
                    transform={`rotate(${
                      bPos === "top-right" || bPos === "bottom-left" ? 45 : -45
                    } ${
                      bPos === "top-right" || bPos === "bottom-right"
                        ? 100 - bSize * 0.45
                        : bSize * 0.45
                    } ${
                      bPos === "top-right" || bPos === "top-left"
                        ? bSize * 0.55
                        : 100 - bSize * 0.55
                    })`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="system-ui,-apple-system,sans-serif"
                    fontWeight="900"
                    fontSize={Math.max(6, bSize * 0.32)}
                    fill={badgeColor}
                  >
                    {badgeText || "NEW"}
                  </text>
                </g>
              )}
              {badgeStyle === "bottom" && (
                <g className="badge-bottom">
                  <rect x="0" y={100 - bSize * 0.6} width="100" height={bSize * 0.6} fill={badgeBg} />
                  <text
                    x="50"
                    y={100 - bSize * 0.28}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="system-ui,-apple-system,sans-serif"
                    fontWeight="800"
                    fontSize={Math.max(6, bSize * 0.32)}
                    fill={badgeColor}
                  >
                    {badgeText || "NEW"}
                  </text>
                </g>
              )}
              {badgeStyle === "dot" && (
                <g className="badge-dot">
                  {(() => {
                    const [bx, by] = {
                      "top-left": [20, 20],
                      "top-right": [80, 20],
                      "bottom-left": [20, 80],
                      "bottom-right": [80, 80],
                    }[bPos];
                    const radius = bSize * 0.35;
                    return (
                      <>
                        <circle cx={bx} cy={by} r={radius} fill={badgeBg} stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x={bx}
                          y={by + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontFamily="system-ui,-apple-system,sans-serif"
                          fontWeight="800"
                          fontSize={Math.max(6, radius * 0.8)}
                          fill={badgeColor}
                        >
                          {badgeText || "NEW"}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
