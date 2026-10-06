import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Current device position, or null when permission is denied or location fails. */
export async function getCurrentPoint(): Promise<GeoPoint | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({});
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * Forward geocoding of a typed address. Returns null when the address cannot be
 * resolved or the platform does not support geocoding (web).
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const trimmed = address.trim();
  if (trimmed.length === 0) return null;
  try {
    if (Platform.OS === 'android') {
      const current = await Location.getForegroundPermissionsAsync();
      if (current.status !== 'granted') {
        const requested = await Location.requestForegroundPermissionsAsync();
        if (requested.status !== 'granted') return null;
      }
    }
    const results = await Location.geocodeAsync(trimmed);
    const first = results[0];
    return first != null ? { latitude: first.latitude, longitude: first.longitude } : null;
  } catch {
    return null;
  }
}

/** Best-effort address label for a point; null when reverse geocoding is unavailable. */
export async function reverseGeocodeLabel(point: GeoPoint): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync(point);
    const first = results[0];
    if (first == null) return null;
    const parts = [
      [first.street, first.streetNumber].filter((part) => part != null && part.length > 0).join(' '),
      first.city,
      first.region,
      first.country,
    ].filter((part): part is string => part != null && part.length > 0);
    return parts.length > 0 ? parts.join(', ') : null;
  } catch {
    return null;
  }
}
