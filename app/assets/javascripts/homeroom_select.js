$(function() {
  $('#homeroom-select').bind('change', function() { 
    window.location.pathname = '/homerooms/' + $(this).val() + '/students'
  });
});
