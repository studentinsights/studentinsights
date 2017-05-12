(function(){
  var Tablesort = window.Tablesort;

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
    return item.match(/^-?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/);
  }, function(a, b) {
    return compareNumberReverse(cleanNumber(a), cleanNumber(b));
  });

}());
