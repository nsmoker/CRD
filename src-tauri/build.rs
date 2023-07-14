extern crate prost_build;

fn main() {
  prost_build::compile_protos(&["src/position.proto"], &["src/"]).unwrap();
  tauri_build::build()
}
