// Extend TableSort with program assigned levels
(function(){

  var program_levels = ["Reg Ed", "2Way English", "2Way Spanish", "Sp Ed"];

  compareProgramLevel = function(a, b) {
    var clean_a = $.trim(a);
    var clean_b = $.trim(b);
    var a_index = program_levels.indexOf(clean_a);
    var b_index = program_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('prog_assign_sort', function(item) {
    cleaned_cell = $.trim(item);
    program_levels.indexOf(cleaned_cell) > 0;
  }, function(a, b) {
      return compareProgramLevel(b, a);
  });

}());
