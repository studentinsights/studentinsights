import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import * as GraphHelpers from '../helpers/GraphHelpers';
import HighchartsWrapper from '../student_profile/HighchartsWrapper';

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

export default class ProfileBarChart extends React.Component {
  // Component for all charts in the profile page.

  // This returns a function, since HighCharts passes in the current element
  // as `this` instead of a parameter.
  createUnsafeTooltipFormatter(monthBuckets, props){
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
  }

  makePlotlines(monthKeys) {
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
  }

  // Compute the month range that's relevant for the current date and months back we're showing
  // on the chart.  Then map each month onto captions, and bucket the list of events into
  // each month.
  render() {
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
  }

  renderHeader() {
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

}

ProfileBarChart.propTypes = {
  id: PropTypes.string.isRequired, // short string identifier for links to jump to
  events: PropTypes.array.isRequired, // array of JSON event objects.
  monthsBack: PropTypes.number.isRequired, // how many months in the past to display?
  tooltipTemplateString: PropTypes.string.isRequired, // Underscore template string that displays each line of a tooltip.
  titleText: PropTypes.string.isRequired,
  nowMomentUTC: PropTypes.instanceOf(moment),
  monthKeyFn: PropTypes.func,
  phaselines: PropTypes.array
};

ProfileBarChart.defaultProps = {
  tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>",
  phaselines: [],
  nowMomentUTC: moment.utc(),
  monthKeyFn: function defaultMonthKeyFn(event) {
    // A function that grabs a monthKey from an event that is passed in.  Should return
    // a string in the format YYYYMMDD for the first day of the month.
    // Used for grouping events on the chart.
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  }
};
