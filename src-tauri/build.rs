fn main() {
  // Kopiere frontend-version.json in das Resource-Verzeichnis
  let frontend_version = std::path::Path::new("../public/frontend-version.json");
  if frontend_version.exists() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let dest = std::path::Path::new(&out_dir).parent().unwrap()
      .parent().unwrap()
      .parent().unwrap()
      .join("frontend-version.json");
    if let Err(e) = std::fs::copy(frontend_version, &dest) {
      println!("cargo:warning=Konnte frontend-version.json nicht kopieren: {}", e);
    }
  }
  
  tauri_build::build()
}
