fimport React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import * as GraphHelpers from '../helpers/GraphHelpers';
import HighchartsWrapper from '../components/HighchartsWrapper';

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
};

export default class IsServiceWorkingChart extends React.Component {
  // Component for all charts in the profile page.

  // This returns a function, since HighCharts passes in the current element
  // as `this` instead of a parameter.
  createUnsafeTooltipFormatter(monthBuckets){
    return function() {
      const graphPointIndex = this.series.data.indexOf(this.point);
      const events = monthBuckets[graphPointIndex];
      if (events.length == 0) return false;

      let unsafeHtmlString = '';
      _.each(events, function(e){
        unsafeHtmlString += `<span>${moment.utc(e.occurred_at).format('MMMM Do, YYYY')}</span>`;
        unsafeHtmlString += '<br />';
      });
      return unsafeHtmlString;
    };
  }

  makePlotlines(monthKeys) {
    return this.props.phaselines.map(phaseline => {
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

  makePlotbands(monthKeys) {
    return this.props.phasebands.map(band => {
      const bandMonthKeyStart = band.momentUTCstart.clone().date(1).format('YYYYMMDD');
      const monthIndexStart = monthKeys.indexOf(bandMonthKeyStart);

      const monthIndexEnd = (band.momentUTCend.isValid())
        ? monthKeys.indexOf(band.momentUTCend.clone().date(1).format('YYYYMMDD'))
        : monthKeys.length - 1;

      return {
        color: '#e8fce8',
        opacity: 0.5,
        from: monthIndexStart,
        to: monthIndexEnd,
        label: {
          text: band.text,
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
    const propStyles = this.props.styles;

    return (
      <div style={propStyles.container}>
        {this.renderHeader()}
        <HighchartsWrapper
          chart={{type: 'column', height: propStyles.chartHeight}}
          credits={false}
          xAxis={[
            {
              categories: monthKeys.map(GraphHelpers.monthAxisCaption),
              plotLines: this.makePlotlines(monthKeys),
              plotBands: this.makePlotbands(monthKeys)
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
            formatter: this.createUnsafeTooltipFormatter(monthBuckets),
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
    const propStyles = this.props.styles;

    return (
      <div style={styles.secHead}>
        <h4 style={propStyles.title}>
          {title}
        </h4>
      </div>
    );
  }

}

IsServiceWorkingChart.propTypes = {
  events: PropTypes.array.isRequired, // array of JSON event objects.
  monthsBack: PropTypes.number.isRequired, // how many months in the past to display?
  titleText: PropTypes.string.isRequired,
  nowMomentUTC: PropTypes.instanceOf(moment),
  monthKeyFn: PropTypes.func,
  phaselines: PropTypes.array,
  phasebands: PropTypes.array,
  styles: PropTypes.object,
};

IsServiceWorkingChart.defaultProps = {
  phaselines: [],
  phasebands: [],
  nowMomentUTC: moment.utc(),
  monthKeyFn(event) {
    // A function that grabs a monthKey from an event that is passed in.  Should return
    // a string in the format YYYYMMDD for the first day of the month.
    // Used for grouping events on the chart.
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  }
};