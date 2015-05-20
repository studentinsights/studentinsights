$(function() {

  if ($('body').hasClass('students') && $('body').hasClass('show')) {

    var attendance_series = [{
            name: 'Absences',
            data: [3, 4, 3, 5, 4]
        }, {
            name: 'Tardies',
            data: [1, 3, 4, 2, 3]
    }]

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
	        options.xAxis.categories = ["2010 - 11", "2011 - 12", "2012 - 13", "2013 - 14", "2014 - 15"]
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
å

