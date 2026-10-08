/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:icerik" {
  import type { Plan, UniteDosyasi } from "./cekirdek/tipler";
  export const planlar: Plan[];
  export const dosyalar: UniteDosyasi[];
}
