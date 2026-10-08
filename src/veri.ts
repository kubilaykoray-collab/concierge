import { dosyalar, gorseller, planlar } from "virtual:icerik";
import { uniteleriKur } from "./cekirdek/icerik";
import type { DersParcasi, Gorsel, Kavram, Unite } from "./cekirdek/tipler";

const TASLAK = import.meta.env.DEV || import.meta.env.VITE_TASLAK === "1";
const plan = (ders: string) => planlar.find((p) => p.ders === ders);
// Derslerin sırası uniteler.json içindeki "sira" alanından gelir; arşiv dersleri sona kalır.
const sira = (ders: string) => (plan(ders)?.arsiv ? 1000 : 0) + (plan(ders)?.sira ?? 500);

export const UNITELER: Unite[] = uniteleriKur(planlar, dosyalar, TASLAK).sort((a, b) => sira(a.ders) - sira(b.ders) || a.ders.localeCompare(b.ders) || a.no - b.no);

export interface KavramKaydi extends Kavram {
  unite: Unite;
}

export interface DersKaydi {
  ders: string; // "otelcilik-seyahat"
  ad: string; // tam ad
  kisaAd: string; // sekmelerde ve etiketlerde
  sinif: number;
  arsiv: boolean; // eski müfredat
  uniteler: Unite[];
}

export const TUM_DERSLER: DersKaydi[] = [...new Set(UNITELER.map((u) => u.ders))].map((ders) => {
  const uniteler = UNITELER.filter((u) => u.ders === ders);
  return { ders, ad: uniteler[0].dersAdi, kisaAd: plan(ders)?.kisaAd ?? uniteler[0].dersAdi, sinif: uniteler[0].sinif, arsiv: plan(ders)?.arsiv === true, uniteler };
});

// Güncel müfredat. Hiç güncel ders yayında değilse arşiv güncel sayılır (uygulama boş kalmasın).
const guncel = TUM_DERSLER.filter((d) => !d.arsiv);
export const DERS_LISTESI: DersKaydi[] = guncel.length > 0 ? guncel : TUM_DERSLER;
export const ARSIV_DERSLERI: DersKaydi[] = guncel.length > 0 ? TUM_DERSLER.filter((d) => d.arsiv) : [];
const arsivde = new Set(ARSIV_DERSLERI.map((d) => d.ders));

export const KAVRAMLAR: KavramKaydi[] = UNITELER.flatMap((unite) => unite.kavramlar.map((k) => ({ ...k, unite })));
// Sıradaki ders önerisi, günün kavramı ve günün vakası yalnız güncel müfredattan seçilir.
export const GUNCEL_UNITELER: Unite[] = UNITELER.filter((u) => !arsivde.has(u.ders));
export const GUNCEL_KAVRAMLAR: KavramKaydi[] = KAVRAMLAR.filter((k) => !arsivde.has(k.unite.ders));
export const DERSLER: { unite: Unite; ders: DersParcasi }[] = GUNCEL_UNITELER.flatMap((unite) => unite.dersler.map((ders) => ({ unite, ders })));

const kavramDizini = new Map(KAVRAMLAR.map((k) => [k.id, k]));
export const kavramBul = (id: string) => kavramDizini.get(id);
export const uniteBul = (anahtar: string) => UNITELER.find((u) => u.anahtar === anahtar);
export const dersBul = (ders: string) => TUM_DERSLER.find((d) => d.ders === ders);

export const GORSELLER: Gorsel[] = gorseller;
const gorselDizini = new Map(gorseller.map((g) => [g.anahtar, g]));
export const gorselBul = (anahtar?: string) => (anahtar ? gorselDizini.get(anahtar) : undefined);
export const gorselAdresi = (anahtar: string) => `gorseller/${anahtar}.webp`;
