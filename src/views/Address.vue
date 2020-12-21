<template>
    <div class="container">
        <b-field label="Emirate">
            <b-radio-button
                v-for="(val, key) in UAE_Emirates"
                :key="key"
                v-model="emirate"
                :native-value="key"
                type="is-success"
            >
                <span>{{ val.name_en }}</span>
            </b-radio-button>
        </b-field>

        {{ area }}
        <Autocomplete
            v-if="emirate"
            v-model="area"
            field="name_en"
            label="Chose Area"
            placeholder="Barsha 1"
            :emirate="emirate"
            :data="emirateAreas"
            @input="option => onAutocompleteInput(option, 'area')"
        />

        {{ building }}
        <Autocomplete
            v-if="emirate"
            v-model="building"
            field="name_en"
            label="Chose Building"
            placeholder="Meera"
            :emirate="emirate"
            :data="UAE_Buildings"
            @input="option => onAutocompleteInput(option, 'building')"
        />

        {{ coords }}
        <b-button @click="setNewCoords" v-text="'Set New Coords'" />
        <DmcMap
            v-if="google"
            v-model="coords"
            :google="google"
            :emirate="emirateDetails"
            :areas="emirateAreas"
            :buildings="UAE_Buildings"
            :area="area"
            :building="building"
        />
    </div>
</template>

<script lang="ts">
    import { Loader, LoaderOptions, google } from 'google-maps';
    import { isNil } from 'lodash';
    import { Component, Vue } from 'vue-property-decorator';

    import { areas } from '@/assets/uaeGeoData/areas';
    import { buildings } from '@/assets/uaeGeoData/buildings';
    import UAE from '@/assets/uaeGeoData/uae.json';
    import { findEmirate, findNeighbourhood } from '@/assets/uaeGeoData/utils';
    import Autocomplete from '@/components/Autocomplete.vue';
    import DmcMap from '@/components/Map.vue';
    import { EmirateKey, IEmirate, IArea, IBuilding, Emirates, Areas, Buildings } from '@/components/models';

    @Component({
        components: {
            DmcMap,
            Autocomplete,
        },
    })
    export default class Address extends Vue {
        // GMap data
        google = null as google | null;
        apiKey = 'AIzaSyDCWGWQFBHWRuqhkSjWQFb6Sf7T8jm7Y6I';
        options = { libraries: [ 'geometry', 'places' ] } as LoaderOptions;

        //
        emirate = 'dubai' as EmirateKey;
        area = null as IArea;
        building = null as IBuilding;

        // JSONs
        UAE_Emirates = UAE.emirates as Readonly<Emirates>
        UAE_Areas = areas as Readonly<Record<EmirateKey, Areas>>
        UAE_Buildings = buildings as Readonly<Buildings>

        coords = {
            lat: null,
            lng: null,
        }

        // Computed
        get emirateAreas() {
            return this.UAE_Areas[this.emirate.toLowerCase()];
        }

        get emirateDetails(): IEmirate {
            return this.UAE_Emirates[this.emirate.toLowerCase()];
        }

        // Created hook
        async created() {
            // Initializing map in her to make sure it avaliable on created in the Map component
            const loader = new Loader(this.apiKey, this.options);
            const gMaps = await loader.load();

            this.google = gMaps;
        }

        // TEST METHODS
        setNewCoords() {
                this.coords.lat = 25.510498;
                this.coords.lng = 55.57039;
        }

        // Methods
        onAutocompleteInput<T extends IArea & IBuilding>(payload: T, scope: 'area' | 'building') {
            if (isNil(payload)) {
                return;
            }

            const emirate = findEmirate(payload, this.UAE_Areas);

            if (this.emirate !== emirate.key) {
                this.emirate = emirate.key;
            }

            if (scope === 'building') {
                const relatedArea = findNeighbourhood(payload.neighbourhood_id, this.UAE_Areas);

                this.building = payload as IBuilding;
                this.area = relatedArea;
            }
            else if (scope === 'area') {
                this.area = payload as IArea;
            }
        }
    }
</script>
