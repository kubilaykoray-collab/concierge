import { useMemo, useState } from "react";
import { KavramGovdesi, romen, Simge } from "../bilesenler";
import { ara } from "../cekirdek/arama";
import { useIlerleme } from "../depo";
import { dersBul, DERS_LISTESI, kavramBul, KAVRAMLAR } from "../veri";

const arsivMi = (ders: string) => (dersBul(ders)?.arsiv ? 1 : 0);
// Aynı terim birkaç derste geçebilir: güncel müfredat önce, arşiv sonra gelir.
const SIRALI = [...KAVRAMLAR].sort((a, b) => a.terim.localeCompare(b.terim, "tr") || arsivMi(a.unite.ders) - arsivMi(b.unite.ders));
const yer = (ders: string, no: number) => `${dersBul(ders)?.kisaAd ?? ders} · ${romen(no)}`;
// Bin satırı birden çizmek yavaş telefonu yorar; liste parça parça açılır.
const SAYFA = 120;

export function Sozluk({ secili }: { secili?: string }) {
  const [sorgu, sorguAyarla] = useState("");
  const [ders, dersAyarla] = useState<string | null>(null);
  const [sinir, sinirAyarla] = useState(SAYFA);
  const ilerleme = useIlerleme();
  const sonuclar = useMemo(() => ara(ders ? SIRALI.filter((k) => k.unite.ders === ders) : SIRALI, sorgu), [sorgu, ders]);
  const kavram = secili ? kavramBul(secili) : undefined;

  let sonHarf = "";
  return (
    <>
      <header className="sayfa-basligi">
        <p className="ust-etiket">{sonuclar.length === KAVRAMLAR.length ? `${KAVRAMLAR.length} kavram` : `${sonuclar.length} / ${KAVRAMLAR.length} kavram`}</p>
        <h1>Sözlük</h1>
      </header>

      <label className="arama">
        <Simge ad="ara" boyut={20} />
        <input type="search" value={sorgu} onChange={(e) => { sorguAyarla(e.target.value); sinirAyarla(SAYFA); }} placeholder="Türkçe ya da İngilizce ara" aria-label="Sözlükte ara" autoComplete="off" />
      </label>

      {DERS_LISTESI.length > 1 && (
        <div className="etiketler">
          <button className={ders === null ? "hap" : "hap hap-cizgili"} onClick={() => dersAyarla(null)}>Tümü</button>
          {DERS_LISTESI.map((x) => (
            <button key={x.ders} className={ders === x.ders ? "hap" : "hap hap-cizgili"} onClick={() => dersAyarla(x.ders)}>{x.kisaAd}</button>
          ))}
        </div>
      )}

      {sonuclar.length === 0 && <p className="ipucu ortala">"{sorgu}" için sonuç yok. Başka bir yazımla dene.</p>}

      <div className="sozluk-listesi">
        {sonuclar.slice(0, sinir).map((k) => {
          const harf = k.terim[0].toLocaleUpperCase("tr");
          const baslik = sorgu === "" && harf !== sonHarf;
          sonHarf = harf;
          return (
            <div key={k.id}>
              {baslik && <h3 className="harf">{harf}</h3>}
              <a className="sozluk-satiri" href={`#/sozluk/${k.id}`}>
                <div className="satir-govde">
                  <strong>{k.terim}</strong>
                  <span>{k.ingilizce}</span>
                  <span className="sozluk-yer">{yer(k.unite.ders, k.unite.no)}</span>
                </div>
                {ilerleme.kartlar[k.id] && <span className="nokta" title="Öğrenildi" />}
              </a>
            </div>
          );
        })}
      </div>

      {sonuclar.length > sinir && (
        <button className="dugme dugme-ikincil" onClick={() => sinirAyarla(sinir + SAYFA * 3)}>
          Devamını göster ({sonuclar.length - sinir} kavram daha)
        </button>
      )}

      {kavram && (
        <div className="perde" onClick={() => history.back()}>
          <article className="cekmece" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={kavram.terim}>
            <button className="yuvarlak-dugme cekmece-kapat" onClick={() => history.back()} aria-label="Kapat"><Simge ad="kapat" boyut={20} /></button>
            <p className="ust-etiket">Ünite {romen(kavram.unite.no)} · {kavram.unite.baslik}</p>
            <KavramGovdesi kavram={kavram} buyuk />
            {kavram.iliskili.length > 0 && (
              <>
                <span className="ust-etiket">İlişkili kavramlar</span>
                <div className="etiketler">
                  {kavram.iliskili.map((id) => kavramBul(id)).filter((k) => k !== undefined).map((k) => (
                    <a key={k.id} className="hap hap-cizgili" href={`#/sozluk/${k.id}`} onClick={(e) => { e.preventDefault(); location.replace(`#/sozluk/${k.id}`); }}>{k.terim}</a>
                  ))}
                </div>
              </>
            )}
          </article>
        </div>
      )}
    </>
  );
}
