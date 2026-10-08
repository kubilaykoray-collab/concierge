import type { Kavram, Soru } from "./tipler";

export type Rastgele = () => number;

export function karistir<T>(dizi: readonly T[], rastgele: Rastgele = Math.random): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

export type AlistirmaTuru = "tanim" | "ingilizce" | "ornek";

export interface Alistirma {
  kavramId: string;
  tur: AlistirmaTuru;
  yonerge: string;
  metin: string;
  secenekler: string[];
  dogru: number;
}

const kucuk = (s: string) => s.toLocaleLowerCase("tr");

// Tanımın içinde terim geçiyorsa cevabı ele vermesin diye boşlukla değiştirir.
export function maskele(metin: string, terim: string): string {
  const konum = kucuk(metin).indexOf(kucuk(terim));
  if (konum < 0) return metin;
  return metin.slice(0, konum) + "＿＿＿" + maskele(metin.slice(konum + terim.length), terim);
}

function celdiriciler(kavram: Kavram, havuz: Kavram[], deger: (k: Kavram) => string, rastgele: Rastgele): string[] {
  const dogru = deger(kavram);
  const adaylar = karistir(havuz.filter((k) => k.id !== kavram.id), rastgele);
  // Aynı konudan çeldirici daha inandırıcıdır; yetmezse ünitenin geri kalanından tamamlanır.
  const sirali = [...adaylar.filter((k) => k.konu === kavram.konu), ...adaylar.filter((k) => k.konu !== kavram.konu)];
  const secilen: string[] = [];
  for (const k of sirali) {
    const d = deger(k);
    if (d !== dogru && !secilen.includes(d)) secilen.push(d);
    if (secilen.length === 3) break;
  }
  return secilen;
}

// Kartın kendi içeriğinden alıştırma üretir; yeni bilgi eklemez.
export function alistirmaUret(kavram: Kavram, havuz: Kavram[], rastgele: Rastgele = Math.random, istenen?: AlistirmaTuru): Alistirma {
  const ornekUygun = kavram.ornek !== null && !kucuk(kavram.ornek).includes(kucuk(kavram.terim));
  let tur: AlistirmaTuru = istenen ?? (["tanim", "ingilizce", "ornek"] as const)[Math.floor(rastgele() * 3)];
  if (tur === "ornek" && !ornekUygun) tur = "tanim";

  const deger = (k: Kavram) => (tur === "ingilizce" ? k.ingilizce : k.terim);
  const secenekler = karistir([deger(kavram), ...celdiriciler(kavram, havuz, deger, rastgele)], rastgele);
  const ortak = { kavramId: kavram.id, tur, secenekler, dogru: secenekler.indexOf(deger(kavram)) };

  if (tur === "ingilizce") return { ...ortak, yonerge: "İngilizcesi hangisi?", metin: kavram.terim };
  if (tur === "ornek") return { ...ortak, yonerge: "Bu durum hangi kavramın örneği?", metin: kavram.ornek! };
  return { ...ortak, yonerge: "Bu tanım hangi kavrama ait?", metin: maskele(kavram.tanim, kavram.terim) };
}

export type DersAdimi = { tur: "kart"; kavram: Kavram } | { tur: "soru"; kavram: Kavram };

// Öğren–hatırla sıralaması: her yeni karttan sonra bir önceki kart sorulur, böylece arada biraz unutma payı kalır.
export function dersAdimlari(kavramlar: Kavram[]): DersAdimi[] {
  const adimlar: DersAdimi[] = [];
  kavramlar.forEach((kavram, i) => {
    adimlar.push({ tur: "kart", kavram });
    if (i > 0) adimlar.push({ tur: "soru", kavram: kavramlar[i - 1] });
  });
  if (kavramlar.length > 0) adimlar.push({ tur: "soru", kavram: kavramlar[kavramlar.length - 1] });
  return adimlar;
}

// Ünite testi: sorular ve şıklar her denemede karışır; doğru-yanlış şıkları yerinde kalır.
export function testHazirla(sorular: Soru[], rastgele: Rastgele = Math.random): Soru[] {
  return karistir(sorular, rastgele).map((s) => {
    if (s.tur === "dogru-yanlis") return s;
    const secenekler = karistir(s.secenekler, rastgele);
    return { ...s, secenekler, dogru: secenekler.indexOf(s.secenekler[s.dogru]) };
  });
}

export const yuzde = (dogru: number, toplam: number) => (toplam === 0 ? 0 : Math.round((dogru / toplam) * 100));
