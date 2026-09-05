import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Schwestertest zu no-mojibake.test.ts, aber gegen die andere Haelfte derselben
 * Fehlerklasse: dort geht ein Zeichen beim Konvertieren KAPUTT (U+FFFD), hier ist
 * es unversehrt in der Datei und wird nur FALSCH GELESEN.
 *
 * Fund vom 2026-09-05 (gemeldet von Dirk): der Hell/Dunkel-Knopf auf
 * /datenschutzerklaerung.html zeigte „â~€" statt ☀. Zwei Ursachen uebereinander:
 *   1. Die Datei deklarierte `charset=ISO-8859-1`, war aber UTF-8 gespeichert.
 *   2. Ihr Inline-Skript setzte ☀/☾ als rohe Zeichen — und stand damit als
 *      einziger Nicht-ASCII-Inhalt voll im Wirkungsbereich von (1). Alles andere
 *      auf der Seite sind HTML-Entities (&uuml; …) und blieb deshalb heil, was
 *      den Fehler monatelang auf diesen einen Knopf reduziert und unsichtbar
 *      gemacht hat. impressum.html hatte denselben Bug, dort war er schon per
 *      \u-Escape gefixt — die Zwillingsdatei wurde vergessen.
 *
 * Der Riegel sitzt bewusst NUR auf der Deklaration, nicht auf rohen Sonderzeichen im
 * Skript: bei korrekt deklariertem UTF-8 ist ein ☀ im Quelltext voellig in Ordnung —
 * die generierten Seiten machen es seit Monaten fehlerfrei so. Ein Guard, der
 * einwandfreien Code rot faerbt, wird abgeschaltet und schuetzt dann gar nichts.
 *
 * Diese Dateien liegen bewusst ausserhalb des Vite-Baus (§5 TMG), also liest sie
 * sonst kein Build, kein Lint und kein anderer Test.
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

describe("Zeichensatz in public/**/*.html", () => {
  for (const file of htmlFiles(PUBLIC_DIR)) {
    const relPath = file.slice(ROOT.length + 1);
    const txt = readFileSync(file, "utf8");

    it(`${relPath} deklariert keinen Nicht-UTF-8-Zeichensatz`, () => {
      const treffer = txt.match(/charset\s*=\s*["']?\s*([\w-]+)/gi) ?? [];
      const falsch = treffer.filter((t) => !/utf-?8/i.test(t));
      expect(falsch, `${relPath} deklariert ${falsch.join(", ")} — die Dateien sind UTF-8`).toEqual([]);
    });
  }
});
