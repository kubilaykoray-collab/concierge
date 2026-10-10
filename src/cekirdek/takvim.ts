// Öğretmenin yıllık planı (CLAUDE.md): hangi hafta hangi konu işleniyor. Uygulama "Bu hafta sınıfta" kartını buradan kurar.
// Bilinmeyen hafta için kart gösterilmez; plan öğretmenden geldikçe genişletilir.
export const ILK_HAFTA = "2026-09-14"; // 1. haftanın pazartesisi
export const ARA_TATIL_HAFTASI = 10; // 16–20 Kasım

export interface HaftaKonusu {
  ders: string; // "otelcilik-seyahat"
  konu: string; // "1.3" — ünite konusu ya da alt başlığı
}

const PLAN: Record<number, HaftaKonusu[]> = {
  1: [{ ders: "otelcilik-seyahat", konu: "1.1" }],
  2: [{ ders: "otelcilik-seyahat", konu: "1.1" }],
  3: [{ ders: "otelcilik-seyahat", konu: "1.2" }, { ders: "genel-turizm-2026", konu: "1.3" }],
  4: [{ ders: "otelcilik-seyahat", konu: "1.2" }, { ders: "genel-turizm-2026", konu: "1.4" }],
  5: [{ ders: "otelcilik-seyahat", konu: "1.3" }, { ders: "genel-turizm-2026", konu: "1.5" }],
  6: [{ ders: "otelcilik-seyahat", konu: "1.3" }, { ders: "genel-turizm-2026", konu: "1.5.2" }],
  7: [{ ders: "otelcilik-seyahat", konu: "2.1" }],
  8: [{ ders: "otelcilik-seyahat", konu: "2.2" }],
  9: [{ ders: "otelcilik-seyahat", konu: "2.3" }],
};

// Pazartesiden pazara aynı hafta sayılır; 1. haftadan önce 0, tatilde ve plan dışında boş liste döner.
export function haftaNo(gun: string, ilkHafta = ILK_HAFTA): number {
  const [y, a, g] = gun.split("-").map(Number);
  const [y0, a0, g0] = ilkHafta.split("-").map(Number);
  const fark = Math.round((Date.UTC(y, a - 1, g) - Date.UTC(y0, a0 - 1, g0)) / 86400000);
  return fark < 0 ? 0 : Math.floor(fark / 7) + 1;
}

export function haftaninKonulari(gun: string, ilkHafta = ILK_HAFTA): HaftaKonusu[] {
  const hafta = haftaNo(gun, ilkHafta);
  if (hafta === 0 || hafta === ARA_TATIL_HAFTASI) return [];
  return PLAN[hafta] ?? [];
}
