---
name: yayinla
description: Değişiklikleri git'e kaydeder ve GitHub'a gönderir. Yalnız öğretmen açıkça "yayınla", "kaydet ve gönder", "GitHub'a yükle" dediğinde kullan; kendi kararınla çalıştırma.
---

# Yayınla

1. **Kontrol.** Sırayla çalıştır, biri başarısızsa dur ve öğretmene düz Türkçeyle söyle:
   `npm test` · `npm run denetle` · `npm run telif` · (uygulama varsa) `npm run build`.
2. **Ne gidiyor.** `git status --short` çıktısını oku. `kaynak/`, `inceleme/`, PDF, `.env` görünüyorsa dur. Öğretmene gidecek
   değişiklikleri bir iki cümleyle özetle (dosya adı değil, anlamı: "Ünite 2'de 6 kart düzeltildi").
3. **Kaydet.** Dosyaları adıyla ekle (`git add -A` yok), Türkçe ve kısa bir commit mesajı yaz. Commit sırasında
   `araclar/yayin-kontrol.mjs` otomatik çalışır; durdurursa nedenini düzelt, `--no-verify` kullanma.
4. **Gönder.**
   - GitHub deposu yoksa (`git remote` boş): önce öğretmene depo adını ve **herkese açık** olacağını söyle, onayını al;
     sonra `gh repo create`. Depo açıldıktan sonra geri alınması zordur.
   - Depo varsa: `git push`.
5. **Yayın sürümü** (5. aşamadan sonra): Pages derlemesinin bittiğini `gh run watch` ile bekle, yayın adresini aç ve
   yeni içeriğin göründüğünü doğrula. Yalnız `onay: true` üniteler görünmeli.
6. **Rapor.** Ne yayınlandı, adres, öğrencinin telefonunda güncellemenin nasıl geleceği.
