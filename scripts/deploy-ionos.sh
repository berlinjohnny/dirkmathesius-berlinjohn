#!/bin/zsh
# ─────────────────────────────────────────────────────────────────────────────
# deploy-ionos.sh — Offizieller Go-live: dirkmathesius.de auf IONOS (Apache).
#
# EIN Befehl: Generator (www) → Produktions-Build (official) → Produktions-.htaccess
# → additiver SFTP-Mirror. ADDITIV (KEIN --delete) = wipe-sicher; überschreibt nur
# Build-Dateien, lässt sonstige Server-Dateien unangetastet.
#
# Voraussetzung: ~/.dirkmathesius-ionos-ftp.env (chmod 600) mit den SFTP-Zugangsdaten.
# ─────────────────────────────────────────────────────────────────────────────
set -e
setopt PIPE_FAIL 2>/dev/null || true

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"

ENV_FILE="$HOME/.dirkmathesius-ionos-ftp.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "✗ $ENV_FILE fehlt. Anlegen (chmod 600) mit:"
  echo "  DM_IONOS_USER=p7467157"
  echo "  DM_IONOS_HOST=home25078987.1and1-data.host"
  echo "  DM_IONOS_PASS=<IONOS-SFTP-Passwort>"
  echo "  DM_IONOS_REMOTE_PATH=/           # Docroot der Domain — am Termin bestätigen"
  exit 1
fi
source "$ENV_FILE"
: "${DM_IONOS_REMOTE_PATH:=/}"

restore() { git checkout -- public/ src/lib/imageJsonLd.ts src/lib/portfolio.ts 2>/dev/null || true; }

echo "→ 1/4 Generator (SITE_URL = https://www.dirkmathesius.de, Variante official)"
# SITE_VARIANT MUSS hier explizit stehen. Der Generator liest sonst VITE_SITE_VARIANT
# aus .env — und dort steht nach dem Fanpage-Cutover "fanpage". Ohne diese Zeile
# wuerde Dirks offizielle Seite mit dem reduzierten Kollaborations-Satz gebaut
# (13 statt 184 Bilder, 3 statt 7 Kategorien). Genau das darf nie passieren.
SITE_URL=https://www.dirkmathesius.de SITE_VARIANT=official node scripts/build-portfolio-manifest.mjs >/dev/null

echo "→ 2/4 Produktions-Build (mode ionos → www + official)"
if ! npm run build:ionos 2>&1 | tail -6; then
  echo "✗ Build fehlgeschlagen"; restore; exit 1
fi

echo "→ 3/4 Produktions-.htaccess einsetzen + Guards"
cp deploy/htaccess.ionos dist/.htaccess
[ -f dist/.htaccess ]  || { echo "✗ dist/.htaccess fehlt"; restore; exit 1; }
[ -f dist/index.html ] || { echo "✗ dist/index.html fehlt"; restore; exit 1; }
if ! grep -q "www.dirkmathesius.de" dist/index.html; then
  echo "✗ index.html nicht auf www gebaut (mode/env?)"; restore; exit 1
fi
files=$(find dist -type f | wc -l | tr -d ' ')
echo "  ✓ dist ok — $files Files, .htaccess (SPA+Security+HTTPS/www) gesetzt"

echo "→ 4/4 SFTP-Mirror (additiv, KEIN --delete) → $DM_IONOS_HOST:$DM_IONOS_REMOTE_PATH"
output=$( LFTP_PASSWORD="$DM_IONOS_PASS" lftp -u "$DM_IONOS_USER" --env-password "sftp://$DM_IONOS_HOST" -e "
  set sftp:auto-confirm yes
  set net:timeout 30
  set net:max-retries 4
  set net:reconnect-interval-base 5
  set mirror:parallel-transfer-count 2
  lcd dist
  cd $DM_IONOS_REMOTE_PATH
  mirror -R --verbose=1 . .
  quit
" 2>&1 ) && rc=0 || rc=$?
echo "$output" | tail -20

restore

if [ $rc -eq 0 ] && ! echo "$output" | grep -qiE "no such file|access failed|login failed|fatal error|permission denied"; then
  echo
  echo "✓ Deploy erfolgreich (additiv). Working-Tree zurückgesetzt (Testbed-Stand)."
  echo "Live-Check: https://www.dirkmathesius.de/  ·  /kollaborationen.html  ·  Formular-Test  ·  GA4 Echtzeit"
else
  echo "✗ Mirror fehlgeschlagen (rc=$rc / SFTP-Fehler im Output)"
  exit 1
fi
