import React from "react";
import Chesspiece from "../Chesspiece/Chesspiece";
import "./styles.css"
import { BOARD_IMAGE_PATH, CHECK_LEGAL_COMMAND, PIECE_DRAG_END_CHANNEL, PIECE_DRAG_START_CHANNEL } from "../../include/constants";
import { Event, UnlistenFn, listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api";
import { PieceDragStartEvent } from "../../include/events";
import { CheckLegalCommandResponse, makeCheckLegalRequest } from "../../include/commands";

interface IState {
    dragFromCol: number | null,
    dragFromRow: number | null,
    unlisteners: UnlistenFn[],
}

interface IProps {
    moveCallback: (fen: string) => void,
    fen: string
}

class Chessboard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            dragFromCol: null,
            dragFromRow: null,
            unlisteners: [],
        }
    }

    fenStringPiecesMap = (fen: string) => {
        let row = 0;
        let col = 0;
        let ret = [];
        let i = 0;
        console.log(fen);
        while (fen.charAt(i) !== " ") {
            const code = fen.charAt(i);
            if (code !== "/" && isNaN(Number(code))) {
                ret.push( <Chesspiece 
                    key={ i }
                    fenCode={ code }
                    gridRow={ row }
                    gridCol={ col }
                    dragging={ row === this.state.dragFromRow && col === this.state.dragFromCol }/> );
                col = (col + 1) % 8;
            } else if (!isNaN(Number(code))) {
                col = (col + Number(code)) % 8;
            } else if (code === "/") {
                row += 1;
            } else {
                break;
            }
            i += 1;
        }
    
        return ret;
    }

    componentDidMount() {
        listen<PieceDragStartEvent>(PIECE_DRAG_START_CHANNEL, this.onPieceDragStartSignal).then(x => this.setState( { unlisteners: this.state.unlisteners.concat(x)}));
        listen(PIECE_DRAG_END_CHANNEL, this.onPieceDragEndSignal).then(x => this.setState( { unlisteners: this.state.unlisteners.concat(x)}));
    }

    onPieceDragStartSignal = (event: Event<PieceDragStartEvent>) => {
        this.setState( { dragFromCol: event.payload.sourceCol, dragFromRow: event.payload.sourceRow } );
    }

    onPieceDragEndSignal = () => {
        this.setState( { dragFromCol: null, dragFromRow: null } );
    }

    muteEvent = (event: React.DragEvent) => {
        event.stopPropagation();
        event.preventDefault();
    }

    componentWillUnmount() {
        this.state.unlisteners.forEach(ul => ul());
    }

    onDrop = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (this.state.dragFromCol !== null && this.state.dragFromRow !== null) {
            const srcRow = 7 - this.state.dragFromRow;
            const srcCol = 7 - this.state.dragFromCol;
            const colWidth = event.currentTarget.getBoundingClientRect().width / 8.0;
            const rowHeight = event.currentTarget.getBoundingClientRect().height / 8.0;
            const startX = event.currentTarget.getBoundingClientRect().left;
            const startY = event.currentTarget.getBoundingClientRect().top;
            const dstCol = 7 - Math.floor((event.clientX - startX) / colWidth);
            const dstRow = 7 - Math.floor((event.clientY - startY) / rowHeight);

            console.log("clientX: " + event.clientX);
            console.log("clientY: " + event.clientY);

            invoke<CheckLegalCommandResponse>(CHECK_LEGAL_COMMAND, makeCheckLegalRequest(srcCol, srcRow, dstCol, dstRow, this.props.fen))
                .then(response => {
                    this.props.moveCallback(response.fen)
                    this.setState( {dragFromCol: null, dragFromRow: null } );
                });

        }
    }

    render() {
        return (
            <div className="main-board-container">
                <img 
                    src={ BOARD_IMAGE_PATH }
                    className="main-board-image" />
                <div className="piece-container" onDrop={ this.onDrop } onDragOver={ this.muteEvent } onDragEnter={ this.muteEvent }>
                    { this.fenStringPiecesMap(this.props.fen) }
                </div>
            </div>
        );
    }
}

export default Chessboard;