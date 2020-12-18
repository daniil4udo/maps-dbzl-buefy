<template>
    <div
        id="dbz-map-wrapper"
        ref="dbzMapWrapper"
        class="dbz-map"
    >
        <div class="dbz-map__body">
            <p class="flame-text flame-text--title5">
                Is the pin in the right location?
            </p>
            <p class="flame-text flame-text--medium">
                Click and drag the pin to the exact spot. Users are more likely to
                respond to ads that are correctly shown on the map
            </p>
            <div
                id="dbz-map-canvas"
                ref="googleMap"
                class="dbz-map__canvas"
                style="position: relative; overflow: hidden; background-color: gray;"
            >
                <template v-if="google && mapInstance">
                    <slot
                        :google="google"
                        :map="mapInstance"
                    />
                </template>

                <Tooltip
                    v-show="tooltipText"
                    :class="{ hidden: !isVisibleTooltip }"
                    :label="tooltipText"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    import { PropType } from '@vue/composition-api';
    import GoogleMapsApiLoader from 'google-maps-api-loader';
    import has from 'lodash/has';
    import inRange from 'lodash/inRange';
    import Vue from 'vue';

    import Tooltip from '@/components/Tooltip.vue';

    import { IEmirate } from './models';

    // Events names
    const idNeighbourhood = 'id_neighbourhood';
    const idBuilding = 'id_building';
    const dbzMapAutocomplete = 'dbz.map.autocomplete';
    const dbzMapChange = 'dbz.map.change';
    const dbzMapClose = 'dbz.map.close';
    const dbzMapError = 'dbz.map.error';

    export default Vue.extend({
        name: 'Map',
        components: {
            Tooltip,
        },
        props: {
            // google instance as in window.google
            google: {
                type: (Object as unknown) as PropType<object>,
                default: () => null,
            },
            emirate: {
                type: (String as unknown) as PropType<string>,
                default: () => 'dubai',
            },
            emirateDetails: {
                type: (Object as unknown) as PropType<IEmirate>,
                default: () => {},
            },
            areas: {
                type: (Array as unknown) as PropType<any[]>,
                default: () => null,
            },
            neighborhoods: {
                type: (Object as unknown) as PropType<object>,
                default: () => null,
            },
            buildings: {
                type: (Object as unknown) as PropType<object>,
                default: () => null,
            },
        },
        data() {
            return {
                mapInstance: null,
                mapOptions: {
                    center: new this.google.maps.LatLng(
                        this.emirateDetails.latLng[0],
                        this.emirateDetails.latLng[1],
                    ),
                    mapTypeId: this.google.maps.MapTypeId.ROADMAP,
                    zoom: 12,
                    scrollwheel: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    zoomControl: !0,
                    fullscreenControl: false,
                    zoomControlOptions: {
                        style: this.google.maps.ZoomControlStyle.LARGE,
                        position: this.google.maps.ControlPosition.LEFT_TOP,
                    },
                    panControl: false,
                    zoomIncrement: 2,
                    animDuration: 200,
                    delayAnim: 100,
                    shortAnim: 400,
                    mediumAnim: 600,
                    longAnim: 1e3,
                },
                // polygonInstance: null,
                polygonOptions: {
                    fillColor: '#2153b0',
                    fillOpacity: 0.2,
                    strokeColor: '#193f85',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                },
                latLngInstance: null,
                center: {
                    lat: null,
                    lng: null,
                },
                //
                foundAreaPoint: null,
                boundaries: null,
                //
                isArabic: false,
                isVisibleTooltip: true,
                tooltipText: '',
                messages: {
                    loading: 'Finding your location...',
                    water: 'Are you scuba diving?',
                    land: 'Lost in the desert?',
                    generic: 'Do you need a GPS, mate?',
                },
                //
            };
        },
        computed: {
            keyedByAreas() {
                return this.areas.reduce((e, o) => {
                    (e[o.value] = o);
                    return e;
                }, {});
            },
            polygonInstance() {
                const polygon = [];
                for (const key in this.keyedByAreas) {
                    if (has(this.keyedByAreas, key)) {
                        const { [this.isArabic ? 'name_ar' : 'name_en']: name, area, value } = this.keyedByAreas[key];

                        const paths = area.map(e => new this.google.maps.LatLng(e[1], e[0]));
                        const boundaries = new this.google.maps.Polygon({ paths, ...this.polygonOptions });

                        polygon.push({
                            name,
                            value,
                            boundaries,
                        });
                    }
                }

                // return Object.keys(this.keyedByAreas).map(n.bind(this));
                return polygon;
            },
        },
        mounted() {
            if (this.google) {
                this.initGoogleMaps();
                this.addEventListeners();
            }
        },
        methods: {
            initGoogleMaps() {
                this.google.maps.visualRefresh = true;

                this.mapInstance = new this.google.maps.Map(this.$refs.googleMap, this.mapOptions);
                this.mapInstance.controls[this.google.maps.ControlPosition.CENTER].push(this.$refs.tooltip);

                // this.createPolygons(this.keyedByAreas);
            },
            // Polygon handlers
            setMapPolygon(e) {
                if (this.boundaries) {
                    this.boundaries.setMap(null);
                }
                this.boundaries = e.boundaries;

                if (e.value) {
                    this.boundaries.setMap(this.mapInstance);
                }
            },
            // Tooltip handler
            setTooltipText(tt: string) {
                this.tooltipText = tt;
            },
            // Coordinates handlers
            isValidLat(lat) {
                if (!lat == null) {
                    return false;
                }

                lat = Number(lat);

                return isNaN(lat) && inRange(lat, -90, 91);
            },
            isValidLng(lng) {
                if (!lng == null) {
                    return false;
                }

                lng = Number(lng);

                return isNaN(lng) && inRange(lng, -180, 180);
            },
            setUserLocation() {
                if (this.isValidLat(this.center.lat) && this.isValidLng(this.center.lng)) {
                    this.latLngInstance = new this.google.maps.LatLng(
                        this.center.lat,
                        this.center.lng,
                    );
                }
                else if (this.isValidLat(window.localStorage.getItem('lat')) && this.isValidLng(window.localStorage.getItem('lng'))) {
                    this.latLngInstance = new this.google.maps.LatLng(
                        window.localStorage.getItem('lat'),
                        window.localStorage.getItem('lng'),
                    );
                }
                else if (window.navigator.geolocation) {
                    window.navigator.geolocation.getCurrentPosition(
                        ({ coords }) => {
                            this.latLngInstance = new this.google.maps.LatLng(coords.latitude, coords.longitude);
                        },
                        () => {
                            this.latLngInstance = null;
                        },
                    );
                }
                else {
                    this.latLngInstance = null;
                }
            },
            setCoordinates(e) {
                this.center.lat = e.lat();
                this.center.lng = e.lng();

                window.localStorage.setItem('lat', e.lat());
                window.localStorage.setItem('lng', e.lng());

                this.$emit('center-changed', this.center);
            },
            setNewArea(newArea) {
                if (this.foundAreaPoint?.name !== newArea?.name) {
                    this.foundAreaPoint = newArea;

                    this.$emit('area-changed', newArea);
                }
            },
            setNeighbourhood(e) {
                const _neirbohoud = this.keyedByAreas[e] || {};

                if (!_neirbohoud || !_neirbohoud.area || !_neirbohoud.coords) {
                    return null;
                }
                const _latLngInstance = new this.google.maps.LatLng(_neirbohoud.coords[1], _neirbohoud.coords[0]);

                this.mapInstance.panTo(_latLngInstance);

                this.setCoordinates(_latLngInstance);
                this.locatePoint(_latLngInstance, _neirbohoud);
            },
            setBuilding(e) {
                const _building = this.buildings[e];
                if (!_building || !_building.neighbourhood_id) {
                    return null;
                }
                if (_building.coords && _building.coords.length === 2) {
                    const n = new this.google.maps.LatLng(_building.coords[1], _building.coords[0]);

                    this.mapInstance.panTo(n);

                    this.setCoordinates(n);
                    this.locatePoint(n);

                    const t = this.isArabic
                        ? _building.name_ar
                        : _building.name_en;

                    this.setTooltipText(t);
                }
                else {
                    this.setNeighbourhood(_building.neighbourhood_id);
                }
            },
            //
            findClosestArea(e) {
                const o = e.map(_e => this.google.maps.geometry.spherical.computeArea(_e.boundaries.getPath()));
                const n = o.indexOf(Math.min(...o));

                return e[n];
            },
            areaContainingPoint(e, o) {
                const cb = o
                    ? ({ value }) => value === o.value
                    : ({ boundaries }) => this.google.maps.geometry.poly.containsLocation(e, boundaries);

                const a = this.polygonInstance.filter(cb);

                const newArea = (a.length === 1)
                    ? a[0]
                    : (a.length >= 2)
                        ? this.findClosestArea(a)
                        : null;

                this.setNewArea(newArea);
            },
            locatePoint(e, o) {
                this.areaContainingPoint(e, o);

                if (this.foundAreaPoint) {
                    this.setMapPolygon(this.foundAreaPoint);
                    this.setTooltipText(this.foundAreaPoint.name);
                }
                else {
                    this.setTooltipText(this.messages.loading);

                    const ElevationService = new this.google.maps.ElevationService();

                    ElevationService.getElevationForLocations(
                        { locations: [ e ] },
                        this.handleElevationResponse.bind(this),
                    );
                }
            },
            // LISTNERS
            addEventListeners() {
                // document.addEventListener('dbz.autocomplete.change', this.handleAutocompleteChange.bind(this));
                // document.addEventListener('dbz.neighborhood.change', this.handleNeighborhoodChange.bind(this));

                this.google.maps.event.addListenerOnce(this.mapInstance, 'tilesloaded', this.handleGoogleMapTilesLoaded.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'dragstart', this.handleGoogleMapDragStart.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'idle', this.handleGoogleMapDragEnd.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'click', this.handleGoogleMapClick.bind(this));
            },
            // Local events handler
            handleAutocompleteChange(eventPayload) {
                if (eventPayload.detail.id === idBuilding) {
                    this.setBuilding(eventPayload.detail.value);
                }
                this.handleNeighborhoodChange(eventPayload);

                const customEventAutocomplete = new CustomEvent(dbzMapAutocomplete, {
                    detail: {
                        id: idNeighbourhood,
                        name: (this.foundAreaPoint || {}).name,
                        value: (this.foundAreaPoint || {}).value,
                    },
                });
                document.dispatchEvent(customEventAutocomplete);
            },
            handleNeighborhoodChange(eventPayload) {
                if (eventPayload.detail.id === idNeighbourhood) {
                    this.setNeighbourhood(eventPayload.detail.value);
                }
            },
            // GMaps event hadlers
            handleGoogleMapDragStart() {
                // querySelectorPin.classList.remove('dbz-animate-shake');
                // querySelectorPin.classList.remove('outside-polygons');
                this.$emit('dragstart');
            },
            handleGoogleMapDragEnd(e) {
                const mapCenter = this.mapInstance.getCenter();

                this.setCoordinates(mapCenter);
                this.locatePoint(mapCenter);
                // this.dispatchEvent();

                this.$emit('dragend');
            },
            handleGoogleMapTilesLoaded() {
                // TODO: set some maps styles
                // TODO: add google maps placeholder img once tilels are loaded
                // querySelectorTooltip.classList.remove('hidden');

                this.setUserLocation();

                const mapCenter = this.latLngInstance || this.mapOptions.center;// this.mapOptions.center;

                this.mapInstance.panTo(mapCenter);
                this.mapInstance.setZoom(this.mapOptions.zoom + this.mapOptions.zoomIncrement);

                this.setCoordinates(mapCenter);
                this.locatePoint(mapCenter);

                this.$emit('tilesloaded');
            },
            handleGoogleMapClick(e) {
                this.mapInstance.panTo(e.latLng);
                this.handleGoogleMapDragEnd();

                this.$emit('click');
            },
            handleElevationResponse(e, o) {
                // querySelectorPin.classList.add('outside-polygons');

                if (o === this.google.maps.ElevationStatus.OK && e[0]) {
                    e[0].elevation > 0
                        ? (this.setTooltipText(this.messages.land))
                        : (this.setTooltipText(this.messages.water));
                }
                else {
                    this.setTooltipText(this.messages.generic);
                }
            },
        },
    });
</script>

<style lang="scss" scoped>
    @media (min-width: 35.5em) {
        .dbz-map__canvas-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            border-bottom:1px solid #a8a8a8;
        }
    }

    .dbz-map__canvas {
        position: relative;
        width: 100%;
        height: 200px;
        background: url('https://dbzstatic-a.akamaihd.net/images/paa/dummy_map_2.jpg') center center no-repeat;
        border-radius: 8px;

        &::after {
            position: absolute;
            top: 43%;
            left: 50%;
            width: 25px;
            height: 41px;
            content: ' ';
            background-image: url('http://maps.gstatic.com/mapfiles/markers2/marker.png');
            background-size: cover;
            transform: translate(-50%, -50%);
        }
    }
</style>
