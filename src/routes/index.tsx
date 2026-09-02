import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, List, Moon, Sun } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { MushafPageView } from "@/components/MushafPageView";
import { AyahSheet } from "@/components/AyahSheet";
import { NavDrawer } from "@/components/NavDrawer";
import { TOTAL_PAGES, loadPageBoxes, toArabicNumber, type AyahBox } from "@/lib/mushaf";
import { juzOfPage, surahName, surahOfPage } from "@/lib/quran-data";
import { readLastPage, saveLastPage, useReaderStore } from "@/lib/reader-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "المصحف الشريف — قراءة المصحف بصفحاته الأصلية" },
      {
        name: "description",
        content:
          "تطبيق مصحف عربي بصفحات المصحف المدني الأصلية، مع تظليل الآيات والمرجعيات والتفسير ومشاركة الآية كصورة.",
      },
      { property: "og:title", content: "المصحف الشريف — قراءة المصحف بصفحاته الأصلية" },
      {
        property: "og:description",
        content: "اقرأ المصحف بصفحاته المطبوعة مع تحديد الآيات، التظليل، التفسير والمرجعيات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reader,
});

type Selection = { ayah: AyahBox; page: number };

function Reader() {
  const [page, setPage] = useState(1);
  const [spread, setSpread] = useState(false);
  const [dark, setDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [dx, setDx] = useState(0);
  const dragRef = useRef<{ x: number; y: number; active: boolean; horizontal: boolean } | null>(
    null,
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);

  const onBackgroundClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setImmersive((v) => !v);
  };

  const store = useReaderStore();

  useEffect(() => setPage(readLastPage()), []);
  useEffect(() => saveLastPage(page), [page]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (orientation: landscape)");
    const update = () => setSpread(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const step = spread ? 2 : 1;

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(TOTAL_PAGES, Math.max(1, next));
      setPage(clamped);
      setSelection(null);
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const next = useCallback(() => {
    if (page + step <= TOTAL_PAGES) go(page + step);
  }, [go, page, step]);
  const prev = useCallback(() => {
    if (page > 1) go(page - step);
  }, [go, page, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, active: true, horizontal: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const deltaX = e.clientX - d.x;
    const deltaY = e.clientY - d.y;
    if (!d.horizontal) {
      if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
        d.active = false;
        return;
      }
      if (Math.abs(deltaX) > 12) d.horizontal = true;
      else return;
    }
    setDx(deltaX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    suppressClickRef.current = Boolean(d?.horizontal);
    if (!d?.active || !d.horizontal) {
      setDx(0);
      return;
    }
    const deltaX = e.clientX - d.x;
    const threshold = Math.min(110, window.innerWidth * 0.16);
    setDx(0);
    if (deltaX > threshold) next();
    else if (deltaX < -threshold) prev();
  };

  const rightPage = spread ? (page % 2 === 1 ? page : page - 1) : page;
  const leftPage = rightPage + 1;

  const selectAyah = (ayah: AyahBox, onPage: number) => setSelection({ ayah, page: onPage });

  const openAyah = async (surah: number, ayahNumber: number, targetPage: number) => {
    go(targetPage);
    const boxes = await loadPageBoxes(targetPage).catch(() => null);
    const found = boxes?.ayahs.find((x) => x.s === surah && x.a === ayahNumber);
    if (found) setSelection({ ayah: found, page: targetPage });
  };

  const selKey = selection ? `${selection.ayah.s}:${selection.ayah.a}` : "";
  const highlight = selection ? store.highlights[selKey] : undefined;
  const isBookmarked = selection
    ? store.bookmarks.some((b) => b.surah === selection.ayah.s && b.ayah === selection.ayah.a)
    : false;

  const pageSurahs = useMemo(() => surahOfPage(rightPage), [rightPage]);

  const renderPage = (p: number) =>
    p >= 1 && p <= TOTAL_PAGES ? (
      <MushafPageView
        key={p}
        page={p}
        highlights={store.highlights}
        selected={selection ? { surah: selection.ayah.s, ayah: selection.ayah.a } : null}
        onSelectAyah={selectAyah}
        onEmptyTap={() => setImmersive((v) => !v)}
      />
    ) : (
      <div key={`empty-${p}`} />
    );

  const spreadFor = (base: number) => {
    const right = base % 2 === 1 ? base : base - 1;
    return (
      <div
        className="flex w-full items-center justify-center gap-3 lg:gap-5"
        onClick={onBackgroundClick}
      >
        <div className="w-1/2 max-w-[min(48%,47vh)]" onClick={onBackgroundClick}>
          {renderPage(right + 1)}
        </div>
        <div className="w-1/2 max-w-[min(48%,47vh)]" onClick={onBackgroundClick}>
          {renderPage(right)}
        </div>
      </div>
    );
  };

  const slideContent = (base: number) =>
    spread ? (
      spreadFor(base)
    ) : (
      <div
        className="mx-auto w-full max-w-[min(100%,52vh)] sm:max-w-[min(620px,56vh)]"
        onClick={onBackgroundClick}
      >
        {renderPage(base)}
      </div>
    );


  return (
    <div dir="rtl" className="flex h-[100svh] flex-col bg-background">
      {!immersive && (
      <header className="z-20 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/90 px-3 py-2 backdrop-blur">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="الفهرس"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-secondary-foreground"
        >
          <List className="size-5" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate font-naskh text-lg font-bold text-foreground">
            {pageSurahs[0] ? surahName(pageSurahs[0].id) : "المصحف الشريف"}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            الجزء {toArabicNumber(juzOfPage(rightPage))} • صفحة {toArabicNumber(rightPage)}
            {spread && leftPage <= TOTAL_PAGES ? ` - ${toArabicNumber(leftPage)}` : ""}
          </p>
        </div>
        <button
          onClick={() => setDark((v) => !v)}
          aria-label="تغيير المظهر"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-secondary-foreground"
        >
          {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>
      )}

      <main
        ref={scrollerRef}
        dir="ltr"
        className="no-tap-highlight relative flex-1 overflow-x-hidden overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onBackgroundClick}
      >
        <div
          className="flex min-h-full items-center justify-center px-2 py-3"
          onClick={onBackgroundClick}
          style={{
            transform: `translateX(${dx}px)`,
            opacity: Math.max(0.35, 1 - Math.abs(dx) / (window.innerWidth || 1) / 0.55),
            transition: "none",
          }}
        >
          {slideContent(page)}
        </div>
      </main>


      {!immersive && (
      <footer className="z-20 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-card/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          onClick={prev}
          disabled={page <= 1}
          aria-label="الصفحة السابقة"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
        <input
          type="range"
          min={1}
          max={TOTAL_PAGES}
          value={page}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="التنقل بين الصفحات"
          className="min-w-0 accent-primary"
        />
        <button
          onClick={next}
          disabled={page >= TOTAL_PAGES}
          aria-label="الصفحة التالية"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
      </footer>
      )}

      {selection && (
        <AyahSheet
          selection={selection}
          highlight={highlight}
          isBookmarked={isBookmarked}
          onClose={() => setSelection(null)}
          onHighlight={(colorId) =>
            store.setHighlight({
              surah: selection.ayah.s,
              surahName: surahName(selection.ayah.s),
              ayah: selection.ayah.a,
              page: selection.page,
              color: colorId,
              rects: selection.ayah.r,
              createdAt: Date.now(),
            })
          }
          onRemoveHighlight={() => store.removeHighlight(selection.ayah.s, selection.ayah.a)}
          onToggleBookmark={() =>
            store.toggleBookmark({
              surah: selection.ayah.s,
              surahName: surahName(selection.ayah.s),
              ayah: selection.ayah.a,
              page: selection.page,
              color: highlight?.color,
              createdAt: Date.now(),
            })
          }
        />
      )}

      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bookmarks={store.bookmarks}
        highlights={store.highlights}
        onGoToPage={go}
        onOpenAyah={openAyah}
        onRemoveBookmark={store.removeBookmark}
      />
      <Toaster position="top-center" />
    </div>
  );
}
