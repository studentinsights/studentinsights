$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {

    $('#homeroom-select').bind('change', function() {
      window.location.pathname = '/homerooms/' + $(this).val();
    });

  }

});
