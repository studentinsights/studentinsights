import chroma from 'chroma-js';

// Theme-y colors
export const selection = 'rgb(255, 204, 138)';
export const steelBlue = 'rgb(137, 175, 202)';


// For encoding gender as a color
export const male = 'rgba(41, 159, 197, 0.5)';
export const female = 'rgba(224, 99, 120, 0.5)';
export const nonBinary = 'rgba(81, 185, 86, 0.5)';
export function genderColor(gender) {
  if (gender === 'M') return male;
  if (gender === 'F') return female;
  return nonBinary;
}

// For DIBELS primarily
export const high = chroma('green').alpha(0.5).css();
export const medium = chroma('orange').alpha(0.5).css();
export const low = chroma('red').alpha(0.5).css();