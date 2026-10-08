import { describe, expect, it } from "vitest";
import { alistirmaUret, dersAdimlari, karistir, maskele, testHazirla, yuzde } from "./alistirma";
import { ara, duzle } from "./arama";
import { dersleriBol, uniteleriKur } from "./icerik";
import { BOS, dersBitti, oku, oyunBitti, rutbe, seri, tekrarCevabi, testBitti } from "./ilerleme";
import { bugun, cevapla, gunEkle, vadesiGelenler, yeniKart } from "./leitner";
import type { Kavram, Plan, Soru, UniteDosyasi } from "./tipler";

const kavram = (n: number, ek: Partial<Kavram> = {}): Kavram => ({
  id: `od-1-00${n}`, konu: "1.1", terim: `Terim ${n}`, ingilizce: `Term ${n}`, tanim: `Tanım ${n}.`,
  ornek: `Örnek ${n}.`, sektor: null, iliskili: [], kontrol: null, ...ek,
});
const kavramlar = [1, 2, 3, 4, 5, 6, 7].map((n) => kavram(n));
const sabit = (deger: number) => () => deger;

describe("icerik", () => {
  const dosya = (unite: number, onay: boolean): UniteDosyasi => ({
    ders: "ornek", sinif: 9, unite, baslik: `Ünite ${unite}`, onay, kazanimlar: [], kavramlar, sorular: [],
  });
  const plan: Plan = { ders: "ornek", sinif: 9, dersAdi: "Örnek Ders", uniteler: [] };

  it("onaysız ünite yayına girmez", () => {
    const yayin = uniteleriKur([plan], [dosya(2, false), dosya(1, true)], false);
    expect(yayin.map((u) => u.no)).toEqual([1]);
    expect(yayin[0].taslak).toBe(false);
  });

  it("geliştirmede onaysız ünite taslak olarak görünür", () => {
    const hepsi = uniteleriKur([plan], [dosya(2, false), dosya(1, true)], true);
    expect(hepsi.map((u) => [u.no, u.taslak])).toEqual([[1, false], [2, true]]);
  });

  it("plandaki ders tanımına göre böler ve hiçbir kartı dışarıda bırakmaz", () => {
    const dersler = dersleriBol("ornek/1", kavramlar, {
      unite: 1, baslik: "x", konular: [],
      dersler: [{ baslik: "İlk", ilk: "od-1-001" }, { baslik: "İkinci", ilk: "od-1-004" }],
    });
    expect(dersler.map((d) => [d.anahtar, d.baslik, d.kavramlar.length])).toEqual([["ornek/1/1", "İlk", 3], ["ornek/1/2", "İkinci", 4]]);
  });

  it("ders tanımı yoksa altışar kartlık bölümler üretir", () => {
    expect(dersleriBol("ornek/1", kavramlar).map((d) => d.kavramlar.length)).toEqual([6, 1]);
  });

  it("ders tanımı ilk kartı kapsamıyorsa otomatik bölmeye döner", () => {
    const dersler = dersleriBol("ornek/1", kavramlar, { unite: 1, baslik: "x", konular: [], dersler: [{ baslik: "Geç", ilk: "od-1-003" }] });
    expect(dersler.flatMap((d) => d.kavramlar)).toHaveLength(7);
  });
});

describe("leitner", () => {
  it("tarih ekleme ay ve yıl sınırını aşar", () => {
    expect(gunEkle("2026-12-31", 1)).toBe("2027-01-01");
    expect(gunEkle("2026-03-01", -1)).toBe("2026-02-28");
    expect(bugun(new Date(2026, 9, 8, 23, 59))).toBe("2026-10-08");
  });

  it("bilinen kart üst kutuya çıkar ve aralığı uzar, bilinmeyen 1. kutuya döner", () => {
    let k = yeniKart("2026-10-08");
    expect(k).toEqual({ kutu: 1, sonraki: "2026-10-09" });
    k = cevapla(k, true, "2026-10-09");
    expect(k).toEqual({ kutu: 2, sonraki: "2026-10-11" });
    k = cevapla(k, true, "2026-10-11");
    expect(k).toEqual({ kutu: 3, sonraki: "2026-10-15" });
    expect(cevapla(k, false, "2026-10-15")).toEqual({ kutu: 1, sonraki: "2026-10-16" });
    expect(cevapla({ kutu: 5, sonraki: "x" }, true, "2026-10-01").kutu).toBe(5);
  });

  it("yalnız vadesi gelen kartları, en zayıf kutudan başlayarak verir", () => {
    const kartlar = { a: { kutu: 3, sonraki: "2026-10-08" }, b: { kutu: 1, sonraki: "2026-10-07" }, c: { kutu: 1, sonraki: "2026-10-09" } };
    expect(vadesiGelenler(kartlar, "2026-10-08")).toEqual(["b", "a"]);
  });
});

describe("alistirma", () => {
  it("dört benzersiz şık üretir ve doğru şıkkı gösterir", () => {
    for (const tur of ["tanim", "ingilizce", "ornek"] as const) {
      const a = alistirmaUret(kavramlar[2], kavramlar, Math.random, tur);
      expect(new Set(a.secenekler).size).toBe(4);
      expect(a.secenekler[a.dogru]).toBe(tur === "ingilizce" ? "Term 3" : "Terim 3");
    }
  });

  it("tanımda terim geçiyorsa gizler", () => {
    expect(maskele("Kış turizmi karda yapılır; KIŞ TURİZMİ sezonu uzatır.", "Kış turizmi")).toBe("＿＿＿ karda yapılır; ＿＿＿ sezonu uzatır.");
    const a = alistirmaUret(kavram(1, { tanim: "Terim 1 bir kavramdır." }), kavramlar, sabit(0), "tanim");
    expect(a.metin).not.toContain("Terim 1");
  });

  it("örneği olmayan ya da örneği cevabı ele veren kartta tanım sorusuna döner", () => {
    expect(alistirmaUret(kavram(1, { ornek: null }), kavramlar, sabit(0), "ornek").tur).toBe("tanim");
    expect(alistirmaUret(kavram(1, { ornek: "Bu bir terim 1 örneği." }), kavramlar, sabit(0), "ornek").tur).toBe("tanim");
  });

  it("çeldiricilerde önce aynı konudaki kartları kullanır", () => {
    const havuz = [kavram(1), kavram(2), kavram(3), kavram(4), kavram(5, { konu: "9.9" }), kavram(6, { konu: "9.9" })];
    const a = alistirmaUret(havuz[0], havuz, Math.random, "tanim");
    expect(a.secenekler.sort()).toEqual(["Terim 1", "Terim 2", "Terim 3", "Terim 4"]);
  });

  it("ders adımları her kartı bir kez öğretir ve bir kez sorar; soru karttan sonra gelir", () => {
    const adimlar = dersAdimlari(kavramlar.slice(0, 3));
    expect(adimlar.map((a) => `${a.tur}:${a.kavram.id.slice(-1)}`)).toEqual(["kart:1", "kart:2", "soru:1", "kart:3", "soru:2", "soru:3"]);
  });

  it("test karışınca doğru cevap aynı metni göstermeye devam eder", () => {
    const sorular: Soru[] = [
      { id: "s1", tur: "coktan-secmeli", soru: "?", secenekler: ["a", "b", "c", "d"], dogru: 2, aciklama: "." },
      { id: "s2", tur: "dogru-yanlis", soru: "?", secenekler: ["Doğru", "Yanlış"], dogru: 1, aciklama: "." },
    ];
    for (let i = 0; i < 20; i++) {
      const hazir = testHazirla(sorular);
      const s1 = hazir.find((s) => s.id === "s1")!;
      expect(s1.secenekler[s1.dogru]).toBe("c");
      expect(hazir.find((s) => s.id === "s2")!.secenekler).toEqual(["Doğru", "Yanlış"]);
    }
  });

  it("karıştırma eleman kaybetmez; yüzde yuvarlanır", () => {
    expect(karistir([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
    expect([yuzde(2, 3), yuzde(0, 0)]).toEqual([67, 0]);
  });
});

describe("arama", () => {
  const liste = [
    kavram(1, { terim: "İç turizm", ingilizce: "Domestic tourism" }),
    kavram(2, { terim: "Cari açık", ingilizce: "Current account deficit", tanim: "Ödemeler farkıdır." }),
    kavram(3, { terim: "Turizm", ingilizce: "Tourism", tanim: "Gezilerin bütünüdür." }),
  ];

  it("Türkçe harf ve büyük-küçük harf farkını yok sayar", () => {
    expect(duzle("  CARİ   AÇIK ")).toBe("cari acik");
    expect(ara(liste, "cari acik").map((k) => k.terim)).toEqual(["Cari açık"]);
    expect(ara(liste, "IC TUR").map((k) => k.terim)).toEqual(["İç turizm"]);
  });

  it("terimi başından tutanı öne alır; İngilizce ve tanımda da arar", () => {
    expect(ara(liste, "turizm").map((k) => k.terim)).toEqual(["Turizm", "İç turizm"]);
    expect(ara(liste, "deficit").map((k) => k.terim)).toEqual(["Cari açık"]);
    expect(ara(liste, "gezilerin").map((k) => k.terim)).toEqual(["Turizm"]);
    expect(ara(liste, "")).toHaveLength(3);
    expect(ara(liste, "zzz")).toEqual([]);
  });
});

describe("ilerleme", () => {
  const GUN = "2026-10-08";

  it("ders bitince yeni kartlar 1. kutuya girer; dersi yinelemek puan basmaz", () => {
    const bir = dersBitti(BOS, "ornek/1/1", ["a", "b"], GUN);
    expect(bir.puan).toBe(20);
    expect(bir.kartlar.a).toEqual({ kutu: 1, sonraki: "2026-10-09" });
    const iki = dersBitti({ ...bir, kartlar: { ...bir.kartlar, a: { kutu: 4, sonraki: "2026-11-01" } } }, "ornek/1/1", ["a", "b"], GUN);
    expect(iki.puan).toBe(20);
    expect(iki.kartlar.a.kutu).toBe(4);
  });

  it("vadeli tekrar kutuyu değiştirir; serbest tekrar doğru cevapta kutuya dokunmaz", () => {
    const d = dersBitti(BOS, "x", ["a"], GUN);
    expect(tekrarCevabi(d, "a", true, "2026-10-09").kartlar.a.kutu).toBe(2);
    const serbest = tekrarCevabi(d, "a", true, GUN, false);
    expect(serbest.kartlar.a).toEqual(d.kartlar.a);
    expect(serbest.puan).toBe(d.puan + 3);
    expect(tekrarCevabi({ ...d, kartlar: { a: { kutu: 3, sonraki: "2026-10-20" } } }, "a", false, GUN, false).kartlar.a.kutu).toBe(1);
    expect(tekrarCevabi(d, "yok", true, GUN)).toBe(d);
  });

  it("test puanı yalnız en iyi sonucu geçen kısım kadar artar", () => {
    let d = testBitti(BOS, "ornek/1", 60, GUN);
    expect([d.puan, d.testler["ornek/1"]]).toEqual([60, { enIyi: 60, deneme: 1 }]);
    d = testBitti(d, "ornek/1", 50, GUN);
    expect([d.puan, d.testler["ornek/1"]]).toEqual([60, { enIyi: 60, deneme: 2 }]);
    d = testBitti(d, "ornek/1", 90, GUN);
    expect(d.puan).toBe(90);
  });

  it("oyunda yalnız rekor puan getirir ve en iyi süre saklanır", () => {
    let d = oyunBitti(BOS, "ornek/1", 30000, GUN);
    d = oyunBitti(d, "ornek/1", 40000, GUN);
    expect([d.oyunlar["ornek/1"], d.puan]).toEqual([30000, 15]);
  });

  it("seri kesintisiz günleri sayar; bugün çalışılmadıysa dünkü seri sürer", () => {
    expect(seri(["2026-10-06", "2026-10-07", "2026-10-08"], GUN)).toBe(3);
    expect(seri(["2026-10-06", "2026-10-07"], GUN)).toBe(2);
    expect(seri(["2026-10-05", "2026-10-06"], GUN)).toBe(0);
    expect(seri(["2026-10-04", "2026-10-07", "2026-10-08"], GUN)).toBe(2);
  });

  it("rütbe eşikleri", () => {
    expect(rutbe(0)).toMatchObject({ ad: "Stajyer", sonraki: "Bellboy", kalan: 150, oran: 0 });
    expect(rutbe(150).ad).toBe("Bellboy");
    expect(rutbe(99999)).toMatchObject({ ad: "Genel Müdür", sonraki: null, oran: 1 });
  });

  it("bozuk ya da eski kayıt uygulamayı çökertmez", () => {
    expect(oku(null)).toBe(BOS);
    expect(oku("{bozuk")).toBe(BOS);
    expect(oku('{"surum":9}')).toBe(BOS);
    expect(oku('{"surum":1,"kartlar":{},"puan":40}')).toMatchObject({ puan: 40, tema: "oto", gunler: [] });
  });
});
