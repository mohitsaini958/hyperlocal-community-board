export const getGeoRoom = (lat, lng) => {
    const latCell = Math.floor(lat * 10);
    const lngCell = Math.floor(lng * 10);

    return `geo_${latCell}_${lngCell}`;
};