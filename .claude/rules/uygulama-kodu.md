---
paths:
  - "src/**"
  - "index.html"
  - "vite.config.*"
  - "public/**"
---

# Uygulama kodu kuralları

- **Ağ çağrısı yok.** `fetch`, analitik, yazı tipi / betik CDN'i, üçüncü taraf gömme eklenmez. Her şey derlemeyle gelir, internetsiz çalışır.
- **Kişisel veri yok.** Giriş, isim, e-posta alanı yok. İlerleme yalnız `localStorage` / IndexedDB'de; anahtarlar tek bir modülden yönetilir.
- **Yalnız `onay: true` içerik derlemeye girer.** Bu süzme tek yerde yapılır ve testi vardır; geliştirme modunda onaysız içerik açıkça "taslak" diye işaretlenir.
- İçerik `icerik/**/*.json` dosyalarından okunur; metin koda gömülmez. Arayüz metinleri Türkçe.
- Bağımlılık eklemeden önce düşün: yavaş telefonda hızlı açılmalı. Yeni paket için gerekçeyi öğretmene tek cümleyle söyle.
- Test önce: her ekranın mantığı (kart sırası, Leitner kutuları, test puanı, arama) arayüzden ayrı, saf fonksiyon olarak yazılır ve sınanır.
- Bitti demeden önce: `npm test`, `npm run build`, `npm run deneme` (uçtan uca; dış ağ isteği ve internetsiz çalışma da burada sınanır)
  ve değişen ekranın `inceleme/ekranlar/` altındaki görüntüsüne gözle bak. Yeni ekran ya da akış eklenince denemeye adımı da eklenir.
- Yapı: `src/cekirdek/` saf mantık + testleri · `src/ekranlar/` ekranlar · `src/bilesenler.tsx` ortak parçalar · `src/stil.css` tek stil dosyası
  (renkler `:root` değişkenleri; aydınlık ve karanlık birlikte güncellenir) · `src/depo.ts` ilerleme kaydı ve yönlendirme.
- Türkçe arama: büyük/küçük harf için `toLocaleLowerCase("tr")` (İ/ı sorunu).
