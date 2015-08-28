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
    console.log(columns_selected);
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

    var attendance_series = [{
            name: 'Risk level 0',
            data: [2]
        }, {
            name: 'Risk level 1',
            data: [2]
        }, {
            name: 'Risk level 2',
            data: [5]
        }, {
            name: 'Risk level 3',
            data: [6]
        },]

    var options = {
      chart: {
        spacingBottom: 0,
        spacingTop: 0,
        spacingLeft: 0,
        spacingRight: 0,
        marginBottom: 0,
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        renderTo: 'chart',
              type: 'bar'
          },
          title: {
          text: '',
          style: {
              display: 'none'
          },
      },
      subtitle: {
          text: '',
            style: {
              display: 'none'
            }
          },
      legend: {
        reversed: true,
        layout: 'horizontal',
        align: 'right',
        verticalAlign: 'top',
        itemStyle: {
          font: '12px "Open Sans", sans-serif !important;',
          color: '#555555'
        }
      },
      xAxis: {
          categories: ['Risk levels'],
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          gridLineColor: 'transparent',
          labels: {
            enabled: false
          },
          minorTickLength: 0,
          tickLength: 0
      },
      yAxis: {
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          gridLineColor: 'transparent',
          labels: {
            enabled: false
          },
          minorTickLength: 0,
          tickLength: 0,
          style: {
            display: 'none'
          },
          categories: [''],
          title: {
              text: null
          },
          labels: {
           enabled:false
          }
      },
      credits: {
          enabled: false
      },
      plotOptions: {
          bar: {
              stacking: 'percent'
          }
      },
      tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
          shared: true,
          followPointer: true,
          headerFormat: ''
      },
      colors: ['#BBD86B', '#62C186', '#FFCB08', '#F15A3D']
    }

    options.series = attendance_series
    var chart = new Highcharts.Chart(options);

  $("#chart-type").on('change', function(){
      var selVal = $("#chart-type").val();
      if(selVal == "attendance" || selVal == '') {
          options.series = attendance_series
          options.xAxis.categories = [""]
      }
      var chart = new Highcharts.Chart(options);
  });
  }
});
