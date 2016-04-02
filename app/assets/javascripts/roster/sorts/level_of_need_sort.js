// Extend TableSort with levels of need
(function(){

  function clean_cell(i) {
    return $.trim(i);
  }

  var need_levels = ["High", "Moderate", "Low >= 2", "Low < 2", "—"];

  compareNeedLevel = function(a, b) {
    var clean_a = clean_cell(a);
    var clean_b = clean_cell(b);
    var a_index = need_levels.indexOf(clean_a);
    var b_index = need_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('need_sort', function(item) {
    cleaned_cell = clean_cell(item);
    need_levels.indexOf(cleaned_cell) > 0;
  }, function(a, b) {
      return compareNeedLevel(b, a);
  });

}());
