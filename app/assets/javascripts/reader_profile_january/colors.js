import chroma from 'chroma-js';
import {shouldHighlight} from './dibelsParsing';


export const ORANGE = 'orange';
export const GREEN = 'rgb(147, 196, 125)';
export const PRESENT = '#ccc';
export const BLANK = '#f8f8f8';



export function boxStyle(dataPoint, gradeThen, style = {}) {
  // no data
  if (!dataPoint) {
    return createBoxStyle(BLANK, {
      ...style,
      color: muchDarkerColor(BLANK).alpha(0.5).hex()
    });
  }

  // data, but how should we color it?
  const isOrange = shouldHighlight(dataPoint, gradeThen);
  if (isOrange === true) {
    return createBoxStyle(ORANGE, style);
  }
  if (isOrange === false) {
    return createBoxStyle(GREEN, style);
  }

  // value, but no thresholds
  return createBoxStyle(PRESENT, style);
}


function createBoxStyle(color, style = {}) {
  return {
    background: color,
    outline: `1px solid ${chroma(color).darken().hex()}`,
    color: muchDarkerColor(color).hex(),
    ...style
  };
}

function muchDarkerColor(color) {
  return chroma(color).darken().darken();
}