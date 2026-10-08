import { BosDurum, dakika, Madalyon, romen, Simge } from "../bilesenler";
import { GECME_NOTU } from "../cekirdek/ilerleme";
import { DERS_CIZIMI, OtelCizimi, Piktogram } from "../cizimler";
import { useIlerleme } from "../depo";
import { ARSIV_DERSLERI, DERS_LISTESI, TUM_DERSLER, uniteBul, UNITELER } from "../veri";

export function Dersler({ secili }: { secili?: string }) {
  const ilerleme = useIlerleme();
  if (UNITELER.length === 0) return <BosDurum baslik="Henüz yayınlanmış ünite yok" metin="Onaylanan üniteler burada görünecek." />;

  const ders = TUM_DERSLER.find((d) => d.ders === secili) ?? DERS_LISTESI.find((d) => d.ders === ilerleme.sonDers) ?? DERS_LISTESI[0];
  const Cizim = DERS_CIZIMI[ders.ders] ?? OtelCizimi;

  return (
    <>
      <header className="sayfa-basligi">
        <p className="ust-etiket">Müfredat</p>
        <h1>Dersler</h1>
      </header>

      {DERS_LISTESI.length > 1 && (
        <div className="parcali" style={{ gridTemplateColumns: `repeat(${DERS_LISTESI.length}, 1fr)` }}>
          {DERS_LISTESI.map((d) => (
            <a key={d.ders} className={d.ders === ders.ders ? "parca parca-secili" : "parca"} href={`#/dersler/${d.ders}`}>{d.kisaAd}</a>
          ))}
        </div>
      )}

      <div className="ders-afisi">
        <Cizim className="ders-afisi-cizim" />
        <span className="ust-etiket">{ders.sinif}. sınıf · {ders.uniteler.length} ünite{ders.arsiv ? " · 2025-2026 müfredatı" : ""}</span>
        <h2>{ders.ad}</h2>
      </div>

      {ders.arsiv && (
        <p className="ipucu">Bu ders önceki yılın kitabına göre hazırlandı. Kartlar doğru, ama ünite sırası bu yılın kitabıyla aynı değil.</p>
      )}

      <div className="unite-kartlari">
        {ders.uniteler.map((u) => {
          const biten = u.dersler.filter((d) => ilerleme.dersler[d.anahtar]).length;
          const test = ilerleme.testler[u.anahtar];
          return (
            <a key={u.anahtar} className="unite-karti" href={`#/unite/${u.anahtar}`}>
              <Madalyon no={u.no} oran={biten / u.dersler.length} boyut={68} />
              <div className="satir-govde">
                <span className="ust-etiket">Ünite {romen(u.no)}{u.taslak ? " · taslak" : ""}</span>
                <strong>{u.baslik}</strong>
                <span>{u.dersler.length} ders · {u.kavramlar.length} kavram{u.vakalar.length ? ` · ${u.vakalar.length} vaka` : ""}</span>
                <span className="unite-durum">
                  {biten === 0 ? "Başlanmadı" : biten === u.dersler.length ? "Dersler tamamlandı" : `${biten}/${u.dersler.length} ders tamamlandı`}
                  {test ? ` · test %${test.enIyi}` : ""}
                </span>
              </div>
              <Piktogram unite={u.anahtar} boyut={44} className="unite-karti-piktogram" />
            </a>
          );
        })}
      </div>

      {ARSIV_DERSLERI.length > 0 && (
        <section>
          <h3 className="bolum-basligi">Arşiv · önceki müfredat</h3>
          <div className="liste">
            {ARSIV_DERSLERI.map((d) => (
              <a key={d.ders} className="satir" href={`#/dersler/${d.ders}`}>
                <div className="satir-govde">
                  <strong>{d.ad}</strong>
                  <span>{d.uniteler.length} ünite · {d.uniteler.reduce((t, u) => t + u.kavramlar.length, 0)} kavram</span>
                </div>
                <Simge ad="ok" boyut={18} />
              </a>
            ))}
          </div>
        </section>
      )}
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
  const cozulenVaka = unite.vakalar.filter((v) => ilerleme.vakalar[v.id]).length;

  return (
    <>
      <a className="geri-baglanti" href={`#/dersler/${unite.ders}`}><Simge ad="geri" boyut={18} /> {unite.dersAdi}</a>
      <header className="unite-basligi">
        <Piktogram unite={unite.anahtar} boyut={180} className="unite-basligi-filigran" />
        <Madalyon no={unite.no} oran={biten / unite.dersler.length} boyut={96} />
        <p className="ust-etiket">Ünite {romen(unite.no)}</p>
        <h1>{unite.baslik}</h1>
        {unite.soz && <blockquote className="soz">{unite.soz}</blockquote>}
        <p className="unite-basligi-durum">{biten}/{unite.dersler.length} ders · {unite.kavramlar.length} kavram</p>
      </header>

      <details className="kazanimlar">
        <summary>Bu ünitenin sonunda neler yapabileceksin?</summary>
        <ul>{unite.kazanimlar.map((k) => <li key={k}>{k}</li>)}</ul>
      </details>

      <h3 className="bolum-basligi">Ders yolu</h3>
      <ol className="yol">
        {unite.dersler.map((d, i) => {
          const bitti = ilerleme.dersler[d.anahtar];
          const sirada = siradaki?.anahtar === d.anahtar;
          // Büyük birimlerde ders yolu kitabın konu başlıklarıyla bölünür.
          const yeniKonu = unite.konular.length > 1 && d.konu !== null && d.konu !== unite.dersler[i - 1]?.konu;
          const konu = unite.konular.find((k) => k.no === d.konu);
          return (
            <li key={d.anahtar} className={[bitti ? "durak durak-bitti" : sirada ? "durak durak-sirada" : "durak", yeniKonu ? "durak-konu-basi" : ""].join(" ")} data-konu={yeniKonu && konu ? `${konu.no} · ${konu.baslik}` : undefined}>
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

      <h3 className="bolum-basligi">Sahaya çık</h3>
      <div className="eylemler">
        {unite.vakalar.length > 0 && (
          <a className="eylem-karti eylem-karti-koyu" href={`#/vaka/${unite.anahtar}`}>
            <Simge ad="zil" boyut={26} />
            <div className="satir-govde">
              <strong>Vaka çalışması</strong>
              <span>Kendini otelde bul, kararı sen ver · {unite.vakalar.length} sahne</span>
            </div>
            <em>{cozulenVaka}/{unite.vakalar.length}</em>
          </a>
        )}
        <a className="eylem-karti" href={`#/test/${unite.anahtar}`}>
          <Simge ad="belge" boyut={26} />
          <div className="satir-govde">
            <strong>Ünite testi</strong>
            <span>{unite.sorular.length} soru · geçme notu %{GECME_NOTU}</span>
          </div>
          <em>{test ? `%${test.enIyi}` : "—"}</em>
        </a>
        <a className="eylem-karti" href={`#/oyun/${unite.anahtar}`}>
          <Simge ad="esle" boyut={26} />
          <div className="satir-govde">
            <strong>Eşleştirme</strong>
            <span>Türkçe – İngilizce, süreye karşı</span>
          </div>
          <em>{rekor ? `${(rekor / 1000).toFixed(1)} sn` : "—"}</em>
        </a>
      </div>
    </>
  );
}
