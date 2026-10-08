// Yayındaki adresi telefon boyutunda açıp doğrular ve karekodunu üretir: node araclar/canli-kontrol.mjs
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import QRCode from "qrcode";

const ADRES = "https://kubilaykoray-collab.github.io/concierge/";
const cikti = join(dirname(fileURLToPath(import.meta.url)), "..", "inceleme");
const TARAYICILAR = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

const tarayici = await puppeteer.launch({ executablePath: TARAYICILAR.find(existsSync), headless: true });
const sorunlar = [];
try {
  const sayfa = await tarayici.newPage();
  await sayfa.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  sayfa.on("pageerror", (h) => sorunlar.push("sayfa hatası: " + h.message));
  sayfa.on("response", (y) => y.status() >= 400 && sorunlar.push(`${y.status()} ${y.url()}`));
  sayfa.on("request", (i) => !i.url().startsWith(ADRES) && !i.url().startsWith("data:") && sorunlar.push("dış ağ isteği: " + i.url()));

  await sayfa.goto(ADRES, { waitUntil: "networkidle0" });
  console.log("Başlık:", await sayfa.title());
  await sayfa.evaluate(() => { location.hash = "/dersler"; });
  await bekle(600);
  const uniteler = await sayfa.$$eval(".unite-karti strong", (e) => e.map((x) => x.textContent));
  console.log("Yayındaki üniteler:", uniteler.join(" · "));
  if (uniteler.length === 0) sorunlar.push("yayında ünite görünmüyor");

  await sayfa.evaluate(() => navigator.serviceWorker.ready);
  await bekle(2500);
  await sayfa.setOfflineMode(true);
  await sayfa.reload({ waitUntil: "domcontentloaded" });
  await bekle(800);
  const internetsiz = await sayfa.$$eval(".unite-karti", (e) => e.length);
  console.log("İnternetsiz yeniden yüklemede ünite sayısı:", internetsiz);
  if (internetsiz !== uniteler.length) sorunlar.push("internetsiz açılmadı");
} finally {
  await tarayici.close();
}

mkdirSync(cikti, { recursive: true });
await QRCode.toFile(join(cikti, "karekod.png"), ADRES, { width: 900, margin: 3, color: { dark: "#152238", light: "#ffffff" } });
console.log("Karekod:", join(cikti, "karekod.png"));

if (sorunlar.length > 0) {
  console.error(`${sorunlar.length} sorun:\n` + sorunlar.map((s) => "  - " + s).join("\n"));
  process.exit(1);
}
console.log("Canlı adres temiz:", ADRES);
