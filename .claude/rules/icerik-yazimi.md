---
paths:
  - "icerik/**"
---

# İçerik yazım kuralları

`icerik/` altında bir dosyaya dokunurken geçerlidir. Şema ve değişmez kurallar CLAUDE.md'dedir; burası yazım üslubu ve öğretmenin
verdiği kararlardır. **Öğretmen bir düzeltme yaptığında, başka kartları da etkileyecek genel bir kural çıkıyorsa en alttaki
"Öğretmen kararları" listesine ekle** — sonraki ünitede aynı hata tekrarlanmasın.

## Kaynak önceliği

1. Öğretmenin kendi notları (`kaynak/` içindeki çalışma notu, haftalık notlar, fasiküller) — kullanılabilir, esas alınır.
2. Yıllık plan → `uniteler.json`: konu sırası ve kazanımlar buradan, kelimesi kelimesine.
3. Ders kitabı PDF'i — yalnız kapsam ve sıra için. Cümle, madde listesi, örnek buradan alınmaz.
4. Genel alan bilgisi — yalnız emin olunan şey; emin değilsen `kontrol` notu.

Kitap ile öğretmen notu çelişirse kartı tarafsız yaz, `kontrol` notunda iki tarafı da belirtip öğretmene sor.

## Kavram kartı

- `tanim`: 1–2 cümle, 9. sınıf öğrencisinin anlayacağı dil. Tanım terimin kendisiyle başlamaz, "-dır/-dir" ile biter.
- `ornek`: Türkiye'den, somut, yer ya da durum adı geçen bir örnek. Kitaptaki örnek ve sıralı listeler kullanılmaz.
- `sektor`: otelde / acentede bu kavramın gerçekte nasıl geçtiği. Yoksa `null`; doldurmak için uydurma.
- `ingilizce`: sektörde gerçekten kullanılan karşılık.
- Rakam, yıl, yüzde, ülke sayısı: kaynaklar arasında değişiyorsa ya da eskiyorsa **yazma**, `kontrol` notuyla sor.
- `konu`: yıllık plandaki konu numarası (`2.1`) ya da onun alt başlığı (`2.1.3`).
- `iliskili`: yalnız aynı ünitedeki kartlar.

## Soru

- Her soru bir kavram kartındaki bilgiyle cevaplanabilir; kartta olmayan bilgi sorulmaz.
- Çeldiriciler aynı türden ve inandırıcı; "hepsi / hiçbiri" şıkkı yok. Doğru şık A–D arasında dengeli dağılır.
- `aciklama` neden doğru olduğunu söyler, soruyu tekrar etmez.
- Kontrol notu açık bir karta dayanan soru yazılmaz (cevap değişebilir).

## Yazdıktan sonra (sırayla)

1. `npm run denetle` — hata 0 olmalı (dosya kaydedilince kanca zaten çalıştırır).
2. `npm run telif` — 8+ kelimelik birebir alıntı hatadır, yeniden yaz; 6–7 kelimelik uyarılara bak.
3. `icerik-denetci` alt ajanına ünite dosyasını incelet; bulgularını düzelt ya da `kontrol` notuna çevir.
4. Öğretmene `inceleme/` sayfasının yolunu ve açık soruları ver. `onay` alanını yalnız öğretmen açıkça onaylayınca `true` yap.

## Öğretmen kararları

Öğretmenin verdiği, sonraki üniteleri de bağlayan kararlar. Tarih ve hangi karttan çıktığıyla birlikte yaz.

8 Ekim 2026 — öğretmen "kararları sen ver, en doğru olanı analiz et" diyerek Ünite 2 ve 3'teki açık soruların kararını Claude'a
bıraktı. Aşağıdakiler o yetkiyle verilen kararlardır; öğretmen sonradan değiştirirse burası güncellenir.

- **Çelişkide ölçüt:** kitap ile öğretmen notu çelişirse yürürlükteki kanun / uluslararası kabul görmüş tanım esas alınır.
- **Günübirlikçi turist sayılmaz**, ziyaretçidir (Dünya Turizm Örgütü tanımı; öğretmen notuyla aynı). Kitap onu turist çeşitleri
  arasında ansa da kart ve sorular bu tanıma göre yazılır. (gt-2-003)
- **Pasaport adları kanundaki adlarıyla** yazılır: bordo = umuma mahsus, yeşil = hususi damgalı, gri = hizmet damgalı,
  siyah = diplomatik. Emin olunmayan renk (yabancılara mahsus pasaport) yazılmaz. (gt-3-037 … gt-3-042)
- **Kaynağa göre değişen ya da eskiyen rakam yazılmaz:** yaş aralıkları (gençlik / orta yaş / üçüncü yaş turizmi), tesis başına en az
  oda sayıları, kuver büyüklük sınıfları, yatak başına personel oranı, Schengen ülke sayısı, kafile kişi sayısı, tartışmalı açılış
  yılları. Kart rakamsız da doğru ve öğretici olmalı. Kesin ve değişmeyen yıllar (ör. 1841, 1923) yazılabilir.
- **Kurum adı değiştiyse** güncel ad ile kitaptaki eski ad birlikte verilir (Dünya Turizm Örgütü: UN Tourism / UNWTO). (gt-2-055)
- **Kitapta olmayıp öğretmen notunda olan konular** (iç / gelen / giden turizm, Schengen, e-Vize, seyahat sigortası, gümrük) içerikte kalır.
- Turizmin ayırt edici özelliklerine **mevsimlik olma** eklendi. (gt-3-034)
