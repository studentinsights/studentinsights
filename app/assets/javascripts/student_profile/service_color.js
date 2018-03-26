export default function serviceColor(serviceTypeId) {
  const Colors = {
    purple: '#e8e9fc',
    orange: '#ffe7d6',
    green: '#e8fce8',
    gray: '#eee'
  };

  const map = {
    // Somerville
    507: Colors.orange,
    502: Colors.green,
    503: Colors.green,
    504: Colors.green,
    505: Colors.gray,
    506: Colors.gray,
    508: Colors.purple,

    // New Bedford
    1: Colors.green,
    2: Colors.green,
    3: Colors.green,
    4: Colors.green,
    5: Colors.green,
    6: Colors.gray,
    7: Colors.orange,
    8: Colors.orange,
    9: Colors.gray,
  };

  return map[serviceTypeId] || null;
}
