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
    import { google } from 'google-maps';
    import has from 'lodash/has';
    import { Component, Prop, Ref, Watch, Emit, VModel, Vue } from 'vue-property-decorator';

    import Tooltip from '@/components/Tooltip.vue';
    import { keyBy } from '@/utils/keyBy';

    import { IEmirate, IArea, IBuilding, IPolygon, ILatLng } from './models';
    // Events names
    const idNeighbourhood = 'id_neighbourhood';
    const idBuilding = 'id_building';
    const dbzMapAutocomplete = 'dbz.map.autocomplete';
    // const dbzMapChange = 'dbz.map.change';
    // const dbzMapClose = 'dbz.map.close';
    // const dbzMapError = 'dbz.map.error';

    @Component({
        name: 'DmcMap',
        components: {
            Tooltip,
        },
    })
    export default class Map extends Vue {
        // googl instance as in window.google
        @Prop({ required: true }) readonly google!: google;
        @Prop({ type: Object }) readonly emirate!: IEmirate;
        @Prop({ type: Array }) readonly areas!: IArea[];
        @Prop({ type: Object }) readonly buildings!: Record<number, IBuilding>

        @Ref() readonly googleMap!: HTMLDivElement;
        @Ref() readonly tooltip!: HTMLDivElement;

        // Data
        mapInstance = null as google.maps.Map<HTMLDivElement>
        mapOptions = {
            center: new this.google.maps.LatLng(
                this.emirate.latLng[1],
                this.emirate.latLng[0],
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
        }

        // polygonInstance: null,
        polygonOptions = {
            fillColor: '#2153b0',
            fillOpacity: 0.2,
            strokeColor: '#193f85',
            strokeOpacity: 0.8,
            strokeWeight: 1,
        }

        latLngInstance = null as google.maps.LatLng
        // center = {
        //     lat: null,
        //     lng: null,
        // }

        //
        foundAreaPoint = null as IPolygon
        boundaries = null as google.maps.Polygon
        //
        isArabic = false
        isVisibleTooltip = true
        tooltipText = ''
        messages = {
            loading: 'Finding your location...',
            water: 'Are you scuba diving?',
            land: 'Lost in the desert?',
            generic: 'Do you need a GPS, mate?',
        }

        // Computed
        get keyedByAreas() {
            return keyBy(this.areas, 'value');
        }

        get polygonInstance(): IPolygon[] {
            const polygon = [];
            for (const key in this.keyedByAreas) {
                if (has(this.keyedByAreas, key)) {
                    const { [this.isArabic ? 'name_ar' : 'name_en']: name, area, value } = this.keyedByAreas[key];

                    // Due to large amount of initial polygons, use native cTr instead of GLatLng
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
        }

        @VModel({ type: Object, default: () => ({ lat: null, lng: null }) }) center!: ILatLng
        @Watch('center', { immediate: false, deep: true })
        onCenterChanged(val: ILatLng) {
            if ((val.lat != null) && (val.lng != null)) {
                const mapCenter = new this.google.maps.LatLng(
                    val.lat,
                    val.lng,
                );
                this.setMapCenter(mapCenter);
            }
        }

        @Watch('emirate', { immediate: false, deep: true })
        onEmirateChange(val: IEmirate, oldVal: IEmirate) {
            if (val != null && val.name_en !== oldVal.name_en) {
                const mapCenter = new this.google.maps.LatLng(
                    val.latLng[1],
                    val.latLng[0],
            );

                this.mapInstance.setZoom(this.mapOptions.zoom);
                this.setMapCenter(mapCenter);
            }
        }

        mounted() {
            if (this.google != null) {
                this.initGoogleMaps();
                this.addEventListeners();
            }
            else {
                throw new Error('Cannot initialize Map without the GMap instance');
            }
        }

        /**
         * Mount
         */
        initGoogleMaps() {
            this.google.maps.visualRefresh = true;

            if (this.googleMap instanceof HTMLDivElement) {
                this.mapInstance = new this.google.maps.Map(this.googleMap, this.mapOptions);
                this.mapInstance.controls[this.google.maps.ControlPosition.RIGHT_CENTER].push(this.tooltip);
            }
        }

        addEventListeners() {
            // document.addEventListener('dbz.autocomplete.change', this.handleAutocompleteChange.bind(this));
            // document.addEventListener('dbz.neighborhood.change', this.handleNeighborhoodChange.bind(this));

            this.google.maps.event.addListenerOnce(this.mapInstance, 'tilesloaded', () => {
                this.handleGoogleMapTilesLoaded.call(this);

                // Rest of the listners attach only once tiles are loaded
                this.google.maps.event.addListener(this.mapInstance, 'dragstart', this.handleGoogleMapDragStart.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'idle', this.handleGoogleMapDragEnd.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'click', this.handleGoogleMapClick.bind(this));
            });
        }

        /**
         * Set handlers
         */
        setMapCenter(mapCenter: google.maps.LatLng, lookupArea?: IArea | IPolygon, panTo = true) {
            if (panTo) {
                this.mapInstance.panTo(mapCenter);
            }

            this.setCoordinates(mapCenter);
            this.locatePoint(mapCenter, lookupArea);
        }

        // Polygon handlers
        setMapPolygon(e: IPolygon) {
            if (this.boundaries) {
                this.boundaries.setMap(null);
            }
            this.boundaries = e.boundaries;

            if (e.value) {
                this.boundaries.setMap(this.mapInstance);
            }
        }

        // Tooltip handler
        setTooltipText(tt: string) {
            this.tooltipText = tt;
        }

        setUserLocation() {
            if (this.center.lat != null && this.center.lng != null) {
                this.latLngInstance = new this.google.maps.LatLng(
                    this.center.lat,
                    this.center.lng,
                );
            }
            else if (window.localStorage.getItem('lat') && window.localStorage.getItem('lng')) {
                this.latLngInstance = new this.google.maps.LatLng(
                    parseFloat(window.localStorage.getItem('lat')),
                    parseFloat(window.localStorage.getItem('lng')),
                );
            }
            else if ('geolocation' in window.navigator) {
                const options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                };
                const getLocation: PositionCallback = async ({ coords }) => {
                    this.latLngInstance = new this.google.maps.LatLng(coords.latitude, coords.longitude);
                };
                const getError: PositionErrorCallback = err => {
                    console.error('⛔️', err.message);
                    this.latLngInstance = null;
                };

                window.navigator.geolocation.getCurrentPosition(getLocation, getError, options);
            }
            else {
                this.latLngInstance = null;
            }
        }

        setCoordinates(e: google.maps.LatLng) {
            // const lat = (typeof e.lat === 'function' ? e.lat() : e.lat) as number;
            // const lng = (typeof e.lng === 'function' ? e.lng() : e.lng) as number;

            this.center.lat = e.lat();
            this.center.lng = e.lng();

            window.localStorage.setItem('lat', JSON.stringify(e.lat()));
            window.localStorage.setItem('lng', JSON.stringify(e.lng()));
        }

        setNeighbourhood(id: string | number) {
            const neighbourhood = this.keyedByAreas[id];

            if (!neighbourhood || !neighbourhood.area || !neighbourhood.coords) {
                return null;
            }

            const latLng = new this.google.maps.LatLng(neighbourhood.coords[1], neighbourhood.coords[0]);

            this.setMapCenter(latLng, neighbourhood);
        }

        setBuilding(buildingValue: string | number) {
            const building = this.buildings[buildingValue];

            if (!building || !building.neighbourhood_id) {
                return null;
            }

            if (building.coords && building.coords.length === 2) {
                const n = new this.google.maps.LatLng(building.coords[1], building.coords[0]);

                this.setMapCenter(n);

                const t = this.isArabic
                    ? building.name_ar
                    : building.name_en;

                this.setTooltipText(t);
            }
            else {
                this.setNeighbourhood(building.neighbourhood_id);
            }
        }

        //
        findClosestArea(e: IPolygon[]) {
            const o = e.map(_e => this.google.maps.geometry.spherical.computeArea(_e.boundaries.getPath()));
            const n = o.indexOf(Math.min(...o));

            return e[n];
        }

        areaContainingPoint(e: google.maps.LatLng, o?: IArea | IPolygon) {
            const cb = o
                ? ({ value }) => value === o.value
                : ({ boundaries }) => this.google.maps.geometry.poly.containsLocation(e, boundaries);

            const a = this.polygonInstance.filter(cb);

            const newArea = (a.length === 1)
                ? a[0]
                : (a.length >= 2)
                    ? this.findClosestArea(a)
                    : null;

            this.updateArea(newArea);
        }

        locatePoint(e: google.maps.LatLng, o?: IArea | IPolygon) {
            this.areaContainingPoint(e, o);

            if (this.foundAreaPoint) {
                this.setMapPolygon(this.foundAreaPoint);
                this.setTooltipText(this.foundAreaPoint.name);
            }
            else {
                this.setTooltipText(this.messages.loading);

                const ElevationService = new this.google.maps.ElevationService() as google.maps.ElevationService;

                ElevationService.getElevationForLocations(
                    { locations: [ e ] },
                    this.handleElevationResponse.bind(this),
                );
            }
        }

        updateArea(newArea: IPolygon) {
            if (this.foundAreaPoint?.name !== newArea?.name) {
                this.foundAreaPoint = newArea;

                // Not using @Emit here to avoid redundant emits of null
                this.$emit('area-changed', newArea);
            }
        }

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
        }

        handleNeighborhoodChange(eventPayload) {
            if (eventPayload.detail.id === idNeighbourhood) {
                this.setNeighbourhood(eventPayload.detail.value);
            }
        }

        // GMaps event hadlers
        @Emit('tilesloaded')
        handleGoogleMapTilesLoaded() {
            // TODO: set some maps styles
            // TODO: add google maps placeholder img once tilels are loaded
            // querySelectorTooltip.classList.remove('hidden');

            this.setUserLocation();

            const mapCenter = this.latLngInstance || this.mapOptions.center;// this.mapOptions.center;

            this.mapInstance.setZoom(this.mapOptions.zoom + this.mapOptions.zoomIncrement);
            this.setMapCenter(mapCenter);

            return mapCenter;
        }

        @Emit('dragstart')
        handleGoogleMapDragStart() {
            const mapCenter = this.mapInstance.getCenter();
            // querySelectorPin.classList.remove('dbz-animate-shake');
            // querySelectorPin.classList.remove('outside-polygons');

            return mapCenter;
        }

        @Emit('dragend')
        handleGoogleMapDragEnd() {
            const mapCenter = this.mapInstance.getCenter();

            this.setMapCenter(mapCenter, null, false);
            // this.dispatchEvent();

            return mapCenter;
        }

        @Emit('click')
        handleGoogleMapClick(e: { domEvent?: MouseEvent; latLng: google.maps.LatLng; pixel?: { x: number; y: number } }) {
            this.mapInstance.panTo(e.latLng);
            this.handleGoogleMapDragEnd();

            return e.latLng;
        }

        handleElevationResponse(results: google.maps.ElevationResult[], status: google.maps.ElevationStatus) {
            // querySelectorPin.classList.add('outside-polygons');

            if (status === this.google.maps.ElevationStatus.OK && results[0]) {
                results[0].elevation > 0
                    ? (this.setTooltipText(this.messages.land))
                    : (this.setTooltipText(this.messages.water));
            }
            else {
                this.setTooltipText(this.messages.generic);
            }
        }
    }
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
