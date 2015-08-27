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
            name: 'Risk level',
            data: [6, 2, 2, 1]
        }, {
            name: 'Interventions',
            data: [3, 2, 0, 0]
        }, ]

    var behavior_series = [{
            name: 'Behavior incidents',
            data: [2, 1, 4, 1, 3]
        },]

    var mcas_series = [{
            name: 'MCAS Math',
            data: [65, 54, 31, 67, 43]
        }, {
            name: 'MCAS English',
            data: [54, 32, 48, 83, 92]
    }]

    var star_series = [{
            name: 'STAR Math',
            data: [33, 39, 52, 67, 59, 29, 49, 29, 90]
        }, {
            name: 'STAR English',
            data: [49, 29, 90, 83, 73, 59, 33, 39, 52]
    }]

    var options = {
    chart: {
      renderTo: 'chart',
            type: 'column'
        },
        title: {
        text: '',
        style: {
            display: 'none'
        }
    },
    subtitle: {
        text: '',
      style: {
            display: 'none'
        }
    },
        legend: {
            layout: 'horizontal',
            align: 'right',
            verticalAlign: 'top',
          itemStyle: {
            font: '12px "Open Sans", sans-serif !important;',
            color: '#555555'

          }
        },
        xAxis: {
            categories: [
                'Risk level 3',
                'Risk level 2',
                'Risk level 1',
                'Risk level 0',
            ],
        },
        yAxis: {
            title: {
                text: '',
          style: {
              display: 'none'
          }
            },
            plotLines: [
              {
                  color: '#B90504',
                  width: 1,
                  zIndex: 3,
                  label: {
                      text: '',
                      align: 'center',
                      style: {
                          color: '#999999'
                      }
                  }
              }
          ],
        },
        tooltip: {
            shared: true
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0
            }
        }
    }

    options.series = attendance_series
    var chart = new Highcharts.Chart(options);

  $("#chart-type").on('change', function(){
      var selVal = $("#chart-type").val();
      if(selVal == "attendance" || selVal == '') {
          options.series = attendance_series
          options.xAxis.categories = ["0", "1", "2", "3"]
      }
      else if(selVal == "behavior") {
          options.series = behavior_series
          options.xAxis.categories = ["2010 - 11", "2011 - 12", "2012 - 13", "2013 - 14", "2014 - 15"]
      }
      else if(selVal == "mcas-growth") {
          options.series = mcas_series
          options.yAxis.plotLines[0].label.text = "MCAS Growth warning: Less than 40 points"
          options.yAxis.plotLines[0].value = "40"
          options.xAxis.categories = ["2010 - 11", "2011 - 12", "2013 - 14", "2014 - 15"]
      }
      else {
          options.series = star_series
          options.yAxis.plotLines[0].label.text = "STAR Percentile warning: Less than 40 points"
          options.yAxis.plotLines[0].value = "40"
          options.xAxis.categories = ["Sept. 2010 - 11", "Jan. 2010 - 11", "May 2011 - 12", "Sept. 2011 - 12", "Jan. 2011 - 12", "May 2011 - 12", "Sept. 2012 - 13", "Jan. 2012 - 13", "May 2012 - 13", "Sept. 2013 - 14", "Jan. 2013 - 14", "May 2013 - 14"]
      }
      var chart = new Highcharts.Chart(options);
  });
  }
});
