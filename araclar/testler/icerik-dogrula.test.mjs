// Denetimin gerçekten hata yakaladığını sınar: node --test araclar/testler/
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { icerigiDenetle } from "../icerik-dogrula.mjs";

const PLAN = {
  ders: "ornek-ders", sinif: 9, dersAdi: "Örnek Ders",
  uniteler: [{ unite: 1, baslik: "Deneme", konular: [
    { no: "1.1", baslik: "Birinci konu", kazanim: "Birinci kazanım." },
    { no: "1.2", baslik: "İkinci konu", kazanim: "İkinci kazanım." },
  ] }],
};

const gecerli = () => ({
  ders: "ornek-ders", sinif: 9, unite: 1, baslik: "Deneme", onay: false,
  kazanimlar: ["Birinci kazanım.", "İkinci kazanım."],
  dersler: [{ baslik: "İlk ders", ilk: "od-1-001" }],
  kavramlar: [
    { id: "od-1-001", konu: "1.1.1", terim: "Bir", ingilizce: "One", tanim: "Tanım.", ornek: null, sektor: null, iliskili: ["od-1-002"], kontrol: null },
    { id: "od-1-002", konu: "1.2", terim: "İki", ingilizce: "Two", tanim: "Tanım.", ornek: "Örnek.", sektor: null, iliskili: [], kontrol: null },
  ],
  sorular: [
    { id: "od-1-s01", tur: "coktan-secmeli", soru: "Soru?", secenekler: ["a", "b", "c", "d"], dogru: 2, aciklama: "Çünkü." },
    { id: "od-1-s02", tur: "dogru-yanlis", soru: "Doğru mu?", secenekler: ["Doğru", "Yanlış"], dogru: 0, aciklama: "Çünkü." },
  ],
});

function denetle(degistir = () => {}) {
  const kok = mkdtempSync(join(tmpdir(), "icerik-"));
  mkdirSync(join(kok, "ornek-ders"));
  const u = gecerli();
  degistir(u);
  writeFileSync(join(kok, "ornek-ders", "uniteler.json"), JSON.stringify(PLAN));
  writeFileSync(join(kok, "ornek-ders", "unite-1.json"), JSON.stringify(u));
  writeFileSync(join(kok, "gorseller.json"), JSON.stringify([{ anahtar: "kumsal", alt: "Kumsal", fotografci: "A", baslik: null, kaynak: "https://ornek", lisans: "CC BY 2.0" }]));
  return icerigiDenetle(kok);
}

const hataBekle = (ad, degistir, desen) =>
  test(ad, () => {
    const { hatalar } = denetle(degistir);
    assert.ok(hatalar.some((h) => desen.test(h)), `beklenen hata yok; gelenler: ${JSON.stringify(hatalar)}`);
  });

test("geçerli dosya hatasız geçer", () => {
  const { hatalar, uyarilar, uniteler } = denetle();
  assert.deepEqual(hatalar, []);
  assert.deepEqual(uyarilar, []);
  assert.deepEqual(uniteler.map((u) => [u.kavram, u.soru, u.kontrol]), [[2, 2, 0]]);
});

hataBekle("boş tanım", (u) => { u.kavramlar[0].tanim = " "; }, /tanim boş/);
hataBekle("hatalı kavram id", (u) => { u.kavramlar[0].id = "od-2-001"; }, /kavram id biçimi/);
hataBekle("tekrar eden id", (u) => { u.kavramlar[1].id = "od-1-001"; }, /id tekrar ediyor/);
hataBekle("tekrar eden terim", (u) => { u.kavramlar[1].terim = "bir"; }, /terim tekrar ediyor/);
hataBekle("olmayan ilişkili kavram", (u) => { u.kavramlar[0].iliskili = ["od-1-099"]; }, /bulunamadı/);
hataBekle("ünite dışı konu", (u) => { u.kavramlar[0].konu = "2.1"; }, /konularından biri değil/);
hataBekle("benzer ama farklı konu numarası", (u) => { u.kavramlar[0].konu = "1.10"; }, /konularından biri değil/);
hataBekle("bilinmeyen alan", (u) => { u.kavramlar[0].tanım = "x"; }, /bilinmeyen alan/);
hataBekle("kazanım plandan farklı", (u) => { u.kazanimlar[0] = "Başka."; }, /kazanimlar uniteler\.json/);
hataBekle("üç seçenekli soru", (u) => { u.sorular[0].secenekler.pop(); }, /4 seçenek/);
hataBekle("aralık dışı doğru cevap", (u) => { u.sorular[0].dogru = 4; }, /dogru geçersiz/);
hataBekle("aynı seçenek iki kez", (u) => { u.sorular[0].secenekler[1] = "a"; }, /aynı seçenek/);
hataBekle("ders tanımı yok", (u) => { delete u.dersler; }, /dersler eksik/);
hataBekle("ders olmayan kartla başlıyor", (u) => { u.dersler[0].ilk = "od-1-777"; }, /bulunamadı/);
hataBekle("ilk ders ilk kartla başlamıyor", (u) => { u.dersler[0].ilk = "od-1-002"; }, /ilk kartıyla başlamalı/);
hataBekle("senaryo sorusunda durum yok", (u) => { u.sorular[0].tur = "senaryo"; }, /durum alanı/);
hataBekle("senaryo olmayan soruda durum var", (u) => { u.sorular[0].durum = "Lobi kalabalık."; }, /durum alanı/);
hataBekle("künyesi olmayan görsel", (u) => { u.kavramlar[0].gorsel = "yok-boyle"; }, /gorseller\.json içinde yok/);
hataBekle("kitapDisi false yazılmış", (u) => { u.kavramlar[0].kitapDisi = false; }, /kitapDisi yalnız true/);
test("künyeli görsel ve sektör terimi kabul edilir", () => {
  const { hatalar } = denetle((u) => { u.kavramlar[0].gorsel = "kumsal"; u.kavramlar[0].kitapDisi = true; });
  assert.deepEqual(hatalar, []);
});
hataBekle("açık notla onay", (u) => { u.onay = true; u.kavramlar[0].kontrol = "Emin değilim."; }, /kontrol notu açık/);

test("kavramı olmayan konu uyarı verir", () => {
  const { hatalar, uyarilar } = denetle((u) => { u.kavramlar[1].konu = "1.1"; });
  assert.deepEqual(hatalar, []);
  assert.ok(uyarilar.some((x) => /konu 1\.2/.test(x)));
});

test("bozuk JSON çökmez, hata olarak raporlanır", () => {
  const kok = mkdtempSync(join(tmpdir(), "icerik-"));
  mkdirSync(join(kok, "ornek-ders"));
  writeFileSync(join(kok, "ornek-ders", "uniteler.json"), JSON.stringify(PLAN));
  writeFileSync(join(kok, "ornek-ders", "unite-1.json"), "{ bozuk");
  assert.ok(icerigiDenetle(kok).hatalar.some((h) => /JSON okunamadı/.test(h)));
});
