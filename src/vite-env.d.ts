/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:icerik" {
  import type { Gorsel, Plan, UniteDosyasi } from "./cekirdek/tipler";
  export const planlar: Plan[];
  export const dosyalar: UniteDosyasi[];
  export const gorseller: Gorsel[];
}
