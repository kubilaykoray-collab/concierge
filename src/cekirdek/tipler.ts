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
  kitapDisi?: true; // ders kitabında olmayan uluslararası sektör terimi
  gorsel?: string; // icerik/gorseller.json içindeki anahtar
}

export interface Soru {
  id: string;
  tur: "coktan-secmeli" | "dogru-yanlis" | "senaryo";
  durum?: string; // yalnız senaryo: otelde geçen sahne
  soru: string;
  secenekler: string[];
  dogru: number;
  aciklama: string;
}

export interface DersTanimi {
  baslik: string;
  ilk: string; // dersin ilk kartının id'si
}

export interface UniteDosyasi {
  ders: string;
  sinif: number;
  unite: number;
  baslik: string;
  onay: boolean;
  kazanimlar: string[];
  soz?: string;
  dersler?: DersTanimi[];
  kavramlar: Kavram[];
  sorular: Soru[];
}

export interface Plan {
  ders: string;
  sinif: number;
  dersAdi: string;
  kisaAd?: string;
  sira?: number;
  arsiv?: boolean; // eski müfredat: uygulamada "Arşiv" altında durur
  uniteler: { unite: number; baslik: string; konular: { no: string; baslik: string; kazanim: string }[] }[];
}

export interface Gorsel {
  anahtar: string;
  alt: string;
  fotografci: string;
  baslik: string | null;
  kaynak: string;
  lisans: string;
  lisansAdresi?: string;
}

export interface DersParcasi {
  konu: string | null; // plandaki ana konu ("1.2"); ders yolu buna göre gruplanır
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
  soz: string | null;
  kazanimlar: string[];
  kavramlar: Kavram[];
  sorular: Soru[]; // ünite testi: bilgi soruları
  vakalar: Soru[]; // senaryo soruları
  konular: { no: string; baslik: string }[]; // plandaki ana konular
  dersler: DersParcasi[];
}
