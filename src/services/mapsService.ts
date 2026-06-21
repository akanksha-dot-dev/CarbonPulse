/**
 * EcoTrack Google Maps Service
 *
 * Wraps the Google Maps Distance Matrix API to compute commute distances.
 * Falls back to manual distance input when API key is absent or request fails.
 */

export interface DistanceResult {
  distanceKm: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
  source: 'api' | 'manual_fallback';
}

// ─── API Availability ─────────────────────────────────────────────────────────

function isMapsConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'undefined' &&
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.length > 10,
  );
}

// ─── Compute Distance via Distance Matrix API ─────────────────────────────────

/**
 * Compute driving distance between two addresses using Google Distance Matrix API.
 * Returns null and falls back to manual entry if API is unavailable.
 *
 * @param origin - Origin address string
 * @param destination - Destination address string
 */
export async function computeDistance(
  origin: string,
  destination: string,
): Promise<DistanceResult | null> {
  if (!isMapsConfigured()) {
    console.info('[EcoTrack] Maps API key not configured — using manual distance mode.');
    return null;
  }

  if (typeof window === 'undefined') return null;

  try {
    // Load the Maps JS API if not already loaded
    await loadMapsAPI();

    const service = new google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (
            status !== 'OK' ||
            !response ||
            response.rows[0]?.elements[0]?.status !== 'OK'
          ) {
            reject(new Error(`Distance Matrix failed: ${status}`));
            return;
          }

          const element = response.rows[0].elements[0];
          resolve({
            distanceKm: element.distance.value / 1000,
            distanceText: element.distance.text,
            durationMinutes: element.duration.value / 60,
            durationText: element.duration.text,
            source: 'api',
          });
        },
      );
    });
  } catch (err) {
    console.warn('[EcoTrack] Distance Matrix request failed:', err);
    return null;
  }
}

// ─── Maps API Loader ──────────────────────────────────────────────────────────

let mapsLoadPromise: Promise<void> | null = null;

function loadMapsAPI(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

// ─── Address Autocomplete ─────────────────────────────────────────────────────

/**
 * Attach Google Places Autocomplete to an input element.
 * Returns a cleanup function.
 */
export async function attachAddressAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected: (address: string) => void,
): Promise<() => void> {
  if (!isMapsConfigured()) return () => {};

  try {
    await loadMapsAPI();
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ['address'],
      fields: ['formatted_address'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onPlaceSelected(place.formatted_address);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  } catch {
    return () => {};
  }
}

// ─── Carbon Comparison by Route Mode ─────────────────────────────────────────

/**
 * Given a distance in km, return emissions for each transport mode.
 * Useful for the "Route Optimizer" feature.
 */
export function compareRouteModeEmissions(distanceKm: number): {
  mode: string;
  label: string;
  emoji: string;
  dailyKgCO2e: number;
  annualKgCO2e: number;
}[] {
  const factors = {
    ev: { label: 'Electric Vehicle', emoji: '⚡', factor: 0.053 },
    ice: { label: 'Petrol Car', emoji: '🚗', factor: 0.192 },
    hybrid: { label: 'Hybrid Car', emoji: '🔋', factor: 0.108 },
    transit: { label: 'Public Transit', emoji: '🚇', factor: 0.089 },
    bicycle: { label: 'Cycling/Walking', emoji: '🚲', factor: 0 },
  };

  return Object.entries(factors).map(([mode, { label, emoji, factor }]) => {
    const dailyKgCO2e = distanceKm * 2 * factor; // round trip
    return {
      mode,
      label,
      emoji,
      dailyKgCO2e: parseFloat(dailyKgCO2e.toFixed(3)),
      annualKgCO2e: parseFloat((dailyKgCO2e * 5 * 52).toFixed(1)), // 5 days/week, 52 weeks
    };
  });
}
