use std::{path::PathBuf, fs};

use tauri::{App, AppHandle, Window};

use crate::{commands::parse_pgn_for_display, constants::PGN_DISPLAY_CHANNEL, commands::position::PgnDisplay};

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