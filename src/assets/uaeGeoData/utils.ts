import has from 'lodash/has';
import isNil from 'lodash/isNil';

import {
    Areas,
    IArea,
    EmirateKey,
    EmirateName,
    EmirateValue,
    IBuilding,
} from '@/components/models';

export function addCustomFormat<T>(target: T, area: IArea, locate = 'en'): T & { custom_format: string } {
    const areaPath: string[] = area[`location_path_${locate}`];

    return Object.assign(target, {
        custom_format: [ ...areaPath ].reverse().join(', '),
    });
}

export function findNeighbourhood(neighbourhood_id: number, areas: Record<EmirateKey, Areas>): IArea | null {
    for (const emirate in areas) {
        if (has(areas, emirate)) {
            const emirateAreas: Areas = areas[emirate];

            if (has(emirateAreas, neighbourhood_id) && !isNil(emirateAreas[neighbourhood_id])) {
                return emirateAreas[neighbourhood_id];
            }
        }
    }

    return null;
}

export function findEmirate<T extends IArea & IBuilding>(payload: T, areas: Record<EmirateKey, Areas>) {
    const area = (payload.neighbourhood_id)
        ? findNeighbourhood(payload.neighbourhood_id, areas)
        : payload;

    if (area && area.location_path_en) {
        return emirateMap(area.location_path_en[1]);
    }

    return null;
}

// TODO: make it less ugly
function emirateMap(emirate: EmirateName): { readonly key: EmirateKey; readonly name: EmirateName; readonly value: EmirateValue } {
    return ({
        dubai: {
            key: 'dubai' as EmirateKey,
            name: 'Dubai' as EmirateName,
            value: 'DXB' as EmirateValue,
        },
        ajman: {
            key: 'ajman' as EmirateKey,
            name: 'Ajman' as EmirateName,
            value: 'AJM' as EmirateValue,
        },
        sharjah: {
            key: 'sharjah' as EmirateKey,
            name: 'Sharjah' as EmirateName,
            value: 'SHJ' as EmirateValue,
        },
        ummalqawain: {
            key: 'ummalqawain' as EmirateKey,
            name: 'Umm Al Qawain' as EmirateName,
            value: 'UAQ' as EmirateValue,
        },
        alain: {
            key: 'alain' as EmirateKey,
            name: 'Al Ain' as EmirateName,
            value: 'AIN' as EmirateValue,
        },
        fujairah: {
            key: 'fujairah' as EmirateKey,
            name: 'Fujairah' as EmirateName,
            value: 'FUJ' as EmirateValue,
        },
        abudhabi: {
            key: 'abudhabi' as EmirateKey,
            name: 'Abu Dhabi' as EmirateName,
            value: 'ADB' as EmirateValue,
        },
        rasalkhaimah: {
            key: 'rasalkhaimah' as EmirateKey,
            name: 'Ras Al Khaimah' as EmirateName,
            value: 'RAK' as EmirateValue,
        },
    })[emirate];
}
