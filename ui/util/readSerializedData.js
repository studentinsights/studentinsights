// This assumes data is was on the page by Rails, and reads it in.
export default function readSerializedData() {
  return $('#serialized-data').data();
}