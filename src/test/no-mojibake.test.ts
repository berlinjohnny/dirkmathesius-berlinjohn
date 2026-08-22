import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Haelt public/**\/*.html frei von U+FFFD-Ersatzzeichen. Diese Dateien (u.a.
 * impressum.html, datenschutzerklaerung.html) liegen bewusst statisch ausserhalb
 * des Vite-Baus (§5 TMG: Pflichtangaben duerfen nicht hinter JS liegen) und
 * werden deshalb von keinem anderen Check (build/lint/vitest der React-App)
 * je inhaltlich gelesen. Ein U+FFFD ist immer ein Fehler -- nie beabsichtigter
 * Inhalt -- und entsteht durch verlustbehaftete Zeichensatz-Konvertierung beim
 * Kopieren von Alt-Content. Fund vom 2026-08-22: 45 Treffer in
 * datenschutzerklaerung.html, unbemerkt seit dem Relaunch.
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

describe("Keine Ersatzzeichen (Mojibake) in public/**/*.html", () => {
  for (const file of htmlFiles(PUBLIC_DIR)) {
    const relPath = file.slice(ROOT.length + 1);
    it(`${relPath} enthaelt kein U+FFFD`, () => {
      const txt = readFileSync(file, "utf8");
      const count = (txt.match(/�/g) ?? []).length;
      expect(count, `${relPath} hat ${count} Ersatzzeichen (�) -- Zeichensatz-Schaden`).toBe(0);
    });
  }
});
