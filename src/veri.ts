import { dosyalar, planlar } from "virtual:icerik";
import { uniteleriKur } from "./cekirdek/icerik";
import type { DersParcasi, Kavram, Unite } from "./cekirdek/tipler";

export const UNITELER: Unite[] = uniteleriKur(planlar, dosyalar, import.meta.env.DEV);

export interface KavramKaydi extends Kavram {
  unite: Unite;
}

export const KAVRAMLAR: KavramKaydi[] = UNITELER.flatMap((unite) => unite.kavramlar.map((k) => ({ ...k, unite })));
export const DERSLER: { unite: Unite; ders: DersParcasi }[] = UNITELER.flatMap((unite) => unite.dersler.map((ders) => ({ unite, ders })));

const kavramDizini = new Map(KAVRAMLAR.map((k) => [k.id, k]));
export const kavramBul = (id: string) => kavramDizini.get(id);
export const uniteBul = (anahtar: string) => UNITELER.find((u) => u.anahtar === anahtar);
