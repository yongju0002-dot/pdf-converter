export function parsePageRanges(input: string, pageCount: number): number[] {
  const indices: number[] = [];
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error("페이지 범위를 입력해주세요. 예: 1-3, 5, 8-10");
  }

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end > pageCount || start > end) {
        throw new Error(
          `잘못된 페이지 범위입니다: "${part}" (전체 ${pageCount}페이지)`,
        );
      }
      for (let i = start; i <= end; i++) indices.push(i - 1);
    } else if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > pageCount) {
        throw new Error(
          `잘못된 페이지 번호입니다: "${part}" (전체 ${pageCount}페이지)`,
        );
      }
      indices.push(page - 1);
    } else {
      throw new Error(`페이지 범위 형식이 올바르지 않습니다: "${part}"`);
    }
  }

  return indices;
}
