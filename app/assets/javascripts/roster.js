$(function() {
  if ($('body').hasClass('students') && $('body').hasClass('index')) {

    // Initialize table sort on roster table
    var table = document.getElementById('roster-table')
    new Tablesort(table, { descending: false });

    // Initialize table sort on roster table
    $('#homeroom-select').bind('change', function() {
      window.location.pathname = '/homerooms/' + $(this).val() + '/students'
    });

    // Show/hide column groups using Chosen plugin
    $(".demographics").hide();
    $("#column-group-select").chosen().on('change', function(e, params) {
      if (params.deselected !== undefined) {
        var assessment = params.deselected
        $('.' + assessment).hide();
      } else if (params.selected !== undefined) {
        var assessment = params.selected
        $('.' + assessment).show();
      }
    });

    // Roster tooltip

    // Risk level tooltip
    var roster_rooltip_template = $('#roster-tooltip-template').html()
    var rendered = Mustache.render(roster_rooltip_template)

    $('#my-tooltip').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    })

    // Turn table rows into links to student profiles
    $('tbody tr').click(function () {
      location.href = $(this).find('td a').attr('href');
    });
  }
});
