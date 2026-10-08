import type { DersParcasi, Kavram, Plan, PlanUnite, Unite, UniteDosyasi } from "./tipler";

const DERS_BOYU = 6;

// Planda ders tanımı varsa ona göre, yoksa sırayla altışar kartlık bölümlere ayırır.
export function dersleriBol(uniteAnahtari: string, kavramlar: Kavram[], plan?: PlanUnite): DersParcasi[] {
  const baslangiclar: { baslik: string; konum: number }[] = [];
  for (const d of plan?.dersler ?? []) {
    const konum = kavramlar.findIndex((k) => k.id === d.ilk);
    if (konum >= 0) baslangiclar.push({ baslik: d.baslik, konum });
  }
  baslangiclar.sort((a, b) => a.konum - b.konum);
  if (baslangiclar.length === 0 || baslangiclar[0].konum !== 0) {
    baslangiclar.length = 0;
    for (let i = 0; i < kavramlar.length; i += DERS_BOYU) {
      baslangiclar.push({ baslik: `Bölüm ${i / DERS_BOYU + 1}`, konum: i });
    }
  }
  return baslangiclar.map((b, i) => ({
    anahtar: `${uniteAnahtari}/${i + 1}`,
    sira: i + 1,
    baslik: b.baslik,
    kavramlar: kavramlar.slice(b.konum, baslangiclar[i + 1]?.konum ?? kavramlar.length),
  }));
}

// Yayına yalnız öğretmenin onayladığı üniteler girer; taslakDahil yalnız geliştirme içindir.
export function uniteleriKur(planlar: Plan[], dosyalar: UniteDosyasi[], taslakDahil: boolean): Unite[] {
  return dosyalar
    .filter((d) => d.onay === true || taslakDahil)
    .map((d) => {
      const plan = planlar.find((p) => p.ders === d.ders);
      const anahtar = `${d.ders}/${d.unite}`;
      return {
        anahtar,
        ders: d.ders,
        dersAdi: plan?.dersAdi ?? d.ders,
        sinif: d.sinif,
        no: d.unite,
        baslik: d.baslik,
        taslak: d.onay !== true,
        kazanimlar: d.kazanimlar,
        kavramlar: d.kavramlar,
        sorular: d.sorular,
        dersler: dersleriBol(anahtar, d.kavramlar, plan?.uniteler.find((u) => u.unite === d.unite)),
      };
    })
    .sort((a, b) => a.ders.localeCompare(b.ders) || a.no - b.no);
}
