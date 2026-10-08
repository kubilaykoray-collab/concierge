import { dosyalar, planlar } from "virtual:icerik";
import { uniteleriKur } from "./cekirdek/icerik";
import type { DersParcasi, Kavram, Unite } from "./cekirdek/tipler";

// Derslerin uygulamadaki sırası; listede olmayan ders sona eklenir.
const DERS_SIRASI = ["konaklama-seyahat", "genel-turizm"];
const sira = (ders: string) => (DERS_SIRASI.indexOf(ders) + 1 || DERS_SIRASI.length + 1);

export const UNITELER: Unite[] = uniteleriKur(planlar, dosyalar, import.meta.env.DEV || import.meta.env.VITE_TASLAK === "1").sort((a, b) => sira(a.ders) - sira(b.ders) || a.no - b.no);

export interface KavramKaydi extends Kavram {
  unite: Unite;
}

export interface DersKaydi {
  ders: string; // "konaklama-seyahat"
  ad: string; // tam ad
  kisaAd: string; // sekmelerde ve etiketlerde
  sinif: number;
  uniteler: Unite[];
}

const KISA_AD: Record<string, string> = { "konaklama-seyahat": "Otelcilik", "genel-turizm": "Genel Turizm" };

export const DERS_LISTESI: DersKaydi[] = [...new Set(UNITELER.map((u) => u.ders))].map((ders) => {
  const uniteler = UNITELER.filter((u) => u.ders === ders);
  return { ders, ad: uniteler[0].dersAdi, kisaAd: KISA_AD[ders] ?? uniteler[0].dersAdi, sinif: uniteler[0].sinif, uniteler };
});

export const KAVRAMLAR: KavramKaydi[] = UNITELER.flatMap((unite) => unite.kavramlar.map((k) => ({ ...k, unite })));
export const DERSLER: { unite: Unite; ders: DersParcasi }[] = UNITELER.flatMap((unite) => unite.dersler.map((ders) => ({ unite, ders })));

const kavramDizini = new Map(KAVRAMLAR.map((k) => [k.id, k]));
export const kavramBul = (id: string) => kavramDizini.get(id);
export const uniteBul = (anahtar: string) => UNITELER.find((u) => u.anahtar === anahtar);
export const dersBul = (ders: string) => DERS_LISTESI.find((d) => d.ders === ders);
