# CRD

This is a small app I've been working on to let you specify a chess repertoire, and then import your games and have the app automatically tell you where you diverged from your repertoire. It currently does that, though it's early development days and the app is still buggy/has an annoying interface. Things this does:

1. Display PGN files with variations.
2. Allow you to interactively make moves and play.
3. Allow you to import a repertoire.
4. Allow you to import a game and see a "diff" view that shows you where you went wrong.

Things this doesn't do yet but that I am actively in the process of adding:
1. Export PGN files.
2. Show Stockfish evals (this was done in a previous version but there was a VCS mishap).
3. Show comments in PGN/let you edit them.
4. Modify repertoires in app (this goes along with exporting PGN).
