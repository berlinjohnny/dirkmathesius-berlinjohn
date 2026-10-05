# Ads-Vorbereitung Dirk Mathesius — B2B + Hochzeit
Stand 05.10.2026 · vorbereitet von der Fläche dirkmathesius · Übergabe an 1:Kybí zur Koordination

**Status: NICHTS geschaltet, kein Budget bewegt.** Gate Geld liegt bei John
(und Dirk als Kontoinhaber/Zahler). Alles unten ist startklar zum Einsetzen.

## 0. Vier Entscheidungen, die nur John/Dirk treffen können
1. **Budget** — Vorschlag Abschnitt 5. CPC-Werte sind **ungemessen** (kein Keyword-Planner-Lauf).
2. **Google-Ads-Konto:** Gibt es eines für Dirk? Wer ist Inhaber, wer zahlt? (Im Repo nichts gefunden — ungeklärt.)
3. **Dirks Freigabe** für Anzeigentexte, Bilder und das Schalten überhaupt.
4. **Referenzmarken im Anzeigentext** (BMW Motorrad, Red Bull, adidas)? Stehen auf seiner Seite, in den Anzeigen
   aber markenrechtlich heikler → Texte unten kommen **ohne** Markennamen aus.

## 1. Logik
- Ziel = **Anfragen auf Dirks Seite www.dirkmathesius.de**. Nie auf die Fanpage (Fanpage = Booking-Booster,
  Links nur Richtung Dirk).
- Zwei getrennte Kampagnen, je eine Landeseite, je ein Messwert:
  - **A Hochzeit/privat** → /hochzeitsfotograf-berlin.html (Formular, Event `variante: hochzeit`)
  - **B B2B/Unternehmen** → /ueber-dirk.html (CTA → /info.html#kontakt, Event `variante: info`)
- **Timing Hochzeit:** Seite selbst nennt 6–12 Monate Vorlauf, Saison Mai–September. Heute (Okt 2026) ist das
  Buchungsfenster für 2027 offen → jetzt starten lohnt. Jahreszahl in Texten jährlich prüfen.

## 2. Tracking — Voraussetzungen (gemessen am 05.10.2026)
- ✅ Event `anfrage_abgeschickt` mit `variante` (`info` / `hochzeit`) ist im Seitencode (Generator
  scripts/build-portfolio-manifest.mjs), GA4-ID G-NHPNTGY90D.
- 🔴 GA4 zeigt **0 Schlüsselereignisse** (28 T). Vor Start: `anfrage_abgeschickt` in GA4 als Schlüsselereignis
  markieren, GA4 ↔ Google Ads verknüpfen, Conversion importieren. Sonst läuft Budget blind.
- ⚠️ Consent-Banner (Standard „abgelehnt") → GA4 zählt nur Teile; Ads-Zahlen sind **Untergrenzen**
  (Consent Mode v2 liefert modellierte Conversions erst ab genug Volumen).
- ⚠️ Search Console ↔ GA4 nicht verknüpft (GA4 empfiehlt es selbst) — beim Verknüpfen gleich mit erledigen.
- ❌ `ads-absprung` (KAS-Logs) hilft hier **nicht**: Dirks Seite liegt auf IONOS, nicht KAS.
- Auto-Tagging (gclid) an. **Feste Kennungen, keine ValueTrack-Platzhalter** wie `{adgroupid}` (löst einer nicht auf,
  entsteht eine Phantom-Kampagne). `utm_content` je Anzeigengruppe fest setzen: a1-hochzeit · a2-verlobung · a3-portrait ·
  b1-industrie · b2-unternehmen · b3-werbung. Final-URLs (Beispiel Gruppe 1):
  - A: `https://www.dirkmathesius.de/hochzeitsfotograf-berlin.html?utm_source=google&utm_medium=cpc&utm_campaign=dm-hochzeit-berlin&utm_content=a1-hochzeit`
  - B: `https://www.dirkmathesius.de/ueber-dirk.html?utm_source=google&utm_medium=cpc&utm_campaign=dm-b2b-berlin&utm_content=b1-industrie`
- ⚠️ Nicht gemessen: Handy-Darstellung der Formulare nach Klick aus Anzeige (vor Start einmal live testen).

## 3. Kampagne A — „Hochzeit & privat" (Google Suche)
Geo: Berlin + ca. 40 km Umland (Seite: „deutschlandweit auf Anfrage" → nicht aktiv bewerben).
Sprache Deutsch. Gebotsstrategie zum Start: Klicks maximieren mit CPC-Limit, nach ~15 Conversions auf Ziel-CPA.
Anzeigengruppen (Keywords als [exakt] und „Phrase"):
- **A1 Hochzeit:** hochzeitsfotograf berlin · hochzeitsfotografie berlin · fotograf hochzeit berlin ·
  hochzeitsreportage berlin · fotograf standesamt berlin · fotograf freie trauung berlin
- **A2 Verlobung/Paar:** verlobungsshooting berlin · paarshooting berlin · fotograf verlobung berlin
- **A3 Portrait/Bewerbung:** businessportrait berlin · bewerbungsfoto berlin · fotograf linkedin foto berlin
  (gleiche Landeseite — Abschnitt „Business & Bewerbung")
Negative (Kampagnenebene): kurs · ausbildung · studium · job · stellenangebot · praktikum · gratis · kostenlos ·
selber · app · software · fotobuch · gebraucht · workshop · vorlage · beispiel · pdf · muster
**Nicht bewerben:** „Familie & Neugeborene" (Kinder-Riegel — keine Kinderthemen in bezahlter Werbung).

Responsive Suchanzeige — Überschriften (≤30 Zeichen, geprüft):
   1. Hochzeitsfotograf Berlin  (24)
   2. Echte Momente statt Posen  (25)
   3. Angebot meist in 24 Stunden  (27)
   4. Dirk Mathesius · Seit 1997  (26)
   5. Dokumentarisch begleitet  (24)
   6. Hochzeit, Verlobung & Feiern  (28)
   7. Für 2027 jetzt anfragen  (23)
   8. 30+ Jahre Fotoerfahrung  (23)
   9. Deutschlandweit auf Anfrage  (27)
  10. Hochzeitsreportage Berlin  (25)
  11. Business-Portrait & Bewerbung  (29)
  12. Persönlich statt Katalog  (24)
Beschreibungen (≤90 Zeichen, geprüft):
   1. Hochzeiten dokumentarisch begleitet – echte Momente, ohne gestellte Regie. Jetzt anfragen.  (90)
   2. Fotograf in Berlin mit 30+ Jahren Erfahrung. Individuelles Angebot meist in 24 Stunden.  (87)
   3. Trauung, Feier und die Momente dazwischen. Für 2027 ideal: 6–12 Monate Vorlauf.  (79)
   4. Farbe und Licht fein abgestimmt – das Motiv bleibt echt. Auswahl vor dem Termin klar.  (85)
Sitelinks: „Business-Portrait" · „FAQ & Ablauf" · „Über Dirk" · „Kontakt aufnehmen" (alle auf dirkmathesius.de).
Callouts: Seit 1997 · Angebot meist in 24 Std. · Dokumentarisch · Deutschlandweit auf Anfrage.
Anzeigenbilder: ads/dm-ad-hochzeit-land.jpg (1200×630) · ads/dm-ad-hochzeit-square.jpg (1200×1200).

## 4. Kampagne B — „B2B / Unternehmen" (Google Suche)
Geo: Berlin + Brandenburg; Seite nennt „Berlin & international" — zum Start eng halten.
Anzeigengruppen:
- **B1 Industrie/Baustelle:** industriefotograf berlin · industriefotografie berlin · baustellenfotografie berlin ·
  fotograf baustelle berlin
- **B2 Unternehmen/Corporate:** unternehmensfotografie berlin · corporate fotograf berlin · imagefotograf berlin ·
  fotograf für unternehmen berlin · mitarbeiterfotos berlin
- **B3 Werbung/Sport/Produkt:** werbefotograf berlin · kampagnenfotograf berlin · sportfotograf berlin ·
  produktfotograf berlin
Negative: wie A, dazu: hochzeit · familie · baby · kamera kaufen · stockfoto · stock · lizenzfrei · bewerbung
Überschriften (geprüft):
   1. Fotograf für Unternehmen  (24)
   2. Industriefotografie Berlin  (26)
   3. Mobil vor Ort oder im Studio  (28)
   4. Hasselblad Mittelformat  (23)
   5. Freigabe am Set, am selben Tag  (30)
   6. Kampagnenfotograf seit 1997  (27)
   7. Sport, People & Industrie  (25)
   8. Konzept statt Preisliste  (24)
   9. Nutzungsrechte nach Einsatz  (27)
  10. Dirk Mathesius Fotografie  (25)
  11. Briefing-Gespräch anfragen  (26)
Beschreibungen (geprüft):
   1. Mobil vor Ort – Baustelle, Hafen, Labor, Büro – oder im Studio. Ein Gespräch zum Briefing.  (90)
   2. Tethered: Bilder am Monitor prüfen & freigeben. Mittelformat für Print & Kampagne.  (82)
   3. Fotograf seit 1997 für Marken, Magazine & Unternehmen. Jetzt Briefing-Gespräch anfragen.  (88)
   4. Nutzungsrechte passend zum Einsatz – vom Magazin bis zur Kampagne. Angebot vorab.  (81)
Sitelinks: „Ablauf einer Produktion" · „Technik & Arbeitsweise" · „Nutzungsrechte" · „Anfrage senden".
Anzeigenbilder: ads/dm-ad-b2b-land.jpg (1200×630) · ads/dm-ad-b2b-square.jpg (1200×1200).
Alle Aussagen stehen so auf /ueber-dirk.html (Tethered/Freigabe am Set, mobil + Studio, Konzept statt Preisliste,
Nutzungsrechte projektbezogen, Hasselblad-Mittelformat, seit 1997).

## 5. Budget — Vorschlag (Entscheidung: John/Dirk)
Kleiner Test statt großer Wette, 21 Tage:
- A Hochzeit 10 €/Tag + B B2B 10 €/Tag = 20 €/Tag → **ca. 420 €** gesamt.
- Alternative „mutig": je 15 €/Tag über 30 Tage → ca. 900 €.
Abbruch-/Weiterregel (Dirk soll sie vorab festlegen): Was ist ihm **eine Hochzeitsanfrage** und **eine
B2B-Anfrage** wert? Daraus ergibt sich das Ziel-CPA. Nach 14 Tagen: Suchbegriffe-Bericht prüfen, Negative
nachziehen. **Ohne gemessene Conversions (Abschnitt 2) nicht über 14 Tage laufen lassen.**
Realistische Erwartung: bei Tagesbudget 10 € sind wenige Klicks/Tag zu erwarten — Aussagekraft nach 21 Tagen
begrenzt. Zahlen dazu sind Schätzung, nicht gemessen.

## 6. Optional, zweiter Schritt: Instagram/Facebook (Meta)
Nur Hochzeit/Portrait (visuell stärker), erst nach Abschnitt 2 und Dirks Freigabe.
- Primärtext (≤125): „Hochzeit, Business & Fashion in Berlin – dokumentarisch, echt, ohne gestellte Regie. Angebot meist in 24 Std."
- Überschrift (≤40): „Dirk Mathesius · Fotograf Berlin seit 1997"
- Button: „Mehr dazu" → Landeseite A mit utm_source=meta&utm_medium=paid_social&utm_campaign=dm-hochzeit-berlin.
- Bild: ads/dm-ad-hochzeit-square.jpg. **Keine Gästegesichter, keine Kinder** (Kinder-Riegel); keine nachgebaute UI.
- Bestätigte Hochzeitsfotos von Dirk wären stärker als das Porträt — liegen auf der Seite nicht vor (Dirk fragen).

## 7. Riegel
Kinder-Riegel · Ads-Riegel (keine nachgebaute UI, Nutzen als Text) · keine Preise/Rabatte/Bewertungen erfunden ·
keine Markennamen ohne Dirks OK · Ziel nur www.dirkmathesius.de · Deploy/Geld/Secrets/Löschen bleiben bei John.

## 8. Dateien (Repo dirkmathesius, Ordner ads/ — wird NICHT deployt)
dm-ad-hochzeit-land.jpg · dm-ad-hochzeit-square.jpg · dm-ad-b2b-land.jpg · dm-ad-b2b-square.jpg
Vorschaukarten für Link-Shares (live): /images/og-hochzeitsfotograf-berlin.jpg, og-dirk-mathesius-fotograf-berlin.jpg

## 9. Offen / ungemessen
Google-Ads-Konto (Existenz, Inhaber, Zahlung) · Schlüsselereignis in GA4 · Keyword-Volumen/CPC ·
Live-Ladezeit der Landeseiten (LCP Dirks Seite 6,3–6,6 s, Lighthouse 05.10. — langsame Seite verteuert Klicks,
Verbesserung = Code-Splitting/Prerender, eigener Auftrag) · Dirks Freigabe.
