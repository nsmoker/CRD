import React from "react";
import "./App.css";
import Chessboard from "./Components/Chessboard/Chessboard";
import { Grid } from "@mui/material";
import { STARTING_POSITION_FEN } from "./include/constants";
import Editor from "./Components/Editor/Editor";


class App extends React.Component {
  constructor(props: Record<string, never>) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={2} className="main-container">
        <Grid item xs={12} style={{width: "100%", height: "100%", maxHeight: "100%", overflow: "auto"}}>
          <Editor/>
        </Grid>
      </Grid>
    );
  }
}

export default App;
