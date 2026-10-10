// İçerik dosyalarının şemaya uygunluğunu denetler: node araclar/icerik-dogrula.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VARSAYILAN_KOK = join(dirname(fileURLToPath(import.meta.url)), "..", "icerik");
const SORU_TURLERI = ["coktan-secmeli", "dogru-yanlis", "senaryo"];
const UNITE_ALANLARI = ["ders", "sinif", "unite", "baslik", "onay", "kazanimlar", "soz", "dersler", "kavramlar", "sorular"];
const KAVRAM_ALANLARI = ["id", "konu", "terim", "ingilizce", "tanim", "ornek", "sektor", "iliskili", "kontrol", "kitapDisi", "gorsel"];
const SORU_ALANLARI = ["id", "tur", "durum", "soru", "secenekler", "dogru", "aciklama"];

const dolu = (v) => typeof v === "string" && v.trim().length > 0;
const doluYaDaNull = (v) => v === null || dolu(v);
const fazlaAlan = (nesne, izinli) => Object.keys(nesne).filter((a) => !izinli.includes(a));

// plan: uniteler.json içindeki ünite kaydı (yoksa undefined)
function uniteDogrula(yol, u, plan, hatalar, uyarilar, gorseller) {
  const hata = (m) => hatalar.push(`${yol}: ${m}`);
  const uyari = (m) => uyarilar.push(`${yol}: ${m}`);

  if (!dolu(u.ders) || !dolu(u.baslik)) hata("ders / baslik boş");
  if (!Number.isInteger(u.sinif) || !Number.isInteger(u.unite)) hata("sinif / unite sayı olmalı");
  if (typeof u.onay !== "boolean") hata("onay true ya da false olmalı");
  if (!Array.isArray(u.kazanimlar) || u.kazanimlar.length === 0 || !u.kazanimlar.every(dolu)) hata("kazanimlar eksik");
  for (const a of fazlaAlan(u, UNITE_ALANLARI)) hata(`bilinmeyen alan: ${a}`);

  const kisa = dolu(u.ders) ? u.ders.split("-").map((p) => p[0]).join("") : "?";
  const onEk = `${kisa}-${u.unite}-`;
  const kavramlar = Array.isArray(u.kavramlar) ? u.kavramlar : [];
  const sorular = Array.isArray(u.sorular) ? u.sorular : [];

  if (plan) {
    if (u.baslik !== plan.baslik) hata(`baslik uniteler.json ile aynı olmalı ("${plan.baslik}")`);
    const beklenen = plan.konular.map((k) => k.kazanim);
    if (JSON.stringify(u.kazanimlar) !== JSON.stringify(beklenen)) hata("kazanimlar uniteler.json ile aynı olmalı");
  }

  const kavramIdleri = new Set();
  const terimler = new Set();
  for (const k of kavramlar) {
    if (!new RegExp(`^${onEk}\\d{3}$`).test(k.id ?? "")) hata(`kavram id biçimi hatalı: ${k.id}`);
    if (kavramIdleri.has(k.id)) hata(`kavram id tekrar ediyor: ${k.id}`);
    kavramIdleri.add(k.id);
    for (const alan of ["konu", "terim", "ingilizce", "tanim"]) {
      if (!dolu(k[alan])) hata(`${k.id}: ${alan} boş`);
    }
    for (const alan of ["ornek", "sektor", "kontrol"]) {
      if (!doluYaDaNull(k[alan])) hata(`${k.id}: ${alan} metin ya da null olmalı`);
    }
    if (!Array.isArray(k.iliskili)) hata(`${k.id}: iliskili liste olmalı`);
    // kitapDisi: ders kitabında olmayan uluslararası sektör terimi (uygulamada "Sektör" etiketiyle görünür)
    if (k.kitapDisi !== undefined && k.kitapDisi !== true) hata(`${k.id}: kitapDisi yalnız true olabilir (değilse alan yazılmaz)`);
    if (k.gorsel !== undefined && !gorseller.has(k.gorsel)) hata(`${k.id}: gorsel "${k.gorsel}" icerik/gorseller.json içinde yok`);
    for (const a of fazlaAlan(k, KAVRAM_ALANLARI)) hata(`${k.id}: bilinmeyen alan: ${a}`);

    if (dolu(k.terim)) {
      const t = k.terim.trim().toLocaleLowerCase("tr");
      if (terimler.has(t)) hata(`${k.id}: terim tekrar ediyor: ${k.terim}`);
      terimler.add(t);
    }
    if (dolu(k.konu) && plan && !plan.konular.some((p) => k.konu === p.no || k.konu.startsWith(p.no + "."))) {
      hata(`${k.id}: konu "${k.konu}" bu ünitenin konularından biri değil`);
    }
  }
  for (const k of kavramlar) {
    for (const hedef of Array.isArray(k.iliskili) ? k.iliskili : []) {
      if (!kavramIdleri.has(hedef)) hata(`${k.id}: iliskili "${hedef}" bulunamadı`);
      if (hedef === k.id) hata(`${k.id}: kendisiyle ilişkilendirilmiş`);
    }
  }
  if (kavramIdleri.size === 0) hata("hiç kavram yok");
  // Ders bölümleri: her biri var olan bir kartla başlar, kart sırasını izler, ilki ilk kartla başlar.
  if (u.soz !== undefined && !dolu(u.soz)) hata("soz boş olamaz");
  if (!Array.isArray(u.dersler) || u.dersler.length === 0) hata("dersler eksik (her ders: baslik + ilk kart id'si)");
  else {
    const sira = u.dersler.map((d) => kavramlar.findIndex((k) => k.id === d.ilk));
    u.dersler.forEach((d, i) => {
      if (!dolu(d.baslik)) hata(`ders ${i + 1}: baslik boş`);
      if (sira[i] < 0) hata(`ders "${d.baslik}": ilk kart "${d.ilk}" bulunamadı`);
      else if (i > 0 && sira[i] <= sira[i - 1]) hata(`ders "${d.baslik}": kart sırasına göre dizilmemiş`);
      const boy = (sira[i + 1] ?? kavramlar.length) - sira[i];
      if (sira[i] >= 0 && (sira[i + 1] ?? 0) >= 0 && (boy < 2 || boy > 7)) uyari(`ders "${d.baslik}": ${boy} kart (2–7 arası olmalı)`);
    });
    if (sira[0] !== 0) hata("ilk ders ünitenin ilk kartıyla başlamalı");
  }
  for (const p of plan?.konular ?? []) {
    if (!kavramlar.some((k) => dolu(k.konu) && (k.konu === p.no || k.konu.startsWith(p.no + ".")))) {
      uyari(`konu ${p.no} (${p.baslik}) için hiç kavram yok`);
    }
  }

  const soruIdleri = new Set();
  for (const s of sorular) {
    // İki hane 99 soruya yeter; büyük birimlerde (ör. Türkiye'nin turistik merkezleri) üç hane kullanılır.
    if (!new RegExp(`^${onEk}s\\d{2,3}$`).test(s.id ?? "")) hata(`soru id biçimi hatalı: ${s.id}`);
    if (soruIdleri.has(s.id)) hata(`soru id tekrar ediyor: ${s.id}`);
    soruIdleri.add(s.id);
    if (!SORU_TURLERI.includes(s.tur)) hata(`${s.id}: bilinmeyen tur "${s.tur}"`);
    if (!dolu(s.soru) || !dolu(s.aciklama)) hata(`${s.id}: soru / aciklama boş`);
    for (const a of fazlaAlan(s, SORU_ALANLARI)) hata(`${s.id}: bilinmeyen alan: ${a}`);
    const sec = s.secenekler;
    if (!Array.isArray(sec) || !sec.every(dolu)) hata(`${s.id}: secenekler eksik`);
    else {
      if (s.tur === "senaryo" ? !dolu(s.durum) : s.durum !== undefined) hata(`${s.id}: durum alanı yalnız senaryo sorusunda olur ve orada zorunludur`);
      const beklenen = s.tur === "dogru-yanlis" ? 2 : 4;
      if (sec.length !== beklenen) hata(`${s.id}: ${beklenen} seçenek olmalı`);
      if (new Set(sec).size !== sec.length) hata(`${s.id}: aynı seçenek iki kez yazılmış`);
      if (!Number.isInteger(s.dogru) || s.dogru < 0 || s.dogru >= sec.length) hata(`${s.id}: dogru geçersiz`);
    }
  }
  if (soruIdleri.size === 0) hata("hiç soru yok");

  // Doğru cevap hep aynı şıkta toplanırsa öğrenci şıkkı ezberler.
  const coktan = sorular.filter((s) => s.tur === "coktan-secmeli" && Number.isInteger(s.dogru));
  if (coktan.length >= 8) {
    for (let i = 0; i < 4; i++) {
      const adet = coktan.filter((s) => s.dogru === i).length;
      if (adet > coktan.length / 2) uyari(`doğru cevapların ${adet}/${coktan.length} tanesi ${"ABCD"[i]} şıkkında`);
    }
  }

  const kontrol = kavramlar.filter((k) => k.kontrol).length;
  if (u.onay === true && kontrol > 0) hata(`onay: true ama ${kontrol} kontrol notu açık; önce notlar kapanmalı`);
  return { kavram: kavramlar.length, soru: sorular.length, kontrol, onay: u.onay };
}

export function icerigiDenetle(icerikKok = VARSAYILAN_KOK) {
  const hatalar = [];
  const uyarilar = [];
  const uniteler = [];

  // Künyesi olan görseller: kartlar yalnız bunlara başvurabilir.
  const gorseller = new Set();
  const gorselYolu = join(icerikKok, "gorseller.json");
  if (existsSync(gorselYolu)) {
    try {
      for (const g of JSON.parse(readFileSync(gorselYolu, "utf8"))) {
        if (!dolu(g.anahtar) || !dolu(g.alt) || !dolu(g.fotografci) || !dolu(g.kaynak) || !dolu(g.lisans)) hatalar.push(`gorseller.json: "${g.anahtar}" künyesi eksik (alt, fotografci, kaynak, lisans zorunlu)`);
        gorseller.add(g.anahtar);
      }
    } catch (e) {
      hatalar.push(`gorseller.json: okunamadı — ${e.message}`);
    }
  }

  for (const ders of readdirSync(icerikKok, { withFileTypes: true })) {
    if (!ders.isDirectory()) continue;
    const dersKok = join(icerikKok, ders.name);

    const planlar = new Map();
    const planYolu = join(dersKok, "uniteler.json");
    if (!existsSync(planYolu)) hatalar.push(`${ders.name}/uniteler.json: dosya yok`);
    else {
      try {
        for (const p of JSON.parse(readFileSync(planYolu, "utf8")).uniteler) planlar.set(p.unite, p);
      } catch (e) {
        hatalar.push(`${ders.name}/uniteler.json: okunamadı — ${e.message}`);
      }
    }

    for (const ad of readdirSync(dersKok)) {
      if (!/^unite-\d+\.json$/.test(ad)) continue;
      const yol = `${ders.name}/${ad}`;
      let u;
      try {
        u = JSON.parse(readFileSync(join(dersKok, ad), "utf8"));
      } catch (e) {
        hatalar.push(`${yol}: JSON okunamadı — ${e.message}`);
        continue;
      }
      if (u.ders !== ders.name) hatalar.push(`${yol}: ders alanı klasör adıyla aynı olmalı`);
      if (ad !== `unite-${u.unite}.json`) hatalar.push(`${yol}: unite alanı dosya adıyla uyuşmuyor`);
      if (planlar.size > 0 && !planlar.has(u.unite)) hatalar.push(`${yol}: uniteler.json içinde ünite ${u.unite} yok`);
      const ozet = uniteDogrula(yol, u, planlar.get(u.unite), hatalar, uyarilar, gorseller);
      uniteler.push({ yol, ders: ders.name, unite: u.unite, baslik: u.baslik, ...ozet });
    }
  }
  uniteler.sort((a, b) => a.ders.localeCompare(b.ders) || a.unite - b.unite);
  return { hatalar, uyarilar, uniteler };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { hatalar, uyarilar, uniteler } = icerigiDenetle();
  for (const u of uniteler) {
    console.log(`${u.yol}: ${u.kavram} kavram, ${u.soru} soru, ${u.kontrol} kontrol notu, onay: ${u.onay}`);
  }
  if (uyarilar.length > 0) console.log(`\n${uyarilar.length} uyarı:\n` + uyarilar.map((h) => "  - " + h).join("\n"));
  if (hatalar.length > 0) {
    console.error(`\n${hatalar.length} hata:\n` + hatalar.map((h) => "  - " + h).join("\n"));
    process.exit(1);
  }
  console.log(`\n${uniteler.length} dosya denetlendi, hata yok.`);
}
