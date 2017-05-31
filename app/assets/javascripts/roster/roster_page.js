$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {

    // Initialize table sort on roster table
    // $('#homeroom-select').bind('change', function() {
    //   window.location.pathname = '/homerooms/' + $(this).val();
    // });

    // updateColumns();

    // const updateCookies = function updateCookies () {
    //   Cookies.set("columns_selected", columns_selected);
    // };

    // $.each(roster_columns, function(key, column){
    //   var newColumnTemplate = columnTemplate.clone(),
    //     isselected = columns_selected.indexOf(key) !== -1;
    //   newColumnTemplate
    //     .find("input")
    //       .attr("name", key)
    //       .attr("checked", isselected)
    //       .on("click", function(event) {
    //         event.stopPropagation();
    //         updateColumns();
    //       }).on("change", updateCookies)
    //     .end()
    //     .find("label")
    //       .text(column)
    //     .end()
    //     .appendTo("#column-listing");
    // });

    // // Turn table rows into links to student profiles
    // $('tbody tr').click(function () {
    //   location.href = $(this).attr('href');
    // });

    // // Replace blank cells with em dashes
    // $('#roster-table tbody td').each(function() {
    //   var content = $.trim($(this).html());
    //   if (content.length === 0) {
    //     $(this).html('—');
    //   }
    // });

  }

});
