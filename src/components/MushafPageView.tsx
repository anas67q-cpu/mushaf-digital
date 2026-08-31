import { useEffect, useRef, useState } from "react";
import {
  PAGE_H,
  PAGE_W,
  colorValue,
  hitTest,
  loadPageBoxes,
  pageImage,
  pageSrcSet,
  toArabicNumber,
  type AyahBox,
  type PageBoxes,
} from "@/lib/mushaf";
import type { Highlight } from "@/lib/reader-store";

type Props = {
  page: number;
  highlights: Record<string, Highlight>;
  selected: { surah: number; ayah: number } | null;
  onSelectAyah: (ayah: AyahBox, page: number) => void;
};

export function MushafPageView({ page, highlights, selected, onSelectAyah }: Props) {
  const [boxes, setBoxes] = useState<PageBoxes | null>(null);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadPageBoxes(page)
      .then((b) => alive && setBoxes(b))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [page]);

  const handleTap = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el || !boxes) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * PAGE_W;
    const y = ((clientY - rect.top) / rect.height) * PAGE_H;
    const hit = hitTest(boxes, x, y);
    if (hit) onSelectAyah(hit, page);
  };

  const overlays = boxes
    ? boxes.ayahs.flatMap((ayah) => {
        const key = `${ayah.s}:${ayah.a}`;
        const hl = highlights[key];
        const isSelected = selected?.surah === ayah.s && selected?.ayah === ayah.a;
        if (!hl && !isSelected) return [];
        const bg = hl ? colorValue(hl.color) : "var(--gold-soft)";
        return ayah.r.map((r, i) => (
          <span
            key={`${key}-${i}`}
            aria-hidden
            className="pointer-events-none absolute rounded-[4px] transition-opacity"
            style={{
              right: `${((PAGE_W - (r[0] + r[2])) / PAGE_W) * 100}%`,
              top: `${(r[1] / PAGE_H) * 100}%`,
              width: `${(r[2] / PAGE_W) * 100}%`,
              height: `${(r[3] / PAGE_H) * 100}%`,
              backgroundColor: bg,
              opacity: isSelected && !hl ? 0.75 : 1,
              mixBlendMode: "multiply",
              outline: isSelected ? "1.5px solid var(--gold)" : undefined,
            }}
          />
        ));
      })
    : [];

  return (
    <div
      ref={frameRef}
      dir="rtl"
      className="page-frame no-tap-highlight relative mx-auto w-full overflow-hidden rounded-xl ring-1 ring-border"
      style={{ aspectRatio: `${PAGE_W} / ${PAGE_H}` }}
      onClick={(e) => handleTap(e.clientX, e.clientY)}
      role="presentation"
    >
      {overlays}
      <img
        src={pageImage(page)}
        srcSet={pageSrcSet(page)}
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 60vw, 45vw"
        alt={`صفحة المصحف رقم ${page}`}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className="mushaf-img pointer-events-none relative h-full w-full select-none object-contain"
      />
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-parchment">
          <span className="font-naskh text-2xl text-gold">﷽</span>
        </div>
      )}
      <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-border bg-parchment/80 px-3 text-[11px] text-muted-foreground">
        {toArabicNumber(page)}
      </span>
    </div>
  );
}
