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
        // Warte kurz, damit das Fenster vollständig geladen ist
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        let _ = window.eval(&format!(
          "window.location.replace('{}');",
          github_pages_url
        ));
      }
    } else {
      log::info!("GitHub Pages nicht erreichbar - App lädt lokal (offline-fähig)");
      // Bei Offline: App lädt lokal (aus dem Bundle)
    }
  });
}
