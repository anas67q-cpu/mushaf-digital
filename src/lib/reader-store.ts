import { useCallback, useEffect, useState } from "react";
import type { Rect } from "./mushaf";

export type Highlight = {
  surah: number;
  surahName: string;
  ayah: number;
  page: number;
  color: string;
  rects: Rect[];
  createdAt: number;
};

export type Bookmark = {
  surah: number;
  surahName: string;
  ayah: number;
  page: number;
  color?: string | undefined;
  createdAt: number;
};

const HL_KEY = "mushaf.highlights.v1";
const BM_KEY = "mushaf.bookmarks.v1";
const PAGE_KEY = "mushaf.lastPage.v1";

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event("mushaf-store"));
};

export const readLastPage = () => {
  const p = Number(read<string>(PAGE_KEY, "1"));
  return Number.isFinite(p) && p >= 1 && p <= 604 ? p : 1;
};

export const saveLastPage = (page: number) => {
  try {
    window.localStorage.setItem(PAGE_KEY, JSON.stringify(String(page)));
  } catch {
    /* ignore */
  }
};

export function useReaderStore() {
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const sync = useCallback(() => {
    setHighlights(read<Record<string, Highlight>>(HL_KEY, {}));
    setBookmarks(read<Bookmark[]>(BM_KEY, []));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("mushaf-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mushaf-store", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const setHighlight = useCallback((h: Highlight) => {
    const all = read<Record<string, Highlight>>(HL_KEY, {});
    all[`${h.surah}:${h.ayah}`] = h;
    write(HL_KEY, all);
  }, []);

  const removeHighlight = useCallback((surah: number, ayah: number) => {
    const all = read<Record<string, Highlight>>(HL_KEY, {});
    delete all[`${surah}:${ayah}`];
    write(HL_KEY, all);
  }, []);

  const toggleBookmark = useCallback((b: Bookmark) => {
    const all = read<Bookmark[]>(BM_KEY, []);
    const idx = all.findIndex((x) => x.surah === b.surah && x.ayah === b.ayah);
    if (idx >= 0) all.splice(idx, 1);
    else all.unshift(b);
    write(BM_KEY, all);
    return idx < 0;
  }, []);

  const removeBookmark = useCallback((surah: number, ayah: number) => {
    const all = read<Bookmark[]>(BM_KEY, []).filter((x) => !(x.surah === surah && x.ayah === ayah));
    write(BM_KEY, all);
  }, []);

  return { highlights, bookmarks, setHighlight, removeHighlight, toggleBookmark, removeBookmark };
}
