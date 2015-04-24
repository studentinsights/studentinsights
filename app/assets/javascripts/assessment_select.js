$(function(){
  $("#assessment-select").chosen().on('change', function(e, params) {
    if (params.deselected !== undefined) {
      var assessment = params.deselected
      $('.' + assessment).hide();
    } else if (params.selected !== undefined) {
      var assessment = params.selected
      $('.' + assessment).show();
    }
  });
});