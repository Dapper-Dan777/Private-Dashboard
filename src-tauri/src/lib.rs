use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::Manager;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize)]
struct FrontendVersion {
    version: String,
    #[serde(rename = "buildDate")]
    build_date: Option<String>,
}

// In-Memory Storage für API-Key (als Fallback, wenn Secure Storage nicht verfügbar ist)
static API_KEY_STORAGE: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
fn get_api_key() -> Option<String> {
    // Versuche zuerst aus Secure Storage zu laden
    // Falls nicht verfügbar, verwende In-Memory Storage
    API_KEY_STORAGE.lock().ok().and_then(|s| s.clone())
}

#[tauri::command]
fn set_api_key(key: Option<String>) -> Result<(), String> {
    // Speichere in Secure Storage (falls verfügbar) und In-Memory
    if let Ok(mut storage) = API_KEY_STORAGE.lock() {
        *storage = key;
        Ok(())
    } else {
        Err("Could not lock API key storage".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![get_api_key, set_api_key])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      } else {
        // In Production: Lade standardmäßig von GitHub Pages (mit Offline-Fallback)
        load_from_github_pages(app.handle().clone());
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn load_from_github_pages(app_handle: tauri::AppHandle) {
  tauri::async_runtime::spawn(async move {
    let github_pages_url = "https://dapper-dan777.github.io/Private-Dashboard/";
    let version_check_url = "https://dapper-dan777.github.io/Private-Dashboard/frontend-version.json";
    
    // Prüfe zuerst, ob GitHub Pages erreichbar ist
    let is_online = match reqwest::Client::new()
      .get(version_check_url)
      .timeout(std::time::Duration::from_secs(3))
      .send()
      .await
    {
      Ok(_) => true,
      Err(_) => false,
    };

    if is_online {
      log::info!("GitHub Pages erreichbar - lade Frontend von GitHub Pages");
      // Lade direkt von GitHub Pages
      if let Some(window) = app_handle.get_webview_window("main") {
        // Warte länger, damit das Frontend den API-Key aus localStorage lesen und in Tauri Storage speichern kann
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;
        
        // Versuche API-Key aus Tauri Storage zu lesen
        let api_key = API_KEY_STORAGE.lock().ok().and_then(|s| s.clone());
        
        let url = if let Some(key) = api_key {
          if !key.trim().is_empty() {
            // Base64-encode für URL-Sicherheit
            let encoded = base64::engine::general_purpose::STANDARD.encode(key.as_bytes());
            format!("{}?apiKey={}", github_pages_url, urlencoding::encode(&encoded))
          } else {
            github_pages_url.to_string()
          }
        } else {
          github_pages_url.to_string()
        };
        
        let _ = window.eval(&format!(
          "window.location.replace('{}');",
          url
        ));
      }
    } else {
      log::info!("GitHub Pages nicht erreichbar - App lädt lokal (offline-fähig)");
      // Bei Offline: App lädt lokal (aus dem Bundle)
    }
  });
}
