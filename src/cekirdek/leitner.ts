// Aralıklı tekrar: bilinen kart bir üst kutuya çıkar ve daha seyrek sorulur, bilinmeyen 1. kutuya döner.
export interface KartDurumu {
  kutu: number; // 1–5
  sonraki: string; // YYYY-AA-GG
}

export const SON_KUTU = 5;
export const USTA_KUTU = 4;
const ARALIK_GUN = [0, 1, 2, 4, 8, 16]; // kutu numarası → kaç gün sonra

export function bugun(simdi: Date = new Date()): string {
  const iki = (n: number) => String(n).padStart(2, "0");
  return `${simdi.getFullYear()}-${iki(simdi.getMonth() + 1)}-${iki(simdi.getDate())}`;
}

export function gunEkle(gun: string, adet: number): string {
  const [y, a, g] = gun.split("-").map(Number);
  return new Date(Date.UTC(y, a - 1, g + adet)).toISOString().slice(0, 10);
}

export function yeniKart(gun: string): KartDurumu {
  return { kutu: 1, sonraki: gunEkle(gun, ARALIK_GUN[1]) };
}

export function cevapla(durum: KartDurumu, bildi: boolean, gun: string): KartDurumu {
  const kutu = bildi ? Math.min(durum.kutu + 1, SON_KUTU) : 1;
  return { kutu, sonraki: gunEkle(gun, ARALIK_GUN[kutu]) };
}

export function vadesiGelenler(kartlar: Record<string, KartDurumu>, gun: string): string[] {
  return Object.keys(kartlar)
    .filter((id) => kartlar[id].sonraki <= gun)
    .sort((a, b) => kartlar[a].kutu - kartlar[b].kutu || kartlar[a].sonraki.localeCompare(kartlar[b].sonraki) || a.localeCompare(b));
}
