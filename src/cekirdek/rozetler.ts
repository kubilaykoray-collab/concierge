import { GECME_NOTU, seri, type Ilerleme } from "./ilerleme";
import { USTA_KUTU } from "./leitner";

// Rozetler: öğrencinin küçük zaferleri. Hepsi ilerleme kaydından hesaplanır, ayrıca saklanmaz;
// böylece kurallar değişince eski kayıt da yeni rozetleri kazanır.
export interface Rozet {
  id: string;
  ad: string;
  aciklama: string;
  kazanildi: boolean;
  oran: number; // 0–1, kazanılana kadar ilerleme
}

export interface UniteOzeti {
  anahtar: string;
  dersler: string[]; // ders anahtarları
}

const oranla = (deger: number, hedef: number) => Math.min(1, deger / hedef);

export function rozetler(d: Ilerleme, gun: string, uniteler: UniteOzeti[], gecerliKart: (id: string) => boolean = () => true): Rozet[] {
  const dersSayisi = Object.keys(d.dersler).length;
  const gunSerisi = seri(d.gunler, gun);
  const kartlar = Object.entries(d.kartlar).filter(([id]) => gecerliKart(id));
  const ogrenilen = kartlar.length;
  const usta = kartlar.filter(([, k]) => k.kutu >= USTA_KUTU).length;
  const sertifika = Object.values(d.testler).filter((t) => t.enIyi >= GECME_NOTU).length;
  const vaka = Object.keys(d.vakalar).length;
  const rekor = Object.keys(d.oyunlar).length;
  const bitenUnite = uniteler.filter((u) => u.dersler.length > 0 && u.dersler.every((x) => d.dersler[x])).length;
  const calisilanGun = d.gunler.length;

  const liste: [string, string, string, number, number][] = [
    ["ilk-gun", "İlk Gün", "İlk dersini bitirdin. Her kariyer böyle başlar.", dersSayisi, 1],
    ["uc-gun", "Üç Gün Üst Üste", "Üç gün arka arkaya çalıştın.", gunSerisi, 3],
    ["bir-hafta", "Bir Hafta", "Yedi günlük seri. Alışkanlık oluyor.", gunSerisi, 7],
    ["bir-ay", "Bir Ay", "Otuz gün üst üste. Bu artık disiplin.", gunSerisi, 30],
    ["yuz-kart", "İlk Yüz", "Yüz kavram öğrendin.", ogrenilen, 100],
    ["bes-yuz-kart", "Beş Yüz", "Beş yüz kavram. Sözlüğün yarısına yakını.", ogrenilen, 500],
    ["bin-kart", "Bin Kart", "Bin kavram. Artık sektörün dilini konuşuyorsun.", ogrenilen, 1000],
    ["usta-hafiza", "Usta Hafıza", "Elli kavramı usta kutusuna taşıdın; artık unutmuyorsun.", usta, 50],
    ["ilk-sertifika", "İlk Sertifika", "Bir ünite testini geçtin.", sertifika, 1],
    ["uc-sertifika", "Üç Sertifika", "Üç ünite sertifikası duvarda.", sertifika, 3],
    ["unite-tamam", "Ünite Tamam", "Bir ünitenin bütün derslerini bitirdin.", bitenUnite, 1],
    ["vaka-cozucu", "Vaka Çözücü", "On vakada doğru kararı verdin.", vaka, 10],
    ["kriz-yoneticisi", "Kriz Yöneticisi", "Elli vaka. Zor konuk seni şaşırtmıyor.", vaka, 50],
    ["hizli-eller", "Hızlı Eller", "Eşleştirmede bir rekor kırdın.", rekor, 1],
    ["sadik-calisan", "Sadık Çalışan", "Toplam otuz gün çalıştın (üst üste olması şart değil).", calisilanGun, 30],
  ];
  return liste.map(([id, ad, aciklama, deger, hedef]) => ({ id, ad, aciklama, kazanildi: deger >= hedef, oran: oranla(deger, hedef) }));
}
