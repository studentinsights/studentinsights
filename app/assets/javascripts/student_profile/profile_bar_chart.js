(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var HighchartsWrapper = window.shared.HighchartsWrapper;

  var styles = {
    title: {
      color: 'black',
      paddingBottom: 20,
      fontSize: 24
    },
    container: {
      width: '100%',
      marginTop: 50,
      marginLeft: 'auto',
      marginRight: 'auto',
      border: '1px solid #ccc',
      padding: '30px 30px 30px 30px',
      position: 'relative'
    },
    secHead: {
      display: 'flex',
      justifyContent: 'space-between',
      position: 'absolute',
      top: 30,
      left: 30,
      right: 30
    },
    navTop: {
      textAlign: 'right',
      verticalAlign: 'text-top'
    }
  };

  // Component for all charts in the profile page.
  window.shared.ProfileBarChart = React.createClass({
    displayName: 'ProfileChart',

    propTypes: {
      id: React.PropTypes.string.isRequired, // short string identifier for links to jump to
      events: React.PropTypes.array.isRequired, // array of JSON event objects.
      monthsBack: React.PropTypes.number.isRequired, // how many months in the past to display?
      tooltipTemplateString: React.PropTypes.string.isRequired, // Underscore template string that displays each line of a tooltip.
      titleText: React.PropTypes.string.isRequired,
      plotLines: React.PropTypes.array.isRequired
    },

    getDefaultProps: function(){
      return {
        tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>",
        plotLines: []
      }
    },

    renderHeader: function(title) {
      return dom.div({ style: styles.secHead },
        dom.h4({ style: styles.title }, title),
        dom.span({ style: styles.navTop }, dom.a({ href: '#' }, 'Back to top'))
      );
    },

    lastNMonthNamesFrom: function(n, d){
      // Takes in an integer and the current date as a Moment object (UTC).
      // Returns an array of the last n month names from the first of this month.
      // i.e. ["Jan", "Dec", "Nov"]

      var first_of_current_month = d.clone().date(1)
      var results = [];
      for (var i = 0; i < n; i++){
        results.splice(0, 0, first_of_current_month.format("MMM"));
        first_of_current_month.subtract(1, 'months');
      }

      return results;
    },

    eventsToSparseArray: function(events, n, d){
      // Takes in an array of event objects, an integer and the current date as a Moment object (UTC).
      // Returns an array which, for each month in the range (0 -- n), contains an array of events that happened that month.
      //
      // If there are no events in a month, the array for that month will be empty.

      var data = {};
      _.each(events, function(event){
        var m = moment.utc(event.occurred_at).date(1);

        // Only include events from less than n months ago.
        var first_category = d.clone().subtract(n, 'months');

        if (d.diff(m, 'months') < n){
          var category = m.diff(first_category, 'months');
          if (data[category]){
            data[category] = data[category].concat(event);
          } else {
            data[category] = [event];
          }
        }
      });

      // Fill in 'holes' with empty arrays.
      _.each(_.range(n), function(i){
        if (!data.hasOwnProperty(i)){
          data[i] = [];
        }
      });
      return _.toArray(data);
    },

    getYearStartPositions: function(n, d){
      // Takes in an integer (number of months back) and the current date as a Moment object (UTC).
      // Returns an object mapping integer (tick position) --> string (year starting at that position).

      var result = {};
      var current_year = d.year();

      // Take 12-month jumps backwards until we can't anymore.
      n -= (d.month() + 1);
      result[n] = current_year.toString();
      while (n - 12 > 0){
        n -= 12;
        current_year -= 1;
        result[n] = current_year.toString();
      }

      return result;
    },

    create_tooltip_formatter: function(eventsByCategory, templatestring){
      return function(){
        var events = eventsByCategory[this.series.data.indexOf(this.point)];
        if (events.length == 0){
          return false;
        }

        var htmlstring = "";
        _.each(events, function(e){
          htmlstring += _.template(templatestring)({e: e});
          htmlstring += "<br>";
        });
        return htmlstring;
      }
    },

    render: function() {
      var eventsByCategory = this.eventsToSparseArray(this.props.events, this.props.monthsBack, moment.utc());
      var yearStartPositions = this.getYearStartPositions(this.props.monthsBack, moment.utc());

      return dom.div({ id: this.props.id, style: styles.container},
        this.renderHeader(this.props.titleText + ', last ' + Math.ceil(this.props.monthsBack / 12) + ' years'),
        createEl(HighchartsWrapper, {
          chart: {type: 'column'},
          credits: false,
          xAxis: [
            {
              categories: this.lastNMonthNamesFrom(this.props.monthsBack, moment.utc()),
            },
            {
              offset: 35,
              linkedTo: 0,
              tickPositions: _.keys(yearStartPositions).map(Number),
              tickmarkPlacement: "on",
              categories: yearStartPositions,
            }
          ],
          plotLines: this.props.plotLines,
          title: {text: ''},
          yAxis: {
              min: 0,
              max: 20,
              allowDecimals: false,
              title: {text: this.props.titleText}
          },
          tooltip: {
            formatter: this.create_tooltip_formatter(eventsByCategory, this.props.tooltipTemplateString),
            useHTML: true
          },
          series: [
            {
              showInLegend: false,
              data: eventsByCategory.map(
                function(list){ return list.length; }
              )
            }
          ]
        })
      );
    }
  });
})();
