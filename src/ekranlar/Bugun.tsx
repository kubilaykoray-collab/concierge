import { Cubuk, dakika, Simge } from "../bilesenler";
import { rutbe, seri } from "../cekirdek/ilerleme";
import { bugun, USTA_KUTU, vadesiGelenler } from "../cekirdek/leitner";
import { rozetler } from "../cekirdek/rozetler";
import { DERS_CIZIMI, KoseSusu, OtelCizimi } from "../cizimler";
import { useIlerleme } from "../depo";
import { DERS_LISTESI, DERSLER, gorselAdresi, GUNCEL_KAVRAMLAR as KAVRAMLAR, GUNCEL_UNITELER as UNITELER, kavramBul } from "../veri";

// Günün yeri: Türkiye'nin turistik merkezlerinden, tercihen fotoğraflı bir kart. Keşfetme isteği uyandırmak için.
function gununYeri(gun: string) {
  const yerler = KAVRAMLAR.filter((k) => k.unite.ders === "genel-turizm-2026" && k.unite.no === 3 && /^3\.[23]/.test(k.konu));
  if (yerler.length === 0) return undefined;
  const fotografli = yerler.filter((k) => k.gorsel);
  const havuz = fotografli.length >= 10 ? fotografli : yerler;
  const sayi = [...gun].reduce((t, h) => (t * 41 + h.charCodeAt(0)) % 99989, 13);
  return havuz[sayi % havuz.length];
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// Her gün herkese aynı kavram: tarihten türetilir, rastgele değildir.
function gununKavrami(gun: string) {
  if (KAVRAMLAR.length === 0) return undefined;
  const sayi = [...gun].reduce((t, h) => (t * 31 + h.charCodeAt(0)) % 100003, 7);
  return KAVRAMLAR[sayi % KAVRAMLAR.length];
}

// Günün vakası da tarihten türetilir; her gün başka bir ünitenin sahnesi öne çıkar.
function gununVakasi(gun: string) {
  const hepsi = UNITELER.flatMap((u) => u.vakalar.map((v) => ({ unite: u, vaka: v })));
  if (hepsi.length === 0) return undefined;
  const sayi = [...gun].reduce((t, h) => (t * 37 + h.charCodeAt(0)) % 99991, 11);
  return hepsi[sayi % hepsi.length];
}

export function Bugun() {
  const ilerleme = useIlerleme();
  const gun = bugun();
  const simdi = new Date();
  const r = rutbe(ilerleme.puan);
  const vadeli = vadesiGelenler(ilerleme.kartlar, gun).filter((id) => kavramBul(id));
  const bitmemis = DERSLER.filter((d) => !ilerleme.dersler[d.ders.anahtar]);
  // Öğrenci en son hangi dersi çalıştıysa oradan devam eder.
  const siradaki = bitmemis.find((d) => d.unite.ders === ilerleme.sonDers) ?? bitmemis[0];
  const guncelKimlikler = new Set(KAVRAMLAR.map((k) => k.id));
  const ogrenilen = Object.keys(ilerleme.kartlar).filter((id) => guncelKimlikler.has(id)).length;
  const usta = Object.entries(ilerleme.kartlar).filter(([id, k]) => guncelKimlikler.has(id) && k.kutu >= USTA_KUTU).length;
  const gunSerisi = seri(ilerleme.gunler, gun);
  const kavram = gununKavrami(gun);
  const vaka = gununVakasi(gun);
  const yer = gununYeri(gun);
  const yeni = ogrenilen === 0;
  const bugunCalisti = ilerleme.gunler.includes(gun);
  const rozetListesi = rozetler(ilerleme, gun, UNITELER.map((u) => ({ anahtar: u.anahtar, dersler: u.dersler.map((d) => d.anahtar) })), (id) => guncelKimlikler.has(id));
  const kazanilanRozet = rozetListesi.filter((r) => r.kazanildi).length;
  const siradakiRozet = rozetListesi.filter((r) => !r.kazanildi).sort((a, b) => b.oran - a.oran)[0];

  return (
    <>
      <header className="vitrin">
        <OtelCizimi className="vitrin-cizim" />
        <div className="marka">
          <Simge ad="anahtarlar" boyut={30} />
          <div>
            <strong lang="en">CONCIERGE</strong>
            <span lang="en">HOSPITALITY ACADEMY</span>
          </div>
        </div>
        <p className="ust-etiket">{GUNLER[simdi.getDay()]} · {simdi.getDate()} {AYLAR[simdi.getMonth()]}</p>
        <h1>{yeni ? "Hoş geldin, meslektaş." : gunSerisi > 1 ? `${gunSerisi} gündür buradasın.` : "Tekrar hoş geldin."}</h1>
        <p className="vitrin-alt">{yeni ? "Otelciliğin dilini ilk dersten itibaren bir profesyonel gibi öğreneceksin." : r.soz}</p>
        {!yeni && (
          <p className="vitrin-not">
            <Simge ad={bugunCalisti ? "tik" : "alev"} boyut={15} />
            {bugunCalisti ? "Bugünkü çalışman tamam; fazlası bonus." : gunSerisi > 0 ? `${gunSerisi} günlük serini korumak için bugün bir ders yeter.` : "Bugün bir dersle yeniden başla; seri yeniden sayılır."}
          </p>
        )}
        <a className="rutbe-seridi" href="#/ilerleme">
          <div>
            <span className="ust-etiket">Unvanın</span>
            <strong>{r.ad}</strong>
          </div>
          <div className="rutbe-sag">
            <span>{ilerleme.puan} puan{r.sonraki ? ` · ${r.sonraki} için ${r.kalan}` : ""}</span>
            <Cubuk oran={r.oran} />
          </div>
        </a>
      </header>

      {yeni && (
        <section className="nasil" aria-label="Nasıl çalışır">
          <div className="nasil-adim"><span>1</span><strong>Öğren</strong><small>3–5 dakikalık dersler, her kartta bir kavram</small></div>
          <div className="nasil-adim"><span>2</span><strong>Hatırla</strong><small>Unutmak üzereyken uygulama sana sorar</small></div>
          <div className="nasil-adim"><span>3</span><strong>Sına</strong><small>Vakalarda kararı sen ver, testle sertifika al</small></div>
        </section>
      )}

      {vadeli.length > 0 && (
        <a className="one-cikan" href="#/tekrar">
          <KoseSusu className="kose-susu" />
          <span className="ust-etiket">Günün tekrarı</span>
          <h2>{vadeli.length} kavram seni bekliyor</h2>
          <p>Unutmaya başlamadan hemen önce hatırlamak, kalıcı öğrenmenin en kısa yolu.</p>
          <span className="one-cikan-dugme">Tekrara başla <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      {siradaki && (
        <a className={vadeli.length > 0 ? "ders-oneri" : "one-cikan"} href={`#/ders/${siradaki.ders.anahtar}`}>
          {vadeli.length === 0 && <KoseSusu className="kose-susu" />}
          <span className="ust-etiket">{yeni ? "İlk dersin" : "Sıradaki ders"} · {siradaki.unite.baslik}</span>
          <h2>{siradaki.ders.baslik}</h2>
          <p>{siradaki.ders.kavramlar.length} kavram · yaklaşık {dakika(siradaki.ders.kavramlar.length)} dakika</p>
          <span className="one-cikan-dugme">Derse başla <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      {!siradaki && vadeli.length === 0 && DERSLER.length > 0 && (
        <a className="one-cikan" href="#/tekrar/serbest">
          <KoseSusu className="kose-susu" />
          <span className="ust-etiket">Bugünlük tamam</span>
          <h2>Bütün dersleri bitirdin</h2>
          <p>Tekrar günü gelen kart yok. İstersen serbest tekrarla formunu koru.</p>
          <span className="one-cikan-dugme">Serbest tekrar <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      <section className="sayilar">
        <div><Simge ad="alev" /><strong>{gunSerisi}</strong><span>gün seri</span></div>
        <div><Simge ad="kitap" /><strong>{ogrenilen}</strong><span>öğrenilen</span></div>
        <div><Simge ad="yildiz" /><strong>{usta}</strong><span>ustalaşılan</span></div>
      </section>

      <a className="rozet-seridi" href="#/ilerleme">
        <Simge ad="anahtarlar" boyut={22} />
        <div className="satir-govde">
          <strong>Rozetler · {kazanilanRozet}/{rozetListesi.length}</strong>
          {siradakiRozet && <span>Sıradaki: {siradakiRozet.ad} · {siradakiRozet.aciklama}</span>}
        </div>
        <Simge ad="ok" boyut={18} />
      </a>

      {yer && (
        <section>
          <h3 className="bolum-basligi">Günün yeri</h3>
          <a className="gunun-yeri" href={`#/sozluk/${yer.id}`}>
            {yer.gorsel && <img src={gorselAdresi(yer.gorsel)} alt="" loading="lazy" width={720} height={446} />}
            <div className="gunun-yeri-govde">
              <span className="ust-etiket">Türkiye'yi keşfet</span>
              <h4>{yer.terim}</h4>
              <p>{yer.tanim}</p>
            </div>
          </a>
        </section>
      )}

      <section>
        <h3 className="bolum-basligi">Dersler</h3>
        <div className="ders-kartlari">
          {DERS_LISTESI.map((d) => {
            const Cizim = DERS_CIZIMI[d.ders] ?? OtelCizimi;
            const toplam = d.uniteler.reduce((t, u) => t + u.dersler.length, 0);
            const biten = d.uniteler.reduce((t, u) => t + u.dersler.filter((x) => ilerleme.dersler[x.anahtar]).length, 0);
            return (
              <a key={d.ders} className="ders-karti" href={`#/dersler/${d.ders}`}>
                <Cizim className="ders-karti-cizim" />
                <span className="ust-etiket">{d.sinif}. sınıf · {d.uniteler.length} ünite</span>
                <strong>{d.ad}</strong>
                <Cubuk oran={toplam ? biten / toplam : 0} />
                <span className="ders-karti-alt">{biten === 0 ? `${toplam} ders seni bekliyor` : `${biten}/${toplam} ders tamamlandı`}</span>
              </a>
            );
          })}
        </div>
      </section>

      {vaka && (
        <section>
          <h3 className="bolum-basligi">Günün vakası</h3>
          <a className="gunun-vakasi" href={`#/vaka/${vaka.unite.anahtar}`}>
            <span className="ust-etiket"><Simge ad="zil" boyut={14} /> {vaka.unite.baslik}</span>
            <p>{vaka.vaka.durum}</p>
            <strong>{vaka.vaka.soru} <Simge ad="ok" boyut={16} /></strong>
          </a>
        </section>
      )}

      {kavram && (
        <section>
          <h3 className="bolum-basligi">Günün kavramı</h3>
          <a className="gunun-kavrami" href={`#/sozluk/${kavram.id}`}>
            <p className="kavram-ingilizce">{kavram.ingilizce}</p>
            <h4>{kavram.terim}</h4>
            <p>{kavram.tanim}</p>
          </a>
        </section>
      )}
    </>
  );
}
