# GitHub Pages Setup für Frontend-Updates

## Schritt 1: GitHub Pages aktivieren

1. Gehe zu: https://github.com/Dapper-Dan777/Private-Dashboard/settings/pages
2. Unter "Source" wähle: **GitHub Actions**
3. Speichere die Einstellungen

## Schritt 2: Frontend deployen

Das Frontend wird automatisch auf GitHub Pages deployed, wenn du Änderungen an `src/`, `public/`, oder Konfigurationsdateien committest und pushst.

Die URL wird sein: `https://dapper-dan777.github.io/Private-Dashboard/`

## Schritt 3: Tauri-App für Remote-Frontend konfigurieren

Für Production-Builds, die das Frontend von GitHub Pages laden:

1. **Option A: Manuell die URL in tauri.conf.json setzen** (für einmaligen Build):
   ```json
   "build": {
     "devUrl": "http://localhost:5173",
     "withGlobalTauri": false
   }
   ```
   Dann die App so bauen, dass sie von GitHub Pages lädt (siehe unten).

2. **Option B: Umgebungsvariable verwenden** (empfohlen):
   ```bash
   export TAURI_FRONTEND_URL="https://dapper-dan777.github.io/Private-Dashboard/"
   npm run tauri:build
   ```

## Schritt 4: App so bauen, dass sie von GitHub Pages lädt

Die einfachste Lösung ist, die App so zu bauen, dass sie standardmäßig von GitHub Pages lädt:

1. **Für Development:** Die App lädt weiterhin von `localhost:5173`
2. **Für Production:** Die App lädt von GitHub Pages

**Wichtig:** Die App benötigt dann eine Internetverbindung, um zu funktionieren.

## Automatische Updates

- Wenn du Änderungen am Frontend machst, committe und pushe sie
- GitHub Actions deployed automatisch auf GitHub Pages
- Die App lädt automatisch die neue Version beim nächsten Start

## Offline-Modus (optional)

Falls du einen Offline-Modus möchtest, kannst du die App so bauen, dass sie:
- Zuerst versucht, von GitHub Pages zu laden
- Falls das fehlschlägt, auf lokale Dateien zurückfällt

Dies erfordert zusätzliche Programmierung in der Rust-App.
