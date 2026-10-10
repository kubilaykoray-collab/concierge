import { useEffect } from "react";
import { Simge, TerfiPerdesi, type SimgeAdi } from "./bilesenler";
import { useIlerleme, useTerfi, useYol } from "./depo";
import { Bugun } from "./ekranlar/Bugun";
import { Ders } from "./ekranlar/Ders";
import { Dersler, UniteEkrani } from "./ekranlar/Dersler";
import { Ilerleme } from "./ekranlar/Ilerleme";
import { Kesfet } from "./ekranlar/Kesfet";
import { Kunye } from "./ekranlar/Kunye";
import { Oyun } from "./ekranlar/Oyun";
import { Sozluk } from "./ekranlar/Sozluk";
import { Tekrar } from "./ekranlar/Tekrar";
import { Vaka } from "./ekranlar/Vaka";
import { Test } from "./ekranlar/Test";

const SEKMELER: { yol: string; ad: string; simge: SimgeAdi }[] = [
  { yol: "", ad: "Bugün", simge: "zil" },
  { yol: "dersler", ad: "Dersler", simge: "kitap" },
  { yol: "kesfet", ad: "Keşfet", simge: "harita" },
  { yol: "sozluk", ad: "Sözlük", simge: "ara" },
  { yol: "ilerleme", ad: "İlerleme", simge: "yildiz" },
];

export function Uygulama() {
  const [terfi, terfiKapat] = useTerfi();
  return (
    <>
      <Ekran />
      {terfi && <TerfiPerdesi unvan={terfi} kapat={terfiKapat} />}
    </>
  );
}

function Ekran() {
  const yol = useYol();
  const { tema } = useIlerleme();

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  const [bolum = "", a, b, c] = yol;
  const uniteAnahtari = `${a}/${b}`;

  // Tam ekran akışlar: alt sekme çubuğu görünmez, dikkat tek işte kalır.
  if (bolum === "ders") return <Ders key={yol.join("/")} uniteAnahtari={uniteAnahtari} sira={Number(c)} />;
  if (bolum === "tekrar") return <Tekrar key={yol.join("/")} serbest={a === "serbest"} />;
  if (bolum === "test") return <Test key={yol.join("/")} uniteAnahtari={uniteAnahtari} />;
  if (bolum === "oyun") return <Oyun key={yol.join("/")} uniteAnahtari={uniteAnahtari} />;
  if (bolum === "vaka") return <Vaka key={yol.join("/")} uniteAnahtari={uniteAnahtari} />;

  const BILINEN = ["dersler", "unite", "kesfet", "sozluk", "ilerleme", "kunye"];
  const sekme = bolum === "unite" ? "dersler" : bolum === "kunye" ? "ilerleme" : BILINEN.includes(bolum) ? bolum : "";
  return (
    <div className="kabuk">
      <main className="sayfa">
        {sekme === "" && <Bugun />}
        {bolum === "dersler" && <Dersler secili={a} />}
        {bolum === "unite" && <UniteEkrani anahtar={uniteAnahtari} />}
        {bolum === "kesfet" && <Kesfet />}
        {bolum === "sozluk" && <Sozluk secili={a} />}
        {bolum === "ilerleme" && <Ilerleme />}
        {bolum === "kunye" && <Kunye />}
      </main>
      <nav className="sekmeler" aria-label="Ana menü">
        {SEKMELER.map((s) => (
          <a key={s.yol} href={`#/${s.yol}`} className={sekme === s.yol ? "sekme sekme-secili" : "sekme"} aria-current={sekme === s.yol ? "page" : undefined}>
            <Simge ad={s.simge} />
            <span>{s.ad}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
