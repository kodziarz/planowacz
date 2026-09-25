/**
 * Colorblind-safe palette based on Okabe & Ito's eight-color set,
 * plus two grays for neutral categories.
 * https://jfly.uni-koeln.de/color/
 */
export const CATEGORY_PALETTE = [
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#F0E442', // yellow
  '#0072B2', // blue
  '#D55E00', // vermillion
  '#CC79A7', // reddish purple
  '#000000', // black
  '#999999', // gray
  '#4D4D4D', // dark gray
] as const;

export const DEFAULT_CATEGORY_COLOR = CATEGORY_PALETTE[0];
