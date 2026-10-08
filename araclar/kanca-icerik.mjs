// Claude Code kancası (PostToolUse, Edit|Write): icerik/ altında bir dosya değişince denetimi çalıştırır.
// Hata varsa 2 koduyla çıkar; hata metni Claude'a geri gider ve hemen düzeltilir. Hata yoksa inceleme sayfaları yenilenir.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icerigiDenetle } from "./icerik-dogrula.mjs";

let dosya = "";
try {
  dosya = JSON.parse(readFileSync(0, "utf8")).tool_input?.file_path ?? "";
} catch {
  process.exit(0);
}
if (!/[\\/]icerik[\\/].+\.json$/.test(dosya)) process.exit(0);

const { hatalar } = icerigiDenetle();
if (hatalar.length > 0) {
  console.error(`İçerik denetimi ${hatalar.length} hata buldu, düzelt:\n` + hatalar.map((h) => "  - " + h).join("\n"));
  process.exit(2);
}
spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "inceleme-belgesi.mjs")]);
