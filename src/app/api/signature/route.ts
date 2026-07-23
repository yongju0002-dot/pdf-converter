import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const sensitivity = Math.min(
    100,
    Math.max(0, Number(formData.get("sensitivity")) || 50),
  );

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "서명 사진을 선택해주세요." },
      { status: 400 },
    );
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let width: number;
  let height: number;
  let data: Buffer;
  try {
    const { data: rawData, info } = await sharp(inputBuffer)
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    data = Buffer.from(rawData);
    width = info.width;
    height = info.height;
  } catch {
    return NextResponse.json(
      { error: "이미지를 읽을 수 없습니다. 올바른 이미지 파일인지 확인해주세요." },
      { status: 400 },
    );
  }

  // Higher sensitivity -> lower luminance threshold -> more of the light
  // background is treated as transparent.
  const threshold = 255 - Math.round((sensitivity / 100) * 200);
  const feather = 35;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha: number;
    if (luminance <= threshold - feather) {
      alpha = 255;
    } else if (luminance >= threshold + feather) {
      alpha = 0;
    } else {
      alpha = 255 * (1 - (luminance - (threshold - feather)) / (2 * feather));
    }
    data[idx + 3] = Math.round(alpha);
  }

  const outputBuffer = await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return new NextResponse(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${baseName}-signature.png"`,
    },
  });
}
