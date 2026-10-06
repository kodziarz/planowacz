import type { GeoPoint } from './location';

/**
 * Address lookups powered by Photon (https://photon.komoot.io), a free geocoding
 * service that needs no API key. Unlike the platform geocoder it also works on
 * the web and does not require the location permission.
 */

const ENDPOINT = 'https://photon.komoot.io/api/';
const TIMEOUT_MS = 6000;
/** Photon only renders results in these languages; anything else uses its default. */
const SUPPORTED_LANGUAGES = ['de', 'en', 'fr'];

/** Minimum number of characters that must be typed before the API is queried. */
export const MIN_QUERY_LENGTH = 3;
/** Number of suggestions shown while typing by default. */
export const MAX_SUGGESTIONS = 5;

export interface AddressSuggestion {
  /** Address label ready to display, e.g. "Empire State Building, 5th Avenue 350, New York, United States". */
  label: string;
  point: GeoPoint;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toPoint(coordinates: unknown): GeoPoint | null {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [longitude, latitude] = coordinates;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function formatLabel(properties: Record<string, unknown>): string | null {
  const name = text(properties.name);
  const street = text(properties.street);
  const houseNumber = text(properties.housenumber);
  const streetLine = [street, houseNumber].filter((part) => part.length > 0).join(' ');
  const nameCoversStreet =
    streetLine.length === 0 ||
    name.length === 0 ||
    name.toLowerCase().includes(streetLine.toLowerCase());
  let head = streetLine;
  if (name.length > 0) head = nameCoversStreet ? name : `${name}, ${streetLine}`;
  const city = text(properties.city);
  const district = text(properties.district);
  const locality = city.length > 0 ? city : district;
  const country = text(properties.country);
  const parts = [head, locality, country].filter((part) => part.length > 0);
  return parts.length > 0 ? parts.join(', ') : null;
}

async function queryPhoton(
  query: string,
  options: { limit: number; lang?: string },
): Promise<Record<string, unknown>[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];
  const lang =
    options.lang != null && SUPPORTED_LANGUAGES.includes(options.lang) ? options.lang : undefined;
  const search =
    `q=${encodeURIComponent(trimmed)}&limit=${options.limit}` +
    (lang != null ? `&lang=${encodeURIComponent(lang)}` : '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${ENDPOINT}?${search}`, { signal: controller.signal });
    if (!response.ok) return [];
    const json: unknown = await response.json();
    if (!isRecord(json) || !Array.isArray(json.features)) return [];
    return json.features.filter(isRecord);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Few addresses matching the typed text, most relevant first. Returns an empty
 * list for short queries, network failures and malformed responses.
 */
export async function suggestAddresses(
  query: string,
  options: { lang?: string; limit?: number } = {},
): Promise<AddressSuggestion[]> {
  const features = await queryPhoton(query, {
    limit: options.limit ?? MAX_SUGGESTIONS,
    lang: options.lang,
  });
  const suggestions: AddressSuggestion[] = [];
  for (const feature of features) {
    const properties = isRecord(feature.properties) ? feature.properties : {};
    const geometry = isRecord(feature.geometry) ? feature.geometry : {};
    const point = toPoint(geometry.coordinates);
    if (point == null) continue;
    const label = formatLabel(properties);
    if (label == null) continue;
    suggestions.push({ label, point });
  }
  return suggestions;
}

/** Coordinates of the best matching address, or null when nothing is found. */
export async function resolveAddress(address: string): Promise<GeoPoint | null> {
  const features = await queryPhoton(address, { limit: 1 });
  const geometry = features.length > 0 && isRecord(features[0].geometry) ? features[0].geometry : {};
  return toPoint(geometry.coordinates);
}
