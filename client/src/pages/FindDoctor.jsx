import { useState } from 'react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MapPin,
  Search,
  MapPinned,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function FindDoctor() {
  const [city, setCity] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = city.trim();
    if (!trimmed) {
      setError('Please enter a location to search.');
      return;
    }

    setLoading(true);
    setError('');
    setHospitals([]);
    setHasSearched(true);

    try {
      // URL-encode the user input; spaces become '+'
      const encodedLocation = encodeURIComponent(trimmed).replace(/%20/g, '+');
      const url = `https://nominatim.openstreetmap.org/search?q=hospital+${encodedLocation}&format=json&addressdetails=1&limit=10`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HealthAI-App/1.0 (college-project)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API returned status ${response.status}`);
      }

      const data = await response.json();

      // Normalize results
      const results = data.map((place) => ({
        id: place.place_id,
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        lat: place.lat,
        lon: place.lon,
      }));

      setHospitals(results);

      if (results.length === 0) {
        setError('No hospitals found for this location. Try a different search term.');
      }
    } catch (err) {
      console.error('Nominatim search error:', err);
      setError('Failed to search hospitals. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex justify-center px-4 pb-12">
      <div className="w-full max-w-3xl">

      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
            <MapPinned className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-3xl font-bold truncate" style={{ color: 'var(--color-ink)' }}>Find a Hospital</h1>
            <p className="mt-1 truncate" style={{ color: 'var(--color-ink-muted)' }}>Search for hospitals and clinics by location</p>
          </div>
        </div>

        {/* Search Controls */}
        <div className="mb-8 animate-slide-up relative bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
          <div className="p-4 space-y-4">
            {/* Location Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block ml-1" style={{ color: 'var(--color-ink-muted)' }}>
                Location
              </label>
              <div className="relative group flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 transition-colors" style={{ color: 'var(--color-ink-muted)' }} />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Vadodara, Alkapuri Vadodara..."
                  className="w-full py-2.5 rounded-full transition-all text-sm font-semibold outline-none focus:ring-1"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: 'var(--color-ink)', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-xs font-medium"
                   style={{ backgroundColor: 'var(--color-amber-subtle)', border: '1px solid var(--color-amber-wash)', color: 'var(--color-amber)' }}>
                {error}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !city.trim()}
            className="w-full py-3.5 font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 text-sm md:text-base tracking-wide"
            style={{ backgroundColor: 'var(--color-teal)', color: 'white', borderRadius: '0' }}
          >
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Hospitals
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div className="py-16 flex flex-col items-center">
            <LoadingSpinner size="lg" text="Searching hospitals..." />
          </div>
        )}

        {!loading && hospitals.length > 0 && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>Search Results</h2>
              <span className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-paper-warm)', color: 'var(--color-ink-muted)', border: '1px solid var(--color-border)' }}>
                {hospitals.length} Matches
              </span>
            </div>

            {hospitals.map((hospital, i) => (
              <div
                key={hospital.id || i}
                className="card p-5 md:p-6 transition-all group relative overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards', animationName: 'fade-in' }}
              >
                
                <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors"
                       style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
                    <Building2 className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1 transition-colors" style={{ color: 'var(--color-ink)' }}>{hospital.name}</h3>

                    <p className="text-sm flex items-start gap-2 leading-relaxed mt-2" style={{ color: 'var(--color-ink-muted)' }}>
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {hospital.address}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}#map=17/${hospital.lat}/${hospital.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ backgroundColor: 'var(--color-paper-warm)', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message (only after a search has been performed) */}
        {!loading && hasSearched && hospitals.length === 0 && !error && (
          <div className="py-16 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                 style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
              <Building2 className="w-8 h-8" style={{ color: 'var(--color-ink-muted)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>No hospitals found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>Try searching with a different location name</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <MedicalDisclaimer />
      </div>
      </div>
    </div>
  );
}
