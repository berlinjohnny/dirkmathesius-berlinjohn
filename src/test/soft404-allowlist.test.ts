import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Haelt den Soft-404-Riegel (public/.htaccess + deploy/htaccess.ionos) synchron
 * zu den echten Client-Routen in src/App.tsx. Eine neue <Route path="..."> ohne
 * passende RewriteRule soll diesen Test rot machen statt still auf einen echten
 * 404 zu fallen (fuer eine Route, die die SPA eigentlich bedienen soll).
 */

const ROOT = join(__dirname, "..", "..");

function routesFromApp(): string[] {
  const src = readFileSync(join(ROOT, "src", "App.tsx"), "utf8");
  const matches = [...src.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
  // "*" ist die NotFound-Route — die MUSS auf einen echten 404 fallen, nicht auf die SPA.
  return matches.filter((p) => p !== "*");
}

function keyFor(routePath: string): string {
  return routePath.replace(/^\//, "").replace(/\/$/, "");
}

describe("Soft-404-Riegel", () => {
  const routes = routesFromApp();

  it("findet die erwarteten Client-Routen in App.tsx", () => {
    expect(routes).toEqual(["/", "/impressum"]);
  });

  for (const file of ["public/.htaccess", "deploy/htaccess.ionos"]) {
    it(`${file} deckt jede Client-Route aus App.tsx ab`, () => {
      const txt = readFileSync(join(ROOT, file), "utf8");
      for (const route of routes) {
        const key = keyFor(route) || "\\$"; // Wurzel-Route -> RewriteRule ^$
        const pattern = new RegExp(`RewriteRule \\^${key}/?\\??\\$?`);
        expect(txt, `${file} sollte eine RewriteRule fuer "${route}" haben`).toMatch(pattern);
      }
    });

    it(`${file} setzt ErrorDocument 404 auf eine echte Datei`, () => {
      const txt = readFileSync(join(ROOT, file), "utf8");
      expect(txt).toMatch(/ErrorDocument 404 \/404\.html/);
    });
  }

  it("public/404.html existiert", () => {
    expect(() => readFileSync(join(ROOT, "public", "404.html"), "utf8")).not.toThrow();
  });
});
