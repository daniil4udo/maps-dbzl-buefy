function insertInIndex(str: string, insertStr: string, i: number): string {
    return str.slice(0, i) + insertStr + str.slice(i);
}

export function wrap(firstTag: string | [ string, string ] = '', lastTag = '') {
    if (Array.isArray(firstTag)) {
        [ firstTag, lastTag ] = firstTag;
    }

    return (str = '', startI: number | [ number, number ], endI?: number) => {
        if (Array.isArray(startI)) {
            [ startI, endI ] = startI;
        }

        if (startI > endI) {
            throw new RangeError('Start index has to be higher that last index');
        }

        const insertFirstTag = insertInIndex(str, firstTag as string, startI);

        return insertInIndex(insertFirstTag, lastTag, endI + firstTag.length);
    };
}
