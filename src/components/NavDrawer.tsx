import { useMemo, useState } from "react";
import { BookOpen, Bookmark as BookmarkIcon, Hash, Search, Trash2, X } from "lucide-react";
import { toArabicNumber } from "@/lib/mushaf";
import { JUZ_PAGES, SURAHS } from "@/lib/quran-data";
import type { Bookmark, Highlight } from "@/lib/reader-store";

type Tab = "surahs" | "juz" | "bookmarks";

type Props = {
  open: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  highlights: Record<string, Highlight>;
  onGoToPage: (page: number) => void;
  onOpenAyah: (surah: number, ayah: number, page: number) => void;
  onRemoveBookmark: (surah: number, ayah: number) => void;
};

export function NavDrawer({
  open,
  onClose,
  bookmarks,
  highlights,
  onGoToPage,
  onOpenAyah,
  onRemoveBookmark,
}: Props) {
  const [tab, setTab] = useState<Tab>("surahs");
  const [query, setQuery] = useState("");
  const [pageInput, setPageInput] = useState("");

  const surahs = useMemo(
    () =>
      SURAHS.filter(
        (s) =>
          !query.trim() ||
          s.name.includes(query.trim()) ||
          s.nameSimple.toLowerCase().includes(query.trim().toLowerCase()) ||
          String(s.id) === query.trim(),
      ),
    [query],
  );

  const highlightList = useMemo(
    () => Object.values(highlights).sort((a, b) => b.createdAt - a.createdAt),
    [highlights],
  );

  if (!open) return null;

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "surahs", label: "السور", icon: BookOpen },
    { id: "juz", label: "الأجزاء", icon: Hash },
    { id: "bookmarks", label: "المرجعيات", icon: BookmarkIcon },
  ];

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex">
      <button aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-ink/25" />
      <aside className="ui-sheet relative ml-auto flex h-full w-[88vw] max-w-sm flex-col border-l border-border bg-card">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
          <h2 className="truncate font-naskh text-xl font-bold">الفهرس</h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary"
          >
            <X className="size-4" />
          </button>
        </header>

        <nav className="flex gap-1 border-b border-border p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm transition-colors ${
                tab === t.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="size-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pageInput) {
                onGoToPage(Math.min(604, Math.max(1, Number(pageInput))));
                onClose();
              }
            }}
            inputMode="numeric"
            placeholder="انتقال إلى صفحة (١ - ٦٠٤)"
            className="min-w-0 flex-1 rounded-xl border border-input bg-parchment px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => {
              if (pageInput) {
                onGoToPage(Math.min(604, Math.max(1, Number(pageInput))));
                onClose();
              }
            }}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            انتقال
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {tab === "surahs" && (
            <>
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-input bg-parchment px-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن سورة"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <ul className="space-y-1">
                {surahs.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        onGoToPage(s.pages[0]);
                        onClose();
                      }}
                      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-right hover:bg-secondary"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-gold-soft text-xs text-primary">
                        {toArabicNumber(s.id)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-naskh text-lg">سورة {s.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.place} • {toArabicNumber(s.verses)} آية
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ص {toArabicNumber(s.pages[0])}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "juz" && (
            <ul className="grid grid-cols-2 gap-2">
              {JUZ_PAGES.map((p, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      onGoToPage(p);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-border bg-parchment px-3 py-3 text-center hover:bg-secondary"
                  >
                    <span className="block font-naskh text-lg">الجزء {toArabicNumber(i + 1)}</span>
                    <span className="block text-xs text-muted-foreground">
                      صفحة {toArabicNumber(p)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === "bookmarks" && (
            <div className="space-y-4">
              <section>
                <h3 className="px-1 pb-2 text-sm font-medium text-muted-foreground">المرجعيات</h3>
                {bookmarks.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">لم تُضف أي مرجعية بعد.</p>
                ) : (
                  <ul className="space-y-1">
                    {bookmarks.map((b) => (
                      <li
                        key={`${b.surah}:${b.ayah}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border bg-parchment px-3 py-2"
                      >
                        <button
                          onClick={() => {
                            onOpenAyah(b.surah, b.ayah, b.page);
                            onClose();
                          }}
                          className="min-w-0 text-right"
                        >
                          <span className="block truncate font-naskh text-lg">{b.surahName}</span>
                          <span className="block text-xs text-muted-foreground">
                            الآية {toArabicNumber(b.ayah)} • صفحة {toArabicNumber(b.page)}
                          </span>
                        </button>
                        <button
                          onClick={() => onRemoveBookmark(b.surah, b.ayah)}
                          aria-label="حذف المرجعية"
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="px-1 pb-2 text-sm font-medium text-muted-foreground">
                  الآيات المظللة
                </h3>
                {highlightList.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">لا توجد آيات مظللة.</p>
                ) : (
                  <ul className="space-y-1">
                    {highlightList.map((h) => (
                      <li key={`${h.surah}:${h.ayah}`}>
                        <button
                          onClick={() => {
                            onOpenAyah(h.surah, h.ayah, h.page);
                            onClose();
                          }}
                          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 py-2 text-right hover:bg-secondary"
                        >
                          <span
                            className="size-4 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: `var(--gold-soft)` }}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-naskh text-lg">{h.surahName}</span>
                            <span className="block text-xs text-muted-foreground">
                              الآية {toArabicNumber(h.ayah)} • صفحة {toArabicNumber(h.page)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
