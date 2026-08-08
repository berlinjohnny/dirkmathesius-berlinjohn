# Was jetzt zu tun ist

Stand: 2026-08-08, direkt nach dem Deploy beider Domains.
Der technische Teil ist fertig und live gemessen — was hier steht, kann Software nicht erledigen.

---

## 🔴 Dringend — diese Woche, sonst kostet es Sichtbarkeit

### 1. Fanpage-Sitemap in der Search Console neu einreichen · **John**

Die Struktur von `dirkmathesius.berlinjohn.de` hat sich heute geändert. Vorher standen dort
sieben Kategorie-Seiten, jetzt eine Übersicht:

| vorher | jetzt |
|---|---|
| `/sport.html`, `/folks.html`, `/publication.html` | → `/photography.html` (301) |
| `/music.html`, `/landscape.html`, `/reportage.html`, `/stills.html` | → `www.dirkmathesius.de` (301) |

Google kennt die alten URLs noch. Die 301-Weiterleitungen führen es zwar von selbst hinüber,
aber das dauert Wochen — mit einer neu eingereichten Sitemap sind es Tage.

**So geht's:** Search Console → Property `dirkmathesius.berlinjohn.de` → *Sitemaps* →
`sitemap.xml` einreichen. Sie enthält jetzt 7 URLs.

> ⚠️ Vor IONOS sitzt eine WAF. Fast jede Aktion in der Search Console scheitert im **ersten**
> Anlauf und klappt im zweiten. Nicht am Setup zweifeln — einfach wiederholen.

### 2. Dirk Zugang zu Search Console und GA4 geben · **John**

Beides läuft aktuell ausschließlich auf Johns Konto (berlinjohnf@googlemail.com). Dirk kann
damit weder sehen, wie seine eigene Seite läuft, noch käme er ohne John an die Daten.

- Search Console → Property `https://www.dirkmathesius.de/` → *Einstellungen* → *Nutzer und Berechtigungen* → Dirk hinzufügen
- GA4 `G-NHPNTGY90D` → *Verwaltung* → *Zugriffsverwaltung* → Dirk hinzufügen

---

## 🟡 Sobald Dirk liefert

### 3. Eigenes Showreel · **Dirk**

Auf `/ueber-dirk.html` läuft derzeit **Johns** Video („Die FriedensFlagge", ID `D5VtZJvNYGY`)
auf Johns YouTube-Kanal. Es ist auf der Seite ehrlich so beschriftet, ist aber natürlich
kein Ersatz für Dirks eigene Arbeit.

Dirk schickt eine YouTube-ID → John tauscht `SHOWREEL_ID` in
`scripts/build-portfolio-manifest.mjs:965` und deployt neu.

### 4. Kontrolle: sind die Fotos die richtigen? · **Dirk**

Die Fanpage zeigt jetzt **13 Bilder** aus der Zusammenarbeit mit John, gebündelt unter
„Photography". Dirks eigene Seite behält alle **184 Fotos in 7 Kategorien** — daran hat sich
nichts geändert. Falls ein Bild auf der Fanpage nichts zu suchen hat: Bescheid geben.

---

## ⚙️ Für den, der das nächste Mal deployt

**Immer die fertigen Skripte nehmen. Niemals von Hand bauen und hochladen.**

| Was | Befehl |
|---|---|
| Dirks Seite (IONOS) | `./scripts/deploy-ionos.sh` |
| Fanpage (KAS) | `deploy-dm` |

### Warum das keine Bequemlichkeitsfrage ist

`npm run build:ionos` **ruft den Generator nicht auf.** Wer den Generator von Hand laufen
lässt, muss `SITE_VARIANT=official` mitgeben — sonst liest er die Variante aus `.env`, wo
`fanpage` steht.

Die Folge wäre nicht kosmetisch: Dirks Seite bekäme statt ihrer sieben Kategorie-Seiten drei
`noindex`-Weiterleitungen, die seine eigenen Sport-, People- und Publication-Seiten auf eine
`berlinjohn.de`-Subdomain schicken. `deploy-ionos.sh` macht es richtig — deshalb das Skript.

### Zwei weitere Landminen

- **Nie zwei Deploys gleichzeitig.** `deploy-dm` macht `pkill -f lftp.*dirkmathesius`. Läuft
  parallel eine zweite Claude-Instanz oder ein zweites Terminal, killt der eine Deploy den
  anderen mitten im Upload.
- **`public/googlebdcb76c090b10bb1.html` niemals löschen** — daran hängt die
  Search-Console-Bestätigung.

---

## Was heute passiert ist

- Fanpage bündelt die 13 Kollaborationen in eine Übersicht `/photography.html`;
  die alten Rubriken leiten per 301 dorthin bzw. zu Dirk.
- **Bug behoben:** Der Umbau hätte Dirks sieben Kategorie-Seiten ohne jeden Anfrage-Button
  zurückgelassen. Jetzt trägt jede genau einen — „Shooting anfragen →" auf `/#info`.
- Dark-Mode auf allen statischen Unterseiten, gekoppelt an die Wahl in der Hauptseite.
- CTA optisch zurückgenommen: Haarlinie statt schwarzem Balken.

Live geprüft: alle 14 Seiten auf `www.dirkmathesius.de` liefern 200, alle Weiterleitungen
auf der Fanpage greifen, beide Sitemaps sind erreichbar.

### Bewusst in Kauf genommen

Der Zusammenzug nimmt einen Teil von PR #16 zurück, der diese Kategorie-Seiten im Juni
gerade gegen Soft-404s gebaut hatte. 13 Bilder auf sieben Rubriken zu verteilen ergab aber
keine Kategorien, sondern fast leere Seiten. **301-Weiterleitungen bleiben in Browser-Caches
kleben** — eine Rückkehr zu den Einzelseiten wäre für wiederkehrende Besucher unsauber.
