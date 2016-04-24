(function(){
  var cleanNumber = function(i) {
      var n = parseFloat(i.replace(/[^\-?0-9.]/g, ''));

      return isNaN(n) ? null : n;
  },

  compareNumberReverse = function(a, b) {
      // Treat null as always greater
      if (a === null) return 1;
      if (b === null) return -1;

      return a - b;
  };

  Tablesort.extend('reverse_number', function(item) {
    return item.match(/^-?[£\x24Û¢´€]?\d+\s*([,\.]\d{0,2})/) || // Prefixed currency
      item.match(/^-?\d+\s*([,\.]\d{0,2})?[£\x24Û¢´€]/) || // Suffixed currency
      item.match(/^-?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/); // Number
  }, function(a, b) {
      return compareNumberReverse(cleanNumber(a), cleanNumber(b));
  });
}());
