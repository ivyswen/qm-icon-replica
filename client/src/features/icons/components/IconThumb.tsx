/* QM icon 复刻：高性能图标缩略图渲染组件，支持内置图标与 Iconify 在线矢量渲染、内存缓存订阅与骨架微光加载态 */
import React, { useEffect, useState } from "react";
import {
  getCachedIcon,
  subscribeIconCache,
  batchFetchIconData,
  BASE_SHAPES,
  type IconData,
  type IconSearchItem,
} from "../api";
import { BUILTIN_ICONS } from "../data/builtinIcons";

interface IconThumbProps {
  item: IconSearchItem;
  size?: number;
}

export const IconThumb: React.FC<IconThumbProps> = ({ item, size = 20 }) => {
  // 1. 检查是否为离线内置图标
  const builtin = item.isBuiltin
    ? item
    : BUILTIN_ICONS.find(i => i.n === item.id);
  if (builtin && builtin.d) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
        <path d={builtin.d} fill="currentColor" fillRule={builtin.fr} />
      </svg>
    );
  }

  // 2. 检查基础几何形状
  const baseShape = BASE_SHAPES[item.id];
  if (baseShape) {
    if (baseShape.d) {
      return (
        <svg
          viewBox={baseShape.vb}
          width={size}
          height={size}
          fill="currentColor"
        >
          <path d={baseShape.d} fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg
        viewBox={baseShape.vb}
        width={size}
        height={size}
        fill="currentColor"
        dangerouslySetInnerHTML={{ __html: baseShape.tag || "" }}
      />
    );
  }

  // 3. 在线图标：优先读取缓存或已下发的 body
  const [data, setData] = useState<IconData | undefined>(() => {
    const cached = getCachedIcon(item.id);
    if (cached) return cached;
    if (item.body) {
      return { body: item.body, viewBox: item.viewBox || "0 0 24 24" };
    }
    return undefined;
  });

  useEffect(() => {
    const cached = getCachedIcon(item.id);
    if (cached) {
      setData(cached);
      return;
    }

    // 订阅全局缓存变更
    const unsubscribe = subscribeIconCache((updatedId, updatedData) => {
      if (updatedId === item.id) {
        setData(updatedData);
      }
    });

    // 触发批量请求补充加载
    batchFetchIconData([item.id]).catch(() => {});

    return unsubscribe;
  }, [item.id]);

  // 已加载矢量：渲染内联 SVG，继承 currentColor
  if (data && data.body) {
    return (
      <svg
        viewBox={data.viewBox || "0 0 24 24"}
        width={size}
        height={size}
        fill="currentColor"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />
    );
  }

  // 未就绪：渲染轻量圆角微光骨架
  return <span className="icon-skeleton" aria-label="正在加载图标" />;
};

export default IconThumb;
