use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct FrontendVersion {
    version: String,
    #[serde(rename = "buildDate")]
    build_date: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      } else {
        // In Production: Prüfe auf Frontend-Updates
        check_frontend_update(app.handle().clone());
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn check_frontend_update(app_handle: tauri::AppHandle) {
  tauri::async_runtime::spawn(async move {
    // Warte kurz, damit die App vollständig geladen ist
    tokio::time::sleep(std::time::Duration::from_secs(1)).await;

    let remote_version_url = "https://dapper-dan777.github.io/Private-Dashboard/frontend-version.json";
    
    // Versuche lokale Version zu laden (aus dem Bundle)
    let local_version = if let Ok(resource_dir) = app_handle.path().resource_dir() {
      let version_path = resource_dir.join("frontend-version.json");
      if let Ok(content) = fs::read_to_string(&version_path) {
        serde_json::from_str::<FrontendVersion>(&content).ok()
      } else {
        None
      }
    } else {
      None
    };

    // Prüfe Remote-Version
    match reqwest::get(remote_version_url).await {
      Ok(response) => {
        if let Ok(remote_version) = response.json::<FrontendVersion>().await {
          let should_update = match &local_version {
            Some(local) => remote_version.version != local.version,
            None => true,
          };

          if should_update {
            log::info!("Neue Frontend-Version verfügbar: {} (lokal: {:?})", 
              remote_version.version, 
              local_version.as_ref().map(|v| &v.version)
            );
            // Lade neues Frontend von GitHub Pages - mehrfach versuchen
            for _ in 0..3 {
              tokio::time::sleep(std::time::Duration::from_millis(500)).await;
              if let Some(window) = app_handle.get_webview_window("main") {
                let result = window.eval(
                  "if (window.location.href.includes('github.io')) { console.log('Already on GitHub Pages'); } else { window.location.replace('https://dapper-dan777.github.io/Private-Dashboard/'); }"
                );
                if result.is_ok() {
                  break;
                }
              }
            }
          } else {
            log::info!("Frontend ist auf dem neuesten Stand: {}", remote_version.version);
          }
        }
      }
      Err(e) => {
        log::warn!("Konnte Remote-Version nicht prüfen: {}. App lädt lokal (offline-fähig).", e);
        // Bei Fehler: App lädt lokal (offline-fähig)
      }
    }
  });
}
