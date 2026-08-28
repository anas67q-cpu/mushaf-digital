import { toArabicNumber } from "./mushaf";

type ShareOptions = {
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  tafsir?: string | null;
};

const W = 1080;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildAyahImage({
  surahName,
  ayahNumber,
  ayahText,
  tafsir,
}: ShareOptions): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  try {
    await Promise.all([
      document.fonts.load('700 64px "Amiri"'),
      document.fonts.load('400 34px "Tajawal"'),
    ]);
  } catch {
    /* fonts optional */
  }

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;

  const pad = 88;
  const maxW = W - pad * 2;

  measure.font = '700 56px "Amiri", serif';
  measure.direction = "rtl";
  const ayahLines = wrap(measure, ayahText, maxW);

  measure.font = '400 32px "Tajawal", sans-serif';
  const tafsirLines = tafsir ? wrap(measure, tafsir, maxW).slice(0, 16) : [];

  const height =
    260 + ayahLines.length * 92 + (tafsirLines.length ? 120 + tafsirLines.length * 52 : 0) + 180;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, W, height);
  grad.addColorStop(0, "#fdf8ec");
  grad.addColorStop(1, "#f5ead3");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, height);

  ctx.strokeStyle = "#b08a4e";
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, W - 68, height - 68);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 50, W - 100, height - 100);

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  ctx.fillStyle = "#8a6a33";
  ctx.font = '400 40px "Tajawal", sans-serif';
  ctx.fillText(`${surahName} — الآية ${toArabicNumber(ayahNumber)}`, W / 2, 150);

  ctx.fillStyle = "#3a2f22";
  ctx.font = '700 56px "Amiri", serif';
  let y = 260;
  for (const line of ayahLines) {
    ctx.fillText(line, W / 2, y);
    y += 92;
  }

  if (tafsirLines.length) {
    y += 26;
    ctx.strokeStyle = "#c9a969";
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
    y += 70;
    ctx.fillStyle = "#5b4a34";
    ctx.font = '400 32px "Tajawal", sans-serif';
    for (const line of tafsirLines) {
      ctx.fillText(line, W / 2, y);
      y += 52;
    }
  }

  ctx.fillStyle = "#a58445";
  ctx.font = '400 28px "Tajawal", sans-serif';
  ctx.fillText("مصحف — قراءة وتدبر", W / 2, height - 80);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
