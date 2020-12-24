import reduce from 'lodash/reduce';

import { addCustomFormat, findNeighbourhood } from '@/assets/uaeGeoData/utils';
import { Buildings } from '@/components/models';

import { areas } from './areas';
import _buildings from './buildings.json';

export const buildings = reduce(
        _buildings as unknown as Buildings,
        (acc, curr, buildingVal) => {
            const neighbourhood = findNeighbourhood(curr.neighbourhood_id, areas);

            // Add value to the building object for easier lookup after
            Object.assign(curr, { value: parseInt(buildingVal, 10) });

            // set Custom format prop (UAE, DUbaii, ...)
            // Helps better UI in Autocomplete
            const building = neighbourhood
                ? { ...addCustomFormat(curr, neighbourhood) }
                : { ...curr };

            return Object.assign(acc, { [buildingVal]: building });
        },
        {} as Buildings,
);

export default {
    ...buildings,
};
