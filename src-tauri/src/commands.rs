
use std::{os::unix::net::UnixStream, io::{Write, Read, Cursor}};

use prost::Message;

use crate::constants::SOCKET_LOCATION;

use self::position::{MoveInPosition, MoveMessage, Coordinate, Position, MoveLegal};

pub mod position {
    include!(concat!(env!("OUT_DIR"), "/gochess.rs"));
}

#[derive(serde::Serialize)]
pub struct CheckLegalResponse {
    fen: String,
    pretty_move: String,
    legal: bool
}

fn create_coord(col: i32, row: i32) -> Coordinate {
    let mut coord = Coordinate::default();
    coord.col = col;
    coord.row = row;
    return coord;
}

fn create_move_message(src_col: i32, src_row: i32, dst_col: i32, dst_row: i32) -> MoveMessage {
    let mut message = MoveMessage::default();
    message.from = Some(create_coord(src_col, src_row));
    message.to = Some(create_coord(dst_col, dst_row));
    message.is_promotion = false;
    message.piece_name = "".to_owned();
    return message;
}

fn create_position(fen: &str) -> Position {
    let mut pos = Position::default();
    pos.fen = fen.to_owned();
    return pos;
}

fn create_legality_request(fen: &str, src_col: i32, src_row: i32, dst_col: i32, dst_row: i32) -> MoveInPosition {
    let mut pos = position::MoveInPosition::default();
    pos.r#move = Some(create_move_message(src_col, src_row, dst_col, dst_row));
    pos.position = Some(create_position(fen));
    return pos;
}

fn serialize_legality_request(request: &MoveInPosition) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.reserve(request.encoded_len());
    request.encode(&mut buf).unwrap();
    return buf;
}

fn deserialize_legality_request(buf: &Vec<u8>) -> MoveLegal {
    return MoveLegal::decode(&mut Cursor::new(buf)).unwrap();
}

fn write_and_get_response(buf: &Vec<u8>) -> Vec<u8> {
    let mut stream = UnixStream::connect(SOCKET_LOCATION).unwrap();
    stream.write_all(&buf).unwrap();
    let mut response = Vec::new();
    stream.read_to_end(&mut response).unwrap();
    return response;   
}

#[tauri::command]
pub fn check_legal(fen: &str, src_col: i32, src_row: i32, dst_col: i32, dst_row: i32) -> CheckLegalResponse {
    let request = create_legality_request(fen, src_col, src_row, dst_col, dst_row);
    println!("src_col {} src_row {} dst_col {} dst_row {}", src_col, src_row, dst_col, dst_row);
    let buffer = serialize_legality_request(&request);
    let response = write_and_get_response(&buffer);
    let legality_response = deserialize_legality_request(&response);

    return CheckLegalResponse {
        fen: legality_response.position.unwrap().fen,
        pretty_move: legality_response.pretty_move,
        legal: legality_response.legal
    };
}