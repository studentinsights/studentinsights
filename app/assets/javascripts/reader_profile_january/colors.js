export const ORANGE = 'orange';
export const GREEN = 'rgb(147, 196, 125)';
export const PRESENT = '#ccc';
export const BLANK = '#f8f8f8';


export function pickBoxColor(maybeDataPoint, shouldHighlight) {
  if (maybeDataPoint === null || maybeDataPoint === undefined) return BLANK;
  if (shouldHighlight === true) return ORANGE;
  if (shouldHighlight === false) return GREEN;
  return PRESENT;
}

// export function pureBoxStyle(maybeShouldHighlight, style = {}) {
//   // no data
//   if (maybeShouldHighlight === null || maybeShouldHighlight === undefined) {
//     return createBoxStyle(BLANK, {
//       ...style,
//       color: muchDarkerColor(BLANK).alpha(0.5).hex()
//     });
//   }

//   // data, but how should we color it?
//   if (maybeShouldHighlight === true) {
//     return createBoxStyle(ORANGE, style);
//   }
//   if (maybeShouldHighlight === false) {
//     return createBoxStyle(GREEN, style);
//   }

//   // value, but no thresholds
//   return createBoxStyle(PRESENT, style);
// }

// export function boxStyle(dataPoint, gradeThen, style = {}) {
//   const maybeShouldHighlight = (dataPoint)
//     ? shouldHighlight(dataPoint, gradeThen)
//     : null;
//   return pureBoxStyle(maybeShouldHighlight, style);
// }


// function createBoxStyle(color, style = {}) {
//   return {
//     background: color,
//     outline: `1px solid ${chroma(color).darken().hex()}`,
//     color: muchDarkerColor(color).hex(),
//     ...style
//   };
// }

// function muchDarkerColor(color) {
//   return chroma(color).darken().darken();
// }