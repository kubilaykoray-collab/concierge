import { useEffect, useState } from "react";
import { AkisBasligi, AltEylem, BosDurum, Simge } from "../bilesenler";
import { karistir } from "../cekirdek/alistirma";
import { oyunBitti } from "../cekirdek/ilerleme";
import { bugun } from "../cekirdek/leitner";
import type { Kavram, Unite } from "../cekirdek/tipler";
import { guncelle, useIlerleme } from "../depo";
import { uniteBul } from "../veri";

const CIFT = 6;

function elDagit(unite: Unite) {
  // İngilizcesi Türkçesiyle aynı olan kartlar (özel adlar) eşleştirmede bir şey öğretmez.
  const uygun = unite.kavramlar.filter((k) => k.ingilizce.toLocaleLowerCase("tr") !== k.terim.toLocaleLowerCase("tr"));
  const kartlar = karistir(uygun).slice(0, CIFT);
  return { sol: kartlar, sag: karistir(kartlar) };
}

export function Oyun({ uniteAnahtari }: { uniteAnahtari: string }) {
  const unite = uniteBul(uniteAnahtari);
  const ilerleme = useIlerleme();
  const [el, elAyarla] = useState(() => (unite ? elDagit(unite) : { sol: [] as Kavram[], sag: [] as Kavram[] }));
  const [solSecili, solAyarla] = useState<string | null>(null);
  const [sagSecili, sagAyarla] = useState<string | null>(null);
  const [eslesen, eslesenAyarla] = useState<string[]>([]);
  const [hata, hataAyarla] = useState(0);
  const [baslangic, baslangicAyarla] = useState(() => Date.now());
  const [gecen, gecenAyarla] = useState(0);
  const [bitis, bitisAyarla] = useState<{ sure: number; rekor: boolean } | null>(null);

  useEffect(() => {
    if (bitis) return;
    const sayac = setInterval(() => gecenAyarla(Date.now() - baslangic), 100);
    return () => clearInterval(sayac);
  }, [baslangic, bitis]);

  // İki taraftan da seçim yapılınca kısa bir an gösterilir, sonra değerlendirilir.
  useEffect(() => {
    if (!solSecili || !sagSecili || !unite) return;
    const dogru = solSecili === sagSecili;
    const bekleme = setTimeout(() => {
      if (dogru) {
        const yeni = [...eslesen, solSecili];
        eslesenAyarla(yeni);
        if (yeni.length === el.sol.length) {
          const sure = Date.now() - baslangic + hata * 3000; // her hata 3 saniye ceza
          const onceki = ilerleme.oyunlar[unite.anahtar];
          guncelle((d) => oyunBitti(d, unite.anahtar, sure, bugun()));
          bitisAyarla({ sure, rekor: onceki === undefined || sure < onceki });
        }
      } else hataAyarla((h) => h + 1);
      solAyarla(null);
      sagAyarla(null);
    }, dogru ? 220 : 520);
    return () => clearTimeout(bekleme);
  }, [solSecili, sagSecili]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!unite || el.sol.length < 2) return <BosDurum baslik="Oyun açılamadı" metin="Bu ünitede eşleştirilecek yeterli kavram yok."><a className="dugme" href="#/dersler">Derslere dön</a></BosDurum>;
  const cikis = `#/unite/${unite.anahtar}`;
  const saniye = (ms: number) => (ms / 1000).toFixed(1);

  const yeniden = () => {
    elAyarla(elDagit(unite));
    eslesenAyarla([]);
    hataAyarla(0);
    gecenAyarla(0);
    bitisAyarla(null);
    baslangicAyarla(Date.now());
  };

  if (bitis) {
    return (
      <div className="akis">
        <div className="sonuc">
          <div className="muhur muhur-buyuk"><Simge ad="saat" boyut={44} /></div>
          <p className="ust-etiket">{bitis.rekor ? "Yeni rekor" : "Eşleştirme bitti"}</p>
          <h1>{saniye(bitis.sure)} saniye</h1>
          <p className="sonuc-metin">
            {hata === 0 ? "Hiç hata yapmadın." : `${hata} hata yaptın; her hata süreye 3 saniye ekler.`}
            {!bitis.rekor && ` Rekorun ${saniye(ilerleme.oyunlar[unite.anahtar])} saniye.`}
          </p>
        </div>
        <AltEylem>
          <button className="dugme" onClick={yeniden}>Yeni el</button>
          <a className="dugme dugme-ikincil" href={cikis}>Üniteye dön</a>
        </AltEylem>
      </div>
    );
  }

  const tas = (k: Kavram, yan: "sol" | "sag") => {
    const secili = (yan === "sol" ? solSecili : sagSecili) === k.id;
    const yanlis = secili && solSecili !== null && sagSecili !== null && solSecili !== sagSecili;
    const sinif = eslesen.includes(k.id) ? "tas tas-eslesti" : yanlis ? "tas tas-yanlis" : secili ? "tas tas-secili" : "tas";
    return (
      <button key={yan + k.id} className={sinif} disabled={eslesen.includes(k.id)} onClick={() => (yan === "sol" ? solAyarla(k.id) : sagAyarla(k.id))}>
        {yan === "sol" ? k.terim : k.ingilizce}
      </button>
    );
  };

  return (
    <div className="akis">
      <AkisBasligi oran={eslesen.length / el.sol.length} etiket={`${saniye(gecen)} sn`} cikis={cikis} />
      <div className="akis-govde">
        <p className="ust-etiket ortala">Eşleştir</p>
        <h2 className="soru-yonerge">Her kavramı İngilizcesiyle buluştur</h2>
        <div className="taslar">
          <div>{el.sol.map((k) => tas(k, "sol"))}</div>
          <div>{el.sag.map((k) => tas(k, "sag"))}</div>
        </div>
        <p className="ipucu ortala">{hata > 0 ? `${hata} hata · +${hata * 3} sn` : "Resepsiyonda hız kadar doğruluk da önemlidir."}</p>
      </div>
    </div>
  );
}
