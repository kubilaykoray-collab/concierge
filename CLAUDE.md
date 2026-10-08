# CLAUDE.md — Turizm Ders Uygulaması

> Bu dosya her oturumda otomatik yüklenir. Öğretmen (proje sahibi) Türkçe konuşur; yanıtlar Türkçe, sade, önce sonuç.

## 1. Amaç

Meslek lisesi turizm öğrencilerinin ders çalışmasını kolaylaştıran, **ücretsiz**, telefona kurulan bir uygulama.
Sahibi: turizm / konaklama öğretmeni. Kullanıcı: öğrencileri (9. sınıftan başlayarak; çoğu Android, bir kısmı iPhone).

İlk kapsam: **9. sınıf Genel Turizm** — önce 2 ünite (Ünite 2 Turizm Hareketleri, Ünite 3 Turizm İşletmeleri), öğrencilere açılır,
gerisi üstüne eklenir. Güncel durum her oturum başında `araclar/durum.mjs` ile dosyalardan hesaplanır; buraya elle durum yazılmaz.
İkinci ders: **Konaklama ve Seyahat Hizmetleri Atölyesi** (`icerik/konaklama-seyahat/`, 10 ünite; öğretmen "otelcilik dersi" der).
Sonra: Genel Turizm'in kalan üniteleri · Mesleki Gelişim Atölyesi.

**Yetki (8 Ekim 2026):** öğretmen içerik kararlarını, onayı ve yayını Claude'a bıraktı ("tam yetki ve onay sende"). İçerik bağımsız
denetimden (`icerik-denetci`) geçtikten sonra `onay: true` yapılıp yayınlanabilir; verilen her karar ve onay öğretmene raporlanır.
Öğretmen bir kararı değiştirirse onun sözü geçer.

## 2. Değişmez kurallar

1. **İçerik kendi cümlelerimizle yazılır.** Kavramlar öğretim programındaki kazanımlara göre, öğrencinin anlayacağı dille yeniden
   anlatılır; kitap cümlesi yapıştırmak iyi kart üretmez. Ders kitabı bilgi kaynağı olarak serbestçe kullanılır.
   (8 Ekim 2026: öğretmen telif denetimini askıya aldı — `npm run telif` artık zorunlu adım değil, yalnız bilgi verir.)
2. **Öğrenciden kişisel veri toplanmaz.** Giriş, hesap, isim, e-posta, analitik, çerez takibi YOK. İlerleme yalnız telefonda
   (`localStorage` / IndexedDB). Sunucu / veritabanı YOK.
3. **Reklam yok. Ücretli servis yok.** Uygulama içinde canlı yapay zekâ çağrısı YOK (her soru para; ayrıca denetimsiz içerik).
4. **İçerik onaysız yayınlanmaz.** Her içerik dosyasında `onay: false / true` alanı; `false` olan
   yayın derlemesine girmez. Yapay zekâ hızlı yazar ama yanlış da yazar — editör öğretmendir.
5. **`kaynak/` klasörü git'e GİRMEZ** (`.gitignore`); kitap ve kişisel ders dosyaları GitHub'a yüklenmez.
6. Öğretmenin asıl ders klasörüne (`C:\Users\pc\OneDrive\Masaüstü\TURIZM OTELCILIK`) **dokunulmaz**; buradaki `kaynak/` onun kopyasıdır.
7. Bilinmeyen şey uydurulmaz: bir tanımdan emin değilsen `kontrol: "..."` notu düş, öğretmene sor.

## 3. Teknik karar

- **Telefona kurulan web uygulaması (PWA)** — mağaza yok, ücret yok, Android + iPhone aynı kod.
  Vite + React + TypeScript · `vite-plugin-pwa` (internetsiz çalışma) · yönlendirme hash tabanlı (GitHub Pages uyumlu).
- **Yayın adresi:** https://kubilaykoray-collab.github.io/concierge/ · depo: `kubilaykoray-collab/concierge` (herkese açık).
  Yayından sonra `node araclar/canli-kontrol.mjs` canlı adresi doğrular ve karekodu `inceleme/karekod.png` olarak üretir.
- **Yayın:** GitHub Pages (ücretsiz), `gh` kurulu. Depo herkese açık olacağı için içinde yalnız kendi yazdığımız içerik bulunur.
- **İçerik = düz dosya**, kod değil: `icerik/<ders>/<unite>.json`. Uygulama derlemede bunları okur.
- Sonradan istenirse Google Play (tek sefer 25 $; Bubblewrap / TWA). App Store (yılda 99 $) planlanmıyor;
  iPhone'da Safari → Paylaş → "Ana Ekrana Ekle".
- Kurulu: git 2.55 · node 24 · gh 2.101. Paketler `npm` ile.

## 4. İçerik şeması

```json
{
  "ders": "genel-turizm", "sinif": 9, "unite": 1, "baslik": "…", "onay": false,
  "kazanimlar": ["…"],
  "soz": "üniteyi özetleyen, akılda kalan tek cümle (isteğe bağlı)",
  "dersler": [ { "baslik": "kısa ders adı", "ilk": "gt-1-001" } ],
  "kavramlar": [
    { "id": "gt-1-001", "konu": "1.1.1", "terim": "Turizm", "ingilizce": "Tourism",
      "tanim": "kendi cümlemizle, 1–2 cümle", "ornek": "sektörden somut örnek",
      "sektor": "otelde / acentede nasıl kullanılır (varsa)", "iliskili": ["gt-1-002"], "kontrol": null }
  ],
  "sorular": [
    { "id": "gt-1-s01", "tur": "coktan-secmeli", "soru": "…", "secenekler": ["…"], "dogru": 0, "aciklama": "neden" },
    { "id": "gt-1-s02", "tur": "senaryo", "durum": "otelde geçen kısa bir sahne", "soru": "Ne yaparsın?",
      "secenekler": ["…"], "dogru": 0, "aciklama": "neden" }
  ]
}
```

`ornek`, `sektor`, `kontrol` boşsa `null`. Soru `tur`: `coktan-secmeli` (4 seçenek), `dogru-yanlis` (2 seçenek) ya da `senaryo`
(4 seçenek + `durum`; uygulamada "Vaka" olarak ayrı oynanır, ünite testine girmez). `dersler` üniteyi 2–7 kartlık derslere böler:
her ders `ilk` kartından bir sonraki dersin `ilk` kartına kadar sürer.
Şemada olmayan alan hatadır; alan eklenecekse önce `araclar/icerik-dogrula.mjs` ve testi güncellenir.
`icerik/<ders>/uniteler.json` yıllık plandan çıkarılan ünite / konu / kazanım listesidir; ünite dosyalarının başlığı, kazanımları
ve `konu` numaraları buna uymak zorundadır.

## 5. Ekranlar (ilk sürüm)

Uygulamanın adı **CONCIERGE — Hospitality Academy** (İngilizce, büyük harf; öğretmenin isteği). Görsel dil "sessiz lüks":
fildişi kâğıt, İsviçre laciverti, şampanya altını; Playfair Display başlık + Inter gövde (dosyaları `src/yazitipleri/` içinde,
ağdan yüklenmez); çizimler elde yazılmış SVG (`src/cizimler.tsx`). Fotoğraf ve dış görsel kullanılmaz.
**Vaka çalışması:** `senaryo` soruları ünitenin "Vaka" modunda oynanır — öğrenci otelde bir sahnenin içine konur ve karar verir.
Öğretme mantığı: ders = birkaç kavram; her yeni karttan sonra bir önceki kart sorulur (öğren → hatırla), yanlışlar ders sonunda
yeniden gelir; biten dersin kartları aralıklı tekrara (Leitner, 1-2-4-8-16 gün) girer; ünite sonunda test; puanla otel kariyeri
basamakları (Stajyer → Genel Müdür). Alıştırmalar kartın kendi içeriğinden üretilir, onaysız yeni bilgi eklemez.

Dersler → Üniteler → **Kavram kartları** (çevir: terim ↔ tanım; Türkçe ↔ İngilizce) · **Tekrar** (bilinmeyen kart daha sık;
basit Leitner kutuları) · **Test** (ünite sonu, karışık) · **Sözlük** (tüm terimlerde arama) · **İlerleme** (telefonda).
Sonra: rol canlandırma senaryoları (resepsiyon, rezervasyon, şikâyet) · sektör sözlüğü (ön büro, kat hizmetleri, F&B, acente, havayolu kısaltmaları).

Tasarım: büyük yazı, tek elle kullanım, karanlık / aydınlık, yavaş telefonda hızlı. Türkçe arayüz.

## 6. Aşamalar

| # | İş | Bitti sayılır |
|---|-----|---------------|
| 1 | `kaynak/` okunur: yıllık plan → ünite ve kazanım listesi çıkarılır; öğretmene ünite seçimi sunulur | öğretmen ilk 2 üniteyi seçti |
| 2 | Seçilen 2 ünitenin içerik dosyaları yazılır (kavram + soru), öğretmen okur / düzeltir | iki dosyada `onay: true` |
| 3 | Uygulama iskeleti: ekranlar, arama, kart, test, internetsiz çalışma | bilgisayarda çalışıyor, testler geçiyor |
| 4 | Telefonda deneme (öğretmenin telefonu; Android + bir iPhone) | kurulum ve internetsiz kullanım doğrulandı |
| 5 | GitHub deposu + Pages yayını, karekod | bağlantı öğrenci telefonunda açılıyor |
| 6 | Ünite ünite içerik; sonra diğer dersler | — |

Her aşamanın sonunda öğretmene kısa rapor: ne yapıldı, neyi onaylaması gerekiyor.

## 7. Kaynaklar (`kaynak/`, git dışı)

- `GENEL TURIZM/` — yıllık plan (2025–2026), öğretmenin hazırladığı fasiküller, haritalar, grafikler, UNESCO notları
- `GENEL TURIZM.pdf` — ders kitabı (**yalnız kapsam / sıra için; metin kopyalanmaz**)
- `GENEL TURIZM CALISMA NOTU FINAL.pdf`, haftalık notlar — öğretmenin kendi notları (kullanılabilir)

## 8. Çalışma biçimi

- Küçük adımlar; her adımda çalışan bir şey. Test önce yazılır (içerik şeması doğrulaması dahil).
- Commit ve push: öğretmen "yayınla" deyince. İlk GitHub deposunu açmadan önce depo adını ve herkese açık olacağını söyle.
- Öğretmen teknik değil: komutları onun yerine çalıştır; ondan yalnız içerik onayı ve karar iste.
- Aynı anda tek oturum: iki Claude oturumu aynı dosyalara yazarsa birbirini ezer.
- "Bitti" demek = ilgili denetim bu oturumda çalıştı ve çıktısı görüldü. Çalıştırılmayan şey "bitti" diye raporlanmaz.

## 9. Düzen: komutlar ve otomatik denetimler

| Komut | Ne yapar |
|---|---|
| `npm run durum` | Aşama, ünite sayıları, açık sorular, sıradaki iş (oturum başında kendiliğinden çalışır) |
| `npm run denetle` | İçerik şeması + yıllık planla tutarlılık (`icerik/` dosyası kaydedilince kendiliğinden çalışır) |
| `npm run telif` | İçeriği kitap metniyle karşılaştırır (askıda; bilgi amaçlı, zorunlu değil) |
| `npm run inceleme` | Öğretmenin okuyacağı sayfalar → `inceleme/` (git dışı; denetim temizse kendiliğinden yenilenir) |
| `npm test` | Denetim araçlarının ve uygulama çekirdeğinin (`src/cekirdek/`) testleri |
| `npm run dev` | Uygulamayı bilgisayarda açar (onaysız üniteler "taslak" etiketiyle görünür) |
| `npm run build` | Yayın derlemesi → `dist/` (yalnız `onay: true` üniteler pakete girer) |
| `npm run deneme` | Derlenmiş uygulamayı telefon boyutunda baştan sona kullanır, ekran görüntülerini `inceleme/ekranlar/` altına yazar |

- `main` dalına her gönderimde `.github/workflows/yayin.yml` denetim + test + derleme yapar ve GitHub Pages'e yayınlar.
- Her commit'ten önce `araclar/yayin-kontrol.mjs` çalışır (git kancası): `kaynak/`, `inceleme/`, PDF ya da hatalı içerik varsa commit durur.
  Depo yeniden klonlanırsa bir kez: `git config core.hooksPath araclar/git-kancalari`.
- İş akışları `.claude/skills/` altında: **unite-yaz** (yeni ünite) · **duzeltme-isle** (öğretmen düzeltmesi / onayı) · **yayinla** (commit + push).
- `.claude/agents/icerik-denetci` — içeriği öğretmene gitmeden önce bağımsız gözle inceler.
- `.claude/rules/icerik-yazimi.md` (içerik üslubu + **öğretmen kararları**) ve `.claude/rules/uygulama-kodu.md` ilgili dosyalara dokununca yüklenir.

**Sistem kendini böyle geliştirir:** aynı hata ikinci kez olmasın diye her düzeltme kalıcı bir yere yazılır —
öğretmenin içerik kararı → `icerik-yazimi.md` "Öğretmen kararları" · makinenin yakalayabileceği hata → `icerik-dogrula.mjs` + testi ·
tekrar eden iş adımı → ilgili skill · proje geneli kural → bu dosya. Bu dosya kısa tutulur; ayrıntı ilgili kural / skill dosyasına gider.
