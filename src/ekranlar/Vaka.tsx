import { useState } from "react";
import { AkisBasligi, AltEylem, BosDurum, Secenekler, Simge } from "../bilesenler";
import { testHazirla } from "../cekirdek/alistirma";
import { PUAN, vakaCevabi } from "../cekirdek/ilerleme";
import { bugun } from "../cekirdek/leitner";
import { guncelle, useIlerleme } from "../depo";
import { uniteBul } from "../veri";

// Vaka çalışması: öğrenci otelde geçen bir sahnenin içine konur ve karar verir.
export function Vaka({ uniteAnahtari }: { uniteAnahtari: string }) {
  const [tur, turAyarla] = useState(0);
  return <Vardiya key={tur} uniteAnahtari={uniteAnahtari} yeniden={() => turAyarla(tur + 1)} />;
}

function Vardiya({ uniteAnahtari, yeniden }: { uniteAnahtari: string; yeniden: () => void }) {
  const unite = uniteBul(uniteAnahtari);
  const ilerleme = useIlerleme();
  // Önce henüz çözülmemiş sahneler gelir; şıklar her seferinde karışır.
  const [sahneler] = useState(() => {
    const karisik = testHazirla(unite?.vakalar ?? []);
    return [...karisik.filter((s) => !ilerleme.vakalar[s.id]), ...karisik.filter((s) => ilerleme.vakalar[s.id])].slice(0, 8);
  });
  const [konum, konumAyarla] = useState(0);
  const [secim, secimAyarla] = useState<number | null>(null);
  const [dogruSayisi, dogruSayisiAyarla] = useState(0);
  const [kazanilan, kazanilanAyarla] = useState(0);

  if (!unite || sahneler.length === 0) {
    return <BosDurum baslik="Vaka bulunamadı" metin="Bu ünitede henüz vaka çalışması yok."><a className="dugme" href="#/dersler">Derslere dön</a></BosDurum>;
  }
  const cikis = `#/unite/${unite.anahtar}`;

  if (konum >= sahneler.length) {
    return (
      <div className="akis">
        <div className="sonuc">
          <div className="muhur muhur-buyuk"><Simge ad="zil" boyut={44} /></div>
          <p className="ust-etiket">Vardiya bitti</p>
          <h1>{dogruSayisi}/{sahneler.length} sahnede doğru kararı verdin</h1>
          <p className="sonuc-metin">
            {dogruSayisi === sahneler.length
              ? "Kusursuz bir vardiya. Konuklar farkında bile olmadı; işin doğrusu da bu."
              : "Takıldığın sahneleri yeniden oynayabilirsin. Gerçek vardiyada ikinci şans olmaz; burada var."}
          </p>
          {kazanilan > 0 && <div className="sonuc-sayilar"><div><strong>+{kazanilan}</strong><span>puan</span></div></div>}
        </div>
        <AltEylem>
          <a className="dugme" href={cikis}>Üniteye dön</a>
          {dogruSayisi < sahneler.length && <button className="dugme dugme-ikincil" onClick={yeniden}>Yeniden oyna</button>}
        </AltEylem>
      </div>
    );
  }

  const sahne = sahneler[konum];
  const sec = (i: number) => {
    const dogru = i === sahne.dogru;
    secimAyarla(i);
    if (dogru) {
      dogruSayisiAyarla((n) => n + 1);
      if (!ilerleme.vakalar[sahne.id]) kazanilanAyarla((p) => p + PUAN.vaka);
    }
    guncelle((d) => vakaCevabi(d, sahne.id, dogru, bugun()));
  };
  const sonraki = () => {
    secimAyarla(null);
    konumAyarla(konum + 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="akis">
      <AkisBasligi oran={konum / sahneler.length} etiket={`${konum + 1}/${sahneler.length}`} cikis={cikis} />
      <div className="akis-govde" key={konum}>
        <div className="sahne">
          <span className="ust-etiket"><Simge ad="zil" boyut={14} /> Sahne {konum + 1}</span>
          <p>{sahne.durum}</p>
        </div>
        <h2 className="test-sorusu">{sahne.soru}</h2>
        <Secenekler secenekler={sahne.secenekler} dogru={sahne.dogru} secim={secim} sec={sec} />
      </div>
      {secim !== null && (
        <AltEylem>
          <div className={secim === sahne.dogru ? "geri-bildirim geri-bildirim-dogru" : "geri-bildirim geri-bildirim-yanlis"}>
            <strong>{secim === sahne.dogru ? "Doğru karar." : "Bir profesyonel böyle yapmazdı."}</strong>
            <span>{sahne.aciklama}</span>
          </div>
          <button className="dugme" onClick={sonraki}>{konum + 1 >= sahneler.length ? "Vardiyayı bitir" : "Sonraki sahne"}</button>
        </AltEylem>
      )}
    </div>
  );
}
