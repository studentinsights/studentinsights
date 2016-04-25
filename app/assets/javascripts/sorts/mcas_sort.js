(function(){

  var performance_levels = ["W", "NI", "P", "A"];

  compareMcasLevel = function(a, b) {
    var clean_a = $.trim(a);
    var clean_b = $.trim(b);
    var a_index = performance_levels.indexOf(clean_a);
    var b_index = performance_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('mcas_sort', function(item) {
    cleaned_cell = $.trim(item);
    performance_levels.indexOf(cleaned_cell) > 0;
  }, function(a, b) {
      return compareMcasLevel(b, a);
  });

}());
