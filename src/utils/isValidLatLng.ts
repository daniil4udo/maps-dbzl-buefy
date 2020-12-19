import inRange from 'lodash/inRange';

export function isValidLat(lat: number | string) {
    if (!lat == null) {
        return false;
    }

    lat = typeof lat === 'string' && parseFloat(lat);

    return isNaN(lat) && inRange(lat, -90, 91);
}

export function isValidLng(lng: number | string) {
    if (!lng == null) {
        return false;
    }

    lng = typeof lng === 'string' && parseFloat(lng);

    return isNaN(lng) && inRange(lng, -180, 180);
}
