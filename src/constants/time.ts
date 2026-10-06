/** The minimal time step for the UI is 5 minutes. */
export const TIME_STEP_MINUTES = 5;
export const MIN_TIME_MINUTES = 5;
export const MAX_TIME_MINUTES = 24 * 60;

/** A single time-spent entry: 15 minutes … 3 hours, in 15-minute steps. */
export const SPENT_MIN_MINUTES = 15;
export const SPENT_MAX_MINUTES = 3 * 60;
export const SPENT_STEP_MINUTES = 15;

export function roundToTimeStep(minutes: number): number {
  const rounded = Math.round(minutes / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
  return Math.max(MIN_TIME_MINUTES, rounded);
}

export function clampTimeStep(minutes: number, min: number, max: number): number {
  const rounded = roundToTimeStep(minutes);
  return Math.min(Math.max(rounded, min), max);
}

export function isValidTimeStep(minutes: number): boolean {
  return minutes >= MIN_TIME_MINUTES && minutes % TIME_STEP_MINUTES === 0;
}
