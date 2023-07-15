export interface MoveDisplayList {
    fen: string,
    comment: string,
    prev: MoveDisplayList | null
    next: MoveDisplayList[]
}

// It is hard to serialize a doubly linked list. As such, we just do the backwards linking on the frontend.
export function finishLinking(mdl: MoveDisplayList) {
    mdl.next.forEach(element => {
        finishLinking(element);
        element.prev = mdl
    });
}