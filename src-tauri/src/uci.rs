use std::{process::{Child, Command, Stdio, ChildStdin}, thread::{self, JoinHandle}, io::{Write, BufRead, BufReader}};

use regex::Regex;
use tauri::AppHandle;
use tauri::Manager;

use crate::constants::EVAL_UPDATE_CHANNEL;

pub struct UciContext {
    engine_proc: Child,
    in_pipe: ChildStdin,
    poll_thread: Option<JoinHandle<()> >,
}

impl UciContext {
    pub fn new() -> Option<Self> {
        let child = Command::new(format!("{}/../bin/stockfish", std::env::current_dir().unwrap().to_str().unwrap()))
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn();
        if let Ok(mut engine_proc) = child {
            let mut ctx = UciContext {
                in_pipe: engine_proc.stdin.take().unwrap(),
                engine_proc,
                poll_thread: None
            };
            ctx.in_pipe.write_all(b"uci\r\n").unwrap_or(());
            ctx.in_pipe.flush().unwrap();
            return Some(ctx);
        } else {
            None
        }
    }

    pub fn init(&mut self, app: AppHandle) {
        self.in_pipe.write_all(b"isready\r\n").unwrap_or(());
        let out_pipe = self.engine_proc.stdout.take().unwrap();
        let poll_thread = thread::spawn(move || {
            let cp_re = Regex::new(r"score cp (?<centipawns>-?[0-9]*)").unwrap();
            let mut buf = String::new();
            let mut br = BufReader::new(out_pipe);
            loop {
                if let Ok(0) = br.read_line(&mut buf) {
                    break;
                } else {
                    if cp_re.is_match(&buf) {
                        app.emit_all(EVAL_UPDATE_CHANNEL, cp_re.captures(&buf).unwrap()["centipawns"].parse::<i32>().unwrap()).unwrap();
                    }
                    buf.clear();
                }
            }
        });

        self.poll_thread = Some(poll_thread);
    }

    pub fn eval_position(&mut self, position_fen: String) {
        self.in_pipe.write_all(b"stop\r\n").unwrap_or(());
        self.in_pipe.write_all(format!("position fen {}\r\n", position_fen).as_bytes()).unwrap_or(());
        self.in_pipe.write_all(b"go depth 25\r\n").unwrap_or(());
    }
}