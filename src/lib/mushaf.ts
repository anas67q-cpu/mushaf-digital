export const PAGE_W = 1024;
export const PAGE_H = 1656;
export const TOTAL_PAGES = 604;

const IMG_BASE = "https://files.quran.app/hafs/madani";

const pad = (p: number) => String(p).padStart(3, "0");

export const pageImage = (page: number, width: 1024 | 1260 | 1920 = 1260) =>
  `${IMG_BASE}/width_${width}/page${pad(page)}.png`;

export const pageSrcSet = (page: number) =>
  [1024, 1260, 1920]
    .map((w) => `${IMG_BASE}/width_${w}/page${pad(page)}.png ${w}w`)
    .join(", ");

/** [x, y, width, height, lineNumber] in 1024x1656 image space */
export type Rect = [number, number, number, number, number];

export type AyahBox = { s: number; a: number; r: Rect[] };
export type PageBoxes = { page: number; w: number; h: number; ayahs: AyahBox[] };

const cache = new Map<number, Promise<PageBoxes>>();

export function loadPageBoxes(page: number): Promise<PageBoxes> {
  let p = cache.get(page);
  if (!p) {
    p = fetch(`/mushaf/bbox/${page}.json`).then((r) => r.json() as Promise<PageBoxes>);
    cache.set(page, p);
  }
  return p;
}

/** Find the ayah at a point given in image space (1024x1656). */
export function hitTest(boxes: PageBoxes, x: number, y: number): AyahBox | null {
  for (const ayah of boxes.ayahs) {
    for (const [rx, ry, rw, rh] of ayah.r) {
      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return ayah;
    }
  }
  // Fallback: closest rect on the same line band (tap between glyphs / margins)
  let best: AyahBox | null = null;
  let bestDist = Infinity;
  for (const ayah of boxes.ayahs) {
    for (const [rx, ry, rw, rh] of ayah.r) {
      const dx = x < rx ? rx - x : x > rx + rw ? x - (rx + rw) : 0;
      const dy = y < ry ? ry - y : y > ry + rh ? y - (ry + rh) : 0;
      const d = dy * 4 + dx; // strongly prefer the tapped line
      if (d < bestDist) {
        bestDist = d;
        best = ayah;
      }
    }
  }
  return bestDist <= 90 ? best : null;
}

export const verseKey = (s: number, a: number) => `${s}:${a}`;

export const toArabicNumber = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]!);

export const HIGHLIGHT_COLORS = [
  { id: "gold", label: "ذهبي", value: "oklch(0.88 0.11 88 / 0.55)" },
  { id: "green", label: "أخضر", value: "oklch(0.87 0.12 150 / 0.5)" },
  { id: "blue", label: "أزرق", value: "oklch(0.85 0.09 235 / 0.5)" },
  { id: "rose", label: "وردي", value: "oklch(0.85 0.09 15 / 0.5)" },
  { id: "violet", label: "بنفسجي", value: "oklch(0.83 0.09 300 / 0.5)" },
] as const;

export type HighlightColorId = (typeof HIGHLIGHT_COLORS)[number]["id"];

export const colorValue = (id: string) =>
  HIGHLIGHT_COLORS.find((c) => c.id === id)?.value ?? HIGHLIGHT_COLORS[0].value;
