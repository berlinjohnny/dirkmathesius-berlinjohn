# Relaunch www.dirkmathesius.de — erledigt

**Go-live am 05.08.2026. Beide Domains sind live.**
Dieses Dokument war das Briefing für den Termin mit Dirk und ist jetzt das Protokoll.

---

## Ergebnis (gemessen am 06.08.2026)

**www.dirkmathesius.de** — 13/13 Seiten 200 · Canonical `https://www.dirkmathesius.de/` ·
non-www→www in zwei Sprüngen · Sitemap 13 URLs / 185 Bilder · 3/3 Security-Header ·
Telefonnummer nirgends im Klartext.

**dirkmathesius.berlinjohn.de** (Fanpage) — 7/7 Kollaborations-Seiten 200 ·
`music`/`reportage`/`landscape`/`stills` leiten per **301 auf Dirks Seite** ·
Canonical zeigt auf Dirk · Sitemap 9 URLs / 14 Bilder.

Die `.htaccess` auf IONOS — die einzige echte Unbekannte vor dem Go-live — läuft
fehlerfrei. Kein 500er, der Rollback wurde nicht gebraucht.

---

## Was beim Deploy passiert ist

Der Mirror ist **additiv**. Überschrieben wurden nur die Dateien mit gleichem Namen
(`index.html`, die Kategorie-Seiten, `style.css`, Teile von `images/`) — das war der
Relaunch. Die alten Bildordner (`sport/`, `folks/`, `music/` …, ~100 MB) blieben
unangetastet, alte von Google indexierte Bild-URLs brechen also nicht.

**Backup der alten Seite:** `~/dirkmathesius-live-backup-2026-08-05/` (5 MB — alles,
was überschrieben wurde, inkl. `images/` und `SpryAssets/`). Rückweg: wieder hochladen.

---

## Deploy-Befehle

```bash
# Dirks offizielle Seite
./scripts/deploy-ionos.sh

# Fanpage (baut nur — Generator vorher separat laufen lassen, falls nötig)
deploy-dm
```

> ⚠️ **`deploy-dm` ist NICHT der Go-live** — das deployt nur die Fanpage-Subdomain.
> Der offizielle Weg ist `scripts/deploy-ionos.sh`.

> ⚠️ **Vor dem Lauf `git status` prüfen.** `deploy-ionos.sh` setzt am Ende `public/`,
> `imageJsonLd.ts` und `portfolio.ts` per `git checkout` zurück — nicht committete
> Änderungen dort wären weg.

> 🔴 **`deploy-ionos.sh` übergibt `SITE_VARIANT=official` an den Generator.** Diese
> Zeile darf nie verschwinden: `.env` steht auf `fanpage`, ohne den Override würde
> Dirks Seite mit 13 statt 184 Bildern und 3 statt 7 Kategorien gebaut.

---

## Falls die Seite je einen 500er zeigt

Wahrscheinlichste Ursache ist die `.htaccess`. Sie lässt sich gefahrlos entfernen —
die Seite funktioniert auch ohne, weil alle Inhaltsseiten echte `.html`-Dateien sind.
Es entfallen dann nur HTTPS-Zwang, die non-www→www-Umleitung und die Security-Header.

```bash
source ~/.dirkmathesius-ionos-ftp.env
LFTP_PASSWORD="$DM_IONOS_PASS" lftp -u "$DM_IONOS_USER" --env-password \
  "sftp://$DM_IONOS_HOST" -e "rm .htaccess; quit"
```

---

## Was seit dem Go-live dazukam

- Buchungs-CTA auf der Startseite (am Desktop gab es vorher **keinen** — der Sticky-Button ist `md:hidden`)
- Fanpage auf reine Kollaborationen umgestellt, Solo-Kategorien leiten zu Dirk
- WhatsApp raus, Anruf rein; Telefonnummer vor Harvestern geschützt
- `/ueber-dirk.html` als vollwertige B2B-Seite (Ablauf, Technik, Nutzungsrechte, 8 BTS-Bilder, Film)
- Bild-Lizenz-Metadaten → Fotos werden in der Google-Bildersuche als „lizenzierbar" gekennzeichnet
- Search Console verifiziert, Sitemap „Erfolgreich", 11 Seiten zur Neu-Indexierung eingereicht
- Kontaktformular end-to-end bewiesen, Anfrage-Mail lesbar gemacht

## Offen (nichts davon blockiert)

1. Dirk als Nutzer zu Search Console und GA4 hinzufügen — beides läuft auf Johns Konto
2. Showreel-ID tauschen, falls Dirk ein eigenes Video hat (aktuell Johns, ehrlich beschriftet)
3. Fanpage-Sitemap in der Search Console neu einreichen
4. Web3Forms PRO, falls eine gestaltete Anfrage-Mail und ein Autoresponder gewünscht sind
