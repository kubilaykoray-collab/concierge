// Bir ünitenin ayrı ajanlarca yazılmış parçalarını tek ünite dosyasında birleştirir.
// Kullanım: node araclar/parca-birlestir.mjs <taslak klasörü> <ders> <ünite no> "<söz>" <parça adları…>
//   örn. node araclar/parca-birlestir.mjs taslak otelcilik-seyahat 1 "…" os-1-A os-1-B os-1-C
// Parça biçimi: { kavramlar: [...], dersler: [{baslik, ilk}], sorular: [...] }  (taslak/parca/<ad>.json)
// İskelet varsa (taslak/<ders>-<ünite>.iskelet.json) öğretmen sözlüğünden gelen terim / tanım değişmiş mi diye bakılır.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const [taslak, ders, uniteNo, soz, ...parcalar] = process.argv.slice(2);
const unite = Number(uniteNo);
const plan = JSON.parse(readFileSync(join(kok, "icerik", ders, "uniteler.json"), "utf8"));
const pu = plan.uniteler.find((u) => u.unite === unite);
if (!pu) throw new Error(`planda ünite ${unite} yok`);
const anaKonu = (konu) => pu.konular.findIndex((p) => konu === p.no || String(konu).startsWith(p.no + "."));
const notlar = [];

// 1. Parçaları derslere ayır
const dersler = [];
const sorular = [];
for (const ad of parcalar) {
  const p = JSON.parse(readFileSync(join(taslak, "parca", `${ad}.json`), "utf8"));
  const kartlar = [...p.kavramlar, ...(p.yeniKavramlar ?? [])];
  const baslar = (p.dersler ?? []).map((d) => ({ baslik: d.baslik, konum: kartlar.findIndex((k) => k.id === d.ilk) })).filter((d) => d.konum >= 0).sort((a, b) => a.konum - b.konum);
  if (baslar.length === 0 || baslar[0].konum !== 0) {
    notlar.push(`${ad}: ders tanımı ilk kartı kapsamıyor; başa "Giriş" dersi eklendi`);
    baslar.unshift({ baslik: "Giriş", konum: 0 });
  }
  baslar.forEach((b, i) => {
    const dilim = kartlar.slice(b.konum, baslar[i + 1]?.konum ?? kartlar.length);
    // Bir ders tek konudan oluşmalı; karışıksa konu değiştiği yerde bölünür.
    let parca = [];
    for (const k of dilim) {
      if (parca.length > 0 && anaKonu(k.konu) !== anaKonu(parca[0].konu)) {
        dersler.push({ baslik: b.baslik, kartlar: parca });
        notlar.push(`${ad}: "${b.baslik}" dersi iki konuya yayılıyordu, bölündü`);
        parca = [];
      }
      parca.push(k);
    }
    if (parca.length > 0) dersler.push({ baslik: b.baslik, kartlar: parca });
  });
  sorular.push(...(p.sorular ?? []));
}

// 2. Dersleri kitabın konu sırasına diz (konu içinde parça sırası korunur)
for (const d of dersler) {
  d.konu = anaKonu(d.kartlar[0].konu);
  if (d.konu < 0) throw new Error(`"${d.baslik}" dersinin konusu planda yok: ${d.kartlar[0].konu} (${d.kartlar[0].id})`);
}
const sirali = dersler.map((d, i) => ({ d, i })).sort((a, b) => a.d.konu - b.d.konu || a.i - b.i).map((x) => x.d);

// 3. Çok küçük dersleri (1 kart) aynı konudaki bir önceki derse ekle
const son = [];
for (const d of sirali) {
  const onceki = son[son.length - 1];
  if (d.kartlar.length < 2 && onceki && onceki.konu === d.konu && onceki.kartlar.length < 7) onceki.kartlar.push(...d.kartlar);
  else son.push(d);
}

const kavramlar = son.flatMap((d) => d.kartlar);
const kimlikler = new Set();
for (const k of kavramlar) {
  if (kimlikler.has(k.id)) throw new Error(`kart id iki kez: ${k.id}`);
  kimlikler.add(k.id);
  delete k._paket;
  if (k.kitapDisi !== true) delete k.kitapDisi;
  if (!k.gorsel) delete k.gorsel;
  k.iliskili = (k.iliskili ?? []).filter((id) => id !== k.id);
  k.ornek ??= null;
  k.sektor ??= null;
  k.kontrol ??= null;
}
for (const k of kavramlar) {
  const eksik = k.iliskili.filter((id) => !kimlikler.has(id));
  if (eksik.length > 0) {
    notlar.push(`${k.id}: olmayan ilişkili kart(lar) çıkarıldı: ${eksik.join(", ")}`);
    k.iliskili = k.iliskili.filter((id) => kimlikler.has(id));
  }
}

// 4. İskeletle karşılaştır: öğretmenin sözlüğünden gelen kart eksik mi, terim / tanım değişmiş mi
const iskeletYolu = join(taslak, `${ders}-${unite}.iskelet.json`);
if (existsSync(iskeletYolu)) {
  const dizin = new Map(kavramlar.map((k) => [k.id, k]));
  for (const i of JSON.parse(readFileSync(iskeletYolu, "utf8")).kavramlar) {
    const k = dizin.get(i.id);
    if (!k) { notlar.push(`EKSİK: ${i.id} ${i.terim} hiçbir parçada yok`); continue; }
    if (k.terim !== i.terim) notlar.push(`${i.id}: terim değişmiş — "${i.terim}" → "${k.terim}"`);
    if (k.tanim !== i.tanim) notlar.push(`${i.id}: tanım değişmiş (${i.terim})`);
    if (k.ingilizce !== i.ingilizce) notlar.push(`${i.id}: İngilizce değişmiş — "${i.ingilizce}" → "${k.ingilizce}"`);
    if (i.kitapDisi && !k.kitapDisi) { k.kitapDisi = true; notlar.push(`${i.id}: kitapDisi etiketi geri kondu`); }
  }
}

const soruKimlikleri = new Set();
for (const s of sorular) {
  if (soruKimlikleri.has(s.id)) throw new Error(`soru id iki kez: ${s.id}`);
  soruKimlikleri.add(s.id);
}

// 5. Yaz
const j = (v) => JSON.stringify(v);
const dizi = (a) => "[" + a.map(j).join(", ") + "]";
const kart = (k) =>
  `    { "id": ${j(k.id)}, "konu": ${j(k.konu)}, "terim": ${j(k.terim)}, "ingilizce": ${j(k.ingilizce)},\n` +
  `      "tanim": ${j(k.tanim)},\n      "ornek": ${j(k.ornek)},\n      "sektor": ${j(k.sektor)},\n` +
  `      "iliskili": ${dizi(k.iliskili)}, "kontrol": ${j(k.kontrol)}${k.kitapDisi ? `, "kitapDisi": true` : ""}${k.gorsel ? `, "gorsel": ${j(k.gorsel)}` : ""} }`;
const soru = (s) =>
  `    { "id": ${j(s.id)}, "tur": ${j(s.tur)},\n${s.tur === "senaryo" ? `      "durum": ${j(s.durum)},\n` : ""}      "soru": ${j(s.soru)},\n` +
  `      "secenekler": ${dizi(s.secenekler)},\n      "dogru": ${s.dogru}, "aciklama": ${j(s.aciklama)} }`;
const metin =
  `{\n  "ders": ${j(ders)},\n  "sinif": ${plan.sinif},\n  "unite": ${unite},\n  "baslik": ${j(pu.baslik)},\n  "onay": false,\n` +
  `  "kazanimlar": [\n${pu.konular.map((k) => "    " + j(k.kazanim)).join(",\n")}\n  ],\n  "soz": ${j(soz)},\n` +
  `  "dersler": [\n${son.map((d) => `    { "baslik": ${j(d.baslik)}, "ilk": ${j(d.kartlar[0].id)} }`).join(",\n")}\n  ],\n` +
  `  "kavramlar": [\n${kavramlar.map(kart).join(",\n")}\n  ],\n  "sorular": [\n${sorular.map(soru).join(",\n")}\n  ]\n}\n`;
writeFileSync(join(kok, "icerik", ders, `unite-${unite}.json`), metin);

console.log(`${ders}/unite-${unite}.json: ${kavramlar.length} kart, ${son.length} ders, ${sorular.filter((s) => s.tur !== "senaryo").length} soru, ${sorular.filter((s) => s.tur === "senaryo").length} vaka, ${kavramlar.filter((k) => k.gorsel).length} görselli, ${kavramlar.filter((k) => k.kitapDisi).length} sektör terimi, ${kavramlar.filter((k) => k.kontrol).length} kontrol notu`);
if (notlar.length > 0) console.log(`${notlar.length} not:\n` + notlar.map((n) => "  - " + n).join("\n"));
