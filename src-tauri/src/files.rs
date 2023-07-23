use std::{path::PathBuf, fs, collections::HashSet};

use tauri::Window;

use crate::{commands::parse_pgn_for_display, constants::{PGN_DISPLAY_CHANNEL, REPERTOIRES_LOCATION, PGN_COMPARE_CHANNEL}, commands::position::PgnDisplay};

#[derive(serde::Serialize, Clone)]
struct PgnDisplayInterchange {
    fen: String,
    comment: String,
    algebraic: String,
    next: Vec<PgnDisplayInterchange>
}

#[derive(serde::Serialize, Clone)]
struct PgnCompareResult {
    display_list: PgnDisplayInterchange,
    diffs: Vec<(PgnDisplayInterchange, PgnDisplayInterchange)>
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

pub fn collect_fens(in_tree: &PgnDisplay) -> Vec<PgnDisplay> {
    let mut ret = Vec::new();
    ret.push(in_tree.clone());
    for x in in_tree.next.iter() {
        ret.append(&mut collect_fens(x));
    }

    return ret;
}

pub fn tree_diff(rep: &PgnDisplay, other: &PgnDisplay) -> Vec<(PgnDisplay, PgnDisplay)> {
    let rep_pos = collect_fens(rep);
    let other_pos = collect_fens(other);
    let mut ret = Vec::new();
    for pos in other_pos {
        for rpos in &rep_pos {
            if pos.fen == rpos.fen {
                if !pos.next.is_empty() && !rpos.next.is_empty() && pos.next[0].fen != rpos.next[0].fen {
                    ret.push((rpos.clone(), pos.clone()));
                }
            }
        }
    }

    ret.sort_unstable_by_key(|x| (x.clone().0.fen, x.clone().1.fen));
    ret.dedup_by_key(|x| (x.clone().0.fen, x.clone().1.fen));
    return ret;
}

pub fn handle_import_compare(app: &Window, file: Option<PathBuf>) {
    if let Some(path) = file {
        if let Ok(dir) = fs::read_dir(REPERTOIRES_LOCATION) {
            let trees = dir.map(|rd| {
                let st = rd.unwrap().file_name().to_str().unwrap().to_owned();
                if let Ok(contents) = fs::read_to_string(format!("{}/{}", REPERTOIRES_LOCATION, st.clone())) {
                    return Some(parse_pgn_for_display(&contents));
                } else {
                    return None;
                }
            });


            if let Ok(contents) = fs::read_to_string(path.to_str().unwrap()) {
                let mut diffs = Vec::new();
                let pgn_for_display = parse_pgn_for_display(&contents);
                for opt in trees {
                    if let Some(tree) = opt {
                        diffs.append(&mut tree_diff(&tree, &pgn_for_display));
                    }
                }
                let res = PgnCompareResult {
                    display_list: PgnDisplayInterchange::from(pgn_for_display),
                    diffs: diffs.iter().map(|(x, y)| (PgnDisplayInterchange::from(x.clone()), PgnDisplayInterchange::from(y.clone()))).collect()
                };

                app.emit(PGN_COMPARE_CHANNEL, res).unwrap();
                println!("diffs: {:?}", diffs.len());
            }

        }


    }
}