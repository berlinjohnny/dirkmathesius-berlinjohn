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

## 5. Budget — Empfehlung auf Messbasis (Stand 06.10.2026)
**Gemessen** (Keyword Planner, Konto „Jim&John<-BerlinJohn", Standort Berlin, Sept 2025–Aug 2026, Sprache NICHT auf
Deutsch gefiltert; Detail: scratchpad/kwp-cpc-2026-10-06.md). „Gebot oben" = Planner-Schätzung, nicht der echte CPC.
- Hochzeit: hochzeitsfotograf berlin 1.000 Suchen/Mon, 2,42–4,00 € · hochzeitsfotografie 90 (2,37–3,77 €) ·
  fotograf hochzeit 50 (2,78–4,24 €) · bewerbungsfoto berlin 720 (0,81–2,02 €) · businessportrait 90 (2,63–7,72 €) ·
  hochzeitsreportage berlin 1.900 (0,53–1,75 €, Intent unklar — vermutlich auch TV-/Reportage-Suchen).
- B2B: sportfotograf 90 (0,51–1,32 €) · produktfotograf 70 (3,29–8,56 €) · corporate fotograf 20 (4,84–7,80 €) ·
  werbefotograf 20 · unternehmensfotografie 10 (5,65–34,58 €) · Rest ≤10 oder keine Daten.
**Folgerung:** Das Volumen deckelt das Budget. Hochzeit-Kern ≈ 1.200 Suchen/Mon, B2B insgesamt nur ≈ 230.
Mehr als ca. 7 €/Tag Hochzeit und 3 €/Tag B2B ist vermutlich Geld ohne Gegenwert (Annahme, nicht gemessen).

**Empfehlung (30 Tage, Obergrenze 300 €):**
- Hochzeit 7 €/Tag ≈ 210 € · B2B 3 €/Tag ≈ 90 € (nur 4 Keywords: sportfotograf, produktfotograf, corporate fotograf,
  werbefotograf; als „exakt"/„Phrase").
- **Zwischenentscheidung Tag 14** (bis dahin max. 140 €): Suchbegriffe-Bericht lesen, Negative nachziehen.
- Abbruchregel VORAB: 30 Klicks je Kampagne ohne eine Anfrage → Stopp, Seite/Anzeige ändern, NICHT Budget erhöhen.
- Start erst nach Abschnitt 0+2 (Konto, Schlüsselereignis, Freigabe). Keine Messung = kein Start.
- „hochzeitsreportage berlin" erst nach dem Suchbegriffe-Bericht zuschalten (Intent unklar).
- Wenn positiv: Verlängerung bis Februar (Anfragen für die Saison 2027), ca. 300 €/Monat, Entscheidung nach 30 Tagen.
**Erwartung (ANNAHME, nicht gemessen):** CPC real ca. 2–3 € bei Hochzeit → ~70 Klicks/Monat; bei 3–6 % Anfragequote
→ 2–4 Anfragen, ca. 50–105 € je Anfrage. B2B: ~20 Klicks/Monat → ca. 1 Anfrage in 30 Tagen. Dünne Datenbasis.
**Break-even-Frage an Dirk:** Was ist ihm eine gebuchte Hochzeit / ein B2B-Auftrag wert, und wie viele Anfragen werden
Buchungen? Kosten je Buchung = Kosten je Anfrage ÷ Buchungsquote.
**Rahmen:** 1:Kybí führt ein Ads-Mandat mit Deckel 400 €/Monat (Matrix). Passen 300 € für Dirk da hinein, oder zahlt Dirk
selbst? (Entscheidung John/1:Kybí.)
B2B-Hinweis: Das Suchvolumen ist für Google Ads dünn. Der stärkere B2B-Weg ist vermutlich Direktansprache (E-Mail/LinkedIn
an Marketing-/Agenturkontakte, Dirks Referenzen) — kostet kein Mediabudget.

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
