$(function() {

  $("#student-searchbar").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: "/students/names",
        data: {
          q: request.term
        },
        success: function(data) {
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
      window.location.pathname = '/students/' + ui.item.value;
    },
  });

});
