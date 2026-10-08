// İçeriğin kalitesini ölçer; şema denetiminin göremediği kalıpları listeler: node araclar/icerik-analiz.mjs [ders]
// Hata vermez, rapor verir. Bulgular editör (insan ya da ajan) için iş listesidir.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..", "icerik");
const yalnizDers = process.argv[2];
const kucuk = (s) => s.toLocaleLowerCase("tr");
const TANIM_SONU = /(d[ıiuü]r|t[ıiuü]r)\.$/;
const TANIM_BOYU = 230;

const uniteler = [];
for (const ders of readdirSync(kok, { withFileTypes: true })) {
  if (!ders.isDirectory() || (yalnizDers && ders.name !== yalnizDers)) continue;
  for (const ad of readdirSync(join(kok, ders.name)).filter((a) => /^unite-\d+\.json$/.test(a))) {
    uniteler.push(JSON.parse(readFileSync(join(kok, ders.name, ad), "utf8")));
  }
}
uniteler.sort((a, b) => a.ders.localeCompare(b.ders) || a.unite - b.unite);

const bulgular = [];
const ekle = (tur, yer, ayrinti) => bulgular.push({ tur, yer, ayrinti });

const terimler = new Map();
for (const u of uniteler) {
  for (const k of u.kavramlar) {
    const anahtar = kucuk(k.terim.trim());
    if (terimler.has(anahtar)) ekle("aynı terim iki ünitede", k.id, `"${k.terim}" ↔ ${terimler.get(anahtar)}`);
    else terimler.set(anahtar, k.id);

    if (k.tanim.length > TANIM_BOYU) ekle("uzun tanım", k.id, `${k.tanim.length} karakter`);
    if (!TANIM_SONU.test(k.tanim.trim())) ekle("tanım -dır/-dir ile bitmiyor", k.id, "…" + k.tanim.trim().slice(-40));
    if (kucuk(k.tanim).startsWith(kucuk(k.terim).split(" ")[0] + " ") && k.terim.split(" ")[0].length > 3) ekle("tanım terimle başlıyor", k.id, k.tanim.slice(0, 50));
    if ((k.tanim.match(/[.!?](\s|$)/g) ?? []).length > 2) ekle("tanım üç cümleden uzun", k.id, "");
    if (!k.ornek) ekle("örnek yok", k.id, k.terim);
    if (!k.sektor) ekle("sektör notu yok", k.id, k.terim);
    if (kucuk(k.terim) === kucuk(k.ingilizce)) ekle("İngilizcesi Türkçesiyle aynı", k.id, k.terim);
    if (k.iliskili.length === 0) ekle("ilişkili kavram yok", k.id, k.terim);
  }

  const kartMetni = kucuk(u.kavramlar.map((k) => [k.terim, k.tanim, k.ornek, k.sektor].join(" ")).join(" "));
  for (const s of u.sorular) {
    if (s.tur === "dogru-yanlis") continue;
    const boylar = s.secenekler.map((x) => x.length);
    const dogruBoy = boylar[s.dogru];
    const digerEnUzun = Math.max(...boylar.filter((_, i) => i !== s.dogru));
    if (dogruBoy > digerEnUzun * 1.25 && dogruBoy - digerEnUzun > 12) ekle("doğru şık belirgin biçimde en uzun", s.id, `${dogruBoy} / ${digerEnUzun}`);
    if (dogruBoy * 1.6 < Math.min(...boylar.filter((_, i) => i !== s.dogru))) ekle("doğru şık belirgin biçimde en kısa", s.id, `${dogruBoy}`);
    const dogruMetin = kucuk(s.secenekler[s.dogru]);
    if (s.tur === "coktan-secmeli" && dogruMetin.length > 5 && kucuk(s.soru).includes(dogruMetin)) ekle("cevap soru kökünde geçiyor", s.id, s.secenekler[s.dogru]);
    if (s.tur === "coktan-secmeli" && dogruMetin.length > 3 && dogruMetin.split(" ").length <= 4 && !kartMetni.includes(dogruMetin)) ekle("doğru cevap hiçbir kartta geçmiyor", s.id, s.secenekler[s.dogru]);
    if (/hepsi|hiçbiri/i.test(s.secenekler.join(" "))) ekle("hepsi / hiçbiri şıkkı", s.id, "");
    if (s.tur === "senaryo") {
      const sahis = s.secenekler.map((x) => (/(r[ıiuü]m|r[ıiuü]z|m)[.!]?$/.test(x.trim()) ? "ben" : /s[ıiuü]n[.!]?$/.test(x.trim()) ? "sen" : "?"));
      if (new Set(sahis).size > 1) ekle("senaryo şıklarında şahıs karışık", s.id, sahis.join(","));
    }
  }

  const coktan = u.sorular.filter((s) => s.tur !== "dogru-yanlis");
  const dagilim = [0, 1, 2, 3].map((i) => coktan.filter((s) => s.dogru === i).length);
  if (Math.max(...dagilim) - Math.min(...dagilim) > 4) ekle("doğru şık dağılımı dengesiz", `${u.ders}/${u.unite}`, dagilim.join("/"));
  const dy = u.sorular.filter((s) => s.tur === "dogru-yanlis");
  const dogruOnerme = dy.filter((s) => s.dogru === 0).length;
  if (dy.length >= 3 && (dogruOnerme === 0 || dogruOnerme === dy.length)) ekle("doğru-yanlışların hepsi aynı", `${u.ders}/${u.unite}`, `${dogruOnerme}/${dy.length}`);

  // Kartı olup hiçbir soruda geçmeyen terim oranı (kabaca kapsam ölçüsü)
  const soruMetni = kucuk(u.sorular.map((s) => [s.durum, s.soru, ...s.secenekler, s.aciklama].join(" ")).join(" "));
  const sorulmayan = u.kavramlar.filter((k) => !soruMetni.includes(kucuk(k.terim))).length;
  u._ozet = `${u.ders}/${u.unite} ${u.baslik}: ${u.kavramlar.length} kart, ${u.sorular.filter((s) => s.tur !== "senaryo").length} soru, ${u.sorular.filter((s) => s.tur === "senaryo").length} vaka, ${(u.dersler ?? []).length} ders; terimi hiçbir soruda geçmeyen kart ${sorulmayan}`;
}

for (const u of uniteler) console.log(u._ozet);
const turler = [...new Set(bulgular.map((b) => b.tur))];
console.log(`\n${bulgular.length} bulgu:`);
for (const tur of turler) {
  const liste = bulgular.filter((b) => b.tur === tur);
  console.log(`\n■ ${tur} (${liste.length})`);
  for (const b of liste.slice(0, 40)) console.log(`  ${b.yer}${b.ayrinti ? " — " + b.ayrinti : ""}`);
  if (liste.length > 40) console.log(`  … ve ${liste.length - 40} tane daha`);
}
