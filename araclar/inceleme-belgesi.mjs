// Öğretmenin okuyup düzeltmesi için içerik dosyalarından okunaklı sayfa üretir:
// node araclar/inceleme-belgesi.mjs  →  inceleme/<ders>-unite-N.html
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const cikis = join(kok, "inceleme");
mkdirSync(cikis, { recursive: true });

const k = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const HARF = ["A", "B", "C", "D"];

for (const ders of readdirSync(join(kok, "icerik"), { withFileTypes: true })) {
  if (!ders.isDirectory()) continue;
  for (const ad of readdirSync(join(kok, "icerik", ders.name))) {
    if (!/^unite-\d+\.json$/.test(ad)) continue;
    const u = JSON.parse(readFileSync(join(kok, "icerik", ders.name, ad), "utf8"));
    const notlar = u.kavramlar.filter((x) => x.kontrol);

    const kavramlar = u.kavramlar.map((x, i) => `
      <div class="kart${x.kontrol ? " sorulu" : ""}">
        <h3>${i + 1}. ${k(x.terim)} <span class="en">${k(x.ingilizce)}</span> <span class="no">${k(x.konu)} · ${k(x.id)}</span></h3>
        <p>${k(x.tanim)}</p>
        ${x.ornek ? `<p><b>Örnek:</b> ${k(x.ornek)}</p>` : ""}
        ${x.sektor ? `<p><b>Sektörde:</b> ${k(x.sektor)}</p>` : ""}
        ${x.kontrol ? `<p class="kontrol"><b>Size soru:</b> ${k(x.kontrol)}</p>` : ""}
      </div>`).join("");

    const sorular = u.sorular.map((s, i) => `
      <div class="kart">
        <h3>${i + 1}. ${k(s.soru)} <span class="no">${k(s.id)}</span></h3>
        <ul>${s.secenekler.map((sec, j) => `<li class="${j === s.dogru ? "dogru" : ""}">${s.secenekler.length === 2 ? "" : HARF[j] + ") "}${k(sec)}${j === s.dogru ? " ✓" : ""}</li>`).join("")}</ul>
        <p><b>Açıklama:</b> ${k(s.aciklama)}</p>
      </div>`).join("");

    const html = `<!doctype html><html lang="tr"><meta charset="utf-8">
<title>${k(u.baslik)} — inceleme</title>
<style>
  body{font:17px/1.5 Georgia,serif;max-width:820px;margin:2em auto;padding:0 1em;color:#222}
  h1{margin-bottom:0} h2{margin-top:2em;border-bottom:2px solid #222}
  h3{font-size:1em;margin:0 0 .3em} p{margin:.25em 0} ul{margin:.3em 0;padding-left:1.2em;list-style:none}
  .kart{border:1px solid #ccc;border-radius:6px;padding:.6em .9em;margin:.6em 0;break-inside:avoid}
  .sorulu{border-color:#c60;border-width:2px}
  .en{font-weight:normal;font-style:italic;color:#555} .no{float:right;font-weight:normal;font-size:.75em;color:#999}
  .kontrol{background:#fff3e0;padding:.4em .6em;border-radius:4px} .dogru{font-weight:bold;color:#060}
</style>
<h1>Ünite ${u.unite}: ${k(u.baslik)}</h1>
<p>${u.kavramlar.length} kavram · ${u.sorular.length} soru · onay: <b>${u.onay ? "verildi" : "bekliyor"}</b></p>
<p>${u.kazanimlar.map(k).join("<br>")}</p>
${notlar.length ? `<h2>Önce bunlara bakın: size ${notlar.length} sorum var</h2>
<ol>${notlar.map((x) => `<li><b>${k(x.terim)}:</b> ${k(x.kontrol)}</li>`).join("")}</ol>` : ""}
<h2>Kavram kartları</h2>${kavramlar}
<h2>Test soruları</h2>${sorular}
</html>`;
    const dosya = join(cikis, `${ders.name}-${ad.replace(".json", ".html")}`);
    writeFileSync(dosya, html, "utf8");
    console.log(dosya);
  }
}
