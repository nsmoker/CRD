# CRD

This is a small app I've been working on to let you specify a chess repertoire, and then import your games and have the app automatically tell you where you diverged from your repertoire. It currently does that, though it's early development days and the app is still buggy/has an annoying interface. Things this does:

1. Display PGN files with variations.
2. Allow you to interactively make moves and play.
3. Show you Stockfish evals.
4. Allow you to import a repertoire.
5. Allow you to import a game and see a "diff" view that shows you where you went wrong.

Things this doesn't do yet but that I am actively in the process of adding:
1. Export PGN files.
2. Show comments in PGN/let you edit them.
3. Modify repertoires in app (this goes along with exporting PGN).

# How to run

I've only tested this app on Linux. It should run on MacOS without issue. Windows 10 should run with minimal changes. Currently, the only barrier to cross-platform is the location of various Unix streams, which matters because the app itself is just a dumb frontend that talks to my Go chess library. The app is currently only set up for ease of iteration, so running it
from a fresh clone is janky. 

1. `git clone git@github.com:nsmoker/CRD.git`
2. `git clone git@github.com:nsmoker/gochess.git`
3. `cd gochess`
4. `make run`
6. In another terminal... `cd CRD`
7. Grab a Stockfish binary, rename it "stockfish", and put it in a directory called bin at the root of the repository.
8. `npm install`
9. `npm run tauri dev`
Should get you up and running. 
