const geolib = require('geolib');

const locationUtil = {
  // Validate koordinat
  validateCoordinates: (latitude, longitude) => {
    try {
      const isValidLat = typeof latitude === 'number' && 
                        latitude >= -90 && 
                        latitude <= 90;
                        
      const isValidLong = typeof longitude === 'number' && 
                         longitude >= -180 && 
                         longitude <= 180;

      return isValidLat && isValidLong;
    } catch {
      return false;
    }
  },

  // Check jarak dalam radius
  isWithinRadius: (point1, point2, radiusInMeters) => {
    try {
      if (!locationUtil.validateCoordinates(point1.latitude, point1.longitude) ||
          !locationUtil.validateCoordinates(point2.latitude, point2.longitude)) {
        return false;
      }

      const distance = geolib.getDistance(
        { latitude: point1.latitude, longitude: point1.longitude },
        { latitude: point2.latitude, longitude: point2.longitude }
      );

      return distance <= radiusInMeters;
    } catch (error) {
      console.error('Error checking radius:', error);
      return false;
    }
  },

  // Get jarak antara dua titik
  getDistance: (point1, point2) => {
    try {
      if (!locationUtil.validateCoordinates(point1.latitude, point1.longitude) ||
          !locationUtil.validateCoordinates(point2.latitude, point2.longitude)) {
        return null;
      }

      return geolib.getDistance(
        { latitude: point1.latitude, longitude: point1.longitude },
        { latitude: point2.latitude, longitude: point2.longitude }
      );
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  },

  // Get alamat deskripsi lokasi (dummy karena tidak ada geocoding)
  getLocationDescription: (latitude, longitude) => {
    if (!locationUtil.validateCoordinates(latitude, longitude)) {
      return 'Invalid location';
    }

    return `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },

  // Validate device location data
  validateLocationData: (data) => {
    const required = ['latitude', 'longitude', 'accuracy', 'timestamp'];
    
    // Check required fields
    const hasAllFields = required.every(field => data.hasOwnProperty(field));
    if (!hasAllFields) return false;

    // Validate coordinates
    if (!locationUtil.validateCoordinates(data.latitude, data.longitude)) {
      return false;
    }

    // Validate accuracy (in meters, should be reasonable)
    if (typeof data.accuracy !== 'number' || data.accuracy < 0 || data.accuracy > 1000) {
      return false;
    }

    // Validate timestamp (should be recent, within last minute)
    const timestamp = new Date(data.timestamp).getTime();
    const now = Date.now();
    if (isNaN(timestamp) || now - timestamp > 60000) {
      return false;
    }

    return true;
  },

  // Format koordinat untuk display
  formatCoordinates: (latitude, longitude) => {
    try {
      if (!locationUtil.validateCoordinates(latitude, longitude)) {
        return 'Invalid coordinates';
      }

      const latDir = latitude >= 0 ? 'N' : 'S';
      const longDir = longitude >= 0 ? 'E' : 'W';

      return `${Math.abs(latitude).toFixed(6)}° ${latDir}, ${Math.abs(longitude).toFixed(6)}° ${longDir}`;
    } catch (error) {
      console.error('Error formatting coordinates:', error);
      return 'Error formatting coordinates';
    }
  },

  // Parse koordinat string ke object
  parseCoordinates: (coordString) => {
    try {
      // Remove whitespace and split by comma
      const parts = coordString.replace(/\s/g, '').split(',');
      if (parts.length !== 2) return null;

      const latitude = parseFloat(parts[0]);
      const longitude = parseFloat(parts[1]);

      if (!locationUtil.validateCoordinates(latitude, longitude)) {
        return null;
      }

      return { latitude, longitude };
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return null;
    }
  },

  // Calculate center point dari multiple koordinat
  getCenterPoint: (points) => {
    try {
      if (!Array.isArray(points) || points.length === 0) {
        return null;
      }

      // Filter valid points
      const validPoints = points.filter(point => 
        locationUtil.validateCoordinates(point.latitude, point.longitude)
      );

      if (validPoints.length === 0) return null;

      const center = geolib.getCenter(validPoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      })));

      return center;
    } catch (error) {
      console.error('Error calculating center point:', error);
      return null;
    }
  },

  // Check if point is inside polygon (untuk area kompleks)
  isPointInArea: (point, polygon) => {
    try {
      if (!locationUtil.validateCoordinates(point.latitude, point.longitude)) {
        return false;
      }

      // Validate polygon points
      const validPolygon = polygon.every(p => 
        locationUtil.validateCoordinates(p.latitude, p.longitude)
      );

      if (!validPolygon) return false;

      return geolib.isPointInPolygon(
        { latitude: point.latitude, longitude: point.longitude },
        polygon
      );
    } catch (error) {
      console.error('Error checking point in area:', error);
      return false;
    }
  }
};

module.exports = locationUtil;