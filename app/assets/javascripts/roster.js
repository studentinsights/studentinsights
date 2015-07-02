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
    $('#my-tooltip').tooltipster({
      content: $('<div class="warning-key"><div class="warning-header"><div class="warning-dot"></div><h6>Warning Indicators</h6></div><div class="warning-set"><p><strong>MCAS Performance:</strong> Warning</p><p><strong>MCAS Growth:</strong> Less than 40 points</p><p><strong>STAR Percentile:</strong> Less than 40 points</p><p><strong>STAR Reading IRL:</strong> A year or more behind</p></div></div>'),
      position: 'bottom-right'
    });
    // Table interactions

    // Turn table rows into links to student profiles
    $('tbody tr').click(function () {
      location.href = $(this).find('td a').attr('href');
    });
  }
});
