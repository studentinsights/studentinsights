import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DashboardScatterPlot from '../school_administrator_dashboard/DashboardScatterPlot';

export default class IncidentHeatmap extends React.Component {
  constructor(props) {
    super(props);
  }

  getincidentTimeAsMinutes(incident) {
    const time = moment.utc(incident.occurred_at).format("HH.mm").split(".");
    const minutes = time[0] * 60 + time[1] * 1;
    //Group all times outside of school hours or not recorded into one spot for a "gutter" category in highcharts
    return this.areMinutesWithinSchoolHours(minutes) ? minutes : 930; // 4:30 - for gutter category
  }

  areMinutesWithinSchoolHours(minutes) {
    return 420 < minutes && minutes < 900;
  }

  render() {
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const seriesData = this.props.incidents.map(incident => {
      const x = categories.indexOf(moment.utc(incident.occurred_at).format("ddd"));
      const y = this.getincidentTimeAsMinutes(incident);
      const time = moment.utc(incident.occurred_at).format("MM/DD/YYYY hh:mm a");
      return {x, y, time};
    });
    return(
      <DashboardScatterPlot
        id={"string"}
        animation={false}
        titleText={null}
        categories={{categories: categories}}
        seriesData={seriesData}
        yAxisMin={420}
        yAxisMax={960}
        measureText={"Time of Incident"}
        tooltip={{pointFormat: '{point.time}'}}/>);
  }
}

IncidentHeatmap.propTypes = {
  incidents: PropTypes.array.isRequired
};