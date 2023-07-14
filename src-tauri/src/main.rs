// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constants;

#[cfg(target_os = "windows")]
use uds_windows::UnixStream;
#[cfg(not(target_os = "windows"))]
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::check_legal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
