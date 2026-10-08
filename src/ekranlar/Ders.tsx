import { useMemo, useState } from "react";
import { AkisBasligi, AltEylem, BosDurum, KavramGovdesi, Secenekler, Simge } from "../bilesenler";
import { alistirmaUret, dersAdimlari, type DersAdimi } from "../cekirdek/alistirma";
import { dersBitti, PUAN } from "../cekirdek/ilerleme";
import { bugun } from "../cekirdek/leitner";
import { guncelle, useIlerleme } from "../depo";
import { uniteBul } from "../veri";

export function Ders({ uniteAnahtari, sira }: { uniteAnahtari: string; sira: number }) {
  const unite = uniteBul(uniteAnahtari);
  const ders = unite?.dersler.find((d) => d.sira === sira);
  const ilerleme = useIlerleme();

  const [adimlar, adimlarAyarla] = useState<DersAdimi[]>(() => dersAdimlari(ders?.kavramlar ?? []));
  const [konum, konumAyarla] = useState(0);
  const [secim, secimAyarla] = useState<number | null>(null);
  const [yanlis, yanlisAyarla] = useState(0);
  const [kazanilan, kazanilanAyarla] = useState<number | null>(null);

  const adim = adimlar[konum];
  // Soru, adıma gelindiğinde bir kez üretilir; şıklar yeniden çizimde yer değiştirmez.
  const alistirma = useMemo(
    () => (adim?.tur === "soru" && unite ? alistirmaUret(adim.kavram, unite.kavramlar) : null),
    [adim, unite],
  );

  if (!unite || !ders) return <BosDurum baslik="Ders bulunamadı" metin="Bu ders yayında değil."><a className="dugme" href="#/dersler">Derslere dön</a></BosDurum>;
  const cikis = `#/unite/${unite.anahtar}`;

  if (kazanilan !== null) {
    const sonraki = unite.dersler.find((d) => d.sira > ders.sira && !ilerleme.dersler[d.anahtar]);
    return (
      <div className="akis">
        <div className="sonuc">
          <div className="muhur muhur-buyuk"><Simge ad="tik" boyut={44} /></div>
          <p className="ust-etiket">Ders tamamlandı</p>
          <h1>{ders.baslik}</h1>
          <p className="sonuc-metin">
            {ders.kavramlar.length} kavram artık dağarcığında.
            {yanlis === 0 ? " Hiç hata yapmadan bitirdin." : ` ${yanlis} soruda takıldın; onları tekrar sorup pekiştirdik.`}
          </p>
          <div className="sonuc-sayilar">
            <div><strong>+{kazanilan}</strong><span>puan</span></div>
            <div><strong>{ders.kavramlar.length}</strong><span>kavram</span></div>
            <div><strong>yarın</strong><span>ilk tekrar</span></div>
          </div>
          <p className="ipucu">Bu kavramlar yarın "Günün tekrarı"nda karşına çıkacak. Bildikçe araları açılır, takıldıkların daha sık gelir.</p>
        </div>
        <AltEylem>
          {sonraki && <a className="dugme" href={`#/ders/${sonraki.anahtar}`}>Sıradaki ders: {sonraki.baslik}</a>}
          <a className={sonraki ? "dugme dugme-ikincil" : "dugme"} href={cikis}>Üniteye dön</a>
        </AltEylem>
      </div>
    );
  }

  const ilerle = () => {
    let liste = adimlar;
    if (adim.tur === "soru" && alistirma && secim !== alistirma.dogru) {
      // Yanlış bilinen kavram dersin sonunda bir kez daha sorulur.
      liste = [...adimlar, { tur: "soru", kavram: adim.kavram }];
      adimlarAyarla(liste);
    }
    if (konum + 1 >= liste.length) {
      const yeniKart = ders.kavramlar.filter((k) => !ilerleme.kartlar[k.id]).length;
      guncelle((d) => dersBitti(d, ders.anahtar, ders.kavramlar.map((k) => k.id), bugun()));
      kazanilanAyarla(yeniKart * PUAN.yeniKart);
      return;
    }
    secimAyarla(null);
    konumAyarla(konum + 1);
    window.scrollTo(0, 0);
  };

  const sec = (i: number) => {
    secimAyarla(i);
    if (alistirma && i !== alistirma.dogru) yanlisAyarla((y) => y + 1);
  };

  const kartSirasi = ders.kavramlar.indexOf(adim.kavram) + 1;

  return (
    <div className="akis">
      <AkisBasligi oran={konum / adimlar.length} etiket={`${konum + 1}/${adimlar.length}`} cikis={cikis} />

      {adim.tur === "kart" && (
        <>
          <div className="akis-govde" key={konum}>
            <p className="ust-etiket ortala">Yeni kavram · {kartSirasi}/{ders.kavramlar.length}</p>
            <article className="kagit"><KavramGovdesi kavram={adim.kavram} buyuk /></article>
          </div>
          <AltEylem><button className="dugme" onClick={ilerle}>Anladım, devam</button></AltEylem>
        </>
      )}

      {adim.tur === "soru" && alistirma && (
        <>
          <div className="akis-govde" key={konum}>
            <p className="ust-etiket ortala">Hatırla</p>
            <h2 className="soru-yonerge">{alistirma.yonerge}</h2>
            <blockquote className={alistirma.tur === "ingilizce" ? "soru-metin soru-terim" : "soru-metin"}>{alistirma.metin}</blockquote>
            <Secenekler secenekler={alistirma.secenekler} dogru={alistirma.dogru} secim={secim} sec={sec} />
          </div>
          {secim !== null && (
            <AltEylem>
              <div className={secim === alistirma.dogru ? "geri-bildirim geri-bildirim-dogru" : "geri-bildirim geri-bildirim-yanlis"}>
                <strong>{secim === alistirma.dogru ? "Doğru." : "Henüz değil."}</strong>
                <span>
                  {secim === alistirma.dogru
                    ? `${adim.kavram.terim} — ${adim.kavram.ingilizce}`
                    : `Doğrusu: ${alistirma.secenekler[alistirma.dogru]}. Dersin sonunda bir kez daha soracağım.`}
                </span>
              </div>
              <button className="dugme" onClick={ilerle}>Devam</button>
            </AltEylem>
          )}
        </>
      )}
    </div>
  );
}

