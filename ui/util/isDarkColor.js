// From https://stackoverflow.com/a/3943023
export default function isDarkColor(color) {
  const {r,g,b} = d3.rgb(color);
  return (r*0.299 + g*0.587 + b*0.114) <= 186;
}