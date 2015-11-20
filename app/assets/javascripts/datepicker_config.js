$(function() {

  if ($('body').hasClass('students') || $('body').hasClass('homerooms')) {

    window.datepicker_options = {
      showOn: "button",
      buttonImage: $("#calendar-icon-path").data('path'),
      buttonImageOnly: true,
      buttonText: "Select date",
      dateFormat: 'yy-mm-dd',
      minDate: 0    // intervention end date cannot be earlier than today
    }

    $(".datepicker").datepicker(window.datepicker_options);

  }

});

