// public/simge.svg dosyasından telefon simgelerini (PNG) üretir: node araclar/simge-uret.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TARAYICILAR = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const svg = readFileSync(join(kok, "simge.svg"), "utf8");
// Maskeli ve Apple simgelerinde köşeyi işletim sistemi yuvarlar; zemin kenara kadar dolu, çizim güvenli alanda olmalı.
const dolu = (olcek) => `<div style="width:100vw;height:100vw;background:#152238;display:grid;place-items:center"><div style="width:${olcek}%">${svg}</div></div>`;

const CIKTILAR = [
  { ad: "simge-192.png", boyut: 192, html: svg },
  { ad: "simge-512.png", boyut: 512, html: svg },
  { ad: "simge-maske-512.png", boyut: 512, html: dolu(80) },
  { ad: "apple-touch-icon.png", boyut: 180, html: dolu(100) },
];

const tarayici = await puppeteer.launch({ executablePath: TARAYICILAR.find(existsSync), headless: true });
const sayfa = await tarayici.newPage();
for (const c of CIKTILAR) {
  await sayfa.setViewport({ width: c.boyut, height: c.boyut });
  await sayfa.setContent(`<body style="margin:0;background:transparent">${c.html}</body>`);
  await sayfa.screenshot({ path: join(kok, c.ad), omitBackground: true });
  console.log(c.ad);
}
await tarayici.close();
