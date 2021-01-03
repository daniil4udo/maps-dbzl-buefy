<template>
    <div
        id="dbz-map-wrapper"
        ref="dbzMapWrapper"
        class="dbz-map"
    >
        <div class="dbz-map__body">
            <p class="flame-text flame-text--title5">
                Is the pin in the right location?
                {{ tooltip }}
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
    /* eslint-disable no-unused-vars */
    /* eslint-disable @typescript-eslint/no-unused-vars */

    import { google } from 'google-maps';
    import { Component, Prop, Ref, Watch, Emit, VModel, Vue } from 'vue-property-decorator';

    import Tooltip from '@/components/Tooltip.vue';
    import { isDefined, has, isLocalStorageAccessSafe } from '@/utils/';

    import { IEmirate, IArea, IBuilding, IPolygon, ILatLng } from './models';
    // Events names
    const idNeighbourhood = 'id_neighbourhood';
    const idBuilding = 'id_building';
    const dbzMapAutocomplete = 'dbz.map.autocomplete';
    // const dbzMapChange = 'dbz.map.change';
    // const dbzMapClose = 'dbz.map.close';
    // const dbzMapError = 'dbz.map.error';

    @Component({
        name: 'Map',
        components: {
            Tooltip,
        },
    })
    export default class Map extends Vue {
        // googl instance as in window.google
        @Prop({ required: true }) readonly google!: google;

        @Prop({ type: String, validator: c => /^[a-z]{2}$/i.test(c), default: () => 'AE' }) country!: string;
        @Prop({ type: Object }) readonly emirate!: IEmirate;
        @Prop({ type: Object }) area!: IArea;
        @Prop({ type: Object }) building!: IBuilding

        @Prop({ type: Object }) readonly areas!: Record<string, IArea>;
        @Prop({ type: Object }) readonly buildings!: Record<number, IBuilding>

        @Ref() readonly googleMap!: HTMLDivElement;
        @Ref() readonly tooltip!: HTMLDivElement;

        // Data
        mapInstance = null as google.maps.Map<HTMLDivElement>
        mapOptions = {
            // TODO: move to computed for the generic sake
            center: new this.google.maps.LatLng(
                this.emirate.coords[1],
                this.emirate.coords[0],
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
            styles: [
                {
                    featureType: 'administrative',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'road',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
                {
                    featureType: 'road.highway',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'on',
                        },
                        {
                            color: '#18a57e',
                        },
                        {
                            weight: '0.55',
                        },
                    ],
                },
                {
                    featureType: 'road.highway',
                    elementType: 'labels.icon',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
                {
                    featureType: 'road.highway.controlled_access',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'road.highway.controlled_access',
                    elementType: 'labels.icon',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
                {
                    featureType: 'road.arterial',
                    elementType: 'all',
                    stylers: [
                        {
                            hue: '#00b7ff',
                        },
                        {
                            saturation: -31.19999999999996,
                        },
                        {
                            lightness: 2.1803921568627374,
                        },
                        {
                            gamma: 1,
                        },
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'road.local',
                    elementType: 'all',
                    stylers: [
                        {
                            hue: '#00B5FF',
                        },
                        {
                            saturation: -33.33333333333343,
                        },
                        {
                            lightness: 27.294117647058826,
                        },
                        {
                            gamma: 1,
                        },
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'transit',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'transit.line',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
                {
                    featureType: 'transit.station.airport',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'on',
                        },
                    ],
                },
                {
                    featureType: 'transit.station.bus',
                    elementType: 'all',
                    stylers: [
                        {
                            visibility: 'off',
                        },
                    ],
                },
                {
                    featureType: 'water',
                    elementType: 'all',
                    stylers: [
                        {
                            color: '#2757a3',
                        },
                    ],
                },
            ],
            panControl: false,
            zoomIncrement: 2,
            zoomEmirate: 1,
            zoomArea: 2,
            zoomBuilding: 3,
            animDuration: 200,
            delayAnim: 100,
            shortAnim: 400,
            mediumAnim: 600,
            longAnim: 1e3,
        }

        // areaPolygonInstances: null,
        polygonOptions = {
            fillColor: '#2153b0',
            fillOpacity: 0.2,
            strokeColor: '#193f85',
            strokeOpacity: 0.8,
            strokeWeight: 1,
        }

        //
        latLngInstance = null as google.maps.LatLng
        foundAreaPoint = null as IPolygon<IArea>
        boundaries = null as google.maps.Polygon
        //
        isArabic = false
        isVisibleTooltip = true
        tooltipText = ''
        messages = {
            loading: '🔍 Finding your location...',
            water: '🤿 Are you scuba diving?',
            land: '🐪 Lost in the desert?',
            generic: '🧭 Do you need a GPS, dude?',
        }

        // Computed
        // get keyedByAreas() {
        //     return keyBy(this.areas, 'value');
        // }

        get areaPolygonInstances(): IPolygon<IArea>[] {
            return this.createPolygonInstances(this.areas);
        }

        createPolygonInstances<T extends IArea | IEmirate>(obj: Record<string, T>): IPolygon<T>[] {
            const polygon = [];
            for (const key in obj) {
                if (has(obj, key)) {
                    const { [this.isArabic ? 'name_ar' : 'name_en']: name, area, value } = obj[key];

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

            return polygon;
        }

        @VModel({ type: Object, default: () => ({ lat: null, lng: null }) }) center!: ILatLng

        mounted() {
            if (isDefined(this.google)) {
                this.initGoogleMaps();
                this.addEventListeners();
            }
            else {
                throw new Error('Cannot initialize Map without the GMap instance');
            }
        }

        destroyed() {
            this.google.maps.event.clearInstanceListeners(this.mapInstance);
        }

        @Watch('center', { immediate: false, deep: true })
        onCenterChanged(newV: ILatLng, oldV: ILatLng) {
            // Needed for v-model work properly
            if (isDefined(newV.lat) && isDefined(newV.lng) && JSON.stringify(newV) !== JSON.stringify(oldV)) {
                const mapCenter = new this.google.maps.LatLng(
                    newV.lat,
                    newV.lng,
                );

                this.mapInstance.panTo(mapCenter);
            }
        }

        @Watch('emirate', { immediate: false, deep: true })
        onEmirateChange(val: IEmirate, oldVal: IEmirate) {
            if (isDefined(val) && val.name_en !== oldVal.name_en) {
                const mapCenter = new this.google.maps.LatLng(
                    val.coords[1],
                    val.coords[0],
                );

                this.setZoom(this.mapOptions.zoomEmirate);
                this.mapInstance.panTo(mapCenter);
            }
        }

        @Watch('area', { immediate: false, deep: true })
        onAreaChanged(newV: IArea) {
            if (isDefined(newV?.value)) {
                this.setNeighbourhood(newV.value);
            }
        }

        @Watch('building', { immediate: false, deep: true })
        onBuildingChanged(newV: IBuilding) {
            if (isDefined(newV?.value)) {
                this.setBuilding(newV.value);
            }
        }

        initGoogleMaps() {
            // TODO: findout a way to enable visual refresh
            // this.google.maps.visualRefresh = true;

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
                this.google.maps.event.addListener(this.mapInstance, 'idle', this.handleGoogleMapIdle.bind(this));
                this.google.maps.event.addListener(this.mapInstance, 'click', this.handleGoogleMapClick.bind(this));
            });
        }

        // Polygon handlers
        setMapPolygon(polygon: IPolygon<IArea>) {
            if (this.boundaries) {
                this.boundaries.setMap(null);
            }

            if (polygon) {
                this.boundaries = polygon.boundaries;

                if (polygon.value) {
                    this.boundaries.setMap(this.mapInstance);
                }
            }
        }

        setZoom(increment = 0) {
            this.mapInstance.setZoom(this.mapOptions.zoom + increment);
        }

        // Tooltip handler
        setTooltipText(tt: string) {
            this.tooltipText = tt;
        }

        setUserLocation() {
            if (isDefined(this.center.lat) && isDefined(this.center.lng)) {
                this.latLngInstance = new this.google.maps.LatLng(
                    this.center.lat,
                    this.center.lng,
                );

                return this.latLngInstance;
            }

            if (isLocalStorageAccessSafe && window.localStorage.getItem('lat') && window.localStorage.getItem('lng')) {
                this.latLngInstance = new this.google.maps.LatLng(
                    parseFloat(window.localStorage.getItem('lat')),
                    parseFloat(window.localStorage.getItem('lng')),
                );

                return this.latLngInstance;
            }

            if ('geolocation' in window.navigator) {
                const options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                };
                const getLocation: PositionCallback = ({ coords }) => {
                    this.latLngInstance = new this.google.maps.LatLng(coords.latitude, coords.longitude);
                };
                const getError: PositionErrorCallback = err => {
                    console.error('⛔️', err.message);
                    this.latLngInstance = null;
                };

                window.navigator.geolocation.getCurrentPosition(getLocation, getError, options);
            }

            else {
                return null;
            }
        }

        setCoordinates({ lat, lng }: google.maps.LatLng) {
            if (this.center.lat !== lat()) {
                this.center.lat = lat();
            }

            if (this.center.lng !== lng()) {
                this.center.lng = lng();
            }

            if (isLocalStorageAccessSafe) {
                window.localStorage.setItem('lat', JSON.stringify(lat()));
                window.localStorage.setItem('lng', JSON.stringify(lng()));
            }
        }

        setNeighbourhood(id: string | number) {
            const neighbourhood = this.areas[id];

            if (!neighbourhood || !neighbourhood.area || !neighbourhood.coords) {
                return null;
            }

            const mapCenter = new this.google.maps.LatLng(neighbourhood.coords[1], neighbourhood.coords[0]);

            this.mapInstance.panTo(mapCenter);
            this.setZoom(this.mapOptions.zoomArea);
            this.setCoordinates(mapCenter);
            this.locatePoint(mapCenter, neighbourhood);
        }

        setBuilding(buildingValue: string | number) {
            const building = this.buildings[buildingValue];

            if (!building || !building.neighbourhood_id) {
                return null;
            }

            if (building.coords && building.coords.length === 2) {
                const mapCenter = new this.google.maps.LatLng(building.coords[1], building.coords[0]);

                this.mapInstance.panTo(mapCenter);
                this.setZoom(this.mapOptions.zoomBuilding);
                this.locatePoint(mapCenter);
                this.setCoordinates(mapCenter);

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
        findClosestArea(polygons: IPolygon<IArea>[]) {
            const o = polygons.map(polygon => this.google.maps.geometry.spherical.computeArea(polygon.boundaries.getPath()));
            const smallesPolygonArea = o.indexOf(Math.min(...o));

            return polygons[smallesPolygonArea];
        }

        areaContainingPoint(e: google.maps.LatLng, o?: IArea | IPolygon<IArea>) {
            const fn = o
                ? ({ value }) => value === o.value
                : ({ boundaries }) => this.google.maps.geometry.poly.containsLocation(e, boundaries);

            const a = this.areaPolygonInstances.filter(fn);

            const newArea = (a.length === 1)
                ? a[0]
                : (a.length >= 2)
                    ? this.findClosestArea(a)
                    : null;

            this.updateArea(newArea);

            return newArea;
        }

        locateEmirate(e: google.maps.LatLng) {
            // TODO: need to autodetect emirate
            // use only on the first call!
        }

        locatePoint(e: google.maps.LatLng, o?: IArea | IPolygon<IArea>) {
            this.areaContainingPoint(e, o);

            if (this.foundAreaPoint) {
                this.setMapPolygon(this.foundAreaPoint);
                this.setTooltipText(this.foundAreaPoint.name);
            }
            else {
                // Remove Polygon if couldn find the location
                this.setMapPolygon(null);

                // Get some elevation data if couldn find the location
                this.setTooltipText(this.messages.loading);

                const ElevationService = new this.google.maps.ElevationService();

                ElevationService.getElevationForLocations(
                    { locations: [ e ] },
                    this.handleElevationResponse.bind(this),
                );
            }
        }

        updateArea(newArea: IPolygon<IArea>) {
            if (this.foundAreaPoint?.name !== newArea?.name) {
                this.foundAreaPoint = newArea;

                // Not using @Emit here to avoid redundant firing of null
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

            this.setUserLocation();

            const mapCenter = this.latLngInstance || this.mapOptions.center;// this.mapOptions.center;

            // Responsible for retriving code from local storage
            this.mapInstance.panTo(mapCenter);
            this.setZoom(this.mapOptions.zoomIncrement);
            this.setCoordinates(mapCenter);
            this.locatePoint(mapCenter);

            return mapCenter;
        }

        @Emit('dragstart')
        handleGoogleMapDragStart() {
            const mapCenter = this.mapInstance.getCenter();
            // querySelectorPin.classList.remove('dbz-animate-shake');
            // querySelectorPin.classList.remove('outside-polygons');
            this.setTooltipText(this.messages.loading);

            return mapCenter;
        }

        @Emit('dragidle')
        handleGoogleMapIdle() {
            const mapCenter = this.mapInstance.getCenter();

            this.setCoordinates(mapCenter);
            this.locatePoint(mapCenter);
            // this.dispatchEvent();

            return mapCenter;
        }

        @Emit('click')
        handleGoogleMapClick(e: { domEvent?: MouseEvent; latLng: google.maps.LatLng; pixel?: { x: number; y: number } }) {
            this.mapInstance.panTo(e.latLng);

            return e.latLng;
        }

        // In case we decide move away from Google Elevation API
        // handle other request in here
        async getElevationResponse(results: Partial<google.maps.ElevationResult>[], status: google.maps.ElevationStatus): Promise<number | null> {
            // let res = await fetch(`https://api.airmap.com/elevation/v1/ele?points=${this.center.lat},${this.center.lng}`);
            // res = await res.json();
            // return res.data ? res.data[0] : null;

            // Google's Elevation response
            return status === this.google.maps.ElevationStatus.OK && results[0]
                ? results[0].elevation
                : null;
        }

        // TODO: Too many time got called, have to fix it
        async handleElevationResponse(results: Partial<google.maps.ElevationResult>[], status: google.maps.ElevationStatus) {
            // querySelectorPin.classList.add('outside-polygons');
            const elevetioResponse = await this.getElevationResponse(results, status);

            if (isDefined(elevetioResponse)) {
                elevetioResponse > 0
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
        height: 500px;
        background: url('https://dbzstatic-a.akamaihd.net/images/paa/dummy_map_2.jpg') center center no-repeat;
        border-radius: 8px;

        &::after {
            position: absolute;
            top: calc(50%);
            left: 50%;
            // width: 25px;
            height: 35px;
            content: '📍';
            // background-image: url('http://maps.gstatic.com/mapfiles/markers2/marker.png');
            background-size: cover;
            transform: translate(-50%, -50%);
        }
    }
</style>
