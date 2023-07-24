import React from "react";
import { MoveDisplayList, TreeDiff, finishLinking } from "../../include/displaytypes";
import { EVAL_POSITION_COMMAND, EVAL_UPDATE_CHANNEL, FEN_COPY_REQUEST_CHANNEL, PGN_COMPARE_CHANNEL, PGN_DISPLAY_CHANNEL, STARTING_POSITION_FEN } from "../../include/constants";
import Chessboard from "../Chessboard/Chessboard";

import { UnlistenFn, listen, Event } from "@tauri-apps/api/event"
import { writeText, readText } from "@tauri-apps/api/clipboard"
import { Grid, ListItem, Typography } from "@mui/material";
import MovelistDisplay from "../MovelistDisplay/MovelistDisplay";
import DiffDisplay from "../DiffDisplay/DiffDisplay";
import { invoke } from "@tauri-apps/api";

interface IState {
    unlisteners: UnlistenFn[]
    rootDisplayList: MoveDisplayList
    displayList: MoveDisplayList
    diffs: [MoveDisplayList, MoveDisplayList][]
    eval_in_cp: number | null
}

class Editor extends React.Component<Record<string, never>, IState> {
    constructor(props: Record<string, never>) {
        super(props)

        const dpl = {
            fen: STARTING_POSITION_FEN,
            algebraic: "",
            comment: [],
            whitesTurn: true,
            prev: null,
            next: []
        }

        this.state = {
            displayList: dpl,
            rootDisplayList: dpl,
            unlisteners: [],
            diffs: [],
            eval_in_cp: null
        }
    }

    componentDidMount(): void {
        listen<MoveDisplayList>(PGN_DISPLAY_CHANNEL, this.handleNewDisplayList).then(this.addUnlistener);
        listen<TreeDiff>(PGN_COMPARE_CHANNEL, this.handleCompare).then(this.addUnlistener);
        listen(FEN_COPY_REQUEST_CHANNEL, this.handleFenCopy).then(this.addUnlistener);
        listen<number>(EVAL_UPDATE_CHANNEL, this.handleEvalUpdate).then(this.addUnlistener);
    }

    addUnlistener = (unlisten: UnlistenFn) => {
        this.setState( { unlisteners: this.state.unlisteners.concat(unlisten) } );
    }

    handleEvalUpdate = (event: Event<number>) => {
        this.setState( { eval_in_cp: event.payload } );
    }

    handleCompare = (event: Event<TreeDiff>) => {
        invoke(EVAL_POSITION_COMMAND, { fen: event.payload.display_list.fen } );
        finishLinking(event.payload.display_list);
        this.setState( { rootDisplayList: event.payload.display_list, displayList: event.payload.display_list, diffs: event.payload.diffs } );
    }

    handleNewDisplayList = (newLst: Event<MoveDisplayList>) => {
        invoke(EVAL_POSITION_COMMAND, { fen: newLst.payload.fen } );
        console.log('hi');
        finishLinking(newLst.payload)
        this.setState( { rootDisplayList: newLst.payload, displayList: newLst.payload } );
    }

    handleFenCopy = () => {
        writeText(this.state.displayList.fen).then(null, () => console.log("Failed to copy FEN string."));
    }

    moveCallback = (fen: string, algebraic: string) => {
        const newMdl = {
            fen: fen,
            algebraic: algebraic,
            comment: [],
            whitesTurn: !this.state.displayList.whitesTurn,
            prev: this.state.displayList,
            next: []
        }
        let found = this.state.displayList.next.find(x => x.fen === fen);
        if (found != undefined) {
            invoke(EVAL_POSITION_COMMAND, { fen: found.fen } );
            this.setState( { displayList: found });
        } else {
            // 07/14/2023 This is bad practice, but until there's a better way that doesn't require migrating to so-called functional components this is what we're doing.
            this.state.displayList.next = this.state.displayList.next.concat(newMdl);
            invoke(EVAL_POSITION_COMMAND, { fen: newMdl.fen } );
            this.setState( { displayList: newMdl } );
        }
    }

    moveSelectionCallback = (move: MoveDisplayList) => () => {
        invoke(EVAL_POSITION_COMMAND, { fen: move.fen } );
        this.setState( { displayList: move } );
    }

    keypressCallback = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowLeft" && this.state.displayList.prev != null) {
            invoke(EVAL_POSITION_COMMAND, { fen: this.state.displayList.prev.fen } );
            this.setState( { displayList: this.state.displayList.prev } );
        } else if (event.key === "ArrowRight" && this.state.displayList.next.length > 0) {
            invoke(EVAL_POSITION_COMMAND, { fen: this.state.displayList.next[0].fen } );
            this.setState( { displayList: this.state.displayList.next[0] } );
        }
    }

    componentWillUnmount(): void {
        this.state.unlisteners.forEach(f => f());
    }

    render(): React.ReactNode {
        let evalSign = this.state.displayList.whitesTurn ? 1 : -1;
        return (
            <Grid container style={{width: "100%", height: "100%", maxHeight: "100%", overflow: "auto"}}>
                <Grid item xs={6} onKeyDown={ this.keypressCallback } tabIndex={-1}>
                    <Chessboard fen={ this.state.displayList.fen } moveCallback={ this.moveCallback } />
                </Grid>
                <Grid item xs={true} style={{height: "100%", maxHeight: "100%", overflow: "auto"}}>
                    <Typography variant="h5">Eval: { this.state.eval_in_cp === null ? "-" : this.state.eval_in_cp / 100.0 * evalSign }</Typography>
                    <MovelistDisplay displayList={ this.state.rootDisplayList } activeMove={ this.state.displayList } moveSelectionCallback={ this.moveSelectionCallback }/>
                </Grid>
                <Grid item xs={"auto"} style={{height: "100%", maxHeight: "100%", overflow: "auto"}}>
                    { this.state.diffs.map(x => {
                        return <ListItem key={ `${x[0].fen} ${x[1].fen}` }> <DiffDisplay diff={ x }/> </ListItem>
                    }) }
                </Grid>
            </Grid>
        );
    }
}

export default Editor;