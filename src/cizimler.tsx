// Uygulamanın çizimleri: tamamı elde yazılmış SVG çizgi resimleri. Dışarıdan görsel yüklenmez.

// Art deco otel cephesi: açılış ekranının ve otelcilik dersinin imzası.
export function OtelCizimi({ className }: { className?: string }) {
  const pencereler = (x: number, ust: number, alt: number, adim = 14) => {
    const satirlar = [];
    for (let y = ust; y < alt; y += adim) satirlar.push(<path key={`${x}-${y}`} d={`M${x} ${y}v7`} />);
    return satirlar;
  };
  return (
    <svg className={className} viewBox="0 0 360 170" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g opacity=".28">
        {Array.from({ length: 13 }, (_, i) => {
          const aci = (Math.PI * (i + 0.5)) / 13;
          return <path key={i} d={`M180 150 L${180 - Math.cos(aci) * 260} ${150 - Math.sin(aci) * 260}`} />;
        })}
      </g>
      <g opacity=".9">
        <path d="M150 150V42h60v108" />
        <path d="M158 42V30h44v12M166 30V20h28v10M174 20v-8h12v8M180 12V2" />
        <path d="M96 150V74h54M210 74h54v76" />
        <path d="M52 150v-50h44M264 100h44v50" />
        <path d="M24 150h312" strokeWidth="1.6" />
        <path d="M166 150v-22a14 14 0 0 1 28 0v22" />
        <path d="M156 122h48l6 8h-60z" />
        {[160, 170, 180, 190, 200].flatMap((x) => pencereler(x, 52, 112))}
        {[106, 118, 130, 142, 218, 230, 242, 254].flatMap((x) => pencereler(x, 84, 140))}
        {[62, 74, 86, 274, 286, 298].flatMap((x) => pencereler(x, 110, 140))}
      </g>
      <g fill="currentColor" stroke="none" opacity=".85">
        {[-28, -14, 0, 14, 28].map((dx, i) => (
          <path key={i} transform={`translate(${180 + dx} ${i === 2 ? 22 : i % 2 ? 26 : 30}) scale(${i === 2 ? 0.95 : 0.6})`} d="m0-5 1.500 3.300 3.500.400-2.600 2.400.700 3.500L0 2.900-3.100 4.600l.700-3.500L-5-1.300l3.500-.400z" />
        ))}
      </g>
    </svg>
  );
}

// Dünya ve rota: Genel Turizm dersinin imzası.
export function DunyaCizimi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 170" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g opacity=".9">
        <circle cx="180" cy="92" r="62" />
        <ellipse cx="180" cy="92" rx="26" ry="62" />
        <ellipse cx="180" cy="92" rx="48" ry="62" opacity=".55" />
        <path d="M118 92h124M127 62h106M127 122h106" />
      </g>
      <path d="M40 120C86 40 150 18 206 40s92 60 118 22" strokeDasharray="2 7" opacity=".7" />
      <g transform="translate(326 58) rotate(-28)" fill="currentColor" stroke="none">
        <path d="M0 0-22-5-30-16h-5l5 14-12-3-5-6h-4l3 9-3 9h4l5-6 12-3-5 14h5l8-11z" />
      </g>
      <circle cx="40" cy="120" r="3.500" fill="currentColor" stroke="none" />
      <g opacity=".28">
        <circle cx="180" cy="92" r="76" />
        <circle cx="180" cy="92" r="92" strokeDasharray="1 9" />
      </g>
    </svg>
  );
}

// Pusula gülü: Mesleki Gelişim Atölyesi'nin imzası (yönünü bulan meslek insanı).
export function PusulaCizimi({ className }: { className?: string }) {
  const kollar = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg className={className} viewBox="0 0 360 170" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(200 88)">
        <circle r="64" opacity=".9" />
        <circle r="52" strokeDasharray="1 7" opacity=".6" />
        <circle r="84" opacity=".28" />
        {kollar.map((a) => (
          <path key={a} transform={`rotate(${a})`} d={a % 90 === 0 ? "M0 -60 L9 -9 L0 0 L-9 -9 Z" : "M0 -38 L6 -6 L0 0 L-6 -6 Z"} opacity={a % 90 === 0 ? 0.9 : 0.5} />
        ))}
        <circle r="4" fill="currentColor" stroke="none" />
        <path d="M0 -76v-10M0 76v10M-76 0h-10M76 0h10" opacity=".7" />
      </g>
    </svg>
  );
}

// Marka amblemi: ince bir mühür halkası içinde çapraz iki anahtar (concierge geleneğinin simgesi).
// Anahtar başları (halkalar) altta, dişler üstte: klasik armacılık düzeni. Tek renk, çizgiyle; her zeminde okunur.
export function Amblem({ className, boyut = 48 }: { className?: string; boyut?: number }) {
  const anahtar = (
    <>
      <circle cx="0" cy="17" r="5.200" />
      <circle cx="0" cy="17" r="1.600" />
      <path d="M0 11.800V-15" />
      <path d="M0-15h-6.200M0-11h-4.600M0-7h-5.400" />
    </>
  );
  return (
    <svg className={className} width={boyut} height={boyut} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="32" cy="32" r="29.500" strokeWidth="1.300" opacity="0.55" />
      <circle cx="32" cy="32" r="25.500" strokeWidth="0.800" opacity="0.35" />
      <g transform="translate(32 35) rotate(-33)">{anahtar}</g>
      <g transform="translate(32 35) rotate(33) scale(-1 1)">{anahtar}</g>
    </svg>
  );
}

export const DERS_CIZIMI: Record<string, typeof OtelCizimi> = {
  "otelcilik-seyahat": OtelCizimi,
  "genel-turizm-2026": DunyaCizimi,
  "mesleki-gelisim": PusulaCizimi,
  "global-otelcilik": DunyaCizimi,
  "konaklama-seyahat": OtelCizimi,
  "genel-turizm": DunyaCizimi,
};

// Ünite piktogramları (24×24 ızgara).
const PIKTOGRAMLAR = {
  damla: <><path d="M12 3.500c3.200 4 5.500 6.900 5.500 10a5.500 5.500 0 0 1-11 0c0-3.100 2.300-6 5.500-10z" /><path d="M9.500 14.500a2.700 2.700 0 0 0 2.300 2.500" /></>,
  kalkan: <><path d="M12 3 5 5.500v6c0 4.300 2.900 7.600 7 9 4.100-1.400 7-4.700 7-9v-6z" /><path d="m9 12 2.200 2.200L15.200 10" /></>,
  papyon: <><path d="M10 12 4 8v8zM14 12l6-4v8z" /><rect x="10" y="10" width="4" height="4" rx="1" /></>,
  konuk: <><circle cx="9" cy="8" r="3.200" /><path d="M3.500 19.500c.500-3.500 2.700-5.500 5.500-5.500s5 2 5.500 5.500" /><path d="m17.500 4.500.900 1.900 2.100.300-1.500 1.400.400 2.100-1.900-1-1.900 1 .400-2.100-1.500-1.400 2.100-.300z" /></>,
  bavul: <><rect x="4.500" y="8" width="15" height="11.500" rx="2" /><path d="M9 8V5.500a1.500 1.500 0 0 1 1.500-1.500h3A1.500 1.500 0 0 1 15 5.500V8M4.500 13h15M8 19.500v1.500M16 19.500v1.500" /></>,
  siren: <><path d="M6.500 17v-4.500a5.500 5.500 0 0 1 11 0V17" /><path d="M4.500 17h15v3h-15zM12 3v1.500M4.800 6.300l1.100 1.100M19.200 6.300l-1.100 1.100" /></>,
  telefon: <path d="M6.200 3.500h3l1.300 4-2 1.300a11 11 0 0 0 4.700 4.700l1.300-2 4 1.300v3c0 1-1 1.700-2 1.700A13.500 13.500 0 0 1 4.500 5.500c0-1 .700-2 1.700-2z" />,
  anahtar: <><circle cx="8" cy="12" r="3.700" /><path d="M11.700 12H20M17 12v3.200M20 12v2.200" /></>,
  parilti: <><path d="M10 4.500 11.700 9l4.500 1.700-4.500 1.700L10 17l-1.700-4.600L3.800 10.700 8.300 9z" /><path d="m18 14.500.800 2.200 2.200.800-2.200.800-.800 2.200-.800-2.200-2.200-.800 2.200-.800zM18 3.500l.500 1.500 1.500.500-1.500.500-.500 1.500-.500-1.500L16 5.500l1.500-.500z" /></>,
  maske: <><path d="M4.500 5.500c5 1.500 10 1.500 15 0V12c0 4.500-3.300 8-7.500 8s-7.500-3.500-7.500-8z" /><path d="M8.500 10.500h2M13.500 10.500h2M9 14.500c2 1.500 4 1.500 6 0" /></>,
  pusula: <><circle cx="12" cy="12" r="8.500" /><path d="m15.500 8.500-2 5-5 2 2-5z" /></>,
  bina: <><path d="M5 20.500V6.500l7-3 7 3v14M3.500 20.500h17" /><path d="M9 9.500v1.500M12 9.500v1.500M15 9.500v1.500M9 13.500v1.500M15 13.500v1.500M10.500 20.500v-3.500h3v3.500" /></>,
  sohbet: <><path d="M4.500 5.500h11v8h-6l-3 3v-3h-2z" /><path d="M9.500 16.500h7l3 3v-3h0v-7h-1.500" /></>,
  harita: <><path d="M4 6.500 9.500 4l5 2.500L20 4v13.500L14.500 20l-5-2.500L4 20z" /><path d="M9.500 4v13.500M14.500 6.500V20" /></>,
} as const;

export type PiktogramAdi = keyof typeof PIKTOGRAMLAR;

const UNITE_PIKTOGRAMI: Record<string, PiktogramAdi> = {
  "otelcilik-seyahat/1": "damla",
  "otelcilik-seyahat/2": "sohbet",
  "otelcilik-seyahat/3": "anahtar",
  "otelcilik-seyahat/4": "bavul",
  "otelcilik-seyahat/5": "konuk",
  "otelcilik-seyahat/6": "papyon",
  "genel-turizm-2026/1": "pusula",
  "genel-turizm-2026/2": "bina",
  "genel-turizm-2026/3": "harita",
  "genel-turizm-2026/4": "parilti",
  "mesleki-gelisim/1": "sohbet",
  "mesleki-gelisim/2": "kalkan",
  "mesleki-gelisim/3": "siren",
  "mesleki-gelisim/4": "damla",
  "mesleki-gelisim/5": "parilti",
  "mesleki-gelisim/6": "anahtar",
  "mesleki-gelisim/7": "telefon",
  "mesleki-gelisim/8": "pusula",
  "mesleki-gelisim/9": "harita",
  "mesleki-gelisim/10": "bina",
  "global-otelcilik/1": "harita",
  "global-otelcilik/2": "konuk",
  "global-otelcilik/3": "parilti",
  "global-otelcilik/4": "maske",
  "global-otelcilik/5": "bavul",
  "global-otelcilik/6": "telefon",
  "konaklama-seyahat/1": "damla",
  "konaklama-seyahat/2": "kalkan",
  "konaklama-seyahat/3": "papyon",
  "konaklama-seyahat/4": "konuk",
  "konaklama-seyahat/5": "bavul",
  "konaklama-seyahat/6": "siren",
  "konaklama-seyahat/7": "telefon",
  "konaklama-seyahat/8": "anahtar",
  "konaklama-seyahat/9": "parilti",
  "konaklama-seyahat/10": "maske",
  "genel-turizm/1": "sohbet",
  "genel-turizm/2": "pusula",
  "genel-turizm/3": "bina",
  "genel-turizm/4": "anahtar",
  "genel-turizm/5": "parilti",
  "genel-turizm/6": "bavul",
  "genel-turizm/7": "maske",
  "genel-turizm/8": "harita",
};

export function Piktogram({ unite, boyut = 24, className }: { unite: string; boyut?: number; className?: string }) {
  return (
    <svg className={className} width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.400" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PIKTOGRAMLAR[UNITE_PIKTOGRAMI[unite] ?? "pusula"]}
    </svg>
  );
}

// Art deco köşe süsü: öne çıkan kartların köşesinde kullanılır.
export function KoseSusu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      {[18, 34, 50, 66, 82, 98].map((r) => (
        <path key={r} d={`M120 ${120 - r}A${r} ${r} 0 0 0 ${120 - r} 120`} opacity={1 - r / 130} />
      ))}
    </svg>
  );
}
