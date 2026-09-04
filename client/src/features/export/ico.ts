/* QM icon 复刻提醒：纯前端 Windows ICO 格式编码器，支持多分辨率 PNG 流打包合一。 */

export interface IcoImageSource {
  width: number;
  height: number;
  data: Uint8Array | ArrayBuffer;
}

/**
 * 将一个或多个尺寸的 PNG 图像数据编码为标准 Microsoft Windows ICO 二进制 Blob
 */
export function encodeIco(images: IcoImageSource[]): Blob {
  if (!images || images.length === 0) {
    throw new Error("encodeIco: images array must not be empty");
  }

  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + count * entrySize;

  // 计算各个图像的数据大小与偏移量
  const normalizedImages = images.map(img => {
    const rawData =
      img.data instanceof Uint8Array ? img.data : new Uint8Array(img.data);
    return {
      width: img.width,
      height: img.height,
      data: rawData,
      size: rawData.byteLength,
    };
  });

  const totalImageBytes = normalizedImages.reduce(
    (sum, img) => sum + img.size,
    0
  );
  const totalBufferSize = dirSize + totalImageBytes;

  const buffer = new ArrayBuffer(totalBufferSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 1. ICONDIR Header (6 字节)
  view.setUint16(0, 0, true); // idReserved = 0
  view.setUint16(2, 1, true); // idType = 1 (ICO)
  view.setUint16(4, count, true); // idCount = images count

  // 2. ICONDIRENTRY Entries (每个 16 字节)
  let currentOffset = dirSize;

  for (let i = 0; i < count; i++) {
    const img = normalizedImages[i];
    const entryOffset = headerSize + i * entrySize;

    // 宽度与高度：256px 需写入 0
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;

    view.setUint8(entryOffset + 0, w); // bWidth
    view.setUint8(entryOffset + 1, h); // bHeight
    view.setUint8(entryOffset + 2, 0); // bColorCount
    view.setUint8(entryOffset + 3, 0); // bReserved
    view.setUint16(entryOffset + 4, 1, true); // wPlanes = 1
    view.setUint16(entryOffset + 6, 32, true); // wBitCount = 32
    view.setUint32(entryOffset + 8, img.size, true); // dwBytesInRes
    view.setUint32(entryOffset + 12, currentOffset, true); // dwImageOffset

    // 3. 复制 PNG 数据到对应偏移位置
    bytes.set(img.data, currentOffset);
    currentOffset += img.size;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

/**
 * 将 Blob 转换为 Uint8Array
 */
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
