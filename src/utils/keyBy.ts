type KeyFn = (arg) => string

export function keyBy(arr: any[], fnKey: string | KeyFn) {
    const obj = {};
    for (const a of arr) {
        typeof fnKey === 'string'
            ? obj[a[fnKey]] = a
            : obj[fnKey(a)] = a;
    }
    return obj;
}
