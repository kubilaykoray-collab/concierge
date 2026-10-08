import { useState } from "react";
import { AkisBasligi, AltEylem, BosDurum, Halka, Secenekler, Simge } from "../bilesenler";
import { KoseSusu } from "../cizimler";
import { testHazirla, yuzde } from "../cekirdek/alistirma";
import { GECME_NOTU, testBitti } from "../cekirdek/ilerleme";
import { bugun } from "../cekirdek/leitner";
import { guncelle } from "../depo";
import { uniteBul } from "../veri";

export function Test({ uniteAnahtari }: { uniteAnahtari: string }) {
  const unite = uniteBul(uniteAnahtari);
  const [sorular, sorularAyarla] = useState(() => testHazirla(unite?.sorular ?? []));
  const [konum, konumAyarla] = useState(-1); // -1: giriş ekranı
  const [secim, secimAyarla] = useState<number | null>(null);
  const [cevaplar, cevaplarAyarla] = useState<number[]>([]);

  if (!unite) return <BosDurum baslik="Test bulunamadı" metin="Bu ünite yayında değil."><a className="dugme" href="#/dersler">Derslere dön</a></BosDurum>;
  const cikis = `#/unite/${unite.anahtar}`;

  if (konum === -1) {
    return (
      <div className="akis">
        <AkisBasligi oran={0} etiket="" cikis={cikis} />
        <div className="sonuc">
          <p className="ust-etiket">Ünite testi</p>
          <h1>{unite.baslik}</h1>
          <p className="sonuc-metin">
            {sorular.length} soru. Her cevaptan sonra doğrusunu ve nedenini göreceksin. Süre yok; acele etme, düşün.
          </p>
          <div className="sonuc-sayilar">
            <div><strong>{sorular.length}</strong><span>soru</span></div>
            <div><strong>%{GECME_NOTU}</strong><span>geçme notu</span></div>
          </div>
        </div>
        <AltEylem><button className="dugme" onClick={() => konumAyarla(0)}>Teste başla</button></AltEylem>
      </div>
    );
  }

  if (konum >= sorular.length) {
    const dogru = cevaplar.filter((c, i) => c === sorular[i].dogru).length;
    const sonuc = yuzde(dogru, sorular.length);
    const gecti = sonuc >= GECME_NOTU;
    const yanlislar = sorular.filter((s, i) => cevaplar[i] !== s.dogru);
    const yeniden = () => {
      sorularAyarla(testHazirla(unite.sorular));
      cevaplarAyarla([]);
      secimAyarla(null);
      konumAyarla(0);
      window.scrollTo(0, 0);
    };
    return (
      <div className="akis">
        <div className="sonuc">
          <Halka oran={sonuc / 100}><strong>%{sonuc}</strong><span>{dogru}/{sorular.length} doğru</span></Halka>
          {gecti && (
            <div className="sertifika">
              <KoseSusu className="sertifika-kose sertifika-kose-1" />
              <KoseSusu className="sertifika-kose sertifika-kose-2" />
              <Simge ad="anahtarlar" boyut={34} />
              <span className="ust-etiket" lang="en">CERTIFICATE OF ACHIEVEMENT</span>
              <strong>{unite.baslik}</strong>
              <span>{unite.dersAdi} · %{sonuc} · {new Date().toLocaleDateString("tr-TR")}</span>
            </div>
          )}
          <p className="ust-etiket">{gecti ? "Ünite sertifikası" : "Biraz daha çalışmalı"}</p>
          <h1>{gecti ? "Geçtin, tebrikler." : "Bu sefer olmadı."}</h1>
          <p className="sonuc-metin">
            {gecti
              ? yanlislar.length === 0 ? "Tek hata yok. Bu üniteye hâkimsin." : "Aşağıda takıldığın sorular var; onlara bir göz at."
              : `Geçme notu %${GECME_NOTU}. Takıldığın soruları incele, ilgili dersleri yinele ve tekrar dene.`}
          </p>
        </div>
        {yanlislar.length > 0 && (
          <section className="yanlislar">
            <h3 className="bolum-basligi">Takıldığın sorular</h3>
            {yanlislar.map((s) => (
              <article key={s.id} className="yanlis-karti">
                <p>{s.soru}</p>
                <strong>{s.secenekler[s.dogru]}</strong>
                <span>{s.aciklama}</span>
              </article>
            ))}
          </section>
        )}
        <AltEylem>
          <a className="dugme" href={cikis}>Üniteye dön</a>
          <button className="dugme dugme-ikincil" onClick={yeniden}>Yeniden çöz</button>
        </AltEylem>
      </div>
    );
  }

  const soru = sorular[konum];
  const sonraki = () => {
    const yeniCevaplar = [...cevaplar, secim!];
    cevaplarAyarla(yeniCevaplar);
    if (konum + 1 >= sorular.length) {
      const dogru = yeniCevaplar.filter((c, i) => c === sorular[i].dogru).length;
      guncelle((d) => testBitti(d, unite.anahtar, yuzde(dogru, sorular.length), bugun()));
    }
    secimAyarla(null);
    konumAyarla(konum + 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="akis">
      <AkisBasligi oran={konum / sorular.length} etiket={`${konum + 1}/${sorular.length}`} cikis={cikis} />
      <div className="akis-govde" key={konum}>
        <p className="ust-etiket ortala">{soru.tur === "dogru-yanlis" ? "Doğru mu, yanlış mı?" : `Soru ${konum + 1}`}</p>
        <h2 className="test-sorusu">{soru.soru}</h2>
        <Secenekler secenekler={soru.secenekler} dogru={soru.dogru} secim={secim} sec={secimAyarla} />
      </div>
      {secim !== null && (
        <AltEylem>
          <div className={secim === soru.dogru ? "geri-bildirim geri-bildirim-dogru" : "geri-bildirim geri-bildirim-yanlis"}>
            <strong>{secim === soru.dogru ? "Doğru." : `Doğrusu: ${soru.secenekler[soru.dogru]}`}</strong>
            <span>{soru.aciklama}</span>
          </div>
          <button className="dugme" onClick={sonraki}>{konum + 1 >= sorular.length ? "Sonucu gör" : "Sonraki soru"}</button>
        </AltEylem>
      )}
    </div>
  );
}
