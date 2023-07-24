import { Chip, Typography } from "@mui/material";
import React from "react";
import { MoveDisplayList } from "../../include/displaytypes";
import "./styles.css"

interface IProps {
    displayList: MoveDisplayList
    activeMove: MoveDisplayList
    moveSelectionCallback: (nMove: MoveDisplayList) => () => void
}

class MovelistDisplay extends React.Component<IProps, Record<string, never> > {
    constructor(props: IProps) {
        super(props)
    }

    generateMoveDisplay = (displayList: MoveDisplayList, ply: number, inVariation: boolean): React.ReactNode[] => {
        let follow: React.ReactNode[] = [];
        let chips = displayList.next.flatMap((elem, index) => {
            let ret: React.ReactNode[] = [];
            // Note that we actually do want == here, this is not a bug.
            let isActive = this.props.activeMove == elem;
            let chip = <Chip 
                key={ elem.algebraic + elem.fen + index + ply } 
                label={ <Typography style={{ maxWidth: "20ch" }}>{ elem.algebraic }</Typography> } 
                variant={ isActive ? "filled" : "outlined" }
                onClick={ this.props.moveSelectionCallback(elem) }
                color={ isActive ? "primary" : "default" }/>

            if (!inVariation && index !== 0) {
                ret.push(<div key={ `${ply} ${elem.fen} ${index} break-start` } className="flex-break"/>);
            }
            if (index !== 0) {
                ret.push(<Typography key={ `${ply} ${elem.fen} ${index} var-start` }>(</Typography>);
            }

            if (ply % 2 === 0) {
                ret.push(
                    <Typography key={ `${ply} ${elem.fen} ${elem.algebraic} ${index} lbl` }>{ (ply + 2) / 2 }. </Typography>
                );
            } else if (index !== 0) {
                ret.push(
                    <Typography key={ `${ply} ${elem.fen} ${elem.algebraic} ${index} lbl` }>{ Math.floor((ply + 2) / 2) }... </Typography>
                );
            }

            ret.push(chip);

            for (let i = 0; i < elem.comment.length; ++i) {
                const comment = elem.comment[i]
                ret.push(<Typography key={ `${ply} ${elem.fen} ${elem.algebraic} ${index} cmt${i}` } className="comment">{ comment }</Typography>)
            }

            ret = ret.concat(this.generateMoveDisplay(elem, ply + 1, inVariation || index !== 0));
            if (index !== 0) {
                ret.push(<Typography key={ `${ply} ${elem.fen} ${index} var-end` }>)</Typography>)
                if (!inVariation) {
                    ret.push(<div key={ `${ply} ${elem.fen} ${index} break-end` } className="flex-break"/>);
                }
            }

            if (index === 0) {
                follow = ret;
            } else {
                return ret;
            }
        });

        if (follow.length > 0 && displayList.next.length > 1 && ply % 2 !== 0) {
            const lst: React.ReactNode[] = [<Typography 
                key={ `${ply} ${displayList.fen} ${displayList.algebraic} ${displayList} restore-lbl` }
            >{ Math.floor((ply + 2.0) / 2.0) }... </Typography>];
            follow = lst.concat(follow);
        }

        return chips.concat(follow);
    }

    render(): React.ReactNode {
        return (
            <div className="movelist-display-container">
                <Typography variant="h3">Moves</Typography>
                <div className="movelist-display">
                    { this.generateMoveDisplay(this.props.displayList, 0, false) }
                </div>
            </div>
        )
    }
}

export default MovelistDisplay;