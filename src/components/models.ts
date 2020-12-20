export interface ILatLng {
    lat: number;
    lng: number;
}
export type TLatLnh = [ number, number]

export type EmirateKey = 'dubai' | 'ajman' | 'sharjah' | 'ummalquawain' | 'alain' | 'fujairah' | 'abudhabi' | 'rasalkhaimah'
export type EmirateName = 'Dubai' | 'Ajman' | 'Sharjah' | 'Umm Al Quawain' | 'Al Ain' | 'Fujairah' | 'Abu Dhabi' | 'Ras Al Khaimah'
export type EmirateValue = 'DXB' | 'AJM' | 'SHJ' | 'UAQ' | 'AIN' | 'FUJ' | 'ADB' | 'RAK'

export interface IEmirate {
  name_en: EmirateName;
  name_ar: string;
  delivery: number;
  coords: TLatLnh;
  image: string;
  value: EmirateValue;
  area?: TLatLnh[];
}

export interface IArea {
    name_en: string;
    name_ar: string;
    location_path_en: string[];
    location_path_ar: string[];
    coords: TLatLnh;
    area: TLatLnh[];
    is_migrated: boolean;
    value: number;
    custom_format?: string;
}

export interface IPolygon<T extends IArea | IEmirate> {
    name: T['name_en' | 'name_ar'];
    value: T['value'];
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
    custom_format?: string;
    value?: number;
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
