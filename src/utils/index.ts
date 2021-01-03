import _has from 'lodash/has';
import _isNil from 'lodash/isNil';

export function isDefined<T>(v: T) {
    return !_isNil(v);
}

type PropertyName = string | number | symbol;
type PropertyPath = Many<PropertyName>;
type Many<T> = T | ReadonlyArray<T>;

export function has<T>(o: T, key: PropertyPath) {
    return _has(o, key);
}

export function isLocalStorageAccessSafe() {
    const TEST_KEY = 'isLocalStorageAccessSafe';
    const TEST_VALUE = 'true';

    try {
        window.localStorage.setItem(TEST_KEY, TEST_VALUE);
        window.localStorage.removeItem(TEST_KEY);

        return true;
    }
    catch (e) {
        return false;
    }
}

export type AllTypes = 'primitive' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'null' | 'undefined' | 'object' | 'array' | 'arguments' | 'buffer' | 'function' | 'generatorfunction' | 'map' | 'weakmap' | 'set' | 'weakset' | 'regexp' | 'date';
export function toType(val: any): AllTypes {
    return {}.toString
        .call(val)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase();
}

function insertInIndex(str: string, insertStr: string, i: number): string {
    return str.slice(0, i) + insertStr + str.slice(i);
}

export function wrap(firstTag: string | [ string, string ] = '', lastTag?: string) {
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
