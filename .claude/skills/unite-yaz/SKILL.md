---
name: unite-yaz
description: Yeni bir ünitenin içerik dosyasını (kavram kartları + test soruları) baştan yazar ve öğretmenin incelemesine hazırlar. Öğretmen "ünite 4'ü yaz", "sıradaki üniteyi hazırla", "yeni ders ekle" dediğinde kullan.
argument-hint: "<ders> <ünite no>  (örn. genel-turizm 4)"
---

# Ünite yaz

Hedef: `icerik/<ders>/unite-<N>.json` — denetimden ve bağımsız incelemeden geçmiş, öğretmenin okuyacağı sayfası hazır.

İstek: $ARGUMENTS (boşsa `uniteler.json` içinde dosyası henüz olmayan ilk üniteyi öner ve öğretmene sor).

1. **Kapsam.** `icerik/<ders>/uniteler.json` içinden ünitenin konularını ve kazanımlarını al. Ders yeni ise önce `kaynak/` içindeki
   yıllık plandan `uniteler.json` dosyasını çıkar ve ünite listesini öğretmene onaylat.
2. **Kaynak.** `kaynak/` altında bu üniteyle ilgili öğretmen notlarını bul ve oku (esas kaynak). Kitap PDF'inden yalnız alt başlıkların
   sırasına bak: `pdftotext -f <ilk> -l <son> -enc UTF-8 "kaynak/<kitap>.pdf" -`. Kitap cümlelerini önüne alıp yeniden yazma;
   başlık listesini çıkar, kitabı kapat, kartları kendi bilginle ve öğretmen notundan yaz.
3. **Yaz.** `.claude/rules/icerik-yazimi.md` kurallarına ve oradaki öğretmen kararlarına uy. Mevcut onaylı bir üniteyi üslup örneği al.
   Ünite başına 30–60 kart, 18–24 bilgi sorusu, 5–8 senaryo, bir `soz` ve 2–7 kartlık `dersler`.
   Öğretmen yetki verdiyse emin olunmayan bilgi yazılmaz (kontrol notu bırakılmaz); vermediyse `kontrol` notu düşülür.
4. **Denetle.** `npm run denetle` → o dosya için 0 hata, 0 uyarı.
5. **Bağımsız inceleme.** Yazan ajandan AYRI bir ajan dosyayı kaynaklarla karşılaştırıp denetler ve düzeltir (yalnız rapor isteniyorsa
   `icerik-denetci`). Güvenlik / sağlık / mevzuat içeren ünitelerde bu adım atlanmaz. Düzeltmeden sonra 4. adımı yinele.
   Birden çok ünite yazılacaksa her ünite ayrı ajana verilir (aynı anda çalışabilirler; her biri yalnız kendi dosyasına dokunur).
6. **Öğretmene rapor** (kısa, Türkçe, teknik terimsiz): kaç kart / soru, `inceleme/<ders>-unite-<N>.html` yolu, açık soruların listesi,
   kitapta olmayıp notlardan aldıkların, bilerek yazmadığın rakamlar. `onay` alanına dokunma.
