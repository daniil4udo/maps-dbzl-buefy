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

        <Neighborhood
            v-if="emirate"
            :emirate="emirate"
            :areas="emirateAreas"
            :buildings="UAE_Buildings"
        />

        <Building
            v-if="emirate"
            :emirate="emirate"
            :areas="emirateAreas"
            :buildings="UAE_Buildings"
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
    import Building from '@/components/Building.vue';
    import DmcMap from '@/components/Map.vue';
    import Neighborhood from '@/components/Neighborhood.vue';
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
            Neighborhood,
            Building,
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
        UAE_Buildings = buildings as Record<number, IBuilding>;
        UAE_Boundaries = boundaries as IBoundaries;

        coords = {
            lat: null,
            lng: null,
        }

        // Computed
        get emirateAreas(): IArea[] {
            const currentEmirateArea = uae[this.emirate] as IArea[];

            return currentEmirateArea
                .sort((a, b) => ((a.name_en > b.name_en) ? 1 : -1))
                .map(area => {
                    area.custom_format = area.location_path_en.reverse().join(', ');
                    return area;
                });
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
