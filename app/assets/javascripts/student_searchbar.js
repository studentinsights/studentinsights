$(function() {

  if ($('#student-searchbar').length > 0) {

    $.get({
      url: '/students/names',
      success: function (data) {
        $("#student-searchbar").autocomplete({
          source: data,
          select: function(e, ui) {
            window.location.pathname = '/students/' + ui.item.id;
          },
        });
      }
    })

  };

});
