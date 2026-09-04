/* QM icon 复刻提醒：图标搜索使用无需密钥的 Iconify 公共 API 与内置离线矢量库融合方案。 */
import {
  BUILTIN_ICONS,
  DEFAULT_ICONIFY_ICONS,
  ICON_QUERY_ALIASES,
  type BuiltinIcon,
} from "./data/builtinIcons";

export type IconData = {
  body: string;
  viewBox: string;
};

export type IconSearchItem = {
  id: string;
  prefix: string;
  name: string;
  label?: string;
  collection?: string;
  license?: string;
  isBuiltin?: boolean;
  d?: string;
  fr?: "evenodd" | "nonzero";
  body?: string;
  viewBox?: string;
};

type IconifySearchResponse = {
  icons?: string[];
  collections?: Record<string, { name?: string; license?: { title?: string } }>;
};

const API_HOSTS = [
  "https://api.iconify.design",
  "https://api.simplesvg.com",
  "https://api.unisvg.com",
];

export const BASE_SHAPES: Record<
  string,
  { d?: string; tag?: string; vb: string }
> = {
  spark: {
    d: "M50 7 60 39 93 50 60 61 50 94 40 61 7 50 40 39Z",
    vb: "0 0 100 100",
  },
  circle: {
    tag: '<circle cx="50" cy="50" r="34" fill="currentColor"/>',
    vb: "0 0 100 100",
  },
  diamond: {
    tag: '<rect x="19" y="19" width="62" height="62" rx="12" transform="rotate(45 50 50)" fill="currentColor"/>',
    vb: "0 0 100 100",
  },
  hex: { d: "M50 11 84 30v40L50 89 16 70V30Z", vb: "0 0 100 100" },
  heart: {
    d: "M50 82 18 49c-13-15-3-36 14-36 9 0 16 5 18 13 3-8 10-13 19-13 17 0 27 21 14 36Z",
    vb: "0 0 100 100",
  },
};

// 内存图标数据缓存
const iconDataCache = new Map<string, IconData>();
type CacheListener = (id: string, data: IconData) => void;
const cacheListeners = new Set<CacheListener>();

export function subscribeIconCache(listener: CacheListener): () => void {
  cacheListeners.add(listener);
  return () => {
    cacheListeners.delete(listener);
  };
}

export function getCachedIcon(id: string): IconData | undefined {
  return iconDataCache.get(id);
}

export function setCachedIcon(id: string, data: IconData): void {
  iconDataCache.set(id, data);
  cacheListeners.forEach(listener => {
    try {
      listener(id, data);
    } catch {}
  });
}

export function clearIconCache(): void {
  iconDataCache.clear();
}

function normalizeIcon(
  id: string,
  collections?: IconifySearchResponse["collections"]
): IconSearchItem {
  const [prefix, ...nameParts] = id.split(":");
  const collection = collections?.[prefix];
  return {
    id,
    prefix: prefix || "custom",
    name: nameParts.join(":") || id,
    collection: collection?.name || prefix,
    license: collection?.license?.title,
  };
}

async function fetchWithFallback(path: string) {
  let lastError: unknown;
  for (const host of API_HOSTS) {
    try {
      const response = await fetch(`${host}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error(`Iconify API ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Iconify API unavailable");
}

export function getBuiltinIcons(filter = ""): IconSearchItem[] {
  const f = filter.trim().toLowerCase();
  const list = BUILTIN_ICONS.filter(
    i =>
      !f ||
      i.n.toLowerCase().includes(f) ||
      i.label.toLowerCase().includes(f) ||
      i.k.toLowerCase().includes(f)
  );
  return list.map(i => ({
    id: i.n,
    prefix: "builtin",
    name: i.n,
    label: i.label,
    collection: "内置矢量库",
    license: "Open Source",
    isBuiltin: true,
    d: i.d,
    fr: i.fr,
  }));
}

export function getDefaultStarterIcons(): IconSearchItem[] {
  const builtins = getBuiltinIcons();
  const online = DEFAULT_ICONIFY_ICONS.map(id => normalizeIcon(id));
  const starter = [...builtins, ...online];
  // 异步预热默认推荐的在线精选图标
  batchFetchIconData(DEFAULT_ICONIFY_ICONS).catch(() => {});
  return starter;
}

export function getQueryCandidates(rawQuery: string): string[] {
  const raw = rawQuery.trim().toLowerCase();
  if (!raw) return [];
  const folded = raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const exact = ICON_QUERY_ALIASES[raw] || ICON_QUERY_ALIASES[folded];
  const candidates: string[] = exact ? [exact] : [];

  for (const [term, query] of Object.entries(ICON_QUERY_ALIASES)) {
    if (term.length >= 2 && raw.includes(term) && !candidates.includes(query)) {
      candidates.push(query);
    }
  }

  const hit = BUILTIN_ICONS.find(i => {
    const k = i.k.toLowerCase();
    return i.n === folded || i.label === raw || k.includes(raw);
  });
  if (hit && !candidates.includes(hit.n)) {
    candidates.push(hit.n);
  }

  if (!candidates.includes(raw)) {
    candidates.push(raw);
  }
  return candidates.slice(0, 4);
}

export async function searchIconify(
  query: string,
  limit = 72,
  prefix?: string
): Promise<IconSearchItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return getDefaultStarterIcons();

  // 1. 本地内置图标快速检索
  const localHits = getBuiltinIcons(trimmed);

  // 2. 语义别名展开并并发查询 Iconify 2w+ 在线库
  const candidates = getQueryCandidates(trimmed);
  const onlineMap = new Map<string, IconSearchItem>();

  for (const q of candidates) {
    try {
      const url = `/search?query=${encodeURIComponent(q)}&limit=${limit}${prefix ? `&prefix=${prefix}` : ""}`;
      const response = await fetchWithFallback(url);
      const data = (await response.json()) as IconifySearchResponse;
      const icons = data.icons || [];
      for (const id of icons) {
        if (!onlineMap.has(id)) {
          onlineMap.set(id, normalizeIcon(id, data.collections));
        }
      }
      if (onlineMap.size >= limit) break;
    } catch {
      // 忽略单个候选词错误，继续尝试其他候选词
    }
  }

  // 3. 聚合去重合并返回
  const combined = [...localHits];
  onlineMap.forEach(item => {
    combined.push(item);
  });

  // 自动后台批量预热前 36 个在线图标矢量
  const onlineIds = combined.filter(i => !i.isBuiltin).map(i => i.id);
  if (onlineIds.length > 0) {
    batchFetchIconData(onlineIds.slice(0, 36)).catch(() => {});
  }

  return combined;
}

const pendingBatchRequests = new Map<string, Promise<void>>();

export async function batchFetchIconData(ids: string[]): Promise<void> {
  const neededByPrefix = new Map<string, Set<string>>();

  for (const id of ids) {
    if (!id || typeof id !== "string") continue;
    if (iconDataCache.has(id)) continue;
    if (BUILTIN_ICONS.some(b => b.n === id)) continue;
    if (id in BASE_SHAPES) continue;

    const [prefix, ...nameParts] = id.split(":");
    const name = nameParts.join(":");
    if (!prefix || !name) continue;

    if (!neededByPrefix.has(prefix)) {
      neededByPrefix.set(prefix, new Set());
    }
    neededByPrefix.get(prefix)!.add(name);
  }

  if (neededByPrefix.size === 0) return;

  const tasks: Promise<void>[] = [];

  neededByPrefix.forEach((nameSet, prefix) => {
    const names = Array.from(nameSet);
    const taskKey = `${prefix}:${names.sort().join(",")}`;
    const existing = pendingBatchRequests.get(taskKey);
    if (existing) {
      tasks.push(existing);
      return;
    }

    const promise = (async () => {
      let succeeded = false;
      for (const host of API_HOSTS) {
        try {
          const response = await fetch(
            `${host}/${encodeURIComponent(prefix)}.json?icons=${encodeURIComponent(names.join(","))}`,
            {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(6000),
            }
          );
          if (!response.ok) continue;
          const data = (await response.json()) as {
            icons?: Record<
              string,
              {
                body?: string;
                left?: number;
                top?: number;
                width?: number;
                height?: number;
              }
            >;
            width?: number;
            height?: number;
          };
          const icons = data.icons || {};
          const defaultWidth = data.width || 24;
          const defaultHeight = data.height || 24;

          for (const name of names) {
            const item = icons[name];
            if (item && item.body) {
              const vb = `${item.left || 0} ${item.top || 0} ${item.width || defaultWidth} ${item.height || defaultHeight}`;
              setCachedIcon(`${prefix}:${name}`, {
                body: item.body,
                viewBox: vb,
              });
            }
          }
          succeeded = true;
          break;
        } catch {
          // 容灾重试下一个镜像站点
        }
      }

      // 若批量拉取未完全获取，对缺失图标单图兜底
      if (!succeeded) {
        await Promise.allSettled(
          names.map(async name => {
            const id = `${prefix}:${name}`;
            if (iconDataCache.has(id)) return;
            try {
              const detail = await fetchIconDetail(id);
              const inner = detail.svg
                .replace(/^<svg[^>]*>/i, "")
                .replace(/<\/svg>$/i, "");
              setCachedIcon(id, {
                body: inner,
                viewBox: detail.viewBox,
              });
            } catch {}
          })
        );
      }
    })().finally(() => {
      pendingBatchRequests.delete(taskKey);
    });

    pendingBatchRequests.set(taskKey, promise);
    tasks.push(promise);
  });

  await Promise.allSettled(tasks);
}

export async function fetchIconDetail(
  id: string
): Promise<{ svg: string; viewBox: string }> {
  // 1. 命中缓存
  const cached = iconDataCache.get(id);
  if (cached) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cached.viewBox}">${cached.body}</svg>`,
      viewBox: cached.viewBox,
    };
  }

  // 2. 检查是否为内置图标
  const builtin = BUILTIN_ICONS.find(i => i.n === id);
  if (builtin) {
    const body = `<path d="${builtin.d}" fill="currentColor"${builtin.fr ? ` fill-rule="${builtin.fr}"` : ""}/>`;
    const res = {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${body}</svg>`,
      viewBox: "0 0 24 24",
    };
    setCachedIcon(id, { body, viewBox: "0 0 24 24" });
    return res;
  }

  // 3. 5种基础几何形状
  if (BASE_SHAPES[id]) {
    const s = BASE_SHAPES[id];
    const body = s.d ? `<path d="${s.d}" fill="currentColor"/>` : s.tag!;
    const res = {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${s.vb}">${body}</svg>`,
      viewBox: s.vb,
    };
    setCachedIcon(id, { body, viewBox: s.vb });
    return res;
  }

  // 4. 在线 Iconify 获取完整矢量和 viewBox
  const [prefix, ...nameParts] = id.split(":");
  const name = nameParts.join(":");
  if (prefix && name) {
    for (const host of API_HOSTS) {
      try {
        const response = await fetch(
          `${host}/${encodeURIComponent(prefix)}.json?icons=${encodeURIComponent(name)}`,
          {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(6000),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const item = data.icons?.[name];
          if (item) {
            const vb = `${item.left || 0} ${item.top || 0} ${item.width || data.width || 24} ${item.height || data.height || 24}`;
            setCachedIcon(id, { body: item.body, viewBox: vb });
            return {
              svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${item.body}</svg>`,
              viewBox: vb,
            };
          }
        }
      } catch {}
    }
  }

  // 5. 回退：直接获取 SVG
  const svgText = await fetchIconSvg(id);
  const vbMatch = svgText.match(/viewBox=["']([^"']+)["']/i);
  const vb = vbMatch?.[1] || "0 0 24 24";
  const inner = svgText.replace(/^<svg[^>]*>/i, "").replace(/<\/svg>$/i, "");
  setCachedIcon(id, { body: inner, viewBox: vb });
  return {
    svg: svgText,
    viewBox: vb,
  };
}

export async function fetchIconSvg(id: string): Promise<string> {
  const builtin = BUILTIN_ICONS.find(i => i.n === id);
  if (builtin) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${builtin.d}" fill="currentColor"${builtin.fr ? ` fill-rule="${builtin.fr}"` : ""}/></svg>`;
  }

  const [prefix, ...nameParts] = id.split(":");
  const name = nameParts.join(":");
  let lastError: unknown;
  for (const host of API_HOSTS) {
    try {
      const response = await fetch(
        `${host}/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg?box=1`,
        {
          headers: { Accept: "image/svg+xml,text/plain" },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (!response.ok) throw new Error(`Iconify SVG ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Icon SVG unavailable");
}

export function iconSvgUrl(id: string): string {
  const builtin = BUILTIN_ICONS.find(i => i.n === id);
  if (builtin) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${encodeURIComponent(builtin.d)}" fill="%23808080"/></svg>`;
  }
  const [prefix, ...nameParts] = id.split(":");
  return `${API_HOSTS[0]}/${encodeURIComponent(prefix)}/${encodeURIComponent(nameParts.join(":"))}.svg?color=%23808080`;
}
