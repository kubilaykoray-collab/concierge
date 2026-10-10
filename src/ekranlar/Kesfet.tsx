import { useState } from "react";
import { BosDurum, Simge } from "../bilesenler";
import { gorselAdresi, GUNCEL_KAVRAMLAR, type KavramKaydi } from "../veri";

// Keşfet: Türkiye'nin turistik merkezleri bölge bölge, fotoğraflı kartlar önde. Ders sırası değil, merak sırası.
const BOLGELER: { kod: string; ad: string }[] = [
  { kod: "3.2.1", ad: "Akdeniz" },
  { kod: "3.2.2", ad: "Ege" },
  { kod: "3.2.3", ad: "Marmara" },
  { kod: "3.2.4", ad: "Karadeniz" },
  { kod: "3.3.1", ad: "İç Anadolu" },
  { kod: "3.3.2", ad: "Doğu Anadolu" },
  { kod: "3.3.3", ad: "Güneydoğu Anadolu" },
  { kod: "3.1", ad: "Türkiye'nin yeri" },
];
const SAYFA = 40;

const YERLER: KavramKaydi[] = GUNCEL_KAVRAMLAR.filter((k) => k.unite.ders === "genel-turizm-2026" && k.unite.no === 3);
const bolgesi = (k: KavramKaydi) => BOLGELER.find((b) => k.konu === b.kod || k.konu.startsWith(b.kod + "."))?.kod ?? null;

export function Kesfet() {
  const [bolge, bolgeAyarla] = useState<string | null>(null);
  const [sinir, sinirAyarla] = useState(SAYFA);
  if (YERLER.length === 0) return <BosDurum baslik="Keşfedecek yer yok" metin="Türkiye'nin turistik merkezleri ünitesi yayınlanınca burası dolacak." />;

  const secili = YERLER.filter((k) => bolge === null || bolgesi(k) === bolge);
  const fotografli = secili.filter((k) => k.gorsel);
  const digerleri = secili.filter((k) => !k.gorsel);

  return (
    <>
      <header className="sayfa-basligi">
        <p className="ust-etiket">{YERLER.length} yer · {YERLER.filter((k) => k.gorsel).length} fotoğraf</p>
        <h1>Keşfet</h1>
      </header>
      <p className="ipucu">Konuğun "Nereyi görmeliyim?" sorusuna cevap verebilmek için Türkiye'yi bölge bölge tanı. Bir yere dokun, kartını oku.</p>

      <div className="etiketler">
        <button className={bolge === null ? "hap" : "hap hap-cizgili"} onClick={() => { bolgeAyarla(null); sinirAyarla(SAYFA); }}>Tümü</button>
        {BOLGELER.map((b) => (
          <button key={b.kod} className={bolge === b.kod ? "hap" : "hap hap-cizgili"} onClick={() => { bolgeAyarla(b.kod); sinirAyarla(SAYFA); }}>{b.ad}</button>
        ))}
      </div>

      <div className="kesfet-izgara">
        {fotografli.slice(0, sinir).map((k) => (
          <a key={k.id} className="kesfet-kart" href={`#/sozluk/${k.id}`}>
            <img src={gorselAdresi(k.gorsel!)} alt="" loading="lazy" width={720} height={446} />
            <strong>{k.terim}</strong>
            <span>{BOLGELER.find((b) => b.kod === bolgesi(k))?.ad ?? ""}</span>
          </a>
        ))}
      </div>
      {fotografli.length > sinir && (
        <button className="dugme dugme-ikincil" onClick={() => sinirAyarla(sinir + SAYFA)}>Daha fazla fotoğraf ({fotografli.length - sinir})</button>
      )}

      {digerleri.length > 0 && (
        <details className="konu-grubu">
          <summary>
            <span className="ust-etiket">Fotoğrafsız yerler</span>
            <span className="konu-grubu-durum">{digerleri.length} yer</span>
          </summary>
          <div className="liste kesfet-liste">
            {digerleri.map((k) => (
              <a key={k.id} className="satir" href={`#/sozluk/${k.id}`}>
                <div className="satir-govde">
                  <strong>{k.terim}</strong>
                  <span>{k.ingilizce}</span>
                </div>
                <Simge ad="ok" boyut={18} />
              </a>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
