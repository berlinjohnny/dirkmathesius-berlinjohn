import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Kein statisches public/**\/*.html darf auf "index.html" verlinken. Der Server
 * liefert die physische Datei zwar mit 200 aus, aber React Router matched danach
 * client-seitig exakt auf "/" (App.tsx) -- "/index.html" faellt auf die
 * Route "*" (NotFound), obwohl der Server-Request erfolgreich war. curl/HTTP-Checks
 * sehen diesen Fehler nicht, nur ein echter Klick im Browser. Fund vom 2026-08-22:
 * genau dieser Link in impressum.html/datenschutzerklaerung.html liess das
 * Kreuz-Logo in eine 404-Sackgasse fuehren. Die richtige Zielangabe ist "/".
 */

const ROOT = join(__dirname, "..", "..");
const PUBLIC_DIR = join(ROOT, "public");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

describe("Kein Link auf index.html (React-Router-Sackgasse)", () => {
  for (const file of htmlFiles(PUBLIC_DIR)) {
    const relPath = file.slice(ROOT.length + 1);
    it(`${relPath} verlinkt nicht relativ auf "index.html"`, () => {
      const txt = readFileSync(file, "utf8");
      expect(txt, `${relPath} sollte auf "/" statt "index.html" verlinken`).not.toMatch(
        /href=["']index\.html["']/,
      );
    });
  }
});
