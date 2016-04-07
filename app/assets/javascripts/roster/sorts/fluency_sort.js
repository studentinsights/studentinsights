// Extend TableSort with Fluency levels
(function(){

  var fluency_levels = ["FLEP-Transitioning", "FLEP", "Fluent"];

  compareFluencyLevel = function(a, b) {
    var clean_a = $.trim(a);
    var clean_b = $.trim(b);
    var a_index = fluency_levels.indexOf(clean_a);
    var b_index = fluency_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('fluency_sort', function(item) {
    return (
      fluency_levels.indexOf($.trim(item)) > 0
    );
  }, function(a, b) {
      return compareFluencyLevel(b, a);
  });

}());
