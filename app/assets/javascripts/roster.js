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

    var risk_level_null_datum = {
      name: 'Risk level N/A',
      data: [chartData.data('null')],
      color: '#999'
    };

    var risk_level_zero_datum = {
      name: 'Risk level 0',
      data: [chartData.data('0')],
      color: '#BBD86B'
    };

    var risk_level_one_datum = {
      name: 'Risk level 1',
      data: [chartData.data('1')],
      color: '#62C186'
    };

    var risk_level_two_datum = {
      name: 'Risk level 2',
      data: [chartData.data('2')],
      color: '#FFCB08'
    };

    var risk_level_three_datum = {
      name: 'Risk level 3',
      data: [chartData.data('3')],
      color: '#F15A3D'
    };

    var datums = [ risk_level_null_datum, risk_level_zero_datum,
      risk_level_one_datum, risk_level_two_datum, risk_level_three_datum ];
    var risk_series = [];

    for(i = 0; i < datums.length; i++) {
      var datum = datums[i];
      if (datum.data[0] > 0) {
        risk_series.push(datum);
      }
    }

    var risk_levels_with_students = risk_series.filter(function(series) {
      return series.data[0] > 0
    });

    risk_levels_with_students[0].borderRadiusTopLeft = 8;
    risk_levels_with_students[0].borderRadiusTopRight = 8;
    risk_levels_with_students[risk_levels_with_students.length - 1].borderRadiusBottomRight = 8;
    risk_levels_with_students[risk_levels_with_students.length - 1].borderRadiusBottomLeft = 8;

    var options = RosterChartSettings;
    options.series = risk_series;
    var chart = new Highcharts.Chart(options);
  }
});
