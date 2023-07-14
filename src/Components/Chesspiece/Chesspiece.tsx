import React from "react";
import { BLACK_BISHOP_IMAGE_PATH, BLACK_KING_IMAGE_PATH, BLACK_KNIGHT_IMAGE_PATH, BLACK_PAWN_IMAGE_PATH, BLACK_QUEEN_IMAGE_PATH, BLACK_ROOK_IMAGE_PATH, PIECE_DRAG_END_CHANNEL, PIECE_DRAG_START_CHANNEL, WHITE_BISHOP_IMAGE_PATH, WHITE_KING_IMAGE_PATH, WHITE_KNIGHT_IMAGE_PATH, WHITE_PAWN_IMAGE_PATH, WHITE_QUEEN_IMAGE_PATH, WHITE_ROOK_IMAGE_PATH } from "../../include/constants";
import { emit } from '@tauri-apps/api/event'

function fenCodeMap(code: string): string {
    switch (code) {
        case "P": return WHITE_PAWN_IMAGE_PATH
        case "p": return BLACK_PAWN_IMAGE_PATH
        case "N": return WHITE_KNIGHT_IMAGE_PATH
        case "n": return BLACK_KNIGHT_IMAGE_PATH
        case "B": return WHITE_BISHOP_IMAGE_PATH
        case "b": return BLACK_BISHOP_IMAGE_PATH
        case "R": return WHITE_ROOK_IMAGE_PATH
        case "r": return BLACK_ROOK_IMAGE_PATH
        case "Q": return WHITE_QUEEN_IMAGE_PATH
        case "q": return BLACK_QUEEN_IMAGE_PATH
        case "K": return WHITE_KING_IMAGE_PATH
        case "k": return BLACK_KING_IMAGE_PATH
        default: return ""
    }
}

interface IProps {
    dragging: boolean,
    fenCode: string,
    gridCol: number,
    gridRow: number
}

class Chesspiece extends React.Component<IProps, Record<string, never> > {
    constructor(props: IProps) {
        super(props);
    }

    onDragStart = () => {
        emit(PIECE_DRAG_START_CHANNEL, {
            sourceRow: this.props.gridRow,
            sourceCol: this.props.gridCol,
        });
    }

    getStyle = (dragging: boolean) => {
        return {
            gridColumnStart: this.props.gridCol + 1,
            gridColumnEnd: this.props.gridCol + 2,
            gridRowStart: this.props.gridRow + 1,
            gridRowEnd: this.props.gridRow + 2,
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: dragging ? "none" : "block"
        }
    }

    render() {
        return <img 
            style={ this.getStyle(this.props.dragging) } 
            src={ fenCodeMap(this.props.fenCode) }
            onDragStart={ this.onDragStart }
            draggable/>
    }
}

export default Chesspiece;