import { Simge } from "../bilesenler";
import { gorselAdresi, GORSELLER } from "../veri";

// Kartlardaki fotoğrafların künyesi. CC BY lisansı fotoğrafçının, kaynağın ve lisansın gösterilmesini şart koşar.
export function Kunye() {
  return (
    <>
      <a className="geri-baglanti" href="#/ilerleme"><Simge ad="geri" boyut={18} /> İlerleme</a>
      <header className="sayfa-basligi">
        <p className="ust-etiket">{GORSELLER.length} fotoğraf</p>
        <h1>Görsel künyesi</h1>
      </header>
      <div className="kagit bilgi">
        <p>
          Kartlardaki fotoğraflar Creative Commons Atıf 2.0 (CC BY 2.0) lisansıyla paylaşılmış çalışmalardır. Her biri kırpılıp küçültülerek
          kullanılmıştır. Fotoğrafçılara teşekkür ederiz.
        </p>
      </div>
      <div className="kunye-listesi">
        {GORSELLER.map((g) => (
          <article key={g.anahtar} className="kunye">
            <img src={gorselAdresi(g.anahtar)} alt={g.alt} loading="lazy" width={720} height={446} />
            <div className="satir-govde">
              <strong>{g.alt}</strong>
              <span>Fotoğraf: {g.fotografci}{g.baslik ? ` · “${g.baslik}”` : ""}</span>
              <span>
                <a href={g.kaynak} target="_blank" rel="noreferrer noopener">Kaynak</a>
                {" · "}
                <a href={g.lisansAdresi ?? "https://creativecommons.org/licenses/by/2.0/"} target="_blank" rel="noreferrer noopener">{g.lisans}</a>
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
