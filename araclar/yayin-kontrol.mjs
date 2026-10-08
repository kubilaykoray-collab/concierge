// Her commit'ten önce otomatik çalışır (araclar/git-kancalari/pre-commit): node araclar/yayin-kontrol.mjs
// Depo herkese açık olacağı için kitap, kişisel dosya ve bozuk içerik girmesini engeller.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icerigiDenetle } from "./icerik-dogrula.mjs";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...arg) => spawnSync("git", ["-c", "core.quotepath=off", ...arg], { cwd: kok, encoding: "utf8" }).stdout ?? "";

const YASAK = [/^kaynak\//, /^inceleme\//, /\.pdf$/i, /(^|\/)\.env/, /^\.claude\/settings\.local\.json$/];
const dosyalar = [...new Set([...git("ls-files").split("\n"), ...git("diff", "--cached", "--name-only", "--diff-filter=ACMR").split("\n")])].filter(Boolean);

const sorunlar = dosyalar.filter((d) => YASAK.some((y) => y.test(d))).map((d) => `depoya girmemesi gereken dosya: ${d}`);
sorunlar.push(...icerigiDenetle().hatalar);

if (sorunlar.length > 0) {
  console.error(`Commit durduruldu, ${sorunlar.length} sorun:\n` + sorunlar.map((s) => "  - " + s).join("\n"));
  process.exit(1);
}
console.log(`Yayın kontrolü temiz (${dosyalar.length} dosya).`);
