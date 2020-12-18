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
    import GoogleMapsApiLoader from 'google-maps-api-loader';
    import Vue from 'vue';

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

    export default Vue.extend({
        name: 'Address',
        components: {
            Map,
            Neighborhood,
            Building,
        },
        data() {
            return {
                google: null,
                emirates,
                emirate: 'dubai',
                buildings,
                boundaries,
            };
        },
        computed: {
            areas() {
                return uae[this.emirate].sort((a, b) => ((a.name_en > b.name_en) ? 1 : -1));
            },
            areasObject() {
                return this.areas.reduce((e, o) => {
                    (e[o.value] = o);
                    return e;
                }, {});
            },
            emirateDetails() {
                return this.emirates[this.emirate.toLowerCase()];
            },
        },
        async created() {
            const gMaps = await GoogleMapsApiLoader({
                libraries: [ 'geometry' ],
                apiKey: 'AIzaSyDCWGWQFBHWRuqhkSjWQFb6Sf7T8jm7Y6I',
            });

            this.google = gMaps;
        },
        methods: {
            onAreaChange(v) {},
        },
    });
</script>
