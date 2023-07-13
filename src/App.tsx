import React from "react";
import "./App.css";
import Chessboard from "./Components/Chessboard/Chessboard";
import { Grid } from "@mui/material";

const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

class App extends React.Component {
  constructor(props: Record<string, never>) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={2} className="main-container">
        <Grid item xs={6} className="editor-grid-item">
          <Chessboard fen={startingPosition}/>
        </Grid>
      </Grid>
    );
  }
}

export default App;
