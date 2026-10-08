import { useEffect, useState, useSyncExternalStore } from "react";
import { BOS, oku, type Ilerleme } from "./cekirdek/ilerleme";

// İlerleme yalnız bu cihazın localStorage'ında durur. Ağ çağrısı yoktur.
const ANAHTAR = "lobi.ilerleme.v1";

function yukle(): Ilerleme {
  try {
    return oku(localStorage.getItem(ANAHTAR));
  } catch {
    return BOS;
  }
}

let durum = yukle();
const dinleyiciler = new Set<() => void>();

export function guncelle(degistir: (d: Ilerleme) => Ilerleme) {
  durum = degistir(durum);
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(durum));
  } catch {
    // Depolama kapalıysa (gizli sekme, dolu disk) uygulama bu oturumluk çalışmaya devam eder.
  }
  dinleyiciler.forEach((d) => d());
}

export const sifirla = () => guncelle((d) => ({ ...BOS, tema: d.tema }));

export function useIlerleme(): Ilerleme {
  return useSyncExternalStore(
    (d) => {
      dinleyiciler.add(d);
      return () => dinleyiciler.delete(d);
    },
    () => durum,
  );
}

// Hash tabanlı yönlendirme: "#/unite/genel-turizm/2" → ["unite", "genel-turizm", "2"]
const parcala = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);

export function useYol(): string[] {
  const [yol, yolAyarla] = useState(parcala);
  useEffect(() => {
    const degisti = () => {
      yolAyarla(parcala());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", degisti);
    return () => window.removeEventListener("hashchange", degisti);
  }, []);
  return yol;
}

export const git = (yol: string) => {
  location.hash = yol;
};
