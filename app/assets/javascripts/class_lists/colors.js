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