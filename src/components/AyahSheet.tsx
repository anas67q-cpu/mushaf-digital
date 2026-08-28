import { useEffect, useState } from "react";
import {
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Highlighter,
  Loader2,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HIGHLIGHT_COLORS, toArabicNumber, type AyahBox } from "@/lib/mushaf";
import { surahById, surahName } from "@/lib/quran-data";
import { TAFSIRS, fetchAyah, fetchTafsir, stripHtml, type AyahInfo } from "@/lib/quran-api";
import { buildAyahImage, shareOrDownload } from "@/lib/share-image";
import type { Bookmark, Highlight } from "@/lib/reader-store";

type Props = {
  selection: { ayah: AyahBox; page: number };
  highlight?: Highlight;
  isBookmarked: boolean;
  onClose: () => void;
  onHighlight: (colorId: string) => void;
  onRemoveHighlight: () => void;
  onToggleBookmark: () => void;
};

export function AyahSheet({
  selection,
  highlight,
  isBookmarked,
  onClose,
  onHighlight,
  onRemoveHighlight,
  onToggleBookmark,
}: Props) {
  const { s: surah, a: ayah } = selection.ayah;
  const [info, setInfo] = useState<AyahInfo | null>(null);
  const [tafsirId, setTafsirId] = useState<number>(TAFSIRS[0].id);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setInfo(null);
    fetchAyah(surah, ayah).then(setInfo);
  }, [surah, ayah]);

  useEffect(() => {
    let alive = true;
    setLoadingTafsir(true);
    setTafsir(null);
    fetchTafsir(tafsirId, surah, ayah).then((t) => {
      if (!alive) return;
      setTafsir(t ? stripHtml(t) : null);
      setLoadingTafsir(false);
    });
    return () => {
      alive = false;
    };
  }, [tafsirId, surah, ayah]);

  const meta = surahById(surah);

  const share = async (withTafsir: boolean) => {
    setSharing(true);
    try {
      const blob = await buildAyahImage({
        surahName: surahName(surah),
        ayahNumber: ayah,
        ayahText: info?.text ?? "",
        tafsir: withTafsir ? tafsir : null,
      });
      if (!blob) throw new Error("failed");
      const result = await shareOrDownload(blob, `ayah-${surah}-${ayah}.png`);
      toast.success(result === "shared" ? "تمت المشاركة" : "تم تنزيل الصورة");
    } catch {
      toast.error("تعذر إنشاء صورة الآية");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
      />
      <section className="ui-sheet relative max-h-[82svh] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:mx-auto sm:mb-6 sm:max-w-2xl sm:rounded-3xl sm:border">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />

        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-naskh text-2xl font-bold text-foreground">
              {surahName(surah)}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              الآية {toArabicNumber(ayah)} • صفحة {toArabicNumber(selection.page)}
              {info ? ` • الجزء ${toArabicNumber(info.juz)}` : ""}
              {meta ? ` • ${meta.place}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary text-secondary-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        {info?.text && (
          <p className="mt-4 rounded-2xl border border-border bg-parchment p-4 text-center font-naskh text-2xl leading-[2.1] text-foreground">
            {info.text}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Highlighter className="size-4" /> تظليل
          </span>
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onHighlight(c.id)}
              aria-label={`تظليل ${c.label}`}
              className="size-8 rounded-full border-2 transition-transform active:scale-95"
              style={{
                backgroundColor: c.value,
                borderColor: highlight?.color === c.id ? "var(--gold)" : "var(--border)",
              }}
            />
          ))}
          {highlight && (
            <button
              onClick={onRemoveHighlight}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
            >
              <Trash2 className="size-3.5" /> إزالة
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onToggleBookmark}
            className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-4 text-gold" />
            ) : (
              <BookmarkIcon className="size-4" />
            )}
            {isBookmarked ? "محفوظة في المرجعيات" : "إضافة مرجعية"}
          </button>
          <button
            disabled={sharing}
            onClick={() => share(false)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {sharing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            مشاركة الآية
          </button>
          <button
            disabled={sharing || !tafsir}
            onClick={() => share(true)}
            className="flex items-center gap-2 rounded-full border border-gold px-4 py-2 text-sm font-medium text-primary disabled:opacity-50"
          >
            <Share2 className="size-4" /> مشاركة مع التفسير
          </button>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {TAFSIRS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTafsirId(t.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  tafsirId === t.id
                    ? "border-gold bg-accent text-accent-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-parchment p-4 text-[15px] leading-8 text-foreground">
            {loadingTafsir ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> جارٍ تحميل التفسير…
              </span>
            ) : tafsir ? (
              tafsir.split("\n").map((p, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {p}
                </p>
              ))
            ) : (
              <span className="text-muted-foreground">لا يوجد تفسير متاح لهذه الآية حاليًا.</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
