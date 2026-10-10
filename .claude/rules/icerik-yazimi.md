---
paths:
  - "icerik/**"
---

# İçerik yazım kuralları

`icerik/` altında bir dosyaya dokunurken geçerlidir. Şema ve değişmez kurallar CLAUDE.md'dedir; burası yazım üslubu ve öğretmenin
verdiği kararlardır. **Öğretmen bir düzeltme yaptığında, başka kartları da etkileyecek genel bir kural çıkıyorsa en alttaki
"Öğretmen kararları" listesine ekle** — sonraki ünitede aynı hata tekrarlanmasın.

## Kaynak önceliği

1. Öğretmenin kendi notları (`kaynak/` içindeki çalışma notları, sınav notları, fasiküller, manifesto) — esas alınır; üslup da buradan gelir.
2. Yıllık plan → `uniteler.json`: konu sırası ve kazanımlar buradan, kelimesi kelimesine.
3. Ders kitabı — bilgi ve kapsam kaynağı. Bilgisi kullanılır, cümlesi yapıştırılmaz: kart kendi cümlemizle, daha kısa ve daha açık yazılır.
4. Genel alan bilgisi — yalnız emin olunan şey; emin değilsen `kontrol` notu.

Kitap ile öğretmen notu çelişirse yürürlükteki mevzuat / uluslararası kabul görmüş tanım esas alınır; ikisi de yoksa öğretmen notu.

## Üslup: EHL kafası

Öğretmenin hedefi sıradan ders notu değil, öğrenciye meslek gururu veren bir anlatım (bkz. `kaynak/KSHA/EHL_Manifesto.md`).

- Öğrenciye geleceğin profesyoneli gibi hitap et. "Temizlikçi" değil "varlığı koruyan kişi"; "kural" değil "standart".
- Her kavramın **neden** önemli olduğu `sektor` alanında görünsün: konuk ne hisseder, otel ne kazanır ya da kaybeder.
- `ornek` küçük bir sahne olsun: saat, yer, kişi. "Sabah 07.00, resepsiyonda…" gibi. Soyut tür listesi örnek değildir.
- `soz`: üniteyi tek cümlede özetleyen, akılda kalan bir vuruş cümlesi (ör. "Konuk fark ederse, biz başarısız olduk.").
- Abartma ve uydurma yok: gerçek olmayan otel hikâyesi, uydurma rakam, kaynağı belirsiz istatistik yazılmaz.
- Sektörde İngilizcesiyle kullanılan terimi İngilizcesiyle öğret (check-in, housekeeping, lost & found, bellboy, wake-up call).

## Kavram kartı

- `tanim`: 1–2 cümle, 9. sınıf öğrencisinin anlayacağı dil. Tanım terimin kendisiyle başlamaz, "-dır/-dir" ile biter.
- `ornek`: Türkiye'den, somut, yer ya da durum adı geçen bir örnek. Kitaptaki örnek ve sıralı listeler kullanılmaz.
- `sektor`: otelde / acentede bu kavramın gerçekte nasıl geçtiği. Yoksa `null`; doldurmak için uydurma.
- `ingilizce`: sektörde gerçekten kullanılan karşılık.
- Rakam, yıl, yüzde, ülke sayısı: kaynaklar arasında değişiyorsa ya da eskiyorsa **yazma**, `kontrol` notuyla sor.
- `konu`: yıllık plandaki konu numarası (`2.1`) ya da onun alt başlığı (`2.1.3`).
- Kart sayısı konunun genişliğine göre: ünite başına 30–60. Öğrencinin bilmesi gereken her kavram, araç, form, unvan ve işlem adımı bir kart.
- `iliskili`: yalnız aynı ünitedeki kartlar.

## Dersler

`dersler` üniteyi 2–7 kartlık, tek oturuşta biten (3–5 dakika) parçalara böler. Kartlar derste okunacağı sırayla dizilir: önce çatı
kavram, sonra parçaları. Ders başlığı kısa ve merak uyandırıcı olur ("Asansörde Kim Önce Biner?").

## Soru

- Her soru bir kavram kartındaki bilgiyle cevaplanabilir; kartta olmayan bilgi sorulmaz.
- Çeldiriciler aynı türden ve inandırıcı; "hepsi / hiçbiri" şıkkı yok. Doğru şık A–D arasında dengeli dağılır.
- `aciklama` neden doğru olduğunu söyler, soruyu tekrar etmez.
- Kontrol notu açık bir karta dayanan soru yazılmaz (cevap değişebilir).
- Ünite başına 18–24 bilgi sorusu (çoğu `coktan-secmeli`, 3–5 `dogru-yanlis`; doğru-yanlışların yarısı yanlış önerme olsun).

## Senaryo (vaka)

Ünite başına 5–8 `senaryo` sorusu. Öğrenci kendini otelde bulur ve karar verir.

- `durum`: 2–4 cümlelik sahne — saat, yer, konuk, sorun. İkinci tekil şahıs: "Gece vardiyasındasın…".
- `soru`: "Ne yaparsın?", "İlk adımın ne olur?", "Hangisi doğru davranıştır?".
- Dört şık da bir personelin gerçekten yapabileceği şeyler olsun; yanlış şıklar yaygın hataları temsil etsin (acele etmek, sorumluluğu
  atmak, prosedürü atlamak, konukla tartışmak). Doğru şık en uzun şık olmasın.
- `aciklama`: doğru davranışın **nedenini** ve yanlışların neden sorun olduğunu söyler; kartlardaki bilgiye dayanır.

## Yazdıktan sonra (sırayla)

1. `npm run denetle` — hata 0 olmalı (dosya kaydedilince kanca zaten çalıştırır).
2. `icerik-denetci` alt ajanına ünite dosyasını incelet; bulgularını düzelt ya da `kontrol` notuna çevir.
3. Öğretmen yetki verdiyse (CLAUDE.md §1 "Yetki") denetimden geçen üniteyi `onay: true` yap; verdiğin kararları raporla.
   Yetki yoksa `inceleme/` sayfasının yolunu ve açık soruları ver, onayı bekle.

## Öğretmenin sözlüğünden gelen kartlar (`kaynak/claude-projesi/veri/kavramlar-*.json`)

Öğretmenin claude.ai projesinde hazırladığı kavram sözlükleri doğrudan kart kaynağıdır. Bu kartlarda `terim`, `ingilizce`, `tanim` AYNEN
alınır (tanım biçimi kuralları — tek cümle, "-dır" bitişi — bunlara uygulanmaz); `ornek`, `sektor`, `iliskili`, `gorsel` bizde yazılır.
Tanım olgu olarak yanlış görünüyorsa değiştirilmez, `kontrol` notu düşülür. `kitap_disi: true` olanlar `kitapDisi: true` olur.

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
- **İstisna — öğretmenin sınav notunda vurguladığı rakam yazılır** (8 Ekim 2026, otelcilik dersi yazılırken): öğretmenin kendi çalışma /
  sınav notunda ya da quiz dosyasında açıkça geçen ve sınavda sorduğu rakam (ör. bulunan eşyanın bekleme süresi, gençlik kulübü yaş
  aralığı, telefonu kaçıncı çalışta açma) karta "genellikle" kaydıyla yazılır ve sorusu sorulabilir. Kitapla öğretmen notu aynı rakamda
  çelişiyorsa öğretmen notu geçer; yalnız kitapta geçen ve işletmeye göre değişen rakam yine yazılmaz.
- **Güvenlik ve ilk yardımda güncel doğru bilgi esas alınır** (otelcilik Ünite 6): kitapta ve öğretmenin sınav notunda geçen "yanığa su
  ile müdahale edilmez, yanık kremi sürülür" ve "elektrik yangınına köpük" ifadeleri güncel ilk yardım / yangın bilgisiyle çeliştiği
  için karta yazılmadı ve sorulmadı. Çerçeve: önce can güvenliği, eğitimli kişi müdahale eder, 112 aranır, amire haber verilir.
  Öğretmen aksini isterse kendi kararıyla ekletir.
- **Öğretmenin iki notu birbiriyle çelişirse** sınav notu (en güncel "FINAL" dosya) geçer; çelişki öğretmene raporlanır
  (ör. kayıp eşya bekleme süresi 90 gün / quiz'de 1 yıl; bez renk kodunda mavi–yeşil; kodlama tablosunda L ve J harfleri).
- **Kalıcı tercihler (9 Ekim 2026, Claude projesinden aktarıldı):** doğruluğundan emin olunmayan bilgi eklenmez · her kavramın
  İngilizcesi İngiliz (British) yazımıyla verilir, Türkçe harflerle okunuş yazılmaz · MEB içeriğine uluslararası otelcilik terimleri
  `kitapDisi` etiketiyle eklenir · kilit kavramlar lisanslı ve künyeli fotoğrafla desteklenir (`gorsel`) · görünüm EHL kalitesinde ·
  teslimden önce baştan sona hata kontrolü.
- **Müfredat 2026-2027'ye göredir:** yeni Maarif Modeli kitapları esas alınır; eski müfredat içeriği arşivdir. Mesleki Gelişim Atölyesi'nin
  kitabı elde yok: yalnız öğretim programındaki anahtar kavramlar ve genel kabul görmüş bilgi yazılır.
- **Kurum adı değiştiyse** güncel ad ile kitaptaki eski ad birlikte verilir (Dünya Turizm Örgütü: UN Tourism / UNWTO). (gt-2-055)
- **Kitapta olmayıp öğretmen notunda olan konular** (iç / gelen / giden turizm, Schengen, e-Vize, seyahat sigortası, gümrük) içerikte kalır.
- Turizmin ayırt edici özelliklerine **mevsimlik olma** eklendi. (gt-3-034)
- **Kalan 15 ünitenin yazımında verilen kararlar (9–10 Ekim 2026; öğretmen "tam yetki ve kontrol için onay veriyorum" dedi):**
  aynı dersin iki biriminde aynı adlı kart olmaz, sonraki birimdeki kart konuya özgü adla yazılır ("Pas anahtarı güvenliği", "Acente
  rezervasyon memuru"); farklı derslerde aynı terim olabilir ama tanımlar çelişmez · atık kutusu rengi yazılmaz (kitap metninde renk kodu
  yok, kurumdan kuruma değişir) · bez renk kodunda yalnız kırmızı = tuvalet ve sarı = lavabo / banyo kesin yazılır, mavi / yeşil "işletmeye
  göre değişir" · bulunan eşya "genellikle 90 gün" (öğretmenin FINAL notu; kitap 6 ay / 1 yıl der) · gençlik kulübü "genellikle 11–18",
  çocuk kulübü "genellikle 12 yaşına kadar" (öğretmen notu; sınav notunda çocuk 0–11 de geçiyor) · çalışma süresi rakamları (45 saat, 11
  saat, gece 7,5 saat) kitapta geçtiği için "yetişkin çalışanlar için" kaydıyla yazılır · çocuk yalnız kayıt formunda yazılı veliye /
  yetkili kişiye teslim edilir · double = tek büyük yatak, twin = iki ayrı yatak (kitap ve uluslararası kullanım; öğretmenin eski notu
  farklı) · B ve C grubu acente Genel Turizm 2'de yazılmadı (kitabın o bölümünde yok, öğretmen notları tutarsız); Otelcilik 4'te kitaptaki
  biçimiyle var · Mesleki Gelişim'de kanun adı / numarası dışında oran, tutar, süre, ceza yazılmaz; finans örneklerindeki rakamlar yuvarlak
  ve zamandan bağımsızdır · Yeşil Yıldız, Mavi Bayrak, Yeşil Anahtar yalnız ne olduklarıyla anlatılır (ölçüt, sayı, yıl yok).
- **2026-2027 ilk beş ünitenin denetiminde verilen kararlar (9 Ekim 2026):** öğretmenin sözlüğündeki tanım kitapla ya da güncel bilgiyle
  tam örtüşmüyorsa tanım aynen kalır, fark `sektor` notunda "ders kitabında … diye geçer; …" biçiminde açıklanır (1883 demir yolu, MÖ 4000
  tekerlek, lisanslı acente, portör muayenesi, enfeksiyon hastalığı, üniforma "belirlediği tip") · aynı terim iki birimde farklı tanımla
  yer almaz; ikincisi konuya özgü adla anılır ("İletişimde ilk izlenim") · Ahilik tarihi gibi kaynağı tartışmalı konularda kesin hüküm
  yerine "kabul edilir / anlatılır" · vakalarda doğru şık stajyeri arkadaşıyla yüzleşmeye ya da kendi başına soruşturmaya itmez: dürüst
  davranır ve amirine bildirir · Genel Turizm 1.5'te kitapta olmayan "çevresel / olumsuz etki" başlığı açılmadı.
