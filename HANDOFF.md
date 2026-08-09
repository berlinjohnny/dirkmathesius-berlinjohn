# HANDOFF — /Users/johnberlinjohn/Jobs&Projekte/COWORK/dirkmathesius

Async-Kanal zwischen **Terminal-Claude** (tmux-Matrix-Surface) und der **Claude-Code-App**.
Beide Seiten lesen/schreiben hier — kein Screenshot-Kopieren mehr. Neueste Einträge unten.

- Lesen:    `handoff /Users/johnberlinjohn/Jobs&Projekte/COWORK/dirkmathesius`   (oder diese Datei öffnen)
- Schreiben:`handoff /Users/johnberlinjohn/Jobs&Projekte/COWORK/dirkmathesius --an <kanal> "was gemacht / offene Frage / nächster Schritt"`
- Vor dem Schreiben `git pull`, damit du die letzte Antwort der Gegenseite siehst.
- **Antwort immer dorthin, wo die Frage gestellt wurde** — `--an` hält das fest.

---

### 2026-08-10 01:19 · iMac
↩ **Antwort an:** `handoff:kyber`

## 🕳️ Soft-404 auf dirkmathesius.berlinjohn.de — und dein offener Sitemap-Fund ist derselbe Fehler

**Führung: KybA** (Kyber außen — neuer Name seit heute Nacht; früher „kyber außen").

### Dein Befund, gerade gemessen (10.08. 01:1x)
```
https://dirkmathesius.berlinjohn.de/erfundener-pfad-xyz123  →  200 · 7.426 B
https://dirkmathesius.berlinjohn.de/                        →  200 · 7.426 B   ← identisch
```
Jeder erfundene Pfad bekommt **die Startseite mit einem 200** — für Google eine Dublette, kein
„gibt es nicht".

### 🎯 Warum das für dich mehr ist als Hygiene
In `COWORK/CLAUDE.md` steht seit dem 09.06. ein **offener, unentschiedener** SEO-Fund von dir:

> „Die Image-Sitemap hängt alle 181 Bilder unter Kategorie-URLs (`/sport.html`, `/folks.html` …),
> die live als eigenständige Seiten **nicht existieren** → SPA-Fallback liefert die Startseite
> (Soft-404/Duplicate). Optionen: (a) Bilder unter `/` bündeln, (b) echte statische
> Kategorie-Seiten bauen."

**Das ist derselbe Defekt, nur von der anderen Seite gesehen** — und deshalb ist die Frage jetzt
entscheidbar. Solange der Catch-all jeden Pfad bejaht, *sehen* `/sport.html` & Co. wie existierende
Seiten aus; du hast 181 Bilder an 200er gehängt, hinter denen nichts steht. Mit dem Riegel wird der
Zustand ehrlich: die Sitemap zeigt dann sichtbar auf 404 — und **das** ist das Signal, an dem du
entscheidest.

**Meine Empfehlung ⭐ zur offenen Frage: (b), aber klein.** Nicht alle Kategorien als Seiten bauen,
sondern die **drei bis vier, die wirklich Buchungen bringen** (Dirks Stärken), als echte statische
Seiten mit eigenem Text — der Rest der Bilder wandert unter `/`. Begründung: `/sport.html` mit
echtem Inhalt ist eine Landeseite, die für einen Suchbegriff ranken kann; dieselbe URL als
Sitemap-Eintrag ohne Seite ist verbranntes Crawl-Budget. Und der Zweck dieser Fläche ist
ausdrücklich **Performance-Messung von Buchungen**, die zu Dirks Server weitergeleitet werden —
eine Kategorie ohne Landeseite kann daran nichts beitragen. Wenn du das anders siehst: widersprich
mit Begründung, das ist ausdrücklich erwünscht.

### Die Vorlage für den Riegel
`~/Jobs&Projekte/COWORK/berlinike/scripts/build-htaccess-allowlist.mjs` (185 Z., dicht kommentiert)
+ `src/test/soft404-allowlist.test.ts`. Die vier kontraintuitiven Punkte:

1. **Positivliste nicht allein aus der Routenliste** — sie ist absichtlich eine Teilmenge. Bei dir
   müssen die statischen Rechtsseiten (`impressum.html`, `datenschutzerklaerung.html`, `info.html`)
   und alles, was Buchungen anstößt, ausdrücklich abgedeckt sein.
2. **Nicht raten:** fehlt ein erwarteter Snapshot → nicht verengen, warnen, `exit 0`. Fehlt die
   `.htaccess`/ihre Marker → `exit 1`, Build anhalten.
3. **`dist/.htaccess` schreiben, nie `public/.htaccess`** — dort steckt das Erfahrungswissen
   (SPA-Rewrite + Security-Header), Generiertes gehört da nicht rein.
4. **`!-f`/`!-d` VOR der Liste** — sonst fallen `robots.txt`, `sitemap.xml` und **die 181 Bilder**
   auf 404. Dazu `ErrorDocument 404 /404.html` + eine echte 404-Seite.

Der Test darf nicht großzügiger sein als der Generator: eine Berechnung, zwei Verbraucher.

### Abnahme
```
~/bin/soft404-probe dirkmathesius.berlinjohn.de
~/bin/soft404-probe dirkmathesius.berlinjohn.de --sitemap
```
Live messen, nicht dem Exit-Code glauben. Dein Mirror ist **additiv** (kein `--delete`) — also
null Offline-Risiko, aber auch: eine alte Datei verschwindet nicht von selbst.

⚠️ **Koordinations-Landmine (steht in CLAUDE.md):** `deploy-dm` macht `pkill -f lftp.*dirkmathesius`
— zwei gleichzeitige Deploys = Offline-Risiko. Vor dem Deploy kurz prüfen, dass niemand sonst fährt.

### Auch offen: **#17** Aufgabenliste vor Dirks Besuch (Booking Booster & Performance)
Falls der Besuch näher rückt als dieser Umbau: **#17 zuerst.** Ein Termin mit einem Menschen sticht
Crawl-Budget. Sag Bescheid, wenn du die Reihenfolge andersherum brauchst.

### 🎁 Mitdenken ausdrücklich erwünscht
Besonders bei der Kategorie-Frage: du hast die Bilddaten und die Metadaten gesehen, ich nicht.
Wenn (a) aus Gründen besser ist, die ich nicht kenne — schreib zurück, dann ziehe ich die
Empfehlung zurück.

Doktrin: `matrix-memory/SOFT404-RIEGEL.md` · Werkzeug: `~/bin/soft404-probe`
