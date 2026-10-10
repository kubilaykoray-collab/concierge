import { useState } from "react";
import { Cubuk, Madalyon, Simge } from "../bilesenler";
import { rutbe, RUTBELER, seri, type Ilerleme as IlerlemeTipi } from "../cekirdek/ilerleme";
import { bugun, SON_KUTU } from "../cekirdek/leitner";
import { rozetler } from "../cekirdek/rozetler";
import { guncelle, sifirla, useIlerleme } from "../depo";
import { kavramBul, KAVRAMLAR, UNITELER } from "../veri";

const KUTU_ADI = ["", "Yeni", "Tanıdık", "Oturuyor", "Sağlam", "Usta"];
const TEMALAR: { deger: IlerlemeTipi["tema"]; ad: string }[] = [
  { deger: "oto", ad: "Otomatik" },
  { deger: "acik", ad: "Aydınlık" },
  { deger: "koyu", ad: "Karanlık" },
];

export function Ilerleme() {
  const ilerleme = useIlerleme();
  const [onay, onayAyarla] = useState(false);
  const r = rutbe(ilerleme.puan);
  const kartlar = Object.entries(ilerleme.kartlar).filter(([id]) => kavramBul(id));
  const kutular = [1, 2, 3, 4, 5].map((n) => kartlar.filter(([, k]) => k.kutu === n).length);
  const enCok = Math.max(1, ...kutular);
  const rozetListesi = rozetler(ilerleme, bugun(), UNITELER.map((u) => ({ anahtar: u.anahtar, dersler: u.dersler.map((d) => d.anahtar) })), (id) => kavramBul(id) !== undefined);

  return (
    <>
      <header className="sayfa-basligi">
        <p className="ust-etiket">Kariyer dosyan</p>
        <h1>İlerleme</h1>
      </header>

      <section className="sayilar">
        <div><Simge ad="alev" /><strong>{seri(ilerleme.gunler, bugun())}</strong><span>gün seri</span></div>
        <div><Simge ad="kitap" /><strong>{kartlar.length}<small>/{KAVRAMLAR.length}</small></strong><span>öğrenilen</span></div>
        <div><Simge ad="yildiz" /><strong>{ilerleme.puan}</strong><span>puan</span></div>
      </section>

      <h3 className="bolum-basligi">Kariyer basamakları</h3>
      <ol className="basamaklar">
        {RUTBELER.map((b, i) => (
          <li key={b.ad} className={i < r.sira ? "basamak basamak-gecildi" : i === r.sira ? "basamak basamak-simdi" : "basamak"}>
            <span className="durak-isaret">{i < r.sira ? <Simge ad="tik" boyut={16} /> : i === r.sira ? <Simge ad="zil" boyut={16} /> : <Simge ad="kilit" boyut={14} />}</span>
            <div className="satir-govde">
              <strong>{b.ad}</strong>
              <span>{i === r.sira ? b.soz : `${b.esik} puan`}</span>
              {i === r.sira && r.sonraki && <Cubuk oran={r.oran} />}
            </div>
          </li>
        ))}
      </ol>

      <h3 className="bolum-basligi">Rozetler · {rozetListesi.filter((r) => r.kazanildi).length}/{rozetListesi.length}</h3>
      <div className="rozetler">
        {rozetListesi.map((r) => (
          <div key={r.id} className={r.kazanildi ? "rozet rozet-kazanildi" : "rozet"}>
            <span className="rozet-simge"><Simge ad={r.kazanildi ? "yildiz" : "kilit"} boyut={18} /></span>
            <strong>{r.ad}</strong>
            <small>{r.aciklama}</small>
            {!r.kazanildi && r.oran > 0 && <Cubuk oran={r.oran} />}
          </div>
        ))}
      </div>

      <h3 className="bolum-basligi">Hafıza kutuları</h3>
      <div className="kagit kutular-karti">
        <div className="kutular">
          {kutular.map((adet, i) => (
            <div key={i} className="kutu">
              <strong>{adet}</strong>
              <div className="kutu-sutun"><div style={{ height: `${(adet / enCok) * 100}%` }} className={i + 1 === SON_KUTU ? "kutu-usta" : ""} /></div>
              <span>{KUTU_ADI[i + 1]}</span>
            </div>
          ))}
        </div>
        <p className="ipucu">Bildiğin kart bir sağdaki kutuya geçer ve daha seyrek sorulur (1, 2, 4, 8, 16 gün). Bilemediğin kart başa döner.</p>
      </div>

      <h3 className="bolum-basligi">Üniteler</h3>
      <div className="liste">
        {UNITELER.map((u) => {
          const ogrenilen = u.kavramlar.filter((k) => ilerleme.kartlar[k.id]).length;
          const test = ilerleme.testler[u.anahtar];
          return (
            <a key={u.anahtar} className="satir" href={`#/unite/${u.anahtar}`}>
              <Madalyon no={u.no} oran={ogrenilen / u.kavramlar.length} boyut={52} />
              <div className="satir-govde">
                <strong>{u.baslik}</strong>
                <span>{ogrenilen}/{u.kavramlar.length} kavram{test ? ` · test %${test.enIyi} (${test.deneme} deneme)` : " · test çözülmedi"}</span>
              </div>
            </a>
          );
        })}
      </div>

      <h3 className="bolum-basligi">Görünüm</h3>
      <div className="parcali">
        {TEMALAR.map((t) => (
          <button key={t.deger} className={ilerleme.tema === t.deger ? "parca parca-secili" : "parca"} onClick={() => guncelle((d) => ({ ...d, tema: t.deger }))}>
            {t.ad}
          </button>
        ))}
      </div>

      <h3 className="bolum-basligi">Telefona kur</h3>
      <div className="kagit bilgi">
        <p><strong>Android (Chrome):</strong> sağ üstteki ⋮ menüsü → "Ana ekrana ekle" ya da "Uygulamayı yükle".</p>
        <p><strong>iPhone (Safari):</strong> alttaki paylaş düğmesi → "Ana Ekrana Ekle".</p>
        <p>Kurduktan sonra internet olmadan da çalışır.</p>
      </div>

      <h3 className="bolum-basligi">Görseller</h3>
      <a className="satir" href="#/kunye">
        <div className="satir-govde">
          <strong>Görsel künyesi</strong>
          <span>Kartlardaki fotoğrafların fotoğrafçıları, kaynakları ve lisansı</span>
        </div>
        <Simge ad="ok" boyut={18} />
      </a>

      <h3 className="bolum-basligi">Gizlilik</h3>
      <div className="kagit bilgi">
        <p>CONCIERGE senden hiçbir bilgi istemez ve toplamaz. Hesap, reklam, takip yok. İlerlemen yalnız bu telefonda durur; telefon ya da tarayıcı değiştirirsen sıfırdan başlar.</p>
        {onay ? (
          <div className="ikili-dugme">
            <button className="dugme dugme-ikincil" onClick={() => onayAyarla(false)}>Vazgeç</button>
            <button className="dugme dugme-kirmizi" onClick={() => { sifirla(); onayAyarla(false); }}>Evet, sıfırla</button>
          </div>
        ) : (
          <button className="metin-dugme" onClick={() => onayAyarla(true)}>İlerlememi sıfırla</button>
        )}
      </div>
    </>
  );
}
