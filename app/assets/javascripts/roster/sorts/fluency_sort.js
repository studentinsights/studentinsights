// Extend TableSort with Fluency levels
(function(){

  function clean_cell(i) {
    return $.trim(i);
  }

  var fluency_levels = ["FLEP-Transitioning", "FLEP", "Fluent"];

  compareFluencyLevel = function(a, b) {
    var clean_a = clean_cell(a);
    var clean_b = clean_cell(b);
    var a_index = fluency_levels.indexOf(clean_a);
    var b_index = fluency_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('fluency_sort', function(item) {
    cleaned_cell = clean_cell(item);
    fluency_levels.indexOf(cleaned_cell) > 0;
  }, function(a, b) {
      return compareFluencyLevel(b, a);
  });

}());
