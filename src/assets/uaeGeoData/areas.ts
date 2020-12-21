import reduce from 'lodash/reduce';

import { addCustomFormat } from '@/assets/uaeGeoData/utils';
import { IArea, EmirateKey, Areas } from '@/components/models';

import abudhabi from './abudhabi/areas.json';
import ajman from './ajman/areas.json';
import alain from './alain/areas.json';
import dubai from './dubai/areas.json';
import fujairah from './fujairah/areas.json';
import rasalkhaimah from './rasalkhaimah/areas.json';
import sharjah from './sharjah/areas.json';
import ummalqawain from './ummalqawain/areas.json';

const _areas = {
    abudhabi,
    ajman,
    alain,
    dubai,
    fujairah,
    rasalkhaimah,
    sharjah,
    ummalqawain,
} as Record<EmirateKey, IArea[]>;

export const areas = reduce(
        _areas,
        (acc, curr, emirateKey: EmirateKey) => {
            // Mutating curr to add new prop
            const area: Areas = curr
                .reduce((a, c) => {
                    addCustomFormat(c, c); // add custom_format prop

                    return Object.assign(a, { [c.value]: c });
                }, {}); // key by value prop

            return Object.assign(acc, { [emirateKey]: area });
        },
        {},
) as Record<EmirateKey, Areas>;

export default {
    ...areas,
};
