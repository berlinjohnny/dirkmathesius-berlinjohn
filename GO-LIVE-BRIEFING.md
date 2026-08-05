# Go-live-Briefing — offizieller Relaunch www.dirkmathesius.de
**Termin: Mittwoch, 05.08.2026, 16:00 Uhr mit Dirk**
Stand: 05.08.2026, 14:15 Uhr · Branch `main` @ `aa558da` (gepusht)

---

## 1. Kurzfassung

Die Seite ist **technisch startklar**. Build grün, Tests grün, Lint 0 Fehler,
alle 15 Routen 200, JSON-LD valide, alle 185 Sitemap-Bilder auflösbar.
Der SFTP-Zugang zu IONOS ist **getestet und funktioniert**, der Docroot ist bestätigt.
Ein Backup der aktuellen Live-Seite liegt lokal.

**Was noch fehlt, ist keine Technik, sondern Dirks Freigabe** (Abschnitt 4).

---

## 2. Was heute geprüft und behoben wurde

### Geprüft (gemessen, nicht vermutet)
| Prüfung | Ergebnis |
|---|---|
| Produktions-Build (`build:ionos`) | ✅ grün, 220 Dateien |
| Tests / Lint | ✅ 1/1 · 0 Fehler (8 harmlose shadcn-Warnings) |
| Alle Seiten lokal aufgerufen | ✅ 15/15 × HTTP 200 |
| JSON-LD (Start, Info, Über, Kollaborationen) | ✅ alle valide |
| Sitemap-Bilder | ✅ 185/185 auflösbar |
| Sitemap-/Robots-Domain | ✅ ausschließlich `www.dirkmathesius.de` |
| IONOS-SFTP-Login | ✅ funktioniert |
| IONOS-Docroot | ✅ bestätigt: Root `/` **ist** der Docroot |
| Alte Links → neue Seite | ✅ **1:1**, keine 301-Weiterleitungen nötig |

### Behoben (zwei echte Fehler, beide gefunden beim Trockenlauf)
1. **Canonical stand nicht im ausgelieferten HTML.** Er wurde bisher nur per
   JavaScript zur Laufzeit gesetzt. Jetzt steht er statisch in `index.html`;
   die Variantenlogik (Fanpage → dirkmathesius.de) funktioniert unverändert.
2. **Die Sitemap bewarb das falsche Startbild.** Sie zeigte auf das *alte*
   `windowpic.jpg` (mit fest verdrahteter Fremd-Domain), obwohl der Hero längst
   das Human-Flag-Foto ist. Ein Bild in der Sitemap existierte im Build gar nicht.
   Jetzt korrekt inkl. passendem Titel/Bildunterschrift.

---

## 3. Was beim Deploy tatsächlich passiert

Der Mirror ist **additiv (kein `--delete`)** — es wird nichts gelöscht.

**Wird überschrieben** (Dateien mit gleichem Namen — das ist der Relaunch):
`index.html`, `info.html`, `impressum.html`, `datenschutzerklaerung.html`,
`sport/folks/music/reportage/landscape/stills/publication.html`, `style.css`,
`favicon.ico` sowie Teile von `images/`.

**Bleibt unangetastet** (~100 MB Altbestand):
die alten Bildordner `sport/`, `folks/`, `music/`, `reportage/`, `landscape/`,
`stills/`, `publication/`, dazu `SpryAssets/`, `downloads/`, `icon.psd`.
→ Alte, von Google indexierte Bild-URLs bleiben erreichbar. Kein SEO-Bruch.

**Kommt neu dazu:** `ueber-dirk.html`, `kollaborationen.html`, `robots.txt`,
`sitemap.xml`, `assets/`, `portfolio/`, `.htaccess`.

### Backup
Alles, was überschrieben wird, liegt gesichert unter:
```
~/dirkmathesius-live-backup-2026-08-05/        (5 MB, inkl. images/ + SpryAssets/)
```
Rückweg: dieselben Dateien einfach wieder hochspielen.

---

## 4. Entscheidungen, die Dirk treffen muss

1. **Go / No-Go** — und wann. Der Deploy dauert wenige Minuten.
2. **Kontaktformular:** Anfragen laufen über Web3Forms. **An welche Adresse sollen
   sie gehen?** Direkt nach dem Go-live einen echten Testeintrag absenden und
   prüfen, ob er ankommt. (Fallback ist `mail@dirkmathesius.de` per mailto.)
3. **Google Analytics** (`G-NHPNTGY90D`): Soll Dirk eigenen Zugriff bekommen?
4. **Google Search Console:** Wer verifiziert `www.dirkmathesius.de` und reicht
   `sitemap.xml` ein? Ohne das dauert die Neuindexierung deutlich länger.
5. **Alte Inhalte:** Der 100-MB-Altbestand bleibt liegen. Soll später aufgeräumt
   werden — oder bewusst als Archiv behalten?

Kein Thema ist die **DNS**: `www.dirkmathesius.de` zeigt bereits auf genau diesen
IONOS-Speicher. Es wird nur der Inhalt ersetzt, nichts umgezogen.

---

## 5. Go-live-Ablauf

```bash
cd ~/Jobs\&Projekte/COWORK/dirkmathesius
./scripts/deploy-ionos.sh
```

Das Skript macht in einem Rutsch: Generator auf `www` → Produktions-Build →
Produktions-`.htaccess` → additiver SFTP-Mirror → setzt den Arbeitsstand
anschließend auf den Testbed-Stand zurück. Es bricht bei jedem Fehler ab.

> ⚠️ **Nicht verwechseln:** `deploy-dm` deployt das **Testbed** auf
> dirkmathesius.berlinjohn.de. Der offizielle Go-live ist **`scripts/deploy-ionos.sh`**.

### Danach sofort prüfen
- `https://www.dirkmathesius.de/` lädt, Startbild da
- `/info.html`, `/ueber-dirk.html`, `/kollaborationen.html`, `/impressum.html`
- `http://dirkmathesius.de` → leitet auf `https://www.dirkmathesius.de` um
- Formular einmal echt abschicken
- GA4-Echtzeitbericht zeigt den Besuch

### Wenn etwas klemmt
Die einzige echte Unbekannte ist die neue `.htaccess` (bisher hatte der Server
keine). Falls die Seite danach einen **500er** zeigt:
```bash
# .htaccess löschen — Seite läuft sofort wieder
source ~/.dirkmathesius-ionos-ftp.env
LFTP_PASSWORD="$DM_IONOS_PASS" lftp -u "$DM_IONOS_USER" --env-password \
  "sftp://$DM_IONOS_HOST" -e "rm .htaccess; quit"
```
Die Seite funktioniert auch **ohne** `.htaccess` vollständig — alle Inhaltsseiten
sind echte `.html`-Dateien. Es entfallen dann nur HTTPS-Zwang, die
non-www→www-Umleitung und die Security-Header.

Kompletter Rückweg: Backup aus Abschnitt 3 wieder hochladen.

---

## 6. Direkt nach dem Go-live (nicht vergessen)

**Die Fanpage muss umgestellt werden.** Solange beide Seiten „official" sind,
konkurrieren sie bei Google um dieselben Begriffe.

In `.env`: `VITE_SITE_VARIANT=fanpage` → dann `deploy-dm`.
Danach zeigt der Canonical von dirkmathesius.berlinjohn.de auf Dirks Seite und
das Ranking bündelt sich dort, wo es hingehört.

---

## 7. Offen / ehrlich benannt

- **`.htaccess` auf IONOS ist ungetestet** (der Server hatte bisher keine).
  Bekannte Falle `Options -MultiViews` ist bewusst vermieden. Rückweg oben.
- **Web3Forms-Zustellung ist ungetestet** — braucht einen echten Absendetest.
- **Die Fanpage-Umstellung (Abschnitt 6) ist noch nicht gemacht** und wäre
  ohne sie ein SEO-Eigentor.
