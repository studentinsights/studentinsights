$(function() {

  if ($('body').hasClass('students') || $('body').hasClass('homerooms')) {

    window.datepicker_options = {
      showOn: "button",
      buttonImage: $("#calendar-icon-path").data('path'),
      buttonImageOnly: true,
      buttonText: "Select date",
      dateFormat: 'yy-mm-dd'
    }

    $(".datepicker").datepicker(window.datepicker_options);

  }

});

