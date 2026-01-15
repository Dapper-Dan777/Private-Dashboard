# Hybrid Frontend-Update System

## Wie es funktioniert:

1. **Lokaler Start**: Die App lädt standardmäßig das Frontend aus dem lokalen Bundle (offline-fähig)

2. **Automatische Prüfung**: Beim Start prüft die App, ob eine neuere Frontend-Version auf GitHub Pages verfügbar ist

3. **Automatisches Update**: Falls eine neue Version verfügbar ist, lädt die App automatisch das neue Frontend von GitHub Pages

4. **Offline-Fallback**: Bei fehlender Internetverbindung lädt die App weiterhin lokal (offline-fähig)

## Setup:

### 1. GitHub Pages aktivieren:
- Gehe zu: https://github.com/Dapper-Dan777/Private-Dashboard/settings/pages
- Unter "Source" wähle: **GitHub Actions**
- Speichere die Einstellungen

### 2. Frontend deployen:
- Committe und pushe Änderungen an `src/`, `public/`, oder Konfigurationsdateien
- GitHub Actions deployed automatisch auf GitHub Pages
- Die `frontend-version.json` wird automatisch mit einem Timestamp generiert

### 3. App bauen:
```bash
npm run tauri:build
```

Die App wird mit der aktuellen Frontend-Version gebaut und prüft beim Start automatisch auf Updates.

## Frontend-Updates ohne App-Neubuild:

1. **Frontend ändern**: Ändere Code in `src/` oder `public/`

2. **Committen und pushen**:
   ```bash
   git add .
   git commit -m "Frontend Update"
   git push
   ```

3. **Automatisches Deployment**: GitHub Actions deployed automatisch

4. **Automatisches Update**: Beim nächsten Start der App wird die neue Version automatisch geladen

## Vorteile:

- ✅ **Offline-fähig**: App funktioniert auch ohne Internet
- ✅ **Automatische Updates**: Frontend-Updates ohne App-Neubuild
- ✅ **Schnell**: Updates werden sofort verfügbar
- ✅ **Flexibel**: Kann zwischen lokal und remote wechseln

## Technische Details:

- **Versionierung**: Jedes Frontend-Deployment erhält einen eindeutigen Timestamp als Version
- **Prüfung**: Die App prüft beim Start die Remote-Version
- **Update**: Bei neuer Version wird automatisch zu GitHub Pages umgeleitet
- **Fallback**: Bei Fehler lädt die App lokal (offline-fähig)
