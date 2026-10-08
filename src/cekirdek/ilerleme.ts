import { cevapla, gunEkle, yeniKart, type KartDurumu } from "./leitner";

// Öğrencinin bütün ilerlemesi. Yalnız telefonda durur; hiçbir yere gönderilmez.
export interface Ilerleme {
  surum: 1;
  kartlar: Record<string, KartDurumu>;
  dersler: Record<string, true>;
  testler: Record<string, { enIyi: number; deneme: number }>;
  oyunlar: Record<string, number>; // en iyi süre (ms)
  puan: number;
  gunler: string[]; // çalışılan günler
  tema: "oto" | "acik" | "koyu";
}

export const BOS: Ilerleme = { surum: 1, kartlar: {}, dersler: {}, testler: {}, oyunlar: {}, puan: 0, gunler: [], tema: "oto" };

export const PUAN = { yeniKart: 10, tekrarDogru: 3, oyun: 15 };
export const GECME_NOTU = 70;

const gunIsle = (gunler: string[], gun: string) => (gunler.includes(gun) ? gunler : [...gunler, gun].sort());

export function dersBitti(d: Ilerleme, dersAnahtari: string, kartIdleri: string[], gun: string): Ilerleme {
  const kartlar = { ...d.kartlar };
  let yeni = 0;
  for (const id of kartIdleri) {
    if (!kartlar[id]) {
      kartlar[id] = yeniKart(gun);
      yeni++;
    }
  }
  return { ...d, kartlar, dersler: { ...d.dersler, [dersAnahtari]: true }, puan: d.puan + yeni * PUAN.yeniKart, gunler: gunIsle(d.gunler, gun) };
}

// vadeli=false serbest tekrardır: puan verir ama kutuyu ve tarihi değiştirmez, yoksa aralıklı tekrar bozulur.
export function tekrarCevabi(d: Ilerleme, id: string, bildi: boolean, gun: string, vadeli = true): Ilerleme {
  const kart = d.kartlar[id];
  if (!kart) return d;
  const kartlar = vadeli || !bildi ? { ...d.kartlar, [id]: cevapla(kart, bildi, gun) } : d.kartlar;
  return { ...d, kartlar, puan: d.puan + (bildi ? PUAN.tekrarDogru : 0), gunler: gunIsle(d.gunler, gun) };
}

export function testBitti(d: Ilerleme, uniteAnahtari: string, sonuc: number, gun: string): Ilerleme {
  const onceki = d.testler[uniteAnahtari] ?? { enIyi: 0, deneme: 0 };
  const enIyi = Math.max(onceki.enIyi, sonuc);
  // Puan yalnız en iyi sonucu geçen kısım için verilir; aynı testi tekrar çözmek puan basmaz.
  return {
    ...d,
    testler: { ...d.testler, [uniteAnahtari]: { enIyi, deneme: onceki.deneme + 1 } },
    puan: d.puan + (enIyi - onceki.enIyi),
    gunler: gunIsle(d.gunler, gun),
  };
}

export function oyunBitti(d: Ilerleme, uniteAnahtari: string, sureMs: number, gun: string): Ilerleme {
  const onceki = d.oyunlar[uniteAnahtari];
  const rekor = onceki === undefined || sureMs < onceki;
  return {
    ...d,
    oyunlar: { ...d.oyunlar, [uniteAnahtari]: rekor ? sureMs : onceki },
    puan: d.puan + (rekor ? PUAN.oyun : 0),
    gunler: gunIsle(d.gunler, gun),
  };
}

// Bugün ya da dün biten kesintisiz gün zinciri. Bugün henüz çalışılmadıysa dünkü seri bozulmuş sayılmaz.
export function seri(gunler: string[], gun: string): number {
  const kume = new Set(gunler);
  let son = kume.has(gun) ? gun : gunEkle(gun, -1);
  let adet = 0;
  while (kume.has(son)) {
    adet++;
    son = gunEkle(son, -1);
  }
  return adet;
}

export const RUTBELER = [
  { ad: "Stajyer", esik: 0, soz: "Her kariyer ilk günle başlar." },
  { ad: "Bellboy", esik: 150, soz: "Konuğu ilk karşılayan sensin." },
  { ad: "Resepsiyonist", esik: 400, soz: "Otelin yüzü, ön büronun sesi." },
  { ad: "Ön Büro Şefi", esik: 800, soz: "Ekibin sana bakarak öğreniyor." },
  { ad: "Departman Müdürü", esik: 1400, soz: "Artık standartları sen belirliyorsun." },
  { ad: "Genel Müdür", esik: 2200, soz: "Otelin anahtarı sende." },
] as const;

export function rutbe(puan: number) {
  let sira = 0;
  RUTBELER.forEach((r, i) => {
    if (puan >= r.esik) sira = i;
  });
  const sonraki = RUTBELER[sira + 1];
  const taban = RUTBELER[sira].esik;
  return {
    sira,
    ad: RUTBELER[sira].ad,
    soz: RUTBELER[sira].soz,
    sonraki: sonraki?.ad ?? null,
    kalan: sonraki ? sonraki.esik - puan : 0,
    oran: sonraki ? (puan - taban) / (sonraki.esik - taban) : 1,
  };
}

export function oku(ham: string | null): Ilerleme {
  if (!ham) return BOS;
  try {
    const veri = JSON.parse(ham);
    if (veri?.surum !== 1 || typeof veri.kartlar !== "object") return BOS;
    return { ...BOS, ...veri };
  } catch {
    return BOS;
  }
}
