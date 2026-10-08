import { useState } from "react";
import { AkisBasligi, AltEylem, BosDurum, KavramGovdesi, Simge } from "../bilesenler";
import { karistir } from "../cekirdek/alistirma";
import { tekrarCevabi } from "../cekirdek/ilerleme";
import { bugun, vadesiGelenler } from "../cekirdek/leitner";
import { guncelle, useIlerleme } from "../depo";
import { kavramBul } from "../veri";

const OTURUM_BOYU = 20;

export function Tekrar({ serbest }: { serbest: boolean }) {
  const ilerleme = useIlerleme();
  // Kuyruk oturum başında bir kez kurulur; cevap verdikçe yeniden hesaplanmaz.
  const [kuyruk, kuyrukAyarla] = useState<string[]>(() => {
    const ogrenilen = Object.keys(ilerleme.kartlar).filter((id) => kavramBul(id));
    if (serbest) return karistir(ogrenilen).slice(0, 10);
    return vadesiGelenler(ilerleme.kartlar, bugun()).filter((id) => kavramBul(id)).slice(0, OTURUM_BOYU);
  });
  const [toplam] = useState(kuyruk.length);
  const [konum, konumAyarla] = useState(0);
  const [acik, acikAyarla] = useState(false);
  const [cevaplanan, cevaplananAyarla] = useState<Record<string, boolean>>({});

  if (toplam === 0) {
    const hicYok = Object.keys(ilerleme.kartlar).length === 0;
    return (
      <div className="akis">
        <AkisBasligi oran={0} etiket="" cikis="#/" />
        <BosDurum
          baslik={hicYok ? "Önce bir ders bitir" : "Bugünlük tekrar yok"}
          metin={hicYok ? "Tekrar kartların, bitirdiğin derslerdeki kavramlardan oluşur." : "Vadesi gelen kart kalmadı. Yarın yenileri gelecek."}
        >
          <a className="dugme" href={hicYok ? "#/dersler" : "#/tekrar/serbest"}>{hicYok ? "Derslere git" : "Serbest tekrar yap"}</a>
        </BosDurum>
      </div>
    );
  }

  if (konum >= kuyruk.length) {
    const bilinen = Object.values(cevaplanan).filter(Boolean).length;
    return (
      <div className="akis">
        <div className="sonuc">
          <div className="muhur muhur-buyuk"><Simge ad="tik" boyut={44} /></div>
          <p className="ust-etiket">{serbest ? "Serbest tekrar" : "Günün tekrarı"} tamamlandı</p>
          <h1>{bilinen}/{toplam} kavramı ilk seferde bildin</h1>
          <p className="sonuc-metin">
            {bilinen === toplam
              ? "Kusursuz. Bu kartlar artık daha seyrek sorulacak."
              : "Takıldıkların yarın yeniden gelecek; bildiklerinin arası açıldı."}
          </p>
        </div>
        <AltEylem><a className="dugme" href="#/">Bugün'e dön</a></AltEylem>
      </div>
    );
  }

  const id = kuyruk[konum];
  const kavram = kavramBul(id)!;
  const kutu = ilerleme.kartlar[id]?.kutu ?? 1;

  const cevapla = (bildi: boolean) => {
    // Kutuyu yalnız ilk cevap belirler; aynı oturumda yeniden gelen kart sadece pekiştirme içindir.
    if (!(id in cevaplanan)) {
      guncelle((d) => tekrarCevabi(d, id, bildi, bugun(), !serbest));
      cevaplananAyarla({ ...cevaplanan, [id]: bildi });
    }
    if (!bildi) kuyrukAyarla([...kuyruk, id]);
    acikAyarla(false);
    konumAyarla(konum + 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="akis">
      <AkisBasligi oran={konum / kuyruk.length} etiket={`${konum + 1}/${kuyruk.length}`} cikis="#/" />
      <div className="akis-govde" key={konum}>
        <p className="ust-etiket ortala">{serbest ? "Serbest tekrar" : `Kutu ${kutu}/5`}</p>
        {!acik ? (
          <button className="kagit cevir-yuz" onClick={() => acikAyarla(true)}>
            <p className="kavram-ingilizce">{kavram.ingilizce}</p>
            <h2 className="kavram-terim">{kavram.terim}</h2>
            <div className="altin-cizgi" />
            <p className="cevir-ipucu">Tanımını ve bir örneğini aklından geçir.<br />Hazır olunca karta dokun.</p>
            <span className="cevir-simge"><Simge ad="cevir" boyut={20} /> Çevir</span>
          </button>
        ) : (
          <article className="kagit kagit-acildi"><KavramGovdesi kavram={kavram} buyuk /></article>
        )}
      </div>
      <AltEylem>
        {acik ? (
          <div className="ikili-dugme">
            <button className="dugme dugme-kirmizi" onClick={() => cevapla(false)}>Bilemedim</button>
            <button className="dugme dugme-yesil" onClick={() => cevapla(true)}>Bildim</button>
          </div>
        ) : (
          <button className="dugme" onClick={() => acikAyarla(true)}>Cevabı göster</button>
        )}
      </AltEylem>
    </div>
  );
}
