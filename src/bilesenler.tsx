import type { ReactNode } from "react";
import type { Kavram } from "./cekirdek/tipler";

const CIZIMLER = {
  zil: <><path d="M5 17a7 7 0 0 1 14 0" /><path d="M3 17h18" /><path d="M12 10V8" /><path d="M10 8h4" /><path d="M6 20h12" /></>,
  kitap: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20" transform="translate(0 -2)" /><path d="M8 8h8M8 12h5" /></>,
  ara: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  yildiz: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z" />,
  ok: <path d="M5 12h14m-6-6 6 6-6 6" />,
  geri: <path d="M19 12H5m6 6-6-6 6-6" />,
  kapat: <path d="M6 6l12 12M18 6 6 18" />,
  tik: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alev: <path d="M12 3c.5 3.5 4.5 5.2 4.5 10a4.5 4.5 0 0 1-9 0c0-1.8.8-3 1.8-4 .4 1.6 1.2 2.3 2 2.6C11 9.500 10.300 6 12 3z" />,
  cevir: <><path d="M4 9a8 8 0 0 1 14-3.500L20 8" /><path d="M20 4v4h-4" /><path d="M20 15a8 8 0 0 1-14 3.500L4 16" /><path d="M4 20v-4h4" /></>,
  saat: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.500V12l3 2" /></>,
  belge: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="m9.500 14 2 2 3.500-4" /></>,
  esle: <><rect x="3.500" y="4" width="7" height="6.500" rx="1.500" /><rect x="13.500" y="13.500" width="7" height="6.500" rx="1.500" /><path d="M10.500 7.200h3.500a2 2 0 0 1 2 2v4.300" /></>,
  gunes: <><circle cx="12" cy="12" r="4" /><path d="M12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400" /></>,
  ay: <path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z" />,
  anahtarlar: <><g transform="rotate(-38 12 12.5)"><path d="M12 4v11.500M12 5.500h2.800M12 8h2" /><circle cx="12" cy="18" r="2.500" /></g><g transform="rotate(38 12 12.5)"><path d="M12 4v11.500M12 5.500H9.200M12 8h-2" /><circle cx="12" cy="18" r="2.500" /></g></>,
  kilit: <><rect x="5.500" y="10.500" width="13" height="9.500" rx="2" /><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500" /></>,
} as const;

export type SimgeAdi = keyof typeof CIZIMLER;

export function Simge({ ad, boyut = 22 }: { ad: SimgeAdi; boyut?: number }) {
  return (
    <svg className="simge" width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CIZIMLER[ad]}
    </svg>
  );
}

const ROMEN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
export const romen = (n: number) => ROMEN[n] ?? String(n);

// Ünite madalyonu: çevresindeki halka ünitedeki ilerlemeyi gösterir.
export function Madalyon({ no, oran = 0, boyut = 64 }: { no: number; oran?: number; boyut?: number }) {
  const r = 28;
  const cevre = 2 * Math.PI * r;
  return (
    <svg className="madalyon" width={boyut} height={boyut} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="madalyon-iz" />
      <circle cx="32" cy="32" r={r} className="madalyon-dolu" strokeDasharray={cevre} strokeDashoffset={cevre * (1 - Math.min(1, oran))} transform="rotate(-90 32 32)" />
      <circle cx="32" cy="32" r="21.500" className="madalyon-ic" />
      <text x="32" y="33" className="madalyon-yazi" textAnchor="middle" dominantBaseline="middle">{romen(no)}</text>
    </svg>
  );
}

export function Halka({ oran, children, boyut = 148 }: { oran: number; children: ReactNode; boyut?: number }) {
  const r = 44;
  const cevre = 2 * Math.PI * r;
  return (
    <div className="halka" style={{ width: boyut, height: boyut }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="madalyon-iz" />
        <circle cx="50" cy="50" r={r} className="madalyon-dolu" strokeDasharray={cevre} strokeDashoffset={cevre * (1 - Math.min(1, oran))} transform="rotate(-90 50 50)" />
      </svg>
      <div className="halka-ic">{children}</div>
    </div>
  );
}

export function Cubuk({ oran }: { oran: number }) {
  return (
    <div className="cubuk" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(oran * 100)}>
      <div style={{ width: `${Math.min(100, Math.max(0, oran * 100))}%` }} />
    </div>
  );
}

// Ders, tekrar, test gibi akışların üst çubuğu: çıkış + ilerleme.
export function AkisBasligi({ oran, etiket, cikis }: { oran: number; etiket: string; cikis: string }) {
  return (
    <header className="akis-basligi">
      <a className="yuvarlak-dugme" href={cikis} aria-label="Kapat"><Simge ad="kapat" boyut={20} /></a>
      <Cubuk oran={oran} />
      <span className="akis-etiket">{etiket}</span>
    </header>
  );
}

export function KavramGovdesi({ kavram, buyuk = false }: { kavram: Kavram; buyuk?: boolean }) {
  return (
    <div className={buyuk ? "kavram kavram-buyuk" : "kavram"}>
      <p className="kavram-ingilizce">{kavram.ingilizce}</p>
      <h2 className="kavram-terim">{kavram.terim}</h2>
      <div className="altin-cizgi" />
      <p className="kavram-tanim">{kavram.tanim}</p>
      {kavram.ornek && (
        <div className="kavram-not">
          <span className="ust-etiket">Örnek</span>
          <p>{kavram.ornek}</p>
        </div>
      )}
      {kavram.sektor && (
        <div className="kavram-not kavram-sektor">
          <span className="ust-etiket"><Simge ad="zil" boyut={14} /> Sektörde</span>
          <p>{kavram.sektor}</p>
        </div>
      )}
    </div>
  );
}

// Android'de kısa dokunsal geri bildirim; desteklemeyen cihazda sessizce geçilir.
export function titret(dogru: boolean) {
  try {
    navigator.vibrate?.(dogru ? 14 : [28, 50, 28]);
  } catch {
    // titreşim izni yoksa önemsiz
  }
}

export type SecenekDurumu = "bos" | "dogru" | "yanlis" | "soluk";

export function Secenekler({ secenekler, dogru, secim, sec }: { secenekler: string[]; dogru: number; secim: number | null; sec: (i: number) => void }) {
  const durum = (i: number): SecenekDurumu => {
    if (secim === null) return "bos";
    if (i === dogru) return "dogru";
    return i === secim ? "yanlis" : "soluk";
  };
  return (
    <div className="secenekler">
      {secenekler.map((metin, i) => (
        <button key={i} className={`secenek secenek-${durum(i)}`} disabled={secim !== null} onClick={() => { titret(i === dogru); sec(i); }}>
          <span className="secenek-harf">{secenekler.length === 2 ? "" : "ABCD"[i]}</span>
          <span>{metin}</span>
          {durum(i) === "dogru" && <Simge ad="tik" boyut={20} />}
          {durum(i) === "yanlis" && <Simge ad="kapat" boyut={20} />}
        </button>
      ))}
    </div>
  );
}

export function AltEylem({ children }: { children: ReactNode }) {
  return <div className="alt-eylem">{children}</div>;
}

export function BosDurum({ baslik, metin, children }: { baslik: string; metin: string; children?: ReactNode }) {
  return (
    <div className="bos-durum">
      <div className="muhur"><Simge ad="zil" boyut={34} /></div>
      <h2>{baslik}</h2>
      <p>{metin}</p>
      {children}
    </div>
  );
}

export function TerfiPerdesi({ unvan, kapat }: { unvan: string; kapat: () => void }) {
  return (
    <div className="perde perde-orta" onClick={kapat}>
      <div className="terfi" role="dialog" aria-label="Terfi" onClick={(e) => e.stopPropagation()}>
        <div className="muhur muhur-buyuk"><Simge ad="anahtarlar" boyut={48} /></div>
        <p className="ust-etiket">Terfi ettin</p>
        <h2>{unvan}</h2>
        <p>Yeni unvanın hayırlı olsun. Emek verdin, karşılığını aldın.</p>
        <button className="dugme" onClick={kapat}>Göreve devam</button>
      </div>
    </div>
  );
}

export const dakika = (kartSayisi: number) => Math.max(2, Math.round(kartSayisi * 0.800));
