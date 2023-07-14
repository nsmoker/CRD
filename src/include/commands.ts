export interface CheckLegalCommandResponse {
    fen: string,
    prettyMove: string,
    legal: boolean
}

export function makeCheckLegalRequest(srcCol: number, srcRow: number, dstCol: number, dstRow: number, fen: string) {
    return {
        fen: fen,
        srcCol: srcCol,
        srcRow: srcRow,
        dstCol: dstCol,
        dstRow: dstRow
    }
}