<template>
    <div class="container">
        <B-Field label="Emirate">
            <B-Radio-button
                v-for="(val, key) in AE_Emirates"
                :key="key"
                v-model="emirate"
                :native-value="key"
                type="is-success"
            >
                <span>{{ val.name_en }}</span>
            </B-Radio-button>
        </B-Field>

        <!-- {{ area }} -->
        <Autocomplete
            v-if="emirate"
            v-model="area"
            field="name_en"
            label="Chose Area"
            :placeholder="areaExample"
            :disabled="building != null"
            :emirate="emirate"
            :data="emirateAreas"
            @input="option => onAutocompleteInput(option, 'area')"
        />

        <!-- {{ building }} -->
        <Autocomplete
            v-if="emirate"
            v-model="building"
            field="name_en"
            label="Chose Building"
            placeholder="Meera Tower"
            :emirate="emirate"
            :data="AE_Buildings"
            @input="option => onAutocompleteInput(option, 'building')"
        />

        {{ coords.lat }},{{ coords.lng }}
        <B-Button @click="setNewCoords" v-text="'Set New Coords'" />
        <Map
            v-if="google"
            :center.sync="coords"
            :google="google"
            :country="'AE'"
            :emirate="emirateDetails"
            :area="area"
            :areas="emirateAreas"
            :building="building"
            :buildings="AE_Buildings"
            @area-changed="onAreaChanched"
        />
    </div>
</template>

<script lang="ts">
    import { Loader, LoaderOptions, google } from 'google-maps';
    import { Component, Vue } from 'vue-property-decorator';

    import { findEmirate, findNeighbourhoodById } from '@/assets/uaeGeoData/utils';
    import Autocomplete from '@/components/Autocomplete.vue';
    import Map from '@/components/Map.vue';
    import { EmirateKey, IEmirate, IArea, IBuilding, IPolygon, Emirates, Areas, Buildings } from '@/components/models';
    import { isDefined } from '@/utils/';

    import { areas } from '../assets/uaeGeoData/areas';
    import { buildings } from '../assets/uaeGeoData/buildings';
    import { emirates } from '../assets/uaeGeoData/uae';

    @Component({
        components: {
            Map,
            Autocomplete,
        },
    })
    export default class Address extends Vue {
        // GMap data
        google = null as google | null;
        apiKey = 'AIzaSyDPnAnJeY1TR8ugUI28QuSLwcmGxVT8Y30';
        options = { libraries: [ 'geometry', 'places' ] } as LoaderOptions;

        //
        country = 'AE' // asISO2
        emirate = 'dubai' as EmirateKey;
        area = null as IArea;
        building = null as IBuilding;

        // JSONs
        AE_Emirates = emirates as unknown as Readonly<Emirates>
        AE_Areas = areas as unknown as Readonly<Record<EmirateKey, Areas>>
        AE_Buildings = buildings as unknown as Readonly<Buildings>

        coords = {
            lat: null,
            lng: null,
        }

        // Computed
        get emirateAreas(): Areas {
            return this.AE_Areas[this.emirate.toLowerCase()];
        }

        get emirateDetails(): IEmirate {
            return this.AE_Emirates[this.emirate.toLowerCase()];
        }

        get areaExample() {
            const v = Object.values(this.emirateAreas);
            const i = Math.floor(Math.random() * (v.length - 0));

            return v[i].name_en;
        }

        // Created hook
        created() {
            this.loadGMaps();
        }

        async loadGMaps() {
            try {
                // Initializing map in her to make sure it avaliable on created in the Map component
                const loader = new Loader(this.apiKey, this.options);
                const gMaps = await loader.load();

                this.google = gMaps;
            }
            catch {
                // swallow
            }
        }

        // TEST METHODS
        setNewCoords() {
                this.coords.lat = 25.510498;
                this.coords.lng = 55.57039;

                // this.building = { name_en: 'Meera Tower', is_in_migrated_neighbourhood: true, coords: [ 55.255582, 25.183397 ], name_ar: 'برج ميره', neighbourhood_id: 62229, value: 6424, custom_format: 'Al Habtoor City, Business Bay, Dubai, AE' };
        }

        // Methods
        onAutocompleteInput<T extends IArea & IBuilding>(payload: T, scope: 'area' | 'building') {
            if (!isDefined(payload)) {
                return;
            }

            const emirate = findEmirate(payload, this.AE_Areas);

            // Extract emirate from the payload and set as new
            if (emirate && this.emirate !== emirate.key) {
                this.emirate = emirate.key;
            }

            if (scope === 'building') {
                const relatedArea = findNeighbourhoodById(payload.neighbourhood_id, this.AE_Areas);

                // As long as area and building are v-models, no need to set it expicitly
                // only update are when building is changed
                this.area = relatedArea;
            }
        }

        onAreaChanched(area: IPolygon<IArea>) {
            // if (this.area?.value !== area?.value) {
            //     const relatedArea = findNeighbourhoodById(area.value, this.AE_Areas);

            //     this.area = relatedArea;
            // }
        }
    }
</script>
