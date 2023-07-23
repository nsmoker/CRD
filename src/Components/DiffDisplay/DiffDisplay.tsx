import { Paper, Typography } from "@mui/material";
import React from "react";
import "./styles.css";
import { MoveDisplayList } from "../../include/displaytypes";

interface IProps {
    diff: [MoveDisplayList, MoveDisplayList]
}

class DiffDisplay extends React.Component<IProps, Record<string, never> > {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <Paper className="diff-display">
                <Typography>Should play {this.props.diff[0].next[0].algebraic}</Typography>
                <Typography>But played  {this.props.diff[1].next.length == 0 ? "Nothing" : this.props.diff[1].next[0].algebraic}</Typography>
            </Paper>
        );
    }
}

export default DiffDisplay;