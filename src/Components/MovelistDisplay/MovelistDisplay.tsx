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

    generateMoveDisplay = (displayList: MoveDisplayList, ply: number): React.ReactNode[] => {
        let chips = displayList.next.flatMap((elem, index) => {
            let ret: React.ReactNode[] = [];
            if (index == 0) {
                // Note that we actually do want == here, this is not a bug.
                let isActive = this.props.activeMove == elem;
                console.log(elem.algebraic);
                let chip = <Chip 
                    key={ elem.algebraic + elem.fen + index + ply } 
                    label={ <Typography style={{ maxWidth: "20ch" }}>{ elem.algebraic }</Typography> } 
                    variant={ isActive ? "filled" : "outlined" }
                    onClick={ this.props.moveSelectionCallback(elem) }
                    color={ isActive ? "primary" : "default" }/>
                if (ply % 2 == 0) {
                    ret.push(
                        <Typography key={ ply }>{ (ply + 2) / 2 }. </Typography>
                    );
                }

                ret.push(chip);

                ret = ret.concat(this.generateMoveDisplay(elem, ply + 1));
            }

            return ret;
        });

        return chips;
    }

    render(): React.ReactNode {
        return (
            <div className="movelist-display-container">
                <Typography variant="h3">Moves</Typography>
                <div className="movelist-display">
                    {this.generateMoveDisplay(this.props.displayList, 0)}
                </div>
            </div>
        )
    }
}

export default MovelistDisplay;