import { Cubuk, dakika, Madalyon, Simge } from "../bilesenler";
import { rutbe, seri } from "../cekirdek/ilerleme";
import { bugun, USTA_KUTU, vadesiGelenler } from "../cekirdek/leitner";
import { useIlerleme } from "../depo";
import { DERSLER, kavramBul, KAVRAMLAR, UNITELER } from "../veri";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// Her gün herkese aynı kavram: tarihten türetilir, rastgele değildir.
function gununKavrami(gun: string) {
  if (KAVRAMLAR.length === 0) return undefined;
  const sayi = [...gun].reduce((t, h) => (t * 31 + h.charCodeAt(0)) % 100003, 7);
  return KAVRAMLAR[sayi % KAVRAMLAR.length];
}

export function Bugun() {
  const ilerleme = useIlerleme();
  const gun = bugun();
  const simdi = new Date();
  const r = rutbe(ilerleme.puan);
  const vadeli = vadesiGelenler(ilerleme.kartlar, gun).filter((id) => kavramBul(id));
  const siradaki = DERSLER.find((d) => !ilerleme.dersler[d.ders.anahtar]);
  const ogrenilen = Object.keys(ilerleme.kartlar).filter((id) => kavramBul(id)).length;
  const usta = Object.entries(ilerleme.kartlar).filter(([id, k]) => kavramBul(id) && k.kutu >= USTA_KUTU).length;
  const gunSerisi = seri(ilerleme.gunler, gun);
  const kavram = gununKavrami(gun);
  const yeni = ogrenilen === 0;

  return (
    <>
      <header className="marka">
        <div className="marka-logo"><Simge ad="zil" boyut={20} /></div>
        <div>
          <strong>Lobi</strong>
          <span>Turizm Akademisi</span>
        </div>
      </header>

      <section className="karsilama">
        <p className="ust-etiket">{GUNLER[simdi.getDay()]} · {simdi.getDate()} {AYLAR[simdi.getMonth()]}</p>
        <h1>{yeni ? "Hoş geldin, meslektaş." : gunSerisi > 1 ? `${gunSerisi} gündür buradasın.` : "Tekrar hoş geldin."}</h1>
        <p className="karsilama-alt">
          {yeni ? "Turizmin dilini ilk dersten itibaren bir profesyonel gibi öğreneceksin." : r.soz}
        </p>
      </section>

      <a className="rutbe-karti" href="#/ilerleme">
        <div className="rutbe-ust">
          <span className="ust-etiket">Unvanın</span>
          <span className="rutbe-puan">{ilerleme.puan} puan</span>
        </div>
        <strong>{r.ad}</strong>
        <Cubuk oran={r.oran} />
        <span className="rutbe-alt">{r.sonraki ? `${r.sonraki} olmana ${r.kalan} puan kaldı` : "Kariyerin zirvesindesin."}</span>
      </a>

      {vadeli.length > 0 && (
        <a className="one-cikan" href="#/tekrar">
          <span className="ust-etiket">Günün tekrarı</span>
          <h2>{vadeli.length} kavram seni bekliyor</h2>
          <p>Unutmaya başlamadan hemen önce hatırlamak, kalıcı öğrenmenin en kısa yolu.</p>
          <span className="one-cikan-dugme">Tekrara başla <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      {siradaki && (
        <a className={vadeli.length > 0 ? "ders-oneri" : "one-cikan"} href={`#/ders/${siradaki.ders.anahtar}`}>
          <span className="ust-etiket">{yeni ? "İlk dersin" : "Sıradaki ders"} · Ünite {siradaki.unite.no}</span>
          <h2>{siradaki.ders.baslik}</h2>
          <p>{siradaki.ders.kavramlar.length} kavram · yaklaşık {dakika(siradaki.ders.kavramlar.length)} dakika</p>
          <span className="one-cikan-dugme">Derse başla <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      {!siradaki && vadeli.length === 0 && UNITELER.length > 0 && (
        <a className="one-cikan" href="#/tekrar/serbest">
          <span className="ust-etiket">Bugünlük tamam</span>
          <h2>Bütün dersleri bitirdin</h2>
          <p>Tekrar günü gelen kart yok. İstersen serbest tekrarla formunu koru.</p>
          <span className="one-cikan-dugme">Serbest tekrar <Simge ad="ok" boyut={18} /></span>
        </a>
      )}

      <section className="sayilar">
        <div><Simge ad="alev" /><strong>{gunSerisi}</strong><span>gün seri</span></div>
        <div><Simge ad="kitap" /><strong>{ogrenilen}<small>/{KAVRAMLAR.length}</small></strong><span>öğrenilen</span></div>
        <div><Simge ad="yildiz" /><strong>{usta}</strong><span>ustalaşılan</span></div>
      </section>

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

      <section>
        <h3 className="bolum-basligi">Üniteler</h3>
        <div className="liste">
          {UNITELER.map((u) => {
            const biten = u.dersler.filter((d) => ilerleme.dersler[d.anahtar]).length;
            return (
              <a key={u.anahtar} className="satir" href={`#/unite/${u.anahtar}`}>
                <Madalyon no={u.no} oran={biten / u.dersler.length} boyut={52} />
                <div className="satir-govde">
                  <strong>{u.baslik}</strong>
                  <span>{biten}/{u.dersler.length} ders · {u.kavramlar.length} kavram</span>
                </div>
                <Simge ad="ok" boyut={18} />
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
