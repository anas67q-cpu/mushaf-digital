import surahsJson from "@/data/surahs.json";
import juzsJson from "@/data/juzs.json";

export type Surah = {
  id: number;
  name: string;
  nameSimple: string;
  verses: number;
  pages: [number, number];
  place: string;
  bismillah: boolean;
};

export const SURAHS = surahsJson as unknown as Surah[];

export const JUZS = juzsJson as unknown as { id: number; first: [string, string] }[];

export const surahName = (id: number) =>
  `سورة ${SURAHS.find((s) => s.id === id)?.name ?? ""}`.trim();

export const surahById = (id: number) => SURAHS.find((s) => s.id === id);

export const juzStartPage = (juz: number) => {
  const j = JUZS.find((x) => x.id === juz);
  if (!j) return 1;
  const surah = surahById(Number(j.first[0]));
  return surah ? surah.pages[0] : 1;
};

/** Approximate juz for a page (juz n spans 20 pages starting at page 2). */
export const juzOfPage = (page: number) =>
  page <= 1 ? 1 : Math.min(30, Math.floor((page - 2) / 20) + 1);
