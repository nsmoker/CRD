import React from "react";
import { BLACK_BISHOP_IMAGE_PATH, BLACK_KING_IMAGE_PATH, BLACK_KNIGHT_IMAGE_PATH, BLACK_PAWN_IMAGE_PATH, BLACK_QUEEN_IMAGE_PATH, BLACK_ROOK_IMAGE_PATH, WHITE_BISHOP_IMAGE_PATH, WHITE_KING_IMAGE_PATH, WHITE_KNIGHT_IMAGE_PATH, WHITE_PAWN_IMAGE_PATH, WHITE_QUEEN_IMAGE_PATH, WHITE_ROOK_IMAGE_PATH } from "../../include/constants";

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
    fenCode: string,
    gridCol: number,
    gridRow: number
}

class Chesspiece extends React.Component<IProps, Record<string, never> > {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        console.log("code: " + this.props.fenCode);
        console.log("row: " + this.props.gridRow);
        console.log("col: " + this.props.gridCol);

        return <img style={{
            gridColumnStart: this.props.gridCol + 1,
            gridColumnEnd: this.props.gridCol + 2,
            gridRowStart: this.props.gridRow + 1,
            gridRowEnd: this.props.gridRow + 2,
            zIndex: 1,
            width: '100%',
            height: '100%'
        }} src={ fenCodeMap(this.props.fenCode) }/>
    }
}

export default Chesspiece;