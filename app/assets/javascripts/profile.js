$(function() {

  if ($('body').hasClass('students') && $('body').hasClass('show')) {

    $('#chart').highcharts({
		chart: {
            type: 'areaspline'
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
                '2010 - 11',
                '2011 - 12',
                '2012 - 13',
                '2013 - 14',
                '2014 - 15',
            ],
        },
        yAxis: {
            title: {
                text: '',
    			style: {
        			display: 'none'
    			}
            },
            plotLines: [{
                value: 2,
                color: '#B90504',
                width: 1,
                zIndex: 3,
                label: {
                    text: 'MCAS Growth: Less than 40 points',
                    align: 'center',
                    style: {
                        color: '#999999'
                    }
                }
            }],
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
        },
        series: [{
            name: 'Absences',
            data: [3, 4, 3, 5, 4]
        }, {
            name: 'Tardies',
            data: [1, 3, 4, 2, 3]
        }]
    });

  }
});
