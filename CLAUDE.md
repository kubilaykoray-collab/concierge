# CLAUDE.md — Turizm Ders Uygulaması

> Bu dosya her oturumda otomatik yüklenir. Öğretmen (proje sahibi) Türkçe konuşur; yanıtlar Türkçe, sade, önce sonuç.

## 1. Amaç

Meslek lisesi turizm öğrencilerinin ders çalışmasını kolaylaştıran, **ücretsiz**, telefona kurulan bir uygulama.
Sahibi: turizm / konaklama öğretmeni. Kullanıcı: öğrencileri (9. sınıftan başlayarak; çoğu Android, bir kısmı iPhone).

İlk kapsam: **9. sınıf Genel Turizm** — önce 2 ünite, öğrencilere açılır, gerisi üstüne eklenir.
Sonraki dersler (sırayla, öğretmen karar verir): Konaklama ve Seyahat Hizmetleri Atölyesi · Mesleki Gelişim Atölyesi.

## 2. Değişmez kurallar

1. **MEB ders kitabının metni ve görselleri KOPYALANMAZ** (telif). Kavramlar öğretim programındaki kazanımlara göre
   **kendi cümlelerimizle** yazılır. `kaynak/` altındaki kitap PDF'i yalnız konu sırası ve kapsam için okunur.
2. **Öğrenciden kişisel veri toplanmaz.** Giriş, hesap, isim, e-posta, analitik, çerez takibi YOK. İlerleme yalnız telefonda
   (`localStorage` / IndexedDB). Sunucu / veritabanı YOK.
3. **Reklam yok. Ücretli servis yok.** Uygulama içinde canlı yapay zekâ çağrısı YOK (her soru para; ayrıca denetimsiz içerik).
4. **İçerik öğretmen onayından geçmeden yayınlanmaz.** Her içerik dosyasında `onay: false / true` alanı; `false` olan
   yayın derlemesine girmez. Yapay zekâ hızlı yazar ama yanlış da yazar — editör öğretmendir.
5. **`kaynak/` klasörü git'e GİRMEZ** (`.gitignore`); kitap ve kişisel ders dosyaları GitHub'a yüklenmez.
6. Öğretmenin asıl ders klasörüne (`C:\Users\pc\OneDrive\Masaüstü\TURIZM OTELCILIK`) **dokunulmaz**; buradaki `kaynak/` onun kopyasıdır.
7. Bilinmeyen şey uydurulmaz: bir tanımdan emin değilsen `kontrol: "..."` notu düş, öğretmene sor.

## 3. Teknik karar

- **Telefona kurulan web uygulaması (PWA)** — mağaza yok, ücret yok, Android + iPhone aynı kod.
  Vite + React + TypeScript · `vite-plugin-pwa` (internetsiz çalışma) · yönlendirme hash tabanlı (GitHub Pages uyumlu).
- **Yayın:** GitHub Pages (ücretsiz), `gh` kurulu. Depo herkese açık olacağı için içinde yalnız kendi yazdığımız içerik bulunur.
- **İçerik = düz dosya**, kod değil: `icerik/<ders>/<unite>.json`. Uygulama derlemede bunları okur.
- Sonradan istenirse Google Play (tek sefer 25 $; Bubblewrap / TWA). App Store (yılda 99 $) planlanmıyor;
  iPhone'da Safari → Paylaş → "Ana Ekrana Ekle".
- Kurulu: git 2.55 · node 24 · gh 2.101. Paketler `npm` ile.

## 4. İçerik şeması (taslak — ilk ünitede kesinleşir)

```json
{
  "ders": "genel-turizm", "sinif": 9, "unite": 1, "baslik": "…", "onay": false,
  "kazanimlar": ["…"],
  "kavramlar": [
    { "id": "gt-1-001", "terim": "Turizm", "ingilizce": "Tourism",
      "tanim": "kendi cümlemizle, 1–2 cümle", "ornek": "sektörden somut örnek",
      "sektor": "otelde / acentede nasıl kullanılır (varsa)", "iliskili": ["gt-1-002"], "kontrol": null }
  ],
  "sorular": [
    { "id": "gt-1-s01", "tur": "coktan-secmeli", "soru": "…", "secenekler": ["…"], "dogru": 0, "aciklama": "neden" }
  ]
}
```

## 5. Ekranlar (ilk sürüm)

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
