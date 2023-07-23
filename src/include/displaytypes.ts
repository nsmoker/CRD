export interface MoveDisplayList {
    fen: string,
    algebraic: string,
    comment: string,
    whitesTurn: boolean,
    prev: MoveDisplayList | null,
    next: MoveDisplayList[]
}

// It is hard to serialize a doubly linked list. As such, we just do the backwards linking on the frontend.
export function finishLinking(mdl: MoveDisplayList) {
    mdl.next.forEach(element => {
        finishLinking(element);
        element.prev = mdl
    });
}

export interface TreeDiff {
    display_list: MoveDisplayList,
    diffs: [MoveDisplayList, MoveDisplayList][]
}