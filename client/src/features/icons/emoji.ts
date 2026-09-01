export interface EmojiCategory {
  id: string;
  labelZh: string;
  labelEn: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "popular",
    labelZh: "常用",
    labelEn: "Popular",
    emojis: [
      "🚀", "⚡", "🔥", "💡", "💎", "⭐", "🌟", "✨", "👑", "🎯",
      "🎨", "🔮", "🍀", "🎉", "🏆", "❤️", "☕", "🎮", "🎵", "🎧",
      "🦄", "🤖", "💻", "📱", "🛡️", "⚔️", "🧭", "⚓", "🛸", "🌈",
      "🧩", "🏷️", "🔥", "🐱", "🐶", "🦁", "🐼", "🦊", "🌸", "🌿",
      "🍎", "🍕", "🍔", "🥑", "🌍", "🌙", "☀️", "✈️", "🚗", "⛵",
      "🏖️", "⚽", "🏀", "📷", "🔒", "🔑", "📦", "✉️", "💬", "👾"
    ]
  },
  {
    id: "smileys",
    labelZh: "表情",
    labelEn: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😋", "😛",
      "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
      "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
      "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
      "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕"
    ]
  },
  {
    id: "animals",
    labelZh: "动物",
    labelEn: "Animals",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
      "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋",
      "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎",
      "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟",
      "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧"
    ]
  },
  {
    id: "food",
    labelZh: "食物",
    labelEn: "Food",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
      "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐",
      "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇",
      "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪",
      "🌮", "🌯", "🥗", "🥘", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱"
    ]
  },
  {
    id: "activities",
    labelZh: "活动",
    labelEn: "Activities",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁",
      "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🎿",
      "⛷️", "🏂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏌️", "🏇",
      "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇",
      "🥈", "🥉", "🏅", "🎖️", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧"
    ]
  },
  {
    id: "travel",
    labelZh: "旅行",
    labelEn: "Travel",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨",
      "🚔", "🚍", "🚘", "🚖", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅",
      "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "🚁", "🛩️", "✈️", "🛫",
      "🛬", "🪂", "🛰️", "🚀", "🛸", "⛵", "🚤", "🛥️", "🛳️", "⛴️",
      "🚢", "⚓", "⛽", "🗿", "🗽", "🗼", "🏰", "🎡", "🎢", "🏖️"
    ]
  },
  {
    id: "objects",
    labelZh: "物品",
    labelEn: "Objects",
    emojis: [
      "💻", "🖥️", "🖨️", "⌨️", "🖱️", "💽", "💾", "💿", "📀", "📷",
      "📸", "📹", "🎥", "📽️", "📞", "☎️", "📟", "📠", "📺", "📻",
      "🎙️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋",
      "🔌", "💡", "🔦", "🕯️", "🧯", "💸", "💵", "💰", "💳", "💎",
      "⚖️", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🔗",
      "📎", "🖇️", "📐", "📏", "📌", "📍", "✂️", "🖊️", "🖋️", "🔒"
    ]
  },
  {
    id: "symbols",
    labelZh: "符号",
    labelEn: "Symbols",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
      "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
      "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
      "♑", "♒", "♓", "🆔", "⚛️", "☢️", "☣️", "📴", "📳", "🈶",
      "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️"
    ]
  }
];

export const HOT_EMOJIS = EMOJI_CATEGORIES[0].emojis;

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[char] ?? char);
}

/**
 * 将 Emoji 字符生成居中矢量 SVG 文本
 */
export function createEmojiSvg(emoji: string = "🚀"): string {
  const safe = escapeXml(emoji.trim() || "🚀");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50" y="58" dominant-baseline="central" text-anchor="middle" font-size="68" font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif">${safe}</text>
</svg>`;
}

/**
 * 将图片 Data URL 生成嵌入式 SVG
 */
export function createImageSvg(dataUrl: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <image href="${dataUrl}" x="5" y="5" width="90" height="90" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

/**
 * 解析用户输入的原始 SVG 代码或路径
 */
export function parseRawSvgInput(input: string): { svg?: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: "SVG 内容不能为空" };

  if (trimmed.startsWith("M") || trimmed.startsWith("m") || trimmed.includes("Z") || trimmed.includes("z")) {
    if (!trimmed.includes("<")) {
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${escapeXml(trimmed)}" fill="currentColor"/></svg>`
      };
    }
  }

  if (/<svg[\s\S]*<\/svg>/i.test(trimmed)) {
    return { svg: trimmed };
  }

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${trimmed}</svg>`
  };
}
