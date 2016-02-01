$(function() {

  $("#student-searchbar").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: "/students/names",
        data: {
          q: request.term
        },
        success: function(data) {

          if (data.length === 0) {
            data = [{ label: 'No matching students', value: null }];
          };

          response(data);
        }
      });
    },
    focus: function(e, ui) {
      e.preventDefault();
      $(this).val(ui.item.label);
    },
    select: function(e, ui) {
      e.preventDefault();

      if (ui.item.label === 'No matching students') {
        $(this).val('');
      } else {
        window.location.pathname = '/students/' + ui.item.value;
      }

    },
  });

});
