# Checkliste vor Dirks Besuch — Booking Booster & Performance

Stand: 2026-08-10. Antwort auf Issue **#17**. Zweck: Dirk soll beim Termin einen real
funktionierenden Booking Booster sehen und wissen, woran seine Seite gemessen wird.

---

## ✅ Steht schon (kann beim Termin gezeigt werden)

- Beide Domains live, technisch fehlerfrei: `www.dirkmathesius.de` (13 Seiten, 184 Fotos,
  7 Kategorien) + `dirkmathesius.berlinjohn.de` (Fanpage, 13 Kollaborationen, bündelt in
  `/photography.html`).
- **Soft-404-Riegel seit heute auf beiden Domains live** — erfundene Pfade liefern jetzt
  einen echten 404 statt einer Startseiten-Dublette (SEO-Hygiene, direkt vor dem Termin
  noch behoben).
- **Booking-Booster-Kette funktioniert end-to-end:** Fanpage → `/photography.html` →
  UTM-Link (`?utm_source=dirkmathesius&utm_medium=booking-booster&utm_campaign=portfolio-photography`)
  → `www.dirkmathesius.de`. Damit ist jede Anfrage, die über die Fanpage kommt, in GA4 als
  eigener Kanal sichtbar — das lässt sich beim Termin live in **GA4 Echtzeit** vorführen.
- Kontaktformular (`/info.html`, Web3Forms) end-to-end bewiesen, Anfrage-Mail lesbar
  (echte Beschriftungen, Reply-To auf den Anfragenden).
- Bild-Lizenz-Metadaten aktiv → Fotos erscheinen in der Google-Bildersuche als
  „lizenzierbar", mit direktem Anfragekanal.
- Security-Header, HTTPS-Zwang, non-www→www-Redirect: alle 3/3 bzw. 200/301 wie erwartet.

---

## 🔴 Vor dem Termin — Johns Aufgaben

### 1. Fanpage-Sitemap in der Search Console neu einreichen
Struktur hat sich am 08.08. geändert (7 Kategorie-URLs → 1 `/photography.html`), Google
kennt noch die alten Pfade. Sitemap hat jetzt **6 URLs** (kollaborationen.html ist raus,
kanonisiert ohnehin zu Dirks Domain).
→ Search Console → Property `dirkmathesius.berlinjohn.de` → *Sitemaps* → `sitemap.xml`
einreichen. ⚠️ IONOS-WAF lässt fast jede Aktion im ersten Anlauf scheitern — beim zweiten
Versuch klappt es.

### 2. Dirk Zugang zu Search Console und GA4 geben
Beides läuft ausschließlich auf Johns Konto — Dirk kann seine eigenen Zahlen sonst nicht
sehen, auch nicht beim Termin selbst live mitverfolgen.
- Search Console → Property `https://www.dirkmathesius.de/` → *Einstellungen* →
  *Nutzer und Berechtigungen* → Dirk hinzufügen
- GA4 `G-NHPNTGY90D` → *Verwaltung* → *Zugriffsverwaltung* → Dirk hinzufügen

---

## 🟡 Sobald Dirk liefert

### 3. Eigenes Showreel
`/ueber-dirk.html` zeigt aktuell **Johns** Video („Die FriedensFlagge"), ehrlich so
beschriftet — aber kein Ersatz für Dirks eigene Arbeit. Dirk schickt eine YouTube-ID →
John tauscht `SHOWREEL_ID` in `scripts/build-portfolio-manifest.mjs:965` und deployt neu.

### 4. Foto-Kontrolle Fanpage
13 Bilder aus der Zusammenarbeit mit John unter „Photography" — Dirks eigene Seite behält
alle 184 Fotos in 7 Kategorien unverändert. Falls ein Bild auf der Fanpage nichts zu suchen
hat: Bescheid geben.

### 5. Entscheidung: Web3Forms PRO?
Aktuell versendet das Kontaktformular funktional, aber mit Standard-Layout und ohne
Autoresponder. Gestaltetes HTML-Template + automatische Eingangsbestätigung gibt es nur im
PRO-Tarif — lohnt sich, wenn Dirk Wert auf eine professionellere erste Rückmeldung legt.

---

## 🎯 Beim Termin selbst zeigen

1. **GA4 Echtzeit öffnen**, eine Testanfrage über die Fanpage schicken → live sehen, wie
   sie mit `booking-booster`-UTM in Dirks eigenem Google-Konto ankommt (sobald Punkt 2
   erledigt ist, sieht Dirk das selbst).
2. **Kontaktformular live testen** — Anfrage abschicken, gemeinsam die Mail im Postfach
   öffnen (Beschriftung + Reply-To vorführen).
3. **Google-Bildersuche:** ein Foto suchen, „Lizenzierbar"-Kennzeichnung zeigen.
4. Kurz erklären, **warum** die Fanpage ihre Solo-Kategorien zu Dirk weiterleitet
   (music/reportage/landscape/stills → 301 zu `www.dirkmathesius.de`) — Linkkraft und
   Besucher bündeln sich bei ihm, nicht bei John.

---

## Referenzen

- Technisches Protokoll des Go-lives: `GO-LIVE-BRIEFING.md`
- Deploy-Anleitung + Landminen: `NAECHSTE-SCHRITTE.md`
- Async-Verlauf mit KybA (Soft-404-Fund, Architekturentscheidungen): `HANDOFF.md`
