// İçerikte ders kitabından kelimesi kelimesine alınmış cümle var mı diye bakar: node araclar/telif-kontrol.mjs
// Kitap metni kaynak/.onbellek/ altına çıkarılır (kaynak/ git dışıdır).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const KITAPLAR = { "genel-turizm": "kaynak/GENEL TURIZM.pdf" };
const PENCERE = 6; // karşılaştırılan kelime dizisi uzunluğu
const HATA_ESIGI = 8; // kitapla art arda bu kadar kelime aynıysa hata
const PDFTOTEXT = ["pdftotext", "C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe"];

const kelimeler = (metin) =>
  metin.replace(/-\r?\n/g, "").toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").filter(Boolean);

function kitapMetni(ders) {
  const pdf = join(kok, KITAPLAR[ders] ?? "");
  if (!KITAPLAR[ders] || !existsSync(pdf)) return null;
  const onbellek = join(kok, "kaynak", ".onbellek", `${ders}.txt`);
  if (!existsSync(onbellek) || statSync(onbellek).mtimeMs < statSync(pdf).mtimeMs) {
    mkdirSync(dirname(onbellek), { recursive: true });
    const calisti = PDFTOTEXT.some((komut) => spawnSync(komut, ["-enc", "UTF-8", pdf, onbellek]).status === 0);
    if (!calisti) return null;
  }
  return readFileSync(onbellek, "utf8");
}

// Metindeki, kitapta da art arda geçen en uzun kelime dizilerini döndürür.
function ortakDiziler(metin, kitapParcalari) {
  const k = kelimeler(metin);
  const bulunan = [];
  let baslangic = -1;
  for (let i = 0; i + PENCERE <= k.length + 1; i++) {
    const var_ = i + PENCERE <= k.length && kitapParcalari.has(k.slice(i, i + PENCERE).join(" "));
    if (var_ && baslangic < 0) baslangic = i;
    if (!var_ && baslangic >= 0) {
      bulunan.push(k.slice(baslangic, i - 1 + PENCERE).join(" "));
      baslangic = -1;
    }
  }
  return bulunan;
}

const hatalar = [];
const uyarilar = [];
let denetlenen = 0;
let atlanan = 0;

for (const ders of readdirSync(join(kok, "icerik"), { withFileTypes: true })) {
  if (!ders.isDirectory()) continue;
  const metin = kitapMetni(ders.name);
  if (metin === null) {
    console.log(`${ders.name}: kitap PDF'i ya da pdftotext bulunamadı — TELİF DENETİMİ YAPILMADI.`);
    atlanan++;
    continue;
  }
  const kitap = kelimeler(metin);
  const parcalar = new Set();
  for (let i = 0; i + PENCERE <= kitap.length; i++) parcalar.add(kitap.slice(i, i + PENCERE).join(" "));

  for (const ad of readdirSync(join(kok, "icerik", ders.name))) {
    if (!/^unite-\d+\.json$/.test(ad)) continue;
    const u = JSON.parse(readFileSync(join(kok, "icerik", ders.name, ad), "utf8"));
    const alanlar = [
      ...u.kavramlar.flatMap((x) => ["tanim", "ornek", "sektor"].map((a) => [`${x.id} ${a}`, x[a]])),
      ...u.sorular.flatMap((s) => [[`${s.id} soru`, s.soru], [`${s.id} aciklama`, s.aciklama], ...s.secenekler.map((sec, j) => [`${s.id} seçenek ${j + 1}`, sec])]),
    ];
    for (const [yer, deger] of alanlar) {
      if (!deger) continue;
      denetlenen++;
      for (const dizi of ortakDiziler(deger, parcalar)) {
        const satir = `${ders.name}/${ad} ${yer}: kitapla aynı ${dizi.split(" ").length} kelime — "${dizi}"`;
        (dizi.split(" ").length >= HATA_ESIGI ? hatalar : uyarilar).push(satir);
      }
    }
  }
}

if (uyarilar.length > 0) console.log(`${uyarilar.length} uyarı (kısa benzerlik, göz at):\n` + uyarilar.map((h) => "  - " + h).join("\n"));
if (hatalar.length > 0) {
  console.error(`\n${hatalar.length} telif hatası (yeniden yazılmalı):\n` + hatalar.map((h) => "  - " + h).join("\n"));
  process.exit(1);
}
console.log(`\n${denetlenen} metin kitapla karşılaştırıldı${atlanan ? `, ${atlanan} ders atlandı` : ""}; ${HATA_ESIGI}+ kelimelik birebir alıntı yok.`);
