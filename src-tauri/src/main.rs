// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constants;
mod files;
mod uci;

use std::{fs::{self}, sync::Mutex};

use constants::{PGN_IMPORT_MENU_ID, ADD_REPERTOIRE_MENU_ID, REPERTOIRES_LOCATION, SAVE_AS_MENU_ID, IMPORT_COMPARE_MENU_ID, COPY_POSITION_FEN_MENU_ID, COPY_CURRENT_FEN_CHANNEL};
use tauri::{Menu, CustomMenuItem, Submenu, api::dialog::FileDialogBuilder, Manager,};
#[cfg(target_os = "windows")]
use uds_windows::UnixStream;

fn main() {
    let mut rep_load_menu = Menu::new();
    let dir_read = fs::read_dir(REPERTOIRES_LOCATION);
    if let Ok(dir) = dir_read {
        for rd in dir {
            if let Ok(rep) = rd {
                rep_load_menu = rep_load_menu.add_item(CustomMenuItem::new(rep.file_name().to_str().unwrap(), rep.file_name().to_str().unwrap()));
            }
        }
    }
    let rep_load_submenu = Submenu::new("Load repertoire", rep_load_menu);
    let file_submenu = Submenu::new("File", Menu::new()
        .add_item(CustomMenuItem::new(PGN_IMPORT_MENU_ID, "Import PGN file"))
        .add_item(CustomMenuItem::new(ADD_REPERTOIRE_MENU_ID, "Add Repertoire"))
        .add_item(CustomMenuItem::new(SAVE_AS_MENU_ID, "Save as..."))
        .add_item(CustomMenuItem::new(IMPORT_COMPARE_MENU_ID, "Import and Compare"))
        .add_submenu(rep_load_submenu));
    let edit_submenu = Submenu::new("Edit", Menu::new()
        .add_item(CustomMenuItem::new(COPY_POSITION_FEN_MENU_ID, "Copy Position FEN")));
    let menu = Menu::new()
        .add_submenu(file_submenu)
        .add_submenu(edit_submenu);

    let mut uci_context = uci::UciContext::new().unwrap();


    tauri::Builder::default()
        .setup(|app| {
            uci_context.init(app.handle());
            app.manage(Mutex::new(uci_context));
            Ok(())
        })
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                x if x == PGN_IMPORT_MENU_ID => {
                    FileDialogBuilder::new()
                        .add_filter("PGN Files", &["pgn"])
                        .pick_file(move |picked| files::handle_pgn_pick(event.window(), picked));
                },
                x if x == ADD_REPERTOIRE_MENU_ID => {
                    FileDialogBuilder::new()
                        .add_filter("PGN Files", &["pgn"])
                        .pick_file(move |picked| files::handle_rep_add(picked));
                },
                x if x == IMPORT_COMPARE_MENU_ID => {
                    FileDialogBuilder::new()
                        .add_filter("PGN Files", &["pgn"])
                        .pick_file(move |picked| files::handle_import_compare(event.window(), picked));
                },
                x if x == COPY_POSITION_FEN_MENU_ID => {
                    event.window().emit(COPY_CURRENT_FEN_CHANNEL, ()).unwrap();
                }
                x => {
                    if let Ok(mut dir) = fs::read_dir(REPERTOIRES_LOCATION) {
                        if dir.any(|y| y.unwrap().file_name().to_str().unwrap() == x) {
                            files::handle_rep_load(event.window(), x.into());
                        }
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![commands::check_legal, commands::submit_position_for_eval])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
