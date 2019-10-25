const Colors = {
  gray: '#eee'
};

// These used to be colored differently, keeping the abstraction even though
// they aren't in current designs.
export default function serviceColor(serviceTypeId) {
  return Colors.gray;
}
