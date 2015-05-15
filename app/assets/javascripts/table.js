// Table interactions

$(function ()
      {
      // Assign a click handler that grabs the URL 
      // from the first cell and redirects the user.
      $('tbody tr').click(function ()
      {
        location.href = $(this).find('td a').attr('href');
      });
});