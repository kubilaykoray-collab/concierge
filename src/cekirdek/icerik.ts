import type { DersParcasi, DersTanimi, Kavram, Plan, Unite, UniteDosyasi } from "./tipler";

const DERS_BOYU = 5;

// Ünite dosyasındaki ders tanımına göre, yoksa sırayla beşer kartlık bölümlere ayırır.
export function dersleriBol(uniteAnahtari: string, kavramlar: Kavram[], tanimlar?: DersTanimi[], konular: { no: string }[] = []): DersParcasi[] {
  // Kartın "1.2.3" konusu plandaki "1.2" ana konusuna bağlanır.
  const anaKonu = (k?: Kavram) => konular.find((p) => k && (k.konu === p.no || k.konu.startsWith(p.no + ".")))?.no ?? null;
  const baslangiclar: { baslik: string; konum: number }[] = [];
  for (const d of tanimlar ?? []) {
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
    konu: anaKonu(kavramlar[b.konum]),
    anahtar: `${uniteAnahtari}/${i + 1}`,
    sira: i + 1,
    baslik: b.baslik,
    kavramlar: kavramlar.slice(b.konum, baslangiclar[i + 1]?.konum ?? kavramlar.length),
  }));
}

// Yayına yalnız onaylı üniteler girer; taslakDahil yalnız geliştirme içindir.
export function uniteleriKur(planlar: Plan[], dosyalar: UniteDosyasi[], taslakDahil: boolean): Unite[] {
  return dosyalar
    .filter((d) => d.onay === true || taslakDahil)
    .map((d) => {
      const anahtar = `${d.ders}/${d.unite}`;
      const konular = planlar.find((p) => p.ders === d.ders)?.uniteler.find((u) => u.unite === d.unite)?.konular ?? [];
      return {
        anahtar,
        ders: d.ders,
        dersAdi: planlar.find((p) => p.ders === d.ders)?.dersAdi ?? d.ders,
        sinif: d.sinif,
        no: d.unite,
        baslik: d.baslik,
        taslak: d.onay !== true,
        soz: d.soz ?? null,
        kazanimlar: d.kazanimlar,
        kavramlar: d.kavramlar,
        sorular: d.sorular.filter((s) => s.tur !== "senaryo"),
        vakalar: d.sorular.filter((s) => s.tur === "senaryo"),
        konular: konular.map((k) => ({ no: k.no, baslik: k.baslik })),
        dersler: dersleriBol(anahtar, d.kavramlar, d.dersler, konular),
      };
    })
    .sort((a, b) => a.ders.localeCompare(b.ders) || a.no - b.no);
}
