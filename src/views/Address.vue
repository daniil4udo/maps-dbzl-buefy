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

        <Autocomplete
            v-if="emirate"
            field="name_en"
            label="Chose Area"
            placeholder="Barsha 1"
            :emirate="emirate"
            :data="emirateAreas"
        />

        <Autocomplete
            v-if="emirate"
            field="name_en"
            label="Chose Building"
            placeholder="Meera"
            :emirate="emirate"
            :data="emirateBuildings"
        />

        {{ coords }}
        <b-button @click="setNewCoords" v-text="'Set New Coords'" />
        <DmcMap
            v-if="google"
            v-model="coords"
            :google="google"
            :emirate="emirateDetails"
            :areas="emirateAreas"
            :buildings="emirateBuildings"
            @area-changed="onAreaChange"
        />
    </div>
</template>

<script lang="ts">
    import { Loader, LoaderOptions, google } from 'google-maps';
    import { Component, Vue } from 'vue-property-decorator';

    import emirates from '@/assets/uaeGeoData/areas.json';
    import boundaries from '@/assets/uaeGeoData/boundaries.json';
    import buildings from '@/assets/uaeGeoData/buildings.json';
    import Autocomplete from '@/components/Autocomplete.vue';
    import DmcMap from '@/components/Map.vue';
    import { EmirateKey, IEmirate, IArea, IBuilding, IBoundaries } from '@/components/models';

    import abudhabi from '../assets/uaeGeoData/abuDhabi/areas.json';
    import ajman from '../assets/uaeGeoData/ajman/areas.json';
    import alain from '../assets/uaeGeoData/alAin/areas.json';
    import dubai from '../assets/uaeGeoData/dubai/areas.json';
    import fujairah from '../assets/uaeGeoData/fujairah/areas.json';
    import rasalkhaimah from '../assets/uaeGeoData/rasAlKhaimah/areas.json';
    import sharjah from '../assets/uaeGeoData/sharjah/areas.json';
    import ummalquawain from '../assets/uaeGeoData/ummAlQuawain/areas.json';

    const uae = {
        abudhabi,
        ummalquawain,
        ajman,
        alain,
        dubai,
        fujairah,
        rasalkhaimah,
        sharjah,
    };

    @Component({
        components: {
            DmcMap,
            Autocomplete,
        },
    })
    export default class Address extends Vue {
        // Data
        google = null as google | null;
        apiKey = 'AIzaSyDCWGWQFBHWRuqhkSjWQFb6Sf7T8jm7Y6I';
        options = { libraries: [ 'geometry' ] } as LoaderOptions;

        emirate = 'dubai' as EmirateKey;

        // JSONS
        UAE_Emirates = emirates as Record<EmirateKey, IEmirate>
        UAE_Boundaries = boundaries as IBoundaries;

        coords = {
            lat: null,
            lng: null,
        }

        // Computed
        get emirateAreas(): Record<string, IArea> {
            const currentEmirateArea = uae[this.emirate] as IArea[];

            return currentEmirateArea
                // .sort((a, b) => ((a.name_en > b.name_en) ? 1 : -1))
                .map(area => {
                    area.custom_format = area.location_path_en.reverse().join(', ');
                    return area;
                })
                .reduce((e, o) => Object.assign(e, { [o.value]: o }), {});
        }

        get emirateBuildings(): Record<string, IBuilding> {
            const computedBuildings = {} as Partial<Record<string, IBuilding>>;

            for (const key in buildings as Record<string, IBuilding>) {
                if (true) {
                    const custom_format = this.emirateAreas[buildings[key].neighbourhood_id]?.custom_format;

                    Object.assign(
                        computedBuildings,
                        { [key]: { ...buildings[key], custom_format } },
                    );
                }
            }

            return computedBuildings;
            // return buildings
            //     // .sort((a, b) => ((a.name_en > b.name_en) ? 1 : -1))
            //     .map(area => {
            //         area.custom_format = area.location_path_en.reverse().join(', ');
            //         return area;
            //     })
            //     .reduce((e, o) => Object.assign(e, { [o.value]: o }), {});
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
        onAreaChange(area) {
            // console.log(area);
        }
    }
</script>
