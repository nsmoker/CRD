// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "windows")]
use uds_windows::UnixStream;
#[cfg(not(target_os = "windows"))]
use std::os::unix::net::UnixStream;
use std::{io::prelude::*, env};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    println!("{}", env::current_dir().unwrap().as_path().to_str().unwrap());
    let mut stream = UnixStream::connect("/tmp/checkLegal.sock").unwrap();
    stream.write_all(b"hello world").unwrap();
    let mut response = String::new();
    stream.read_to_string(&mut response).unwrap();
    println!("{}", response);

    tauri::Builder::default()
        .setup(|app| {
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
