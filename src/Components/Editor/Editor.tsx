import React from "react";
import { MoveDisplayList, finishLinking } from "../../include/displaytypes";
import { PGN_DISPLAY_CHANNEL, STARTING_POSITION_FEN } from "../../include/constants";
import Chessboard from "../Chessboard/Chessboard";

import { UnlistenFn, listen, Event } from "@tauri-apps/api/event"
import { Grid } from "@mui/material";
import MovelistDisplay from "../MovelistDisplay/MovelistDisplay";

interface IState {
    unlisteners: UnlistenFn[]
    rootDisplayList: MoveDisplayList
    displayList: MoveDisplayList
}

class Editor extends React.Component<Record<string, never>, IState> {
    constructor(props: Record<string, never>) {
        super(props)

        const dpl = {
            fen: STARTING_POSITION_FEN,
            algebraic: "",
            comment: "",
            prev: null,
            next: []
        }

        this.state = {
            displayList: dpl,
            rootDisplayList: dpl,
            unlisteners: []
        }
    }

    componentDidMount(): void {
        listen<MoveDisplayList>(PGN_DISPLAY_CHANNEL, this.handleNewDisplayList)
            .then(unlisten => this.setState( { unlisteners: this.state.unlisteners.concat(unlisten) } ))
    }

    handleNewDisplayList = (newLst: Event<MoveDisplayList>) => {
        finishLinking(newLst.payload)
        this.setState( { rootDisplayList: newLst.payload, displayList: newLst.payload } );
    }

    moveCallback = (fen: string, algebraic: string) => {
        const newMdl = {
            fen: fen,
            algebraic: algebraic,
            comment: "",
            prev: this.state.displayList,
            next: []
        }
        let found = this.state.displayList.next.find(x => x.fen === fen);
        if (found != undefined) {
            this.setState( { displayList: found });
        } else {
            // 07/14/2023 This is bad practice, but until there's a better way that doesn't require migrating to so-called """"functional"""" components this is what we're doing.
            this.state.displayList.next = this.state.displayList.next.concat(newMdl);
            this.setState( { displayList: newMdl } );
        }
    }

    moveSelectionCallback = (move: MoveDisplayList) => () => {
        this.setState( { displayList: move } );
    }

    keypressCallback = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowLeft" && this.state.displayList.prev != null) {
            this.setState( { displayList: this.state.displayList.prev } );
        } else if (event.key === "ArrowRight" && this.state.displayList.next.length > 0) {
            this.setState( { displayList: this.state.displayList.next[0] } );
        }
    }

    componentWillUnmount(): void {
        this.state.unlisteners.forEach(f => f());
    }

    render(): React.ReactNode {
        return (
            <Grid container className="editor-grid">
                <Grid item xs={8} onKeyDown={ this.keypressCallback } tabIndex={-1}>
                    <Chessboard fen={ this.state.displayList.fen } moveCallback={ this.moveCallback } />
                </Grid>
                <Grid item xs={4}>
                    <MovelistDisplay displayList={ this.state.rootDisplayList } activeMove={ this.state.displayList } moveSelectionCallback={ this.moveSelectionCallback }/>
                </Grid>
            </Grid>
        );
    }
}

export default Editor;