import JSZip from "jszip";
import { BUILTIN_ICONS } from "@/features/icons/data/builtinIcons";
import { encodeIco, blobToUint8Array, type IcoImageSource } from "./ico";

export type ExportFormat = "PNG" | "WebP" | "SVG" | "ICO";

export type ExportDesignState = {
  shape: string;
  iconId?: string;
  iconSvg?: string;
  sourceMode?: "clipart" | "text" | "emoji" | "image" | "logo" | "svg";
  customText?: string;
  fontFamily?: string;
  fontWeight?: number;
  textTransform?: "none" | "arc-up" | "arc-down";
  textArc?: number;
  emojiChar?: string;
  customSvgCode?: string;
  customImageDataUrl?: string;
  imageMonochrome?: boolean;
  bgImageUrl?: string;

  mask: "none" | "squircle" | "round" | "circle" | "hex" | "star" | "diamond" | "triangle" | "teardrop" | "shield" | "custom";
  maskRadius?: number;
  maskPad?: number;
  customMask?: string;

  strokeEnabled?: boolean;
  strokeWidth?: number;
  strokeColor?: string;

  glowEnabled?: boolean;
  glowBlur?: number;
  glowColor?: string;

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

  badgeEnabled?: boolean;
  badgeStyle?: "corner" | "bottom" | "dot";
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  badgeSize?: number;

  fg: string;
  fgType?: "solid" | "gradient";
  fgColor2?: string;
  fgAngle?: number;
  background: "solid" | "linear" | "radial" | "conic" | "image" | "transparent";
  bgColor1?: string;
  color2: string;
  bgAngle?: number;
  pattern?: "none" | "dots" | "stripes" | "grid" | "checker" | "waves" | "cross";
  patternOpacity?: number;
  patternSize?: number;
  noise?: number;
  rotation?: number;
  scale?: number;
  dx?: number;
  dy?: number;
  appName: string;
  size: number;
};

const shapes: Record<string, string> = {
  spark: '<path d="M50 7 60 39 93 50 60 61 50 94 40 61 7 50 40 39Z" fill="currentColor"/>',
  circle: '<circle cx="50" cy="50" r="34" fill="currentColor"/>',
  diamond: '<rect x="19" y="19" width="62" height="62" rx="12" transform="rotate(45 50 50)" fill="currentColor"/>',
  hex: '<path d="M50 11 84 30v40L50 89 16 70V30Z" fill="currentColor"/>',
  heart: '<path d="M50 82 18 49c-13-15-3-36 14-36 9 0 16 5 18 13 3-8 10-13 19-13 17 0 27 21 14 36Z" fill="currentColor"/>',
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

function angleToCoordinates(angleInDegrees: number = 135) {
  const rad = ((angleInDegrees % 360) * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const x1 = Math.round(50 - sin * 50);
  const y1 = Math.round(50 + cos * 50);
  const x2 = Math.round(50 + sin * 50);
  const y2 = Math.round(50 - cos * 50);
  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

function extractRemoteSvg(iconSvg: string) {
  const viewBox = iconSvg.match(/viewBox=["']([^"']+)["']/i)?.[1] || "0 0 24 24";
  const openingEnd = iconSvg.indexOf(">") + 1;
  const closingStart = iconSvg.lastIndexOf("</svg>");
  const inner = openingEnd > 0 && closingStart > openingEnd ? iconSvg.slice(openingEnd, closingStart) : iconSvg;
  return { viewBox, inner };
}

function backgroundPaint(state: ExportDesignState) {
  if (state.background === "transparent") return "none";
  if (state.background === "solid") return state.bgColor1 || "#f6f7fa";
  if (state.background === "radial") return "url(#bg-radial)";
  if (state.background === "conic") return "url(#bg-conic)";
  if (state.background === "image") return "url(#bg-image)";
  return "url(#bg-linear)";
}

export function createSvgMarkup(state: ExportDesignState) {
  const isFgGradient = state.fgType === "gradient";
  const fgPaint = isFgGradient ? "url(#icon-fg-gradient)" : (state.fg || "#0f766e");
  const fgCoords = angleToCoordinates(state.fgAngle ?? 90);
  const fgGradientDef = isFgGradient
    ? `<linearGradient id="icon-fg-gradient" x1="${fgCoords.x1}" y1="${fgCoords.y1}" x2="${fgCoords.x2}" y2="${fgCoords.y2}">
      <stop offset="0%" stop-color="${escapeXml(state.fg)}"/>
      <stop offset="100%" stop-color="${escapeXml(state.fgColor2 || state.fg)}"/>
    </linearGradient>`
    : "";

  const bgCoords = angleToCoordinates(state.bgAngle ?? 135);
  const startBgColor = state.bgColor1 || "#dceee9";
  const pSize = state.patternSize ?? 14;
  const pOpacity = (state.patternOpacity ?? 20) / 100;

  const gradients = `
    <linearGradient id="bg-linear" x1="${bgCoords.x1}" y1="${bgCoords.y1}" x2="${bgCoords.x2}" y2="${bgCoords.y2}">
      <stop offset="0%" stop-color="${escapeXml(startBgColor)}"/><stop offset="53%" stop-color="#f8fafc"/><stop offset="100%" stop-color="${escapeXml(state.color2)}"/>
    </linearGradient>
    <radialGradient id="bg-radial" cx="25%" cy="20%" r="80%">
      <stop offset="0%" stop-color="${escapeXml(state.color2)}"/><stop offset="72%" stop-color="${escapeXml(startBgColor)}"/>
    </radialGradient>
    <linearGradient id="bg-conic" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${escapeXml(state.color2)}"/><stop offset="50%" stop-color="${escapeXml(startBgColor)}"/><stop offset="100%" stop-color="${escapeXml(state.color2)}"/>
    </linearGradient>
    <linearGradient id="bg-image" x1="${bgCoords.x1}" y1="${bgCoords.y1}" x2="${bgCoords.x2}" y2="${bgCoords.y2}">
      <stop offset="0%" stop-color="${escapeXml(startBgColor)}"/><stop offset="48%" stop-color="#ffffff"/><stop offset="100%" stop-color="${escapeXml(state.color2 || "#fff2d6")}"/>
    </linearGradient>
    <linearGradient id="bg-top-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="51%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bg-bevel-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.1"/>
      <stop offset="60%" stop-color="#000000" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </linearGradient>
    ${state.pattern === "dots" ? `<pattern id="bg-pattern" width="${pSize}" height="${pSize}" patternUnits="userSpaceOnUse"><circle cx="${pSize / 2}" cy="${pSize / 2}" r="${pSize / 8}" fill="rgba(255,255,255,${pOpacity})"/></pattern>` : ""}
    ${state.pattern === "stripes" ? `<pattern id="bg-pattern" width="${pSize}" height="${pSize}" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="${pSize}" stroke="rgba(255,255,255,${pOpacity})" stroke-width="${pSize / 4}"/></pattern>` : ""}
    ${state.pattern === "grid" ? `<pattern id="bg-pattern" width="${pSize}" height="${pSize}" patternUnits="userSpaceOnUse"><path d="M ${pSize} 0 L 0 0 0 ${pSize}" fill="none" stroke="rgba(255,255,255,${pOpacity})" stroke-width="1"/></pattern>` : ""}
    ${state.pattern === "checker" ? `<pattern id="bg-pattern" width="${pSize * 1.2}" height="${pSize * 1.2}" patternUnits="userSpaceOnUse"><rect width="${pSize * 0.6}" height="${pSize * 0.6}" fill="rgba(255,255,255,${pOpacity})"/><rect x="${pSize * 0.6}" y="${pSize * 0.6}" width="${pSize * 0.6}" height="${pSize * 0.6}" fill="rgba(255,255,255,${pOpacity})"/></pattern>` : ""}
    ${state.pattern === "waves" ? `<pattern id="bg-pattern" width="${pSize * 1.5}" height="${pSize * 0.75}" patternUnits="userSpaceOnUse"><path d="M 0 ${pSize * 0.375} Q ${pSize * 0.375} 0 ${pSize * 0.75} ${pSize * 0.375} T ${pSize * 1.5} ${pSize * 0.375}" fill="none" stroke="rgba(255,255,255,${pOpacity})" stroke-width="1.5"/></pattern>` : ""}
    ${state.pattern === "cross" ? `<pattern id="bg-pattern" width="${pSize}" height="${pSize}" patternUnits="userSpaceOnUse"><path d="M${pSize / 2} ${pSize / 5} v${pSize * 0.6} M${pSize / 5} ${pSize / 2} h${pSize * 0.6}" stroke="rgba(255,255,255,${pOpacity})" stroke-width="1.5"/></pattern>` : ""}
    ${(state.noise ?? 0) > 0 ? '<filter id="bg-noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/></filter>' : ""}
    ${fgGradientDef}`;

  // 11 款形状蒙版与剪裁
  const pad = Math.max(0, Math.min(30, state.maskPad ?? 0));
  const innerSize = 100 - pad * 2;
  let maskPath = "";
  if (state.mask === "circle") {
    maskPath = `<circle cx="50" cy="50" r="${50 - pad}"/>`;
  } else if (state.mask === "round") {
    maskPath = `<rect x="${pad}" y="${pad}" width="${innerSize}" height="${innerSize}" rx="16" ry="16"/>`;
  } else if (state.mask === "star") {
    maskPath = `<polygon points="50,${pad + 4} ${63 - pad * 0.2},${35 + pad * 0.1} ${96 - pad},${36 + pad * 0.1} ${69 - pad * 0.3},${56 - pad * 0.1} ${79 - pad * 0.4},${90 - pad} 50,${70 - pad * 0.4} ${21 + pad * 0.4},${90 - pad} ${31 + pad * 0.3},${56 - pad * 0.1} ${4 + pad},${36 + pad * 0.1} ${37 + pad * 0.2},${35 + pad * 0.1}"/>`;
  } else if (state.mask === "diamond") {
    maskPath = `<rect x="${20 + pad * 0.6}" y="${20 + pad * 0.6}" width="${60 - pad * 1.2}" height="${60 - pad * 1.2}" rx="8" transform="rotate(45 50 50)"/>`;
  } else if (state.mask === "triangle") {
    maskPath = `<polygon points="50,${pad + 6} ${95 - pad},${94 - pad} ${5 + pad},${94 - pad}"/>`;
  } else if (state.mask === "teardrop") {
    maskPath = `<path d="M50 ${pad + 6} C50 ${pad + 6} ${92 - pad} ${45 + pad * 0.5} ${92 - pad} ${68 - pad * 0.5} A${42 - pad} ${42 - pad} 0 0 1 ${8 + pad} ${68 - pad * 0.5} C${8 + pad} ${45 + pad * 0.5} 50 ${pad + 6} 50 ${pad + 6} Z"/>`;
  } else if (state.mask === "hex") {
    maskPath = `<path d="M50 ${pad} ${100 - pad} ${pad + 20} ${100 - pad} ${100 - pad - 20} 50 ${100 - pad} ${pad} ${100 - pad - 20} ${pad} ${pad + 20}Z"/>`;
  } else if (state.mask === "shield") {
    maskPath = `<path d="M50 ${pad + 4} L${92 - pad} ${pad + 18} C${92 - pad} ${65 - pad * 0.5} 50 ${96 - pad} 50 ${96 - pad} C50 ${96 - pad} ${8 + pad} ${65 - pad * 0.5} ${8 + pad} ${pad + 18} Z"/>`;
  } else if (state.mask === "custom" && state.customMask?.trim()) {
    maskPath = `<path d="${escapeXml(state.customMask)}"/>`;
  } else if (state.mask === "none") {
    maskPath = `<rect x="0" y="0" width="100" height="100"/>`;
  } else {
    // 默认或 squircle iOS 超椭圆
    const radius = Math.max(4, Math.min(46, state.maskRadius ?? 22));
    maskPath = `<rect x="${pad}" y="${pad}" width="${innerSize}" height="${innerSize}" rx="${radius}" ry="${radius}"/>`;
  }

  const maskDef = `<clipPath id="app-clip">${maskPath}</clipPath>`;

  const showBg = state.layersVisible?.bg !== false;
  const showFg = state.layersVisible?.fg !== false;
  const showBadge = state.badgeEnabled && state.layersVisible?.badge !== false;

  const bgFill = showBg ? backgroundPaint(state) : "none";
  const bgRect = bgFill !== "none" ? `<rect width="100" height="100" fill="${bgFill}"/>` : "";
  const glossRect = showBg && state.gloss === "top"
    ? '<rect width="100" height="100" fill="url(#bg-top-gloss)" style="mix-blend-mode:screen"/>'
    : showBg && state.gloss === "bevel"
      ? '<rect width="100" height="100" fill="url(#bg-bevel-gloss)" style="mix-blend-mode:overlay"/>'
      : "";
  const patternRect = showBg && state.pattern && state.pattern !== "none" ? '<rect width="100" height="100" fill="url(#bg-pattern)"/>' : "";
  const noiseRect = showBg && (state.noise ?? 0) > 0 ? `<rect width="100" height="100" filter="url(#bg-noise)" opacity="${Math.min(1, (state.noise ?? 0) / 100)}" style="mix-blend-mode:overlay"/>` : "";
  const innerBorderRect = showBg && state.innerBorder
    ? `<rect x="${pad + 1}" y="${pad + 1}" width="${innerSize - 2}" height="${innerSize - 2}" rx="${Math.max(2, (state.maskRadius ?? 22) - 1)}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>`
    : "";

  // 阴影计算
  const sPreset = state.shadowPreset ?? (state.shadow ? "soft" : "none");
  const sX = state.shadowOffsetX ?? (sPreset === "soft" ? 0 : sPreset === "hard" ? 4 : sPreset === "long" ? 12 : 0);
  const sY = state.shadowOffsetY ?? (sPreset === "soft" ? 4 : sPreset === "hard" ? 6 : sPreset === "long" ? 14 : 0);
  const sBlur = state.shadowBlur ?? (sPreset === "soft" ? 10 : sPreset === "hard" ? 0 : sPreset === "long" ? 8 : 0);
  const sAlpha = (state.shadowAlpha ?? (sPreset === "none" ? 0 : 30)) / 100;
  const sColor = state.shadowColor || "#000000";

  const shadowFilter = sPreset !== "none" && (sBlur > 0 || sX !== 0 || sY !== 0)
    ? `<filter id="app-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${sX}" dy="${sY}" stdDeviation="${sBlur / 2}" flood-color="${escapeXml(sColor)}" flood-opacity="${sAlpha}"/></filter>`
    : "";

  const glowFilter = state.glowEnabled
    ? `<filter id="app-glow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="${Math.max(1, (state.glowBlur ?? 8) / 2)}" flood-color="${escapeXml(state.glowColor || "#0f766e")}" flood-opacity="0.8"/></filter>`
    : "";

  // 内部主体图标
  const iconTransform = `translate(${50 + (state.dx ?? 0)} ${50 + (state.dy ?? 0)}) rotate(${state.rotation ?? 0}) scale(${(state.scale ?? 60) / 60}) translate(-50 -50)`;
  const remote = state.iconSvg ? extractRemoteSvg(state.iconSvg) : undefined;
  const builtin = !remote ? BUILTIN_ICONS.find((i) => i.n === state.shape) : undefined;
  const baseShapeRaw = shapes[state.shape] || shapes.spark;
  const shapedMarkup = isFgGradient
    ? baseShapeRaw.replace(/fill="currentColor"/g, `fill="${fgPaint}"`)
    : baseShapeRaw.replace(/fill="currentColor"/g, `fill="${escapeXml(state.fg || "#0f766e")}"`);

  let iconMarkup = "";
  if (state.sourceMode === "text" && state.customText) {
    const lines = state.customText.split("\n");
    const weight = state.fontWeight || 800;
    const font = state.fontFamily || "Inter, sans-serif";
    iconMarkup = `<text x="50" y="55" text-anchor="middle" dominant-baseline="middle" font-family="${escapeXml(font)}" font-weight="${weight}" font-size="${lines.length > 1 ? 28 : 42}" fill="${fgPaint}">${lines.map((l, idx) => `<tspan x="50" dy="${idx === 0 ? 0 : 30}">${escapeXml(l)}</tspan>`).join("")}</text>`;
  } else if (state.sourceMode === "emoji" && state.emojiChar) {
    iconMarkup = `<text x="50" y="55" text-anchor="middle" dominant-baseline="middle" font-size="46">${escapeXml(state.emojiChar)}</text>`;
  } else if (state.sourceMode === "image" && state.customImageDataUrl) {
    iconMarkup = `<image href="${state.customImageDataUrl}" x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet"/>`;
  } else if (remote) {
    iconMarkup = `<svg x="15" y="15" width="70" height="70" viewBox="${escapeXml(remote.viewBox)}">${remote.inner}</svg>`;
  } else if (builtin) {
    iconMarkup = `<svg x="15" y="15" width="70" height="70" viewBox="0 0 24 24"><path d="${builtin.d}" fill="${fgPaint}"${builtin.fr ? ` fill-rule="${builtin.fr}"` : ""}/></svg>`;
  } else {
    iconMarkup = shapedMarkup;
  }

  const filterAttr = state.glowEnabled
    ? ' filter="url(#app-glow)"'
    : sPreset !== "none"
      ? ' filter="url(#app-shadow)"'
      : "";
  const strokeAttr = state.strokeEnabled
    ? ` stroke="${escapeXml(state.strokeColor || "#ffffff")}" stroke-width="${(state.strokeWidth ?? 2) / 4}" paint-order="stroke fill"`
    : "";

  // 3 种徽章形态（角标飘带、底部横条、圆点）
  let badgeMarkup = "";
  if (showBadge) {
    const bStyle = state.badgeStyle || "corner";
    const bPos = state.badgePosition || "top-right";
    const bText = escapeXml(state.badgeText || "NEW");
    const bBg = escapeXml(state.badgeBg || "#ef4444");
    const bColor = escapeXml(state.badgeColor || "#ffffff");
    const bSize = state.badgeSize ?? 30;

    if (bStyle === "corner") {
      // 斜角飘带
      let polyPoints = "";
      let textX = 0, textY = 0, rot = 0;
      if (bPos === "top-right") {
        polyPoints = "60,0 100,0 100,40 80,40 100,20 100,0 40,0 0,0 100,100";
        // 45度斜角多边形
        polyPoints = `100,0 ${100 - bSize * 1.5},0 100,${bSize * 1.5}`;
        textX = 100 - bSize * 0.45;
        textY = bSize * 0.55;
        rot = 45;
      } else if (bPos === "top-left") {
        polyPoints = `0,0 ${bSize * 1.5},0 0,${bSize * 1.5}`;
        textX = bSize * 0.45;
        textY = bSize * 0.55;
        rot = -45;
      } else if (bPos === "bottom-left") {
        polyPoints = `0,100 ${bSize * 1.5},100 0,${100 - bSize * 1.5}`;
        textX = bSize * 0.45;
        textY = 100 - bSize * 0.55;
        rot = 45;
      } else {
        polyPoints = `100,100 ${100 - bSize * 1.5},100 100,${100 - bSize * 1.5}`;
        textX = 100 - bSize * 0.45;
        textY = 100 - bSize * 0.55;
        rot = -45;
      }
      badgeMarkup = `<g class="badge-corner">
        <polygon points="${polyPoints}" fill="${bBg}"/>
        <text x="${textX}" y="${textY}" transform="rotate(${rot} ${textX} ${textY})" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="${Math.max(6, bSize * 0.32)}" fill="${bColor}">${bText}</text>
      </g>`;
    } else if (bStyle === "bottom") {
      // 底部横条
      badgeMarkup = `<g class="badge-bottom">
        <rect x="0" y="${100 - bSize * 0.6}" width="100" height="${bSize * 0.6}" fill="${bBg}"/>
        <text x="50" y="${100 - bSize * 0.28}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="${Math.max(6, bSize * 0.32)}" fill="${bColor}">${bText}</text>
      </g>`;
    } else {
      // 圆点 / 徽章
      const posCoords = {
        "top-left": [20, 20],
        "top-right": [80, 20],
        "bottom-left": [20, 80],
        "bottom-right": [80, 80],
      }[bPos];
      const [bx, by] = posCoords;
      const radius = bSize * 0.35;
      badgeMarkup = `<g class="badge-dot">
        <circle cx="${bx}" cy="${by}" r="${radius}" fill="${bBg}" stroke="#ffffff" stroke-width="1.5"/>
        <text x="${bx}" y="${by + 1}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="${Math.max(6, radius * 0.8)}" fill="${bColor}">${bText}</text>
      </g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${state.size}" height="${state.size}" viewBox="0 0 100 100" role="img" aria-label="${escapeXml(state.appName)}">
  <defs>
    ${gradients}
    ${maskDef}
    ${shadowFilter}
    ${glowFilter}
  </defs>
  <g clip-path="url(#app-clip)">
    ${bgRect}
    ${glossRect}
    ${patternRect}
    ${noiseRect}
    ${innerBorderRect}
    ${showFg ? `<g transform="translate(50 50) scale(0.5) translate(-50 -50)">
      <g color="${escapeXml(state.fg)}" fill="${fgPaint}" transform="${iconTransform}"${filterAttr}${strokeAttr}>
        ${iconMarkup}
      </g>
    </g>` : ""}
    ${badgeMarkup}
  </g>
</svg>`;
}

function blobFromText(text: string, type: string) {
  return new Blob([text], { type });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export async function renderSvgToCanvas(state: ExportDesignState) {
  const svg = createSvgMarkup(state);
  const svgUrl = URL.createObjectURL(blobFromText(svg, "image/svg+xml;charset=utf-8"));
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = svgUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = state.size;
    canvas.height = state.size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");
    context.drawImage(image, 0, 0, state.size, state.size);
    return canvas;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function canvasBlob(canvas: HTMLCanvasElement, type: "image/png" | "image/webp") {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("浏览器无法生成位图")), type, 0.94);
  });
}

/**
 * 为指定设计状态生成 ICO 格式 Blob（默认打包 16, 32, 48, 64, 128, 256 多分辨率）
 */
export async function createIcoBlob(state: ExportDesignState, sizes: number[] = [16, 32, 48, 64, 128, 256]): Promise<Blob> {
  const images: IcoImageSource[] = [];
  for (const size of sizes) {
    const canvas = await renderSvgToCanvas({ ...state, size });
    const png = await canvasBlob(canvas, "image/png");
    const data = await blobToUint8Array(png);
    images.push({ width: size, height: size, data });
  }
  return encodeIco(images);
}

export async function exportFormat(state: ExportDesignState, format: ExportFormat) {
  const baseName = (state.appName.trim() || "qm-icon").replace(/[^a-zA-Z0-9\u4e00-\u9fff-_]+/g, "-");
  if (format === "SVG") {
    downloadBlob(blobFromText(createSvgMarkup(state), "image/svg+xml;charset=utf-8"), `${baseName}-${state.size}.svg`);
    return;
  }
  if (format === "ICO") {
    // ICO 单独导出包含常用全尺寸或当前指定尺寸的合一文件
    const targetSizes = state.size > 256 ? [16, 32, 48, 64, 128, 256] : Array.from(new Set([16, 32, 48, 64, 128, 256, state.size])).sort((a, b) => a - b);
    const icoBlob = await createIcoBlob(state, targetSizes);
    downloadBlob(icoBlob, `${baseName}.ico`);
    return;
  }
  const canvas = await renderSvgToCanvas(state);
  const blob = await canvasBlob(canvas, format === "PNG" ? "image/png" : "image/webp");
  downloadBlob(blob, `${baseName}-${state.size}.${format.toLowerCase()}`);
}

export type ExportPlatform = "android" | "ios" | "web" | "macos" | "windows";

type PlatformVariant = { pixels: number; label: string; path: string; stem: string };

export const PLATFORM_PRESETS: Record<ExportPlatform, { label: string; variants: PlatformVariant[] }> = {
  android: {
    label: "Android",
    variants: [
      { pixels: 48, label: "mdpi", path: "Android/mipmap-mdpi", stem: "ic_launcher" },
      { pixels: 72, label: "hdpi", path: "Android/mipmap-hdpi", stem: "ic_launcher" },
      { pixels: 96, label: "xhdpi", path: "Android/mipmap-xhdpi", stem: "ic_launcher" },
      { pixels: 144, label: "xxhdpi", path: "Android/mipmap-xxhdpi", stem: "ic_launcher" },
      { pixels: 192, label: "xxxhdpi", path: "Android/mipmap-xxxhdpi", stem: "ic_launcher" },
    ],
  },
  ios: {
    label: "iOS",
    variants: [
      { pixels: 40, label: "20pt @2x", path: "iOS/AppIcon.appiconset", stem: "icon-20@2x" },
      { pixels: 60, label: "20pt @3x", path: "iOS/AppIcon.appiconset", stem: "icon-20@3x" },
      { pixels: 58, label: "29pt @2x", path: "iOS/AppIcon.appiconset", stem: "icon-29@2x" },
      { pixels: 120, label: "60pt @2x", path: "iOS/AppIcon.appiconset", stem: "icon-60@2x" },
      { pixels: 152, label: "76pt @2x", path: "iOS/AppIcon.appiconset", stem: "icon-76@2x" },
      { pixels: 167, label: "83.5pt @2x", path: "iOS/AppIcon.appiconset", stem: "icon-83.5@2x" },
      { pixels: 1024, label: "App Store", path: "iOS/AppIcon.appiconset", stem: "icon-1024" },
    ],
  },
  web: {
    label: "Web-PWA",
    variants: [
      { pixels: 16, label: "favicon 16", path: "Web-PWA/favicon", stem: "favicon-16" },
      { pixels: 32, label: "favicon 32", path: "Web-PWA/favicon", stem: "favicon-32" },
      { pixels: 48, label: "favicon 48", path: "Web-PWA/favicon", stem: "favicon-48" },
      { pixels: 192, label: "PWA 192", path: "Web-PWA/icons", stem: "pwa-192" },
      { pixels: 512, label: "PWA 512", path: "Web-PWA/icons", stem: "pwa-512" },
    ],
  },
  macos: {
    label: "macOS",
    variants: [
      { pixels: 16, label: "16", path: "macOS.iconset", stem: "icon_16x16" },
      { pixels: 32, label: "16@2x", path: "macOS.iconset", stem: "icon_16x16@2x" },
      { pixels: 128, label: "128", path: "macOS.iconset", stem: "icon_128x128" },
      { pixels: 256, label: "128@2x", path: "macOS.iconset", stem: "icon_128x128@2x" },
      { pixels: 512, label: "256@2x", path: "macOS.iconset", stem: "icon_256x256@2x" },
      { pixels: 1024, label: "512@2x", path: "macOS.iconset", stem: "icon_512x512@2x" },
    ],
  },
  windows: {
    label: "Windows",
    variants: [
      { pixels: 16, label: "16", path: "Windows", stem: "icon-16" },
      { pixels: 32, label: "32", path: "Windows", stem: "icon-32" },
      { pixels: 48, label: "48", path: "Windows", stem: "icon-48" },
      { pixels: 64, label: "64", path: "Windows", stem: "icon-64" },
      { pixels: 128, label: "128", path: "Windows", stem: "icon-128" },
      { pixels: 256, label: "256", path: "Windows", stem: "icon-256" },
    ],
  },
};

export type ZipPlanEntry = {
  platform: ExportPlatform;
  platformLabel: string;
  pixels: number;
  variantLabel: string;
  files: string[];
};

export function getZipPlatforms(selectedPlatforms: ExportPlatform[]): ExportPlatform[] {
  return selectedPlatforms.length ? selectedPlatforms : ["web"];
}

export function buildZipPlan(selectedPlatforms: ExportPlatform[]): ZipPlanEntry[] {
  return getZipPlatforms(selectedPlatforms).flatMap((platform) => {
    const preset = PLATFORM_PRESETS[platform];
    return preset.variants.map((variant) => {
      const basePath = `${variant.path}/${variant.stem}`;
      const files = platform === "windows"
        ? [`${basePath}.png`, `${basePath}.webp`, `${basePath}.svg`, `${basePath}.ico`]
        : [`${basePath}.png`, `${basePath}.webp`, `${basePath}.svg`];
      return { platform, platformLabel: preset.label, pixels: variant.pixels, variantLabel: variant.label, files };
    });
  });
}

function iosContents(variants: PlatformVariant[]) {
  const sizeByPixels: Record<number, string> = { 40: "20x20", 60: "20x20", 58: "29x29", 120: "60x60", 152: "76x76", 167: "83.5x83.5", 1024: "1024x1024" };
  return JSON.stringify({ images: variants.map((variant) => ({ filename: `${variant.stem}.png`, idiom: "universal", scale: variant.pixels === 1024 ? "1x" : variant.label.includes("@3x") ? "3x" : "2x", size: sizeByPixels[variant.pixels] || `${variant.pixels}x${variant.pixels}` })), info: { author: "xcode", version: 1 } }, null, 2);
}

function macContents(variants: PlatformVariant[]) {
  return JSON.stringify({ images: variants.map((variant) => ({ filename: `${variant.stem}.png`, idiom: "mac", scale: variant.label.includes("@2x") ? "2x" : "1x", size: variant.label.replace("@2x", "") + "x" + variant.label.replace("@2x", "") })), info: { author: "xcode", version: 1 } }, null, 2);
}

function webManifest(appName: string) {
  return JSON.stringify(
    {
      name: appName || "QM Icon App",
      short_name: appName || "QM Icon",
      icons: [
        { src: "icons/pwa-192.png", sizes: "192x192", type: "image/png" },
        { src: "icons/pwa-512.png", sizes: "512x512", type: "image/png" },
      ],
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0f766e",
    },
    null,
    2
  );
}

export function getPlatformConfigFiles(platform: ExportPlatform, appName: string = ""): string[] {
  if (platform === "android") {
    return [
      "Android/mipmap-anydpi-v26/ic_launcher.xml",
      "Android/mipmap-anydpi-v26/ic_launcher_round.xml",
      "Android/res/values/colors.xml",
      "Android/res/drawable/ic_launcher_foreground.xml",
    ];
  }
  if (platform === "ios") return ["iOS/AppIcon.appiconset/Contents.json"];
  if (platform === "macos") return ["macOS.iconset/Contents.json"];
  if (platform === "windows") return ["Windows/icon.ico", "Windows/app.ico"];
  if (platform === "web") return ["Web-PWA/manifest.json", "Web-PWA/favicon/favicon.ico"];
  return [];
}

function platformConfigFiles(platform: ExportPlatform, variants: PlatformVariant[], appName: string) {
  if (platform === "android") return {
    "Android/mipmap-anydpi-v26/ic_launcher.xml": `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>\n`,
    "Android/mipmap-anydpi-v26/ic_launcher_round.xml": `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>\n`,
    "Android/res/values/colors.xml": `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#F6F7FA</color></resources>\n`,
    "Android/res/drawable/ic_launcher_foreground.xml": `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="100" android:viewportHeight="100"><path android:fillColor="#0F766E" android:pathData="M50,7 L60,39 L93,50 L60,61 L50,94 L40,61 L7,50 L40,39 Z"/></vector>\n`,
  };
  if (platform === "ios") return { "iOS/AppIcon.appiconset/Contents.json": iosContents(variants) };
  if (platform === "macos") return { "macOS.iconset/Contents.json": macContents(variants) };
  if (platform === "web") return { "Web-PWA/manifest.json": webManifest(appName) };
  return {};
}

export async function exportZip(state: ExportDesignState, selectedPlatforms: ExportPlatform[]) {
  const baseName = (state.appName.trim() || "qm-icon").replace(/[^a-zA-Z0-9\u4e00-\u9fff-_]+/g, "-");
  const platforms = getZipPlatforms(selectedPlatforms);
  const zip = new JSZip();
  const manifest: Array<{ platform: string; label: string; pixels: number; files: string[] }> = [];
  let fileCount = 0;

  for (const platform of platforms) {
    const preset = PLATFORM_PRESETS[platform];
    const winImages: IcoImageSource[] = [];
    const webFaviconImages: IcoImageSource[] = [];

    for (const variant of preset.variants) {
      const sizedState = { ...state, size: variant.pixels };
      const canvas = await renderSvgToCanvas(sizedState);
      const png = await canvasBlob(canvas, "image/png");
      const webp = await canvasBlob(canvas, "image/webp");
      const svg = createSvgMarkup(sizedState);
      const basePath = `${variant.path}/${variant.stem}`;
      const pngBytes = await blobToUint8Array(png);

      if (platform === "windows") {
        // 单尺寸 ICO
        const singleIco = encodeIco([{ width: variant.pixels, height: variant.pixels, data: pngBytes }]);
        const files = [`${basePath}.png`, `${basePath}.webp`, `${basePath}.svg`, `${basePath}.ico`];
        zip.file(files[0], png);
        zip.file(files[1], webp);
        zip.file(files[2], svg);
        zip.file(files[3], singleIco);
        manifest.push({ platform, label: variant.label, pixels: variant.pixels, files });
        fileCount += 4;
        winImages.push({ width: variant.pixels, height: variant.pixels, data: pngBytes });
      } else {
        const files = [`${basePath}.png`, `${basePath}.webp`, `${basePath}.svg`];
        zip.file(files[0], png);
        zip.file(files[1], webp);
        zip.file(files[2], svg);
        manifest.push({ platform, label: variant.label, pixels: variant.pixels, files });
        fileCount += 3;

        if (platform === "web" && [16, 32, 48].includes(variant.pixels)) {
          webFaviconImages.push({ width: variant.pixels, height: variant.pixels, data: pngBytes });
        }
      }
    }

    // 平台级特殊合一图标与配置文件
    if (platform === "windows" && winImages.length > 0) {
      const multiIco = encodeIco(winImages);
      zip.file("Windows/icon.ico", multiIco);
      zip.file("Windows/app.ico", multiIco);
      fileCount += 2;
    }

    if (platform === "web" && webFaviconImages.length > 0) {
      const faviconIco = encodeIco(webFaviconImages);
      zip.file("Web-PWA/favicon/favicon.ico", faviconIco);
      fileCount += 1;
    }

    const configs = platformConfigFiles(platform, preset.variants, state.appName);
    Object.entries(configs).forEach(([path, content]) => {
      zip.file(path, content);
      fileCount += 1;
    });
  }

  const allConfigFiles = platforms.flatMap((platform) => getPlatformConfigFiles(platform, state.appName));
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        name: state.appName,
        sourceSize: state.size,
        selectedPlatforms: platforms,
        files: manifest,
        configFiles: allConfigFiles,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  downloadBlob(blob, `${baseName}-platform-icons.zip`);
  return { platformCount: platforms.length, fileCount: fileCount + 1 };
}

