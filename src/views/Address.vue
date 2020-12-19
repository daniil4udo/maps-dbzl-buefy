<template>
    <div v-if="google" class="container">
        <b-field label="Emirate">
            <b-radio-button
                v-for="(val, key) in emirates"
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
            :areas="areas"
            :buildings="buildings"
        />

        <Building
            v-if="emirate"
            :emirate="emirate"
            :areas="areas"
            :buildings="buildings"
        />

        <Map
            :google="google"
            :emirate="emirate"
            :emirate-details="emirateDetails"
            :areas="areas"
            :buildings="buildings"
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
    import Map from '@/components/Map.vue';
    import Neighborhood from '@/components/Neighborhood.vue';

    import abudhabi from '../assets/uaeGeoData/abuDhabi/areas.json';
    import ajman from '../assets/uaeGeoData/ajman/areas.json';
    import alain from '../assets/uaeGeoData/alAin/areas.json';
    import dubai from '../assets/uaeGeoData/dubai/areas.json';
    import fujairah from '../assets/uaeGeoData/fujairah/areas.json';
    import rasalkhaimah from '../assets/uaeGeoData/rasAlKhaimah/areas.json';
    import sharjah from '../assets/uaeGeoData/sharjah/areas.json';
    import ummalquawain from '../assets/uaeGeoData/ummAlQuawain/areas.json';
    import { EmirateKey, IEmirate, IBuilding, IBoundaries } from '../components/models';

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
            Map,
            Neighborhood,
            Building,
        },
    })
    export default class Address extends Vue {
        // Data
        google = null as google | null;
        apiKey = 'AIzaSyDCWGWQFBHWRuqhkSjWQFb6Sf7T8jm7Y6I';
        options = {
            libraries: [ 'geometry' ],
        } as LoaderOptions;

        emirates = emirates as Record<EmirateKey, IEmirate>
        emirate = 'dubai' as EmirateKey;
        buildings = buildings as Record<number, IBuilding>;
        boundaries = boundaries as IBoundaries;

        // Computed
        get areas() {
            return uae[this.emirate].sort((a, b) => ((a.name_en > b.name_en) ? 1 : -1));
        }

        get emirateDetails() {
            return this.emirates[this.emirate.toLowerCase()];
        }

        // Created hook
        async created() {
            // Initializing map in her to make sure it avaliable on created in the Map component
            const loader = new Loader(this.apiKey, this.options);
            const gMaps = await loader.load();

            this.google = gMaps;
        }

        // Methods
        onAreaChange(area) {}
    }
</script>
