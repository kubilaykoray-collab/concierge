import type { Kavram } from "./tipler";

const HARFLER: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

// "TURİZM", "turizm", "cari acik" hepsi aynı yazıma iner; öğrenci Türkçe harf yazmasa da bulur.
export function duzle(metin: string): string {
  return metin.toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, (h) => HARFLER[h]).replace(/\s+/g, " ").trim();
}

export function ara<T extends Kavram>(kavramlar: T[], sorgu: string): T[] {
  const s = duzle(sorgu);
  if (s === "") return kavramlar;
  const puan = (k: Kavram) => {
    const terim = duzle(k.terim);
    if (terim.startsWith(s)) return 0;
    if (terim.includes(s)) return 1;
    if (duzle(k.ingilizce).includes(s)) return 2;
    if (duzle(k.tanim).includes(s)) return 3;
    return -1;
  };
  return kavramlar
    .map((k) => ({ k, p: puan(k) }))
    .filter((x) => x.p >= 0)
    .sort((a, b) => a.p - b.p || a.k.terim.localeCompare(b.k.terim, "tr"))
    .map((x) => x.k);
}
