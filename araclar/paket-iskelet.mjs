// Öğretmenin Claude projesinden gelen kavram listelerini (kaynak/claude-projesi/veri/) uygulama şemasında ünite iskeletine çevirir.
// terim, ingilizce, tanim AYNEN alınır; ornek / sektor boş gelir ve ünite yazılırken doldurulur.
// Kullanım: node araclar/paket-iskelet.mjs <çıktı klasörü>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const cikis = process.argv[2];
if (!cikis) throw new Error("çıktı klasörü ver");
mkdirSync(cikis, { recursive: true });

// Paket dersi → uygulama dersi, ünite ve "bolum" başlığından konu numarası
const DERSLER = [
  { paket: "OSH9", ders: "otelcilik-seyahat", onEk: "os", unite: 1, konu: (b) => (b.startsWith("1.1") ? "1.1" : b.startsWith("1.2") ? "1.2" : null) },
  { paket: "GT9", ders: "genel-turizm-2026", onEk: "gt2", unite: 1, konu: (b) => (/^1\.[1-4]/.test(b) ? b.slice(0, 3) : null) },
  { paket: "MGA9", ders: "mesleki-gelisim", onEk: "mg", unite: 1, konu: (b) => (/^[1-8]\. /.test(b) ? `1.${b[0]}` : null) },
];

for (const d of DERSLER) {
  const ham = JSON.parse(readFileSync(join(kok, "kaynak", "claude-projesi", "veri", `kavramlar-${d.paket}.json`), "utf8"));
  const liste = Array.isArray(ham) ? ham : ham.kavramlar;
  const kavramlar = liste.map((k, i) => {
    const konu = d.konu(k.bolum);
    return {
      id: `${d.onEk}-${d.unite}-${String(i + 1).padStart(3, "0")}`,
      konu, // null: kitap dışı sektör terimi; ünite yazılırken en yakın konuya bağlanır
      terim: k.terim,
      ingilizce: k.ingilizce,
      tanim: k.tanim,
      ornek: null,
      sektor: null,
      iliskili: [],
      kontrol: null,
      ...(k.kitap_disi ? { kitapDisi: true } : {}),
      _paket: { id: k.id, bolum: k.bolum, ...(k.program_anahtar_kavrami ? { programAnahtarKavrami: true } : {}) },
    };
  });
  writeFileSync(join(cikis, `${d.ders}-${d.unite}.iskelet.json`), JSON.stringify({ ders: d.ders, unite: d.unite, kavramlar }, null, 1));
  const ozet = {};
  for (const k of kavramlar) ozet[k._paket.bolum] = `${ozet[k._paket.bolum]?.split("…")[0] ?? k.id}…${k.id}`;
  console.log(d.ders, kavramlar.length, JSON.stringify(ozet));
}
