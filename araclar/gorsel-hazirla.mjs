// Öğretmenin Claude projesinden gelen CC BY 2.0 fotoğrafları uygulama için küçültür: node araclar/gorsel-hazirla.mjs
// Girdi: kaynak/claude-projesi/gorseller/ (git dışı) · Çıktı: public/gorseller/*.webp + icerik/gorseller.json (künye)
// MEB kitabından alınan görseller (kitap-gorselleri/) bilerek alınmaz. Yalnız icerik/gorsel-secimi.json içinde adı geçenler işlenir.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const paket = join(kok, "kaynak", "claude-projesi");
const cikis = join(kok, "public", "gorseller");
const GENISLIK = 720;
const CC_BY = "https://creativecommons.org/licenses/by/2.0/";

if (!existsSync(join(paket, "gorseller", "kunye.json"))) {
  console.error("kaynak/claude-projesi/gorseller/kunye.json yok; paket bu bilgisayarda değil. Mevcut public/gorseller korunuyor.");
  process.exit(1);
}

// Seçim dosyası: { "<anahtar>": { "dosya": "fotograflar/…/x.jpg", "alt": "görselde ne var" } }
const secim = JSON.parse(readFileSync(join(kok, "icerik", "gorsel-secimi.json"), "utf8"));
const kunye = JSON.parse(readFileSync(join(paket, "gorseller", "kunye.json"), "utf8"));

rmSync(cikis, { recursive: true, force: true });
mkdirSync(cikis, { recursive: true });

const kayitlar = [];
for (const [anahtar, s] of Object.entries(secim)) {
  const k = kunye.find((x) => x.dosya === "gorseller/" + s.dosya);
  if (!k) throw new Error(`${anahtar}: künyede yok — ${s.dosya}`);
  if (k.lisans !== CC_BY || !k.fotografci || !k.kaynak_url) throw new Error(`${anahtar}: lisansı ya da künyesi eksik, kullanılamaz`);
  if (!/^[a-z0-9-]+$/.test(anahtar)) throw new Error(`${anahtar}: anahtar küçük harf, rakam ve tire olmalı`);
  await sharp(join(paket, k.dosya)).rotate().resize({ width: GENISLIK, height: Math.round(GENISLIK * 0.62), fit: "cover", position: s.odak ?? "attention" }).webp({ quality: 68 }).toFile(join(cikis, `${anahtar}.webp`));
  kayitlar.push({ anahtar, alt: s.alt, fotografci: k.fotografci, baslik: k.baslik, kaynak: k.kaynak_url, lisans: "CC BY 2.0", lisansAdresi: CC_BY });
}

kayitlar.sort((a, b) => a.anahtar.localeCompare(b.anahtar));
writeFileSync(join(kok, "icerik", "gorseller.json"), JSON.stringify(kayitlar, null, 1) + "\n");
const toplam = readdirSync(cikis).reduce((t, f) => t + readFileSync(join(cikis, f)).length, 0);
console.log(`${kayitlar.length} görsel → public/gorseller/ (${Math.round(toplam / 1024)} KB), künye → icerik/gorseller.json`);
