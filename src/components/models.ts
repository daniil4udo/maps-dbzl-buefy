export interface ILatLng {
    lat: null | number;
    lng: null | number;
}
export type TLatLnh = [ number, number]

export type EmirateKey = 'dubai' | 'ajman' | 'sharjah' | 'ummalquawain' | 'alain' | 'fujairah' | 'abudhabi' | 'rasalkhaimah'
export type EmirateName = 'Dubai' | 'Ajman' | 'Sharjah' | 'Umm Al Quawain' | 'Al Ain' | 'Fujairah' | 'Abu Dhabi' | 'Ras Al Khaimah'
export interface IEmirate {
  name_en: EmirateName;
  name_short: string;
  name_ar: string;
  delivery: number;
  latLng: TLatLnh;
  image: string;
}

export interface IArea {
    location_path_en: string[];
    coords: number[];
    area: Array<number>[];
    location_path_ar: string[];
    name_en: string;
    is_migrated: boolean;
    name_ar: string;
    value: number;
}

export interface IPolygon {
    name: IArea['name_en' | 'name_ar'];
    value: IArea['value'];
    boundaries: google.maps.Polygon;
}
export interface ILocationData<T> {
    areas: T[];
    boundaries: IBoundaries;
    buildings?: Record<number, IBuilding>;
}
export interface IBoundaries {
    type: string;
    coordinates: Array<number[]>[][];
}
export interface IBuilding {
    name_en: string;
    is_in_migrated_neighbourhood: boolean;
    coords: null | number[];
    name_ar: string;
    neighbourhood_id: number | string;
}

export interface ILocationStateInterface {
    uaeLocationData: ILocationData<IEmirate>;
    emirateLocationData: ILocationData<IArea>;
    userNavigator: ILatLng;

    emirate: unknown;
    deliveryCharge: unknown;
    area: {
        index: unknown;
        title: unknown;
        value: unknown;
    };
    locationType: unknown;
    address: unknown;
    mapLocation: unknown;

    orderNotes: unknown;
}
