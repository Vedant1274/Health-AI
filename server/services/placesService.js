const axios = require('axios');

/**
 * In-memory cache for Google Places API results.
 * Key: "query|lat|lng|city" → Value: { data, expiry }
 * TTL: 1 hour
 */
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Maps medical conditions/findings to specialty search phrases.
 */
const CONDITION_SPECIALTY_MAP = {
  // Blood-related
  'anemia': 'hematologist',
  'hemoglobin': 'hematologist',
  'low hemoglobin': 'hematologist',
  'high hemoglobin': 'hematologist',
  'iron deficiency': 'hematologist',
  'platelet': 'hematologist',
  'wbc': 'hematologist',
  'rbc': 'hematologist',
  'blood count': 'hematologist',

  // Diabetes / Endocrine
  'glucose': 'endocrinologist',
  'blood sugar': 'endocrinologist',
  'hba1c': 'endocrinologist',
  'diabetes': 'endocrinologist',
  'thyroid': 'endocrinologist',
  'tsh': 'endocrinologist',
  't3': 'endocrinologist',
  't4': 'endocrinologist',

  // Heart / Cardiovascular
  'cholesterol': 'cardiologist',
  'triglycerides': 'cardiologist',
  'ldl': 'cardiologist',
  'hdl': 'cardiologist',
  'heart': 'cardiologist',
  'cardiac': 'cardiologist',
  'chest pain': 'cardiologist',

  // Liver
  'liver': 'hepatologist',
  'bilirubin': 'hepatologist',
  'alt': 'hepatologist',
  'ast': 'hepatologist',
  'sgpt': 'hepatologist',
  'sgot': 'hepatologist',
  'alkaline phosphatase': 'hepatologist',

  // Kidney
  'kidney': 'nephrologist',
  'creatinine': 'nephrologist',
  'urea': 'nephrologist',
  'bun': 'nephrologist',
  'egfr': 'nephrologist',
  'uric acid': 'nephrologist',

  // Infection / Inflammation
  'crp': 'general physician',
  'esr': 'general physician',
  'infection': 'general physician',
  'fever': 'general physician',
  'inflammation': 'general physician',

  // Respiratory
  'lung': 'pulmonologist',
  'respiratory': 'pulmonologist',
  'breathing': 'pulmonologist',
};

/**
 * Determine the best specialty search phrase based on flagged conditions.
 */
function mapConditionToSpecialty(condition) {
  if (!condition) return 'general physician';

  const lowerCondition = condition.toLowerCase();

  for (const [keyword, specialty] of Object.entries(CONDITION_SPECIALTY_MAP)) {
    if (lowerCondition.includes(keyword)) {
      return specialty;
    }
  }

  return 'general physician';
}

/**
 * Generate a cache key from search parameters.
 */
function getCacheKey(query, lat, lng, city) {
  return `${query}|${lat || ''}|${lng || ''}|${city || ''}`.toLowerCase();
}

/**
 * Check cache for existing results.
 */
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * Store results in cache.
 */
function setCache(key, data) {
  // Clean up expired entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now > v.expiry) cache.delete(k);
    }
  }

  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Search for doctors/hospitals near a location using Google Places API (New) Text Search.
 *
 * @param {Object} params
 * @param {string} params.condition - The medical condition or finding
 * @param {string} [params.city] - City name or pincode
 * @param {number} [params.lat] - Latitude (from browser geolocation)
 * @param {number} [params.lng] - Longitude (from browser geolocation)
 * @returns {Array} Normalized list of places
 */
async function searchNearbyDoctors({ condition, city, lat, lng }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey.startsWith('AIza-your')) {
    throw new Error('Google Places API key is not configured. Please set GOOGLE_PLACES_API_KEY in your .env file.');
  }

  const specialty = mapConditionToSpecialty(condition);
  const locationText = city || 'nearby';
  const searchQuery = `${specialty} doctor ${locationText}`;

  // Check cache
  const cacheKey = getCacheKey(searchQuery, lat, lng, city);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Build the request for Google Places API (New) Text Search
    const requestBody = {
      textQuery: searchQuery,
      languageCode: 'en',
      maxResultCount: 10,
    };

    // Add location bias if coordinates are available
    if (lat && lng) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: 10000.0, // 10km radius
        },
      };
    }

    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.nationalPhoneNumber',
            'places.internationalPhoneNumber',
            'places.rating',
            'places.userRatingCount',
            'places.location',
            'places.googleMapsUri',
            'places.primaryType',
            'places.types',
          ].join(','),
        },
      }
    );

    const places = response.data.places || [];

    // Normalize the response
    const normalizedResults = places.map(place => ({
      placeId: place.id || '',
      name: place.displayName?.text || 'Unknown',
      specialty: specialty,
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
      rating: place.rating || 0,
      userRatingsTotal: place.userRatingCount || 0,
      location: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude,
      } : null,
      mapsUrl: place.googleMapsUri || '',
      type: place.primaryType || '',
    }));

    // Cache results
    setCache(cacheKey, normalizedResults);

    return normalizedResults;
  } catch (error) {
    console.error('Google Places API error:', error.response?.data || error.message);

    if (error.response?.status === 403) {
      throw new Error('Google Places API access denied. Please check that your API key is valid and the Places API is enabled in your Google Cloud Console.');
    }

    if (error.response?.status === 429) {
      throw new Error('Google Places API rate limit exceeded. Please try again in a moment.');
    }

    if (error.response?.status === 400) {
      throw new Error('Invalid search request. Please try a different location or search term.');
    }

    throw new Error('Failed to search for doctors/hospitals. Please try again.');
  }
}

module.exports = { searchNearbyDoctors, mapConditionToSpecialty };
