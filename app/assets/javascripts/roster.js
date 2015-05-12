// Extend TableSort with MCAS performance levels
(function(){

  function clean_cell(i) {
    return $.trim(i);
  }

  var performance_levels = ["W", "NI", "P", "A"];

  compareLevel = function(a, b) {
    var clean_a = clean_cell(a);
    var clean_b = clean_cell(b);
    var a_index = performance_levels.indexOf(clean_a);
    var b_index = performance_levels.indexOf(clean_b);
    return a_index - b_index;
  };

  Tablesort.extend('mcas_sort', function(item) {
    cleaned_cell = clean_cell(item);
    performance_levels.indexOf(cleaned_cell) > 0;
  }, function(a, b) {
      return compareLevel(b, a);
  });

}());

$(function() {
  if ($('body').hasClass('students') && $('body').hasClass('index')) {

    // Initialize table sort on roster table
    var table = document.getElementById('roster-table')
    new Tablesort(table, { descending: true });

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
      content: $('<div class="warning-key"><div class="warning-header"><div class="warning-dot"></div><h6>Warning Indicators</h6></div><div class="warning-set"><p><strong>MCAS Growth:</strong> Less than 40 points</p><p><strong>STAR Percentile:</strong> Less than 40 points</p><p><strong>STAR Reading IRL:</strong> A year or more behind</p></div></div>'),
      position: 'bottom-right'
    });    
  }
});
