import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import * as GraphHelpers from '../helpers/GraphHelpers';
import HighchartsWrapper from '../components/HighchartsWrapper';
import DetailsSection from './DetailsSection';


// Component for all bar charts in the profile page.
export default class ProfileBarChart extends React.Component {
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

  // Compute the month range that's relevant for the current date and months back we're showing
  // on the chart.  Then map each month onto captions, and bucket the list of events into
  // each month.
  render() {
    const monthKeys = GraphHelpers.monthKeys(this.props.nowMomentUTC, this.props.monthsBack);
    const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, this.props.events);
    const yearCategories = GraphHelpers.yearCategories(monthKeys);

    const nYearsBack = Math.ceil(this.props.monthsBack / 12);
    const title = this.props.titleText + ', last ' + nYearsBack + ' years';
    return (
      <DetailsSection className="ProfileBarChart" title={title} anchorId={this.props.id}>
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
          tooltip={this.props.tooltipFn ? this.props.tooltipFn(monthBuckets) : {
            formatter: createUnsafeTooltipFormatter(monthBuckets, tooltipEventTextFn),
            useHTML: true
          }}
          plotOptions={{
            column: {
              stacking: 'normal'
            }
          }}
          series={this.props.seriesFn ? this.props.seriesFn(monthBuckets) : [{
            showInLegend: false,
            data: _.map(monthBuckets, 'length')
          }]}
        />
      </DetailsSection>
    );
  }

}

ProfileBarChart.propTypes = {
  id: PropTypes.string.isRequired, // short string identifier for links to jump to
  events: PropTypes.array.isRequired, // array of JSON event objects.
  monthsBack: PropTypes.number.isRequired, // how many months in the past to display?
  titleText: PropTypes.string.isRequired,
  nowMomentUTC: PropTypes.instanceOf(moment),
  monthKeyFn: PropTypes.func,
  phaselines: PropTypes.array,
  tooltipFn: PropTypes.func,
  seriesFn: PropTypes.func
};

ProfileBarChart.defaultProps = {
  phaselines: [],
  nowMomentUTC: moment.utc(),
  monthKeyFn(event) {
    // A function that grabs a monthKey from an event that is passed in.  Should return
    // a string in the format YYYYMMDD for the first day of the month.
    // Used for grouping events on the chart.
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  }
};



// This returns a function, since HighCharts passes in the current element
// as `this` instead of a parameter.
export function createUnsafeTooltipFormatter(monthBuckets, eventTextFn) {
  return function() {
    const graphPointIndex = this.series.data.indexOf(this.point);
    const events = monthBuckets[graphPointIndex];
    if (events.length == 0) return false;

    let unsafeHtmlString = '';
    const sortedEvents = _.sortBy(events, e => moment.utc(e.occurred_at));
    _.each(sortedEvents, function(e){
      const text = eventTextFn(e);
      unsafeHtmlString += `<span>${text}</span>`;
      unsafeHtmlString += '<br />';
    });
    return unsafeHtmlString;
  };
}

export function tooltipEventTextFn(e) {
  return moment.utc(e.occurred_at).format('MMMM Do, YYYY');
}


// Given a list of activeServices, return a list of `phaselines` that can be passed to `ProfileBarChart`
// to render the services as phaseline interventions.
export function servicePhaselines(activeServices, serviceTypesIndex) {
  const attendanceServiceTypes = [502, 503, 504, 505, 506];
  const attendanceServices = activeServices.filter(service => {
    return (attendanceServiceTypes.indexOf(service.service_type_id) > -1);
  });

  return attendanceServices.map(service => {
    const serviceText = serviceTypesIndex[service.service_type_id].name;

    return {
      momentUTC: moment.utc(service.date_started),
      text: 'Started ' + serviceText
    };
  });
}
