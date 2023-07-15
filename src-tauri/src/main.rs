// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constants;
mod files;

use std::fs;

use commands::parse_pgn_for_display;
use constants::PGN_IMPORT_MENU_ID;
use tauri::{Menu, CustomMenuItem, Submenu, api::dialog::FileDialogBuilder, WindowBuilder};
#[cfg(target_os = "windows")]
use uds_windows::UnixStream;
#[cfg(not(target_os = "windows"))]
use tauri::Manager;

fn main() {
    let file_submenu = Submenu::new("File", Menu::new()
    .add_item(CustomMenuItem::new(PGN_IMPORT_MENU_ID, "Import PGN file")));
    let menu = Menu::new()
        .add_submenu(file_submenu);


    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                x if x == PGN_IMPORT_MENU_ID => {
                    FileDialogBuilder::new()
                        .add_filter("PGN Files", &["pgn"])
                        .pick_file(move |picked| files::handle_pgn_pick(event.window(), picked));
                },
                _ => todo!()
            }
        })
        .setup(|app| {
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::check_legal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
