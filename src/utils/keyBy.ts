type KeyFn = (arg) => string

export function keyBy<T>(arr: T[], fnKey: string | KeyFn): Record<string, T> {
    const obj = {};
    for (const a of arr) {
        typeof fnKey === 'string'
            ? obj[a[fnKey]] = a
            : obj[fnKey(a)] = a;
    }
    return obj;
}
