import Fuse from 'fuse.js';
import _defaults from 'lodash/defaultsDeep';
import _isNil from 'lodash/isNil';

export class WorkerSearch<T extends object> {
    private fuse: Fuse<T>;
    private data: T[];
    private options: Fuse.IFuseOptions<T>;

    constructor(data: Record<string, T> | T[], options: Fuse.IFuseOptions<T> = {}) {
        this.data = Array.isArray(data) ? data : Object.values(data);
        this.options = _defaults(options, {
            includeScore: true,
            threshold: 0.23,
            includeMatches: true,
        });
        this.fuse = new Fuse(this.data, options);
    }

    public async find(s: string) {
        try {
            // Fuzzy search
            return this.fuseSearch(s);
        }
        catch {
            // If Fuse fails, perform regulat search
            return this.matchSearch(s);
        }
    }

    private fuseSearch(s: string | Fuse.Expression) {
        if (typeof s === 'string') {
            return this.fuse
                .search(s)
                .map(e => e.item);
        }

        console.error(`[Autocomplete]: Search string has to be type 'string'. Got ${typeof s}`);
    }

    private matchSearch(s = '') {
        const matchInputCountry = (c = '') => String
            .prototype
            .includes
            .call(c.toString().toUpperCase(), s.toString().toUpperCase());

        return this.data.filter(d => this.options.keys.some(keys => {
            if (typeof keys === 'string') {
                return matchInputCountry(d[keys]);
            }
            if (Array.isArray(keys)) {
                return keys.some(k => matchInputCountry(d[k]));
            }
            if (!_isNil(keys) && typeof keys === 'object') {
                return Array.isArray(keys.name)
                    ? keys.name.some(k => matchInputCountry(d[k]))
                    : matchInputCountry(d[keys.name]);
            }

            return false;
        }));
    }
}
