/**
 * 生成文字图标矢量 SVG
 */
export function createTextSvg(
  text: string = "",
  fontFamily: string = "system-ui, -apple-system, sans-serif"
): string {
  const clean = text ?? "";
  const len = Array.from(clean).length;
  let fontSize = 54;
  let y = 67;

  if (len <= 1) {
    fontSize = 58;
    y = 69;
  } else if (len === 2) {
    fontSize = 46;
    y = 66;
  } else if (len === 3) {
    fontSize = 32;
    y = 62;
  } else {
    fontSize = 24;
    y = 59;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="${y}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="800" fill="currentColor">${clean}</text></svg>`;
}
