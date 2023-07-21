use std::{path::PathBuf, fs};

use tauri::Window;

use crate::{commands::parse_pgn_for_display, constants::{PGN_DISPLAY_CHANNEL, REPERTOIRES_LOCATION}, commands::position::PgnDisplay};

#[derive(serde::Serialize, Clone)]
struct PgnDisplayInterchange {
    fen: String,
    comment: String,
    algebraic: String,
    next: Vec<PgnDisplayInterchange>
}

impl From<PgnDisplay> for PgnDisplayInterchange {
    fn from(value: PgnDisplay) -> Self {
        // Due to the complications involved in getting a doubly linked list to Typescript, we'll go ahead and let the front end handle the backward links.
        println!("{}", value.next.len());
        return PgnDisplayInterchange { 
            fen: value.fen, 
            comment: value.comment, 
            algebraic: value.algebraic,
            next:  value.next.iter().map(|x| Self::from(x.to_owned())).collect()
        }
    }
}

pub fn handle_pgn_pick(app: &Window, picked: Option<PathBuf>) {
    if let Some(file) = picked {
        if let Ok(contents) = fs::read_to_string(file) {
            let pgn_for_display = parse_pgn_for_display(&contents);
            app.emit(PGN_DISPLAY_CHANNEL, PgnDisplayInterchange::from(pgn_for_display)).unwrap();
        }
    }
}

pub fn handle_rep_add(picked: Option<PathBuf>) {
    if let Some(file) = picked {
        fs::create_dir(REPERTOIRES_LOCATION).unwrap_or(());
        fs::copy(file.clone(), format!("{}/{}", REPERTOIRES_LOCATION, file.file_name().unwrap().to_str().unwrap())).unwrap_or(0);
    }
}

pub fn handle_rep_load(app: &Window, file: &str) {
    if let Ok(contents) = fs::read_to_string(format!("{}/{}", REPERTOIRES_LOCATION, file)) {
        let pgn_for_display = parse_pgn_for_display(&contents);
        app.emit(PGN_DISPLAY_CHANNEL, PgnDisplayInterchange::from(pgn_for_display)).unwrap();
    }
}

pub fn handle_save_pgn(app: &Window, file: Option<PathBuf>) {
    todo!();
}