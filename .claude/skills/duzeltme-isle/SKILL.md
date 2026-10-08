---
name: duzeltme-isle
description: Öğretmenin bir ünite için yazdığı düzeltmeleri, açık soruların cevaplarını ya da onayını içerik dosyasına işler. Öğretmen "şu kartı değiştir", "7. soruyu çıkar", "günübirlikçi turist sayılmaz", "ünite 2 tamam, onaylıyorum" gibi içerik geri bildirimi verdiğinde kullan.
---

# Düzeltme işle

Öğretmen düz yazıyla konuşur; kart ve soruları inceleme sayfasındaki **sıra numarasıyla** ("Ünite 3, 12. kart") ya da terim adıyla söyler.
Sıra numarası = dosyadaki dizideki sıra (1'den başlar). Emin değilsen terimi geri okuyup doğrulat.

1. **Eşle.** Her düzeltmeyi bir kavram ya da soru `id`'sine bağla. Birden fazla yere uyan ya da anlaşılmayan düzeltmeyi sor; tahmin etme.
2. **İşle.**
   - Metin değişikliği: öğretmenin cümlesini aynen kullan (yazım hatası dışında düzeltme).
   - Açık soru cevaplandıysa: kartı cevaba göre yaz, `kontrol` → `null`.
   - Kart / soru silme: `id`'ler yeniden numaralanmaz; silinen karta `iliskili` ile bağlananları temizle, o karta dayanan soruları öğretmene bildir.
   - Bir kart değişince ona dayanan soruların cevabı ve açıklaması hâlâ doğru mu diye bak.
3. **Genelle.** Düzeltme başka kartları da etkileyen bir karar ise (ör. "çelişkide benim notum geçerli", "rakam yazma")
   `.claude/rules/icerik-yazimi.md` → "Öğretmen kararları" listesine tarihle ekle ve aynı durumu taşıyan diğer kartları da düzelt.
4. **Denetle.** `npm run denetle` ve `npm run telif` → 0 hata.
5. **Onay.** `onay: true` yalnız şu üçü birlikte sağlanınca: öğretmen o ünite için açıkça onay verdi · açık `kontrol` notu kalmadı ·
   denetim temiz. Not kaldıysa onaylamadan önce kalan soruları sor.
6. **Rapor.** Ne değişti (kart / soru adıyla), kalan açık soru sayısı, yenilenen inceleme sayfasının yolu.
