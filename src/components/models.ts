// type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

export interface ILatLng {
    readonly lat: number;
    readonly lng: number;
}
export type TLatLng = readonly [ ILatLng['lat'], ILatLng['lng']]
export type TLocationPath = readonly [ 'UAE', EmirateName, ...string[] ]

export type EmirateKey = 'dubai' | 'ajman' | 'sharjah' | 'ummalqawain' | 'alain' | 'fujairah' | 'abudhabi' | 'rasalkhaimah'
export type EmirateName = 'Dubai' | 'Ajman' | 'Sharjah' | 'Umm Al Qawain' | 'Al Ain' | 'Fujairah' | 'Abu Dhabi' | 'Ras Al Khaimah'
export type EmirateValue = 'DXB' | 'AJM' | 'SHJ' | 'UAQ' | 'AIN' | 'FUJ' | 'ADB' | 'RAK'

export interface IUAE {
    readonly name_en: EmirateName;
    readonly name_ar: string;
    readonly emirates: Emirates;
    readonly area: TLatLng[] | TLatLng[][];
}

export type Emirates = Record<EmirateKey, IEmirate>
export interface IEmirate {
  readonly name_en: EmirateName;
  readonly name_ar: string;

  readonly coords: TLatLng;
  readonly area: TLatLng[];

  readonly value: EmirateValue;
  readonly image: string;
  readonly delivery: number;
}

export type Areas = Record<IArea['value'], IArea>
export interface IArea {
    readonly name_en: string;
    readonly name_ar: string;

    readonly location_path_en: TLocationPath;
    readonly location_path_ar: string[];

    readonly coords: TLatLng;
    readonly area: TLatLng[];

    readonly value: number;
    readonly is_migrated: boolean;

    // Values elow are added during runtime
    custom_format?: string;
}

export type Buildings = Record<IBuilding['value'], IBuilding>
export interface IBuilding {
    readonly name_en: string;
    readonly name_ar: string;

    readonly coords: null | number[];

    readonly is_in_migrated_neighbourhood: boolean;
    readonly neighbourhood_id: number;

    // Values elow are added during runtime
    value?: number;
    custom_format?: string;
}
export interface IPolygon<T extends IArea | IEmirate> {
    name: T['name_en' | 'name_ar'];
    value: T['value'];
    boundaries: google.maps.Polygon;
}

// NOT REALTED
export interface ILocationData<T> {
    areas: T[];
    boundaries: IBoundaries;
    buildings?: Record<number, IBuilding>;
}
export interface IBoundaries {
    type: string;
    coordinates: Array<number[]>[][];
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
