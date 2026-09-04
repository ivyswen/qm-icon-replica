import { describe, expect, it } from "vitest";
import { encodeIco } from "./ico";

describe("encodeIco - ICO 格式二进制编码器", () => {
  it("单图像编码应生成合法的 6 字节 ICONDIR + 16 字节 ICONDIRENTRY + PNG 负载", async () => {
    const fakePng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02,
    ]);
    const blob = encodeIco([
      {
        width: 32,
        height: 32,
        data: fakePng,
      },
    ]);

    expect(blob.type).toBe("image/x-icon");
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // ICONDIR Header
    expect(view.getUint16(0, true)).toBe(0); // idReserved
    expect(view.getUint16(2, true)).toBe(1); // idType = 1 (ICO)
    expect(view.getUint16(4, true)).toBe(1); // idCount = 1

    // Entry 0
    expect(view.getUint8(6)).toBe(32); // width
    expect(view.getUint8(7)).toBe(32); // height
    expect(view.getUint8(8)).toBe(0); // color count
    expect(view.getUint8(9)).toBe(0); // reserved
    expect(view.getUint16(10, true)).toBe(1); // planes
    expect(view.getUint16(12, true)).toBe(32); // bit count
    expect(view.getUint32(14, true)).toBe(fakePng.length); // bytes in res
    expect(view.getUint32(18, true)).toBe(22); // offset: 6 + 16 = 22

    // Payload
    expect(Array.from(bytes.slice(22))).toEqual(Array.from(fakePng));
  });

  it("多图像（包含 256px 需写入 0）编码应正确计算各条目偏移量与尺寸", async () => {
    const png16 = new Uint8Array([1, 2, 3, 4]);
    const png32 = new Uint8Array([5, 6, 7, 8, 9]);
    const png256 = new Uint8Array([10, 11, 12]);

    const blob = encodeIco([
      { width: 16, height: 16, data: png16 },
      { width: 32, height: 32, data: png32 },
      { width: 256, height: 256, data: png256 },
    ]);

    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // 图像数量 = 3
    expect(view.getUint16(4, true)).toBe(3);

    // 目录头大小 = 6 + 3 * 16 = 54
    const headerAndEntriesSize = 6 + 3 * 16;

    // Entry 0 (16px)
    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(7)).toBe(16);
    expect(view.getUint32(14, true)).toBe(4);
    expect(view.getUint32(18, true)).toBe(headerAndEntriesSize);

    // Entry 1 (32px)
    const entry1Offset = 6 + 16;
    expect(view.getUint8(entry1Offset)).toBe(32);
    expect(view.getUint8(entry1Offset + 1)).toBe(32);
    expect(view.getUint32(entry1Offset + 8, true)).toBe(5);
    expect(view.getUint32(entry1Offset + 12, true)).toBe(
      headerAndEntriesSize + 4
    );

    // Entry 2 (256px 应为 0)
    const entry2Offset = 6 + 32;
    expect(view.getUint8(entry2Offset)).toBe(0);
    expect(view.getUint8(entry2Offset + 1)).toBe(0);
    expect(view.getUint32(entry2Offset + 8, true)).toBe(3);
    expect(view.getUint32(entry2Offset + 12, true)).toBe(
      headerAndEntriesSize + 4 + 5
    );

    // 验证负载
    expect(
      Array.from(bytes.slice(headerAndEntriesSize, headerAndEntriesSize + 4))
    ).toEqual([1, 2, 3, 4]);
    expect(
      Array.from(
        bytes.slice(headerAndEntriesSize + 4, headerAndEntriesSize + 9)
      )
    ).toEqual([5, 6, 7, 8, 9]);
    expect(Array.from(bytes.slice(headerAndEntriesSize + 9))).toEqual([
      10, 11, 12,
    ]);
  });

  it("当传入空数组时抛出错误", () => {
    expect(() => encodeIco([])).toThrowError();
  });
});
