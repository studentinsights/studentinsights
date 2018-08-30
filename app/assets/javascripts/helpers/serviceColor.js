export default function serviceColor(serviceTypeId) {
  const Colors = {
    purple: '#e8e9fc',
    orange: '#ffe7d6',
    green: '#e8fce8',
    gray: '#eee'
  };

  const map = {
    507: Colors.gray,
    502: Colors.gray,
    503: Colors.gray,
    504: Colors.gray,
    505: Colors.gray,
    506: Colors.gray,
    508: Colors.gray
  };

  return map[serviceTypeId] || Colors.gray;
}
