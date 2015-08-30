$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {

    // Initialize table sort on roster table
    var table = document.getElementById('roster-table');
    new Tablesort(table, { descending: false });

    // Initialize table sort on roster table
    $('#homeroom-select').bind('change', function() {
      window.location.pathname = '/homerooms/' + $(this).val();
    });

    function updateColumns () {
      for (i = 0; i < roster_columns.length; i++) {
        var column = roster_columns[i];
        if (columns_selected.indexOf(column) === -1) {
          $('.' + column).hide();
        } else {
          $('.' + column).show();
        }
      }
    }

    function updateCookies () {
      Cookies.set("columns_selected", columns_selected);
    }

    // Show/hide column groups
    var roster_columns = [
      'attendance',
      'discipline',
      'language',
      'star_math',
      'star_reading',
      'program',
      'free-reduced',
      'access',
      'dibels',
      'name',
      'risk',
      'sped',
      'mcas_math',
      'mcas_ela'
    ];

    var columns_selected = Cookies.getJSON("columns_selected");
    updateColumns();

    $("#column-group-select").chosen({width: "110%"}).on('change', function(e, params) {
      if (params.deselected !== undefined) {
        var assessment = params.deselected;
        var index = columns_selected.indexOf(assessment)
        columns_selected.splice(index, 1);
        updateCookies();
        updateColumns();
      } else if (params.selected !== undefined) {
        var assessment = params.selected;
        columns_selected.push(assessment)
        updateCookies();
        updateColumns();
      }
    });

    // Risk level tooltip for overall roster table

    var roster_rooltip_template = $('#roster-tooltip-template').html();
    var rendered = Mustache.render(roster_rooltip_template);

    $('#roster-tooltip').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    });

    // Tooltips for individual student risk levels

    function getRiskLevelToolTip (studentId) {
      var tooltip = $(".risk-level-tooltip[data-student-id='" + studentId + "']").html();
      var mustache_rendered = Mustache.render(tooltip);
      return mustache_rendered;
    }

    $.each($('.risk-tooltip-circle'), function() {
      $this = $(this)
      var student_id = parseInt($this.data('student-id'))
      var tooltip = getRiskLevelToolTip(student_id)
      $this.tooltipster({
        content: tooltip,
        position: 'bottom',
        contentAsHTML: true
      });
    });

    // Turn table rows into links to student profiles
    $('tbody td').click(function () {
      location.href = $(this).attr('href');
    });
  }
});

$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {
    var chartData = $('#chart-data');
    RosterChart.fromChartData(chartData).render();
  }
});
