/**
 * pdf-lib's embedJpg reads the input via `new DataView(bytes.buffer)`, which
 * ignores byteOffset and always reads from byte 0 of the *underlying*
 * ArrayBuffer. Small buffers (roughly under 4KB) allocated via `Buffer.from`
 * or `Buffer.alloc` can come from Node's shared internal buffer pool and
 * have a nonzero byteOffset, which makes pdf-lib read garbage instead of the
 * real SOI marker (0xffd8) and throw "SOI not found in JPEG". This is a
 * pdf-lib bug, not something wrong with the JPEG itself - confirmed by
 * inspecting node_modules/pdf-lib/src/core/embedders/JpegEmbedder.ts
 * directly and reproducing the failure/fix in isolation.
 *
 * `Buffer.allocUnsafeSlow` is never pooled, so copying into one guarantees
 * byteOffset 0 regardless of buffer size or platform.
 */
export function toEmbedJpgSafeBuffer(data: Buffer): Buffer {
  const safe = Buffer.allocUnsafeSlow(data.length);
  data.copy(safe);
  return safe;
}
