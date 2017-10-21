import Highcharts from 'highcharts';

(function(root) {

  const ProfileChartSettings = {};

  ProfileChartSettings.base_options = {
    chart: {
      renderTo: 'chart',
      type: 'areaspline',
      spacingBottom: 0,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      marginTop: 10
    },
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    legend: {
      enabled: false,
      layout: 'horizontal',
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        font: '12px "Open Sans", sans-serif !important;',
        color: '#555555'
      }
    },
    xAxis: {
      categories: [],
      dateTimeLabelFormats: {}
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
  };

  ProfileChartSettings.star_chart_base_options = {
    chart: {
      renderTo: 'chart',
      type: 'areaspline',
      spacingBottom: 0,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      marginTop: 10
    },
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    legend: {
      enabled: false,
      layout: 'horizontal',
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        font: '12px "Open Sans", sans-serif !important;',
        color: '#555555'
      }
    },
    xAxis: {
      categories: [],
      dateTimeLabelFormats: {}
    },
    tooltip: {
      formatter: function () {
        const date = Highcharts.dateFormat('%A, %b %e, %Y', new Date(this.x));
        const percentileRank = this.y;
        const gradeLevelEquivalent = this.points[0].point.gradeLevelEquivalent;

        if ( gradeLevelEquivalent === undefined ) {
          return date + '<br>Percentile Rank:<b> ' + percentileRank;
        } else {
          return date + '<br>Percentile Rank:<b> ' + percentileRank +
                 '</b><br>Grade Level Equivalent: <b>' + gradeLevelEquivalent;
        }
      },
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
  };

  ProfileChartSettings.x_axis_datetime = {
    type: 'datetime',
    dateTimeLabelFormats: {
      day: '%b %e %Y',
      week: '%b %e %Y',
      year: '%b %e %Y'
    }
  };

  ProfileChartSettings.x_axis_schoolyears = {
    type: 'linear',
    categories: [],
    dateTimeLabelFormats: {}
  };

  ProfileChartSettings.default_yaxis = {
    allowDecimals: false,
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    plotLines: [],
    min: undefined,
    max: undefined
  };

  ProfileChartSettings.mcas_level_bands = [{
    color: '#E7EBED',
    from: 200,
    to: 218,
    label: {
      text: 'Warning',
      align: 'left',
      style: {
        color: '#999999'
      }
    }
  }, {
    color: '#F6F7F8',
    from: 220,
    to: 238,
    label: {
      text: 'Needs Improvement',
      align: 'left',
      style: {
        color: '#999999'
      }
    }
  }, {
    color: '#E7EBED',
    from: 240,
    to: 258,
    label: {
      text: 'Proficient',
      align: 'left',
      style: {
        color: '#999999'
      }
    }
  }, {
    color: '#F6F7F8',
    from: 260,
    to: 280,
    label: {
      text: 'Advanced',
      align: 'left',
      style: {
        color: '#999999'
      }
    }
  }];

  ProfileChartSettings.default_mcas_score_yaxis = {
    allowDecimals: false,
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    plotLines: [],
    min: 200,
    max: 280
  };

  ProfileChartSettings.percentile_yaxis =  {
    allowDecimals: false,
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    plotLines: [],
    min: 0,
    max: 100
  };

  ProfileChartSettings.benchmark_plotline = [{
    color: '#B90504',
    width: 1,
    zIndex: 3,
    value: 50,
    label: {
      text: 'Average baseline: 50th percentile',
      align: 'center',
      style: {
        color: '#999999'
      }
    }
  }, {
    color: '#B90504',
    width: 1,
    zIndex: 3,
    value: 40,
    label: {
      text: 'Warning: Less than 40th percentile',
      align: 'center',
      style: {
        color: '#999999'
      }
    }
  }];

  root.ProfileChartSettings = ProfileChartSettings;

})(window);
