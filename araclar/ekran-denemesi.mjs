// Derlenmiş uygulamayı telefon boyutunda gerçek tarayıcıda baştan sona kullanır: node araclar/ekran-denemesi.mjs
// Önce `npm run build`. Ekran görüntüleri inceleme/ekranlar/ altına yazılır (git dışı). Hata varsa 1 koduyla çıkar.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const cikti = join(kok, "inceleme", "ekranlar");
rmSync(cikti, { recursive: true, force: true });
mkdirSync(cikti, { recursive: true });

const TARAYICILAR = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const ADRES = "http://localhost:4173/";
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

const sunucu = spawn(process.execPath, [join(kok, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", "4173", "--strictPort"], { cwd: kok, stdio: "ignore" });
const tarayici = await puppeteer.launch({ executablePath: TARAYICILAR.find(existsSync), headless: true });
const sorunlar = [];
let no = 0;

try {
  const sayfa = await tarayici.newPage();
  await sayfa.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sayfa.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  sayfa.on("pageerror", (h) => sorunlar.push("sayfa hatası: " + h.message));
  sayfa.on("console", (m) => agAcik && m.type() === "error" && sorunlar.push("konsol: " + m.text()));
  let agAcik = false; // açılışta sunucu beklenirken ve ağ bilerek kesilmişken başarısız istek beklenir
  sayfa.on("requestfailed", (i) => agAcik && sorunlar.push("istek başarısız: " + i.url()));
  sayfa.on("request", (i) => !i.url().startsWith(ADRES) && !i.url().startsWith("data:") && sorunlar.push("DIŞ AĞ İSTEĞİ: " + i.url()));

  for (let i = 0; i < 40; i++) {
    try { await sayfa.goto(ADRES, { waitUntil: "networkidle0" }); break; } catch { await bekle(250); }
  }
  agAcik = true;

  const cek = async (ad, tam = false) => {
    await bekle(450);
    await sayfa.screenshot({ path: join(cikti, `${String(++no).padStart(2, "0")}-${ad}.png`), fullPage: tam });
  };
  const git = async (yol) => { await sayfa.evaluate((y) => { location.hash = y; }, yol); await bekle(250); };
  // Terfi kutlaması her ekranın üstünde açılır; görülünce kaydedilir ve kapatılır.
  let terfiGoruldu = false;
  const terfiKapat = async () => {
    if (!(await sayfa.$(".terfi"))) return;
    if (!terfiGoruldu) { terfiGoruldu = true; await cek("terfi"); }
    await sayfa.click(".terfi .dugme");
    await bekle(150);
  };
  const tikla = async (secici) => { await terfiKapat(); await sayfa.waitForSelector(secici, { timeout: 4000 }); await sayfa.click(secici); await bekle(120); };
  const var_ = (secici) => sayfa.$(secici).then((e) => e !== null);
  const metin = (secici) => sayfa.$eval(secici, (e) => e.textContent);
  const dogrula = async (kosul, mesaj) => { if (!(await kosul)) sorunlar.push("BEKLENEN OLMADI: " + mesaj); };

  // 1. İlk açılış
  await cek("bugun-ilk-acilis", true);
  await dogrula(metin("h1").then((t) => t.includes("Hoş geldin")), "ilk açılışta karşılama");

  // 2. İlk ders: kartlar ve hatırlama soruları. İlk soruda bilerek yanlış şık seçilir.
  await tikla(".one-cikan");
  await cek("ders-kavram-karti");
  let soruGoruldu = 0;
  for (let i = 0; i < 60 && !(await var_(".sonuc")); i++) {
    if (await var_(".secenek:not(:disabled)")) {
      soruGoruldu++;
      if (soruGoruldu === 1) await cek("ders-soru");
      await dogrula(sayfa.$$eval(".secenek", (dugmeler) => dugmeler.length === 4), "alıştırmada 4 şık");
      await sayfa.click(soruGoruldu === 1 ? ".secenek:nth-child(1)" : ".secenek:nth-child(2)");
      await bekle(150);
      if (soruGoruldu <= 2) await cek(`ders-geri-bildirim-${soruGoruldu}`);
    }
    await tikla(".alt-eylem .dugme");
  }
  await dogrula(var_(".sonuc"), "ders sonuç ekranına ulaşıldı");
  await cek("ders-tamamlandi");

  // 3. Ünite ve dersler
  const ilkDers = await sayfa.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("lobi.ilerleme.v1")).dersler)[0]);
  const [ilkKurs, ilkUnite] = ilkDers.split("/");
  await git(`/unite/${ilkKurs}/${ilkUnite}`);
  await cek("unite", true);
  await dogrula(var_(".durak-bitti"), "biten ders işaretlendi");
  await git("/dersler");
  await cek("dersler", true);
  const kurslar = await sayfa.$$eval(".parcali .parca", (p) => p.map((x) => x.getAttribute("href")));
  for (const k of kurslar) {
    await git(k.slice(1));
    await dogrula(sayfa.$$eval(".unite-karti", (u) => u.length > 0), `derste ünite var: ${k}`);
  }

  // 4. Tekrar: kartların vadesi düne çekilir (bir gün geçmiş gibi)
  await sayfa.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("lobi.ilerleme.v1"));
    for (const k of Object.values(d.kartlar)) k.sonraki = "2000-01-01";
    d.puan = 198; // bir sonraki doğru cevap unvan eşiğini (200) geçirsin
    localStorage.setItem("lobi.ilerleme.v1", JSON.stringify(d));
  });
  await sayfa.reload({ waitUntil: "networkidle0" });
  await git("/");
  await cek("bugun-tekrar-var", true);
  await dogrula(var_(".gunun-vakasi"), "açılışta günün vakası var");
  await tikla(".one-cikan");
  await cek("tekrar-on-yuz");
  await tikla(".cevir-yuz");
  await cek("tekrar-arka-yuz");
  let ilk = true;
  for (let i = 0; i < 40 && !(await var_(".sonuc")); i++) {
    if (await var_(".cevir-yuz")) await tikla(".cevir-yuz");
    await tikla(ilk ? ".dugme-kirmizi" : ".dugme-yesil");
    ilk = false;
  }
  await terfiKapat();
  await dogrula(Promise.resolve(terfiGoruldu), "unvan eşiği geçilince terfi kutlaması göründü");
  await cek("tekrar-bitti");
  const kutular = await sayfa.evaluate(() => Object.values(JSON.parse(localStorage.getItem("lobi.ilerleme.v1")).kartlar).map((k) => k.kutu).sort().join(""));
  await dogrula(Promise.resolve(/^12+$/.test(kutular)), `tekrar sonrası kutular (bir kart 1'de, diğerleri 2'de): ${kutular}`);

  // 4b. Vaka çalışması (senaryosu olan ilk ünite)
  await git("/dersler/konaklama-seyahat");
  const vakaYolu = await sayfa.evaluate(async () => {
    for (const a of document.querySelectorAll(".unite-karti")) if (a.textContent.includes("vaka")) return a.getAttribute("href").replace("#/unite/", "/vaka/");
    return null;
  });
  if (vakaYolu) {
    await git(vakaYolu);
    await cek("vaka-sahne");
    for (let i = 0; i < 30 && !(await var_(".sonuc")); i++) {
      if (await var_(".secenek:not(:disabled)")) {
        await sayfa.click(".secenek:nth-child(2)");
        await bekle(120);
        if (i === 0) await cek("vaka-geri-bildirim");
      }
      await tikla(".alt-eylem .dugme");
    }
    await dogrula(var_(".sonuc"), "vaka çalışması bitti");
    await cek("vaka-bitti");
  }

  // 5. Ünite testi
  await git("/test/genel-turizm/2");
  await cek("test-giris");
  await tikla(".alt-eylem .dugme");
  await cek("test-soru");
  for (let i = 0; i < 60 && !(await var_(".halka")); i++) {
    if (await var_(".secenek:not(:disabled)")) {
      await sayfa.click(".secenek:nth-child(1)");
      await bekle(120);
      if (i === 0) await cek("test-aciklama");
    }
    await tikla(".alt-eylem .dugme");
  }
  await terfiKapat();
  await cek("test-sonuc", true);
  await dogrula(sayfa.evaluate(() => JSON.parse(localStorage.getItem("lobi.ilerleme.v1")).testler["genel-turizm/2"]?.deneme === 1), "test sonucu kaydedildi");

  // 6. Eşleştirme oyunu: her sol taş için sağdakiler sırayla denenir
  await git("/oyun/genel-turizm/3");
  await cek("oyun");
  for (let sol = 1; sol <= 6; sol++) {
    for (let sag = 1; sag <= 6; sag++) {
      if (await var_(`.taslar > div:first-child .tas:nth-child(${sol}):disabled`)) break;
      if (await var_(`.taslar > div:last-child .tas:nth-child(${sag}):disabled`)) continue;
      await sayfa.click(`.taslar > div:first-child .tas:nth-child(${sol})`);
      await sayfa.click(`.taslar > div:last-child .tas:nth-child(${sag})`);
      if (sol === 1 && sag === 1) await cek("oyun-secim");
      await bekle(650);
      if (await var_(".sonuc")) break;
    }
  }
  await dogrula(var_(".sonuc"), "oyun bitti");
  await cek("oyun-bitti");

  // 7. Sözlük
  await git("/sozluk");
  await cek("sozluk");
  await sayfa.type(".arama input", "pasaport");
  await cek("sozluk-arama");
  await dogrula(sayfa.$$eval(".etiketler .hap", (h) => h.length >= 3), "sözlükte ders filtresi var");
  await dogrula(sayfa.$$eval(".sozluk-satiri", (s) => s.length >= 5 && s.length < 20), "aramada pasaport sonuçları");
  await tikla(".sozluk-satiri");
  await cek("sozluk-ayrinti");
  await dogrula(var_(".cekmece"), "kavram ayrıntısı açıldı");

  // 8. İlerleme ve karanlık tema
  await git("/ilerleme");
  await cek("ilerleme", true);
  await sayfa.evaluate(() => [...document.querySelectorAll(".parca")].find((p) => p.textContent === "Karanlık").click());
  await git("/");
  await cek("karanlik-bugun", true);
  await git("/ders/genel-turizm/3/3");
  await cek("karanlik-kavram-karti");
  await tikla(".alt-eylem .dugme");
  await tikla(".alt-eylem .dugme");
  await sayfa.click(".secenek:nth-child(3)");
  await cek("karanlik-soru");

  // 9. İnternetsiz: servis çalışanı hazır olduktan sonra ağ kesilir ve sayfa yeniden yüklenir
  await sayfa.evaluate(() => navigator.serviceWorker.ready);
  await bekle(1500);
  agAcik = false;
  await sayfa.setOfflineMode(true);
  await git("/dersler");
  await sayfa.reload({ waitUntil: "domcontentloaded" });
  await bekle(800);
  await dogrula(sayfa.$$eval(".unite-karti", (k) => k.length > 0), "internetsiz yeniden yüklemede üniteler göründü");
  await cek("internetsiz-dersler");
  await sayfa.setOfflineMode(false);
  agAcik = true;

  // 10. Yatay taşma: hiçbir ekranda sayfa sağa kaymamalı
  for (const yol of ["/", "/dersler", "/dersler/genel-turizm", "/unite/genel-turizm/3", "/unite/konaklama-seyahat/1", "/sozluk", "/ilerleme"]) {
    await git(yol);
    await dogrula(sayfa.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= 390), `yatay taşma yok: ${yol}`);
  }
} catch (hata) {
  sorunlar.push("DENEME YARIDA KALDI: " + hata.message);
} finally {
  await tarayici.close();
  sunucu.kill();
}

console.log(`${no} ekran görüntüsü → ${cikti}`);
if (sorunlar.length > 0) {
  console.error(`${sorunlar.length} sorun:\n` + sorunlar.map((s) => "  - " + s).join("\n"));
  process.exit(1);
}
console.log("Uçtan uca deneme temiz: hata yok, dış ağ isteği yok, internetsiz çalışıyor.");
