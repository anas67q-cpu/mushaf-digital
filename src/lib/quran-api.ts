const API = "https://api.quran.com/api/v4";

export type AyahInfo = {
  key: string;
  text: string;
  juz: number;
  hizb: number;
  page: number;
  sajdah: boolean | string | null;
};

export async function fetchAyah(surah: number, ayah: number): Promise<AyahInfo | null> {
  const res = await fetch(
    `${API}/verses/by_key/${surah}:${ayah}?fields=text_uthmani&words=false`,
  ).catch(() => null);
  if (!res || !res.ok) return null;
  const data = (await res.json()) as {
    verse?: {
      verse_key: string;
      text_uthmani: string;
      juz_number: number;
      hizb_number: number;
      page_number: number;
      sajdah_number: number | null;
    };
  };
  const v = data.verse;
  if (!v) return null;
  return {
    key: v.verse_key,
    text: v.text_uthmani,
    juz: v.juz_number,
    hizb: v.hizb_number,
    page: v.page_number,
    sajdah: v.sajdah_number !== null,
  };
}

export const TAFSIRS = [
  { id: 16, name: "التفسير الميسر" },
  { id: 91, name: "تفسير السعدي" },
  { id: 14, name: "تفسير ابن كثير" },
  { id: 15, name: "تفسير الطبري" },
  { id: 93, name: "تفسير البغوي" },
] as const;

export async function fetchTafsir(
  tafsirId: number,
  surah: number,
  ayah: number,
): Promise<string | null> {
  const res = await fetch(`${API}/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`).catch(() => null);
  if (!res || !res.ok) return null;
  const data = (await res.json()) as { tafsir?: { text: string } };
  return data.tafsir?.text ?? null;
}

export const stripHtml = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
