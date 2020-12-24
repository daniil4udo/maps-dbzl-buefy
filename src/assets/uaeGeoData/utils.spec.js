// import { areas } from '@/assets/uaeGeoData/areas';

import * as utils from './utils';

describe('@/assets/uaeGeoData/utils.ts', () => {
    describe('assignCustomFormat merges target and source correctly', () => {
        it('assignCustomFormat', () => {
            const area = {
                location_path_en: [
                    'UAE',
                    'Abu Dhabi',
                    'Masdar City',
                ],
            };
            const custom_format = utils.assignCustomFormat(area);

            expect(custom_format).toEqual({
                location_path_en: [
                    'UAE',
                    'Abu Dhabi',
                    'Masdar City',
                ],
                ...custom_format,
            });
        });
    });

    describe('assignCustomFormat assigns to target correctly', () => {
        it('assignCustomFormat', () => {
            const area = {
                location_path_en: [
                    'UAE',
                    'Abu Dhabi',
                    'Masdar City',
                ],
            };
            const custom_format = utils.assignCustomFormat({}, area);

            expect(custom_format).toEqual({
                ...custom_format,
            });
        });
    });
});
