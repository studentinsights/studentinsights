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
      titleText: React.PropTypes.string.isRequired
    },

    getDefaultProps: function(){
      return {
        tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>"
      }
    },

    renderHeader: function(title) {
      return dom.div({ style: styles.secHead },
        dom.h4({ style: styles.title }, title),
        dom.span({ style: styles.navTop }, dom.a({ href: '#' }, 'Back to top'))
      );
    },

    getMonthNames: function(){
      var first_of_this_month = moment.utc().date(1);
      var results = [];
      for (var i = 0; i < this.props.monthsBack; i++){
        results.splice(0, 0, first_of_this_month.clone().subtract(i, 'months').format("MMM"));
      }

      return results;
    },

    eventsToSparseArray: function(events){
      // Return an array of arrays of events for each month in the range (i.e. 0 - 48).
      // If there are no events in a month, the array will be empty.

      var data = {};
      var n = this.props.monthsBack;

      _.each(events, function(event){
        var m = moment.utc(event.occurred_at).date(1);

        // Only include events from less than n months ago.
        var now = moment.utc();
        var first_category = now.clone().subtract(n, 'months');

        if (now.diff(m, 'months') < n){
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

    getPositionsForYearStarts: function(){
      var result = {};
      var current = moment.utc();
      var current_year = current.year();
      var n = this.props.monthsBack;

      // Take 12-month jumps backwards until we can't anymore.
      n -= (current.month() + 1);
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
      var eventsByCategory = this.eventsToSparseArray(this.props.events);
      var positionsForYearStarts = this.getPositionsForYearStarts();

      return dom.div({ id: this.props.id, style: styles.container},
        this.renderHeader(this.props.titleText + ', last ' + Math.ceil(this.props.monthsBack / 12) + ' years'),
        createEl(HighchartsWrapper, {
          chart: {type: 'column'},
          credits: false,
          xAxis: [{
            categories: this.getMonthNames(),
          },
          {
            offset: 35,
            linkedTo: 0,
            tickPositions: _.keys(positionsForYearStarts).map(Number),
            tickmarkPlacement: "on",
            categories: positionsForYearStarts,
          }],
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