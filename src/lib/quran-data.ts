import surahsJson from "@/data/surahs.json";

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

/** Standard Madani mushaf juz start pages. */
export const JUZ_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402,
  422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export const surahById = (id: number) => SURAHS.find((s) => s.id === id);

export const surahName = (id: number) => `سورة ${surahById(id)?.name ?? ""}`.trim();

export const juzOfPage = (page: number) => {
  let juz = 1;
  JUZ_PAGES.forEach((p, i) => {
    if (page >= p) juz = i + 1;
  });
  return juz;
};

export const surahOfPage = (page: number) =>
  SURAHS.filter((s) => s.pages[0] <= page && s.pages[1] >= page);
