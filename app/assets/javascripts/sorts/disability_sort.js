(function(){

  var disabilityLevels = ['None', 'Low < 2', 'Low >= 2', 'Moderate', 'High'];

  Tablesort.extend('disability', function(item) {
    return item.search(/(High|Moderate|Low < 2|Low >= 2|None)/i) !== -1;
  }, function(a,b) {
    return disabilityLevels.indexOf(b) - disabilityLevels.indexOf(a);
  });

}());
