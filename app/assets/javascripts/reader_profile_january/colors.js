export const ORANGE = 'orange';
export const GREEN = 'rgb(147, 196, 125)';
export const PRESENT = '#ccc';
export const BLANK = '#f8f8f8';


// Based on whethere there's a data point and it should be highlighted, pick the color.
export function pickBoxColor(maybeDataPoint, shouldHighlight) {
  if (maybeDataPoint === null || maybeDataPoint === undefined) return BLANK;
  if (shouldHighlight === true) return ORANGE;
  if (shouldHighlight === false) return GREEN;
  return PRESENT;
}
