import type { Situation } from '@/types';

export type SituationSortMode = 'creation' | 'name' | 'distance';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two points in kilometres. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function hasCoords(situation: Situation): situation is Situation & GeoPoint {
  return situation.latitude != null && situation.longitude != null;
}

function byCreation(a: Situation, b: Situation): number {
  return a.createdAt - b.createdAt;
}

/**
 * Sorts situations by creation time (older first), name, or distance to the
 * reference point (closest first; without coordinates — or without a reference
 * point — the situations keep the creation order at the end).
 */
export function sortSituations(
  situations: Situation[],
  mode: SituationSortMode,
  reference: GeoPoint | null = null,
): Situation[] {
  const sorted = [...situations];
  if (mode === 'creation') return sorted.sort(byCreation);
  if (mode === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name) || byCreation(a, b));
  }
  if (reference == null) return sorted.sort(byCreation);
  const withCoords = sorted.filter(hasCoords);
  const withoutCoords = sorted.filter((situation) => !hasCoords(situation));
  return [
    ...withCoords.sort(
      (a, b) =>
        haversineKm(reference, a) - haversineKm(reference, b) || byCreation(a, b),
    ),
    ...withoutCoords.sort(byCreation),
  ];
}
