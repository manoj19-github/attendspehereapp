// src/utils/map.ts
export const generateOpenStreetMapUrl = (
  centerLat: number,
  centerLng: number,
  markerLat?: number,
  markerLng?: number,
  zoom: number = 15
): string => {
  const baseUrl = 'https://www.openstreetmap.org/export/embed.html';
  const params = new URLSearchParams({
    bbox: `${centerLng - 0.01},${centerLat - 0.01},${centerLng + 0.01},${centerLat + 0.01}`,
    layer: 'mapnik',
    marker: `${centerLat},${centerLng}`,
  });

  if (markerLat && markerLng) {
    params.append('marker', `${markerLat},${markerLng}`);
  }

  return `${baseUrl}?${params.toString()}`;
};

export const generateFullMapUrl = (
  officeLat: number,
  officeLng: number,
  userLat?: number,
  userLng?: number
): string => {
  const markers = [];
  
  // Office marker (blue)
  markers.push(`mlat=${officeLat}&mlon=${officeLng}&mtype=office`);
  
  // User marker (green) if provided
  if (userLat && userLng) {
    markers.push(`mlat=${userLat}&mlon=${userLng}&mtype=user`);
  }

  return `https://www.openstreetmap.org/?lat=${officeLat}&lon=${officeLng}&zoom=16&layers=M`;
};




export const getMapRegion = (
  lat: number,
  lng: number,
  latitudeDelta: number = 0.01,
  longitudeDelta: number = 0.01,
) => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta,
  longitudeDelta,
});

export const getBoundingBox = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLng = Math.min(lng1, lng2);
  const maxLng = Math.max(lng1, lng2);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.5,
    longitudeDelta: (maxLng - minLng) * 1.5,
  };
};


