import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// icerik/ dosyalarını uygulamaya verir. Yayın derlemesine yalnız onay: true üniteler girer;
// onaysız içerik paketin içine hiç yazılmaz. Geliştirmede hepsi gelir, uygulama "taslak" diye işaretler.
function icerikEklentisi(): Plugin {
  const ID = "virtual:icerik";
  const kok = join(import.meta.dirname, "icerik");
  let gelistirme = false;
  return {
    name: "icerik",
    configResolved(ayar) {
      gelistirme = ayar.command === "serve" || process.env.VITE_TASLAK === "1"; // VITE_TASLAK=1: onaysız içerikle önizleme derlemesi (yayınlanmaz)
    },
    resolveId: (id) => (id === ID ? "\0" + ID : undefined),
    load(id) {
      if (id !== "\0" + ID) return;
      const planlar: unknown[] = [];
      const uniteler: { onay: boolean }[] = [];
      for (const ders of readdirSync(kok, { withFileTypes: true })) {
        if (!ders.isDirectory()) continue;
        for (const ad of readdirSync(join(kok, ders.name))) {
          const yol = join(kok, ders.name, ad);
          if (ad === "uniteler.json") planlar.push(JSON.parse(readFileSync(yol, "utf8")));
          else if (/^unite-\d+\.json$/.test(ad)) uniteler.push(JSON.parse(readFileSync(yol, "utf8")));
          else continue;
          this.addWatchFile(yol);
        }
      }
      const yayin = uniteler.filter((u) => u.onay === true || gelistirme);
      const gorselYolu = join(kok, "gorseller.json");
      this.addWatchFile(gorselYolu);
      // Yalnız yayındaki bir kartın kullandığı görsellerin künyesi pakete girer.
      const kullanilan = new Set((yayin as { kavramlar?: { gorsel?: string }[] }[]).flatMap((u) => (u.kavramlar ?? []).map((k) => k.gorsel)));
      const gorseller = (JSON.parse(readFileSync(gorselYolu, "utf8")) as { anahtar: string }[]).filter((g) => kullanilan.has(g.anahtar));
      // Büyük veri JS nesnesi olarak değil JSON metni olarak gömülür: tarayıcı JSON'u çok daha hızlı ayrıştırır (yavaş telefon).
      const metin = (veri: unknown) => `JSON.parse(${JSON.stringify(JSON.stringify(veri))})`;
      return `export const planlar = ${metin(planlar)};\nexport const dosyalar = ${metin(yayin)};\nexport const gorseller = ${metin(gorseller)};`;
    },
  };
}

export default defineConfig({
  // Göreli taban: GitHub Pages'te depo adı ne olursa olsun çalışır (yönlendirme hash tabanlı).
  base: "./",
  plugins: [
    icerikEklentisi(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["simge.svg", "apple-touch-icon.png"],
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,woff2,webp}"] },
      manifest: {
        name: "CONCIERGE — Hospitality Academy",
        short_name: "CONCIERGE",
        description: "Otelcilik ve turizm kavramlarını ders ders öğren, vakalarla dene, kendini sına.",
        lang: "tr",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F4EEE2",
        theme_color: "#152238",
        icons: [
          { src: "simge-192.png", sizes: "192x192", type: "image/png" },
          { src: "simge-512.png", sizes: "512x512", type: "image/png" },
          { src: "simge-maske-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: { include: ["src/**/*.test.ts"] },
});
