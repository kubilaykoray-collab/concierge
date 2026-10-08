export interface Kavram {
  id: string;
  konu: string;
  terim: string;
  ingilizce: string;
  tanim: string;
  ornek: string | null;
  sektor: string | null;
  iliskili: string[];
  kontrol: string | null;
}

export interface Soru {
  id: string;
  tur: "coktan-secmeli" | "dogru-yanlis";
  soru: string;
  secenekler: string[];
  dogru: number;
  aciklama: string;
}

export interface UniteDosyasi {
  ders: string;
  sinif: number;
  unite: number;
  baslik: string;
  onay: boolean;
  kazanimlar: string[];
  kavramlar: Kavram[];
  sorular: Soru[];
}

export interface PlanUnite {
  unite: number;
  baslik: string;
  konular: { no: string; baslik: string; kazanim: string }[];
  dersler?: { baslik: string; ilk: string }[];
}

export interface Plan {
  ders: string;
  sinif: number;
  dersAdi: string;
  uniteler: PlanUnite[];
}

export interface DersParcasi {
  anahtar: string; // "genel-turizm/2/3"
  sira: number; // 1'den başlar
  baslik: string;
  kavramlar: Kavram[];
}

export interface Unite {
  anahtar: string; // "genel-turizm/2"
  ders: string;
  dersAdi: string;
  sinif: number;
  no: number;
  baslik: string;
  taslak: boolean;
  kazanimlar: string[];
  kavramlar: Kavram[];
  sorular: Soru[];
  dersler: DersParcasi[];
}
