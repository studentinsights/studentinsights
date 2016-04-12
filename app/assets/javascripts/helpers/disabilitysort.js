 (function(){
  Tablesort.extend('disability', function(item) {
     return (
      item.search(/(High|Moderate|Low < 2)/i) !== -1
      );
    }, function(a,b) {
    var disability = ['Low < 2','Moderate','High'];
    return disability.indexOf(b) - disability.indexOf(a);
  });
}());