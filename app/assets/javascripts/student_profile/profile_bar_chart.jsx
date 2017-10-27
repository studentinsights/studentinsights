import _ from 'lodash';
import moment from 'moment';

(function() {
  window.shared || (window.shared = {});
  const HighchartsWrapper = window.shared.HighchartsWrapper;
  const GraphHelpers = window.shared.GraphHelpers;

  const styles = {
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
      position: 'relative',
      bottom: 10
    },
    navTop: {
      textAlign: 'right',
      verticalAlign: 'text-top'
    }
  };

  // A function that grabs a monthKey from an event that is passed in.  Should return
  // a string in the format YYYYMMDD for the first day of the month.
  // Used for grouping events on the chart.
  function defaultMonthKeyFn(event) {
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  }

  // Component for all charts in the profile page.
  window.shared.ProfileBarChart = React.createClass({
    displayName: 'ProfileChart',

    propTypes: {
      id: React.PropTypes.string.isRequired, // short string identifier for links to jump to
      events: React.PropTypes.array.isRequired, // array of JSON event objects.
      monthsBack: React.PropTypes.number.isRequired, // how many months in the past to display?
      tooltipTemplateString: React.PropTypes.string.isRequired, // Underscore template string that displays each line of a tooltip.
      titleText: React.PropTypes.string.isRequired,
      nowMomentUTC: React.PropTypes.instanceOf(moment),
      monthKeyFn: React.PropTypes.func,
      phaselines: React.PropTypes.array
    },

    getDefaultProps: function(){
      return {
        tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>",
        phaselines: [],
        nowMomentUTC: moment.utc(),
        monthKeyFn: defaultMonthKeyFn
      };
    },

    // This returns a function, since HighCharts passes in the current element
    // as `this` instead of a parameter.
    createUnsafeTooltipFormatter: function(monthBuckets, props){
      return function() {
        const graphPointIndex = this.series.data.indexOf(this.point);
        const events = monthBuckets[graphPointIndex];
        if (events.length == 0) return false;

        let htmlstring = "";
        _.each(events, function(e){
          htmlstring += _.template(props.tooltipTemplateString)({e: e});
          htmlstring += "<br>";
        });
        return htmlstring;
      };
    },

    makePlotlines: function (monthKeys) {
      return this.props.phaselines.map(function(phaseline) {
        const phaselineMonthKey = phaseline.momentUTC.clone().date(1).format('YYYYMMDD');
        const monthIndex = monthKeys.indexOf(phaselineMonthKey);

        return {
          color: '#ccc',
          value: monthIndex,
          width: 2,
          zIndex: 10,
          label: {
            text: phaseline.text,
            align: 'left',
          }
        };
      });
    },

    // Compute the month range that's relevant for the current date and months back we're showing
    // on the chart.  Then map each month onto captions, and bucket the list of events into
    // each month.
    render: function() {
      const monthKeys = GraphHelpers.monthKeys(this.props.nowMomentUTC, this.props.monthsBack);
      const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, this.props.events);
      const yearCategories = GraphHelpers.yearCategories(monthKeys);

      return (
        <div id={this.props.id} style={styles.container}>
          {this.renderHeader()}
          <HighchartsWrapper
            chart={{type: 'column'}}
            credits={false}
            xAxis={[
              {
                categories: monthKeys.map(GraphHelpers.monthAxisCaption),
                plotLines: this.makePlotlines(monthKeys)
              },
              {
                offset: 35,
                linkedTo: 0,
                categories: yearCategories,
                tickPositions: Object.keys(yearCategories).map(Number),
                tickmarkPlacement: "on"
              }
            ]}
            title={{text: ''}}
            yAxis={{
              min: 0,
              max: 20,
              allowDecimals: false,
              title: {text: this.props.titleText}
            }}
            tooltip={{
              formatter: this.createUnsafeTooltipFormatter(monthBuckets, this.props),
              useHTML: true
            }}
            series={[
              {
                showInLegend: false,
                data: _.map(monthBuckets, 'length')
              }
            ]} />
        </div>
      );
    },


    renderHeader: function() {
      const nYearsBack = Math.ceil(this.props.monthsBack / 12);
      const title = this.props.titleText + ', last ' + nYearsBack + ' years';

      return (
        <div style={styles.secHead}>
          <h4 style={styles.title}>
            {title}
          </h4>
          <span style={styles.navTop}>
            <a href="#">
              Back to top
            </a>
          </span>
        </div>
      );
    }

  });
})();
