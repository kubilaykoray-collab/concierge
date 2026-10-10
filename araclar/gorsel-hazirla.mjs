// Lisansı açık fotoğrafları uygulama için küçültür: node araclar/gorsel-hazirla.mjs
// Girdi 1: kaynak/claude-projesi/gorseller/ (öğretmenin paketi, CC BY 2.0) + icerik/gorsel-secimi.json (seçim)
// Girdi 2: taslak/gorsel-havuzu/kunye.json (Openverse'ten toplanan CC0 / CC BY havuz; her kayıt kullanılır)
// Çıktı: public/gorseller/*.webp + icerik/gorseller.json (künye). MEB kitabından görsel bilerek alınmaz.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Künye metinlerindeki HTML kalıntılarını (&#x27; &amp; …) düz yazıya çevirir.
const duz = (m) => m && m.replace(/&#x([0-9a-f]+);/gi, (_, k) => String.fromCodePoint(parseInt(k, 16))).replace(/&#(\d+);/g, (_, k) => String.fromCodePoint(Number(k))).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const paket = join(kok, "kaynak", "claude-projesi");
const havuz = join(kok, "taslak", "gorsel-havuzu");
const cikis = join(kok, "public", "gorseller");
const GENISLIK = 720;
const CC_BY_2 = "https://creativecommons.org/licenses/by/2.0/";
// Kabul edilen lisanslar: CC0 ve CC BY (sürümü ne olursa olsun). BY-SA / NC / ND alınmaz.
const LISANS = /^(CC0 1\.0|CC BY \d\.\d)$/;

const kayitlar = []; // { anahtar, dosya (mutlak), odak, alt, fotografci, baslik, kaynak, lisans, lisansAdresi }
const anahtarKontrol = (a) => { if (!/^[a-z0-9-]+$/.test(a)) throw new Error(`${a}: anahtar küçük harf, rakam ve tire olmalı`); };

// 1. Öğretmenin paketi (seçilenler)
if (existsSync(join(paket, "gorseller", "kunye.json"))) {
  const secim = JSON.parse(readFileSync(join(kok, "icerik", "gorsel-secimi.json"), "utf8"));
  const kunye = JSON.parse(readFileSync(join(paket, "gorseller", "kunye.json"), "utf8"));
  for (const [anahtar, s] of Object.entries(secim)) {
    const k = kunye.find((x) => x.dosya === "gorseller/" + s.dosya);
    if (!k) throw new Error(`${anahtar}: künyede yok — ${s.dosya}`);
    if (k.lisans !== CC_BY_2 || !k.fotografci || !k.kaynak_url) throw new Error(`${anahtar}: lisansı ya da künyesi eksik, kullanılamaz`);
    anahtarKontrol(anahtar);
    kayitlar.push({ anahtar, dosya: join(paket, k.dosya), odak: s.odak, alt: s.alt, fotografci: duz(k.fotografci), baslik: duz(k.baslik), kaynak: k.kaynak_url, lisans: "CC BY 2.0", lisansAdresi: CC_BY_2 });
  }
} else {
  console.error("kaynak/claude-projesi/gorseller/kunye.json yok; öğretmenin paketi bu bilgisayarda değil, paket görselleri atlanıyor.");
}

// 2. Openverse havuzu (hepsi)
if (existsSync(join(havuz, "kunye.json"))) {
  for (const k of JSON.parse(readFileSync(join(havuz, "kunye.json"), "utf8"))) {
    anahtarKontrol(k.anahtar);
    if (!LISANS.test(k.lisans ?? "")) throw new Error(`${k.anahtar}: lisans "${k.lisans}" kabul edilmiyor (yalnız CC0 ve CC BY)`);
    if (!k.lisansAdresi || !k.kaynak_url || !k.alt) throw new Error(`${k.anahtar}: künye eksik (lisansAdresi, kaynak_url, alt zorunlu)`);
    if (!k.fotografci && k.lisans !== "CC0 1.0") throw new Error(`${k.anahtar}: CC BY lisansında fotoğrafçı adı zorunlu`);
    if (!existsSync(join(havuz, k.dosya))) throw new Error(`${k.anahtar}: dosya yok — ${k.dosya}`);
    if (kayitlar.some((x) => x.anahtar === k.anahtar)) throw new Error(`${k.anahtar}: anahtar iki kaynakta da var`);
    kayitlar.push({ anahtar: k.anahtar, dosya: join(havuz, k.dosya), odak: k.odak, alt: k.alt, fotografci: duz(k.fotografci || "Bilinmiyor"), baslik: duz(k.baslik) || null, kaynak: k.kaynak_url, lisans: k.lisans, lisansAdresi: k.lisansAdresi });
  }
}

if (kayitlar.length === 0) { console.error("işlenecek görsel yok; mevcut public/gorseller korunuyor."); process.exit(1); }
rmSync(cikis, { recursive: true, force: true });
mkdirSync(cikis, { recursive: true });
for (const k of kayitlar) {
  await sharp(k.dosya).rotate().resize({ width: GENISLIK, height: Math.round(GENISLIK * 0.62), fit: "cover", position: k.odak ?? "attention" }).webp({ quality: 68 }).toFile(join(cikis, `${k.anahtar}.webp`));
}

const kunyeler = kayitlar.map(({ dosya, odak, ...k }) => k).sort((a, b) => a.anahtar.localeCompare(b.anahtar));
writeFileSync(join(kok, "icerik", "gorseller.json"), JSON.stringify(kunyeler, null, 1) + "\n");
const toplam = readdirSync(cikis).reduce((t, f) => t + readFileSync(join(cikis, f)).length, 0);
console.log(`${kunyeler.length} görsel → public/gorseller/ (${Math.round(toplam / 1024)} KB), künye → icerik/gorseller.json`);
