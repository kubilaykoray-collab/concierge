// Projenin o anki durumunu dosyalardan çıkarır: node araclar/durum.mjs
// Oturum başında otomatik çalışır (.claude/settings.json → SessionStart).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icerigiDenetle } from "./icerik-dogrula.mjs";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...arg) => spawnSync("git", arg, { cwd: kok, encoding: "utf8" }).stdout?.trim() ?? "";

const { hatalar, uyarilar, uniteler } = icerigiDenetle();
const bekleyen = uniteler.filter((u) => !u.onay);
const uygulamaVar = existsSync(join(kok, "src")) && existsSync(join(kok, "vite.config.ts"));

let asama;
if (uniteler.length === 0) asama = "1 — ünite seçimi bekleniyor, içerik dosyası yok";
else if (bekleyen.length > 0) asama = `2 — içerik yazıldı, öğretmen onayı bekleniyor (${bekleyen.length} ünite)`;
else if (!uygulamaVar) asama = "3 — içerik onaylı, uygulama iskeleti kurulacak";
else if (!git("remote")) asama = "4–5 — uygulama hazır, henüz yayınlanmadı (GitHub deposu yok)";
else asama = "6 — uygulama yayında; yeni üniteler eklenecek";

console.log("PROJE DURUMU (dosyalardan hesaplandı)");
console.log(`Aşama: ${asama}`);
for (const u of uniteler) {
  console.log(`- ${u.ders} ünite ${u.unite} (${u.baslik}): ${u.kavram} kavram, ${u.soru} soru, ${u.kontrol} açık soru, onay: ${u.onay ? "verildi" : "bekliyor"}`);
}
console.log(`İçerik denetimi: ${hatalar.length} hata, ${uyarilar.length} uyarı`);
for (const h of hatalar) console.log(`  HATA ${h}`);

const degisen = git("status", "--porcelain").split("\n").filter(Boolean).length;
const uzak = git("remote");
console.log(`Git: ${degisen} kaydedilmemiş değişiklik; GitHub deposu ${uzak ? "bağlı" : "henüz açılmadı"}`);

if (hatalar.length > 0) console.log("Sıradaki iş: önce denetim hatalarını düzelt.");
else if (bekleyen.length > 0) console.log("Sıradaki iş: öğretmenden açık soruların cevabını ve ünite onayını al (inceleme/ sayfaları).");
else if (!uygulamaVar) console.log("Sıradaki iş: 3. aşama — uygulama iskeleti.");
else if (!uzak) console.log("Sıradaki iş: öğretmen onayıyla GitHub deposu + Pages yayını (yayinla skill'i).");
else console.log("Sıradaki iş: sıradaki ünite (unite-yaz skill'i) ya da öğretmenin istediği iyileştirme.");
