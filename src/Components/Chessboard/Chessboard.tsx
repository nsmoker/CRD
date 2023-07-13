import React from "react";
import Chesspiece from "../Chesspiece/Chesspiece";
import "./styles.css"
import { BOARD_IMAGE_PATH } from "../../include/constants";

function fenStringPiecesMap(fen: string) {
    let row = 0;
    let col = 0;
    let ret = [];
    let i = 0;
    while (fen.charAt(i) !== " ") {
        const code = fen.charAt(i);
        if (code !== "/" && isNaN(Number(code))) {
            ret.push(<Chesspiece key={i} fenCode={code} gridRow={row} gridCol={col}/>);
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

interface IProps {
    fen: string
}

class Chessboard extends React.Component<IProps, Record<string, never> > {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <div className="main-board-container">
                <img src={BOARD_IMAGE_PATH} className="main-board-image"/>
                <div className="piece-container">
                    {fenStringPiecesMap(this.props.fen)}
                </div>
            </div>
        );
    }
}

export default Chessboard;