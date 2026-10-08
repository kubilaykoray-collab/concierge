import { BosDurum, dakika, Madalyon, romen, Simge } from "../bilesenler";
import { GECME_NOTU } from "../cekirdek/ilerleme";
import { useIlerleme } from "../depo";
import { uniteBul, UNITELER } from "../veri";

export function Dersler() {
  const ilerleme = useIlerleme();
  const dersler = [...new Set(UNITELER.map((u) => u.ders))];

  if (UNITELER.length === 0) return <BosDurum baslik="Henüz yayınlanmış ünite yok" metin="Öğretmenin onayladığı üniteler burada görünecek." />;

  return (
    <>
      <header className="sayfa-basligi">
        <p className="ust-etiket">Müfredat</p>
        <h1>Dersler</h1>
      </header>
      {dersler.map((ders) => {
        const uniteler = UNITELER.filter((u) => u.ders === ders);
        return (
          <section key={ders}>
            <h3 className="bolum-basligi">{uniteler[0].dersAdi} · {uniteler[0].sinif}. sınıf</h3>
            <div className="unite-kartlari">
              {uniteler.map((u) => {
                const biten = u.dersler.filter((d) => ilerleme.dersler[d.anahtar]).length;
                const test = ilerleme.testler[u.anahtar];
                return (
                  <a key={u.anahtar} className="unite-karti" href={`#/unite/${u.anahtar}`}>
                    <Madalyon no={u.no} oran={biten / u.dersler.length} boyut={72} />
                    <div className="satir-govde">
                      <span className="ust-etiket">Ünite {romen(u.no)}{u.taslak ? " · taslak" : ""}</span>
                      <strong>{u.baslik}</strong>
                      <span>{u.dersler.length} ders · {u.kavramlar.length} kavram · {u.sorular.length} soruluk test</span>
                      <span className="unite-durum">
                        {biten === 0 ? "Başlanmadı" : biten === u.dersler.length ? "Dersler tamamlandı" : `${biten}/${u.dersler.length} ders tamamlandı`}
                        {test ? ` · test %${test.enIyi}` : ""}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}

export function UniteEkrani({ anahtar }: { anahtar: string }) {
  const ilerleme = useIlerleme();
  const unite = uniteBul(anahtar);
  if (!unite) return <BosDurum baslik="Ünite bulunamadı" metin="Bu ünite yayında değil."><a className="dugme" href="#/dersler">Derslere dön</a></BosDurum>;

  const biten = unite.dersler.filter((d) => ilerleme.dersler[d.anahtar]).length;
  const siradaki = unite.dersler.find((d) => !ilerleme.dersler[d.anahtar]);
  const test = ilerleme.testler[unite.anahtar];
  const rekor = ilerleme.oyunlar[unite.anahtar];

  return (
    <>
      <a className="geri-baglanti" href="#/dersler"><Simge ad="geri" boyut={18} /> Dersler</a>
      <header className="unite-basligi">
        <Madalyon no={unite.no} oran={biten / unite.dersler.length} boyut={96} />
        <p className="ust-etiket">{unite.dersAdi} · Ünite {romen(unite.no)}</p>
        <h1>{unite.baslik}</h1>
        <p>{biten}/{unite.dersler.length} ders tamamlandı</p>
      </header>

      <details className="kazanimlar">
        <summary>Bu ünitenin sonunda neler yapabileceksin?</summary>
        <ul>{unite.kazanimlar.map((k) => <li key={k}>{k}</li>)}</ul>
      </details>

      <h3 className="bolum-basligi">Ders yolu</h3>
      <ol className="yol">
        {unite.dersler.map((d) => {
          const bitti = ilerleme.dersler[d.anahtar];
          const sirada = siradaki?.anahtar === d.anahtar;
          return (
            <li key={d.anahtar} className={bitti ? "durak durak-bitti" : sirada ? "durak durak-sirada" : "durak"}>
              <span className="durak-isaret">{bitti ? <Simge ad="tik" boyut={16} /> : d.sira}</span>
              <a className="durak-kart" href={`#/ders/${d.anahtar}`}>
                <div className="satir-govde">
                  <strong>{d.baslik}</strong>
                  <span>{d.kavramlar.length} kavram · {dakika(d.kavramlar.length)} dk{bitti ? " · tamamlandı" : ""}</span>
                </div>
                {sirada ? <span className="hap">Başla</span> : <Simge ad="ok" boyut={18} />}
              </a>
            </li>
          );
        })}
      </ol>

      <h3 className="bolum-basligi">Kendini sına</h3>
      <div className="ikili">
        <a className="eylem-karti" href={`#/test/${unite.anahtar}`}>
          <Simge ad="belge" boyut={26} />
          <strong>Ünite testi</strong>
          <span>{unite.sorular.length} soru · geçme notu %{GECME_NOTU}</span>
          <em>{test ? `En iyi: %${test.enIyi}` : "Henüz çözülmedi"}</em>
        </a>
        <a className="eylem-karti" href={`#/oyun/${unite.anahtar}`}>
          <Simge ad="esle" boyut={26} />
          <strong>Eşleştirme</strong>
          <span>Türkçe – İngilizce, süreye karşı</span>
          <em>{rekor ? `Rekor: ${(rekor / 1000).toFixed(1)} sn` : "Henüz oynanmadı"}</em>
        </a>
      </div>
    </>
  );
}
