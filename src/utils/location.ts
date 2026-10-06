import { Platform } from 'react-native';
import * as Location from 'expo-location';

import { resolveAddress } from './address-lookup';

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
 * Forward geocoding of a typed address. The online Photon lookup runs first so
 * that addresses resolve on every platform, including the web; the platform
 * geocoder is only a fallback. Returns null when nothing can resolve it.
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const trimmed = address.trim();
  if (trimmed.length === 0) return null;
  const online = await resolveAddress(trimmed);
  if (online != null) return online;
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
