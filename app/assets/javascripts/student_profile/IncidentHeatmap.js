import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import {withDefaultNowContext} from '../testing/NowContainer';
import DisciplineScatterPlot, {getincidentTimeAsMinutes} from '../components/DisciplineScatterPlot';

export default class IncidentHeatmap extends React.Component {
  constructor(props) {
    super(props);
  }

  toolTipFormatter() {
    return `${this.point.type} - ${this.point.date}`;
  }

  //Discipline patterns are more likely to be meaningful within a single school year
  filterToSchoolYear(incidents) {
    const {nowFn} = this.context;
    const currentSchoolYear = toSchoolYear(nowFn());
    const cutoffDay = firstDayOfSchool(currentSchoolYear);
    return incidents.filter(incident => {
      const incidentMoment = toMomentFromTimestamp(incident.occurred_at);
      return incidentMoment.isAfter(cutoffDay);
    });
  }

  render() {
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const incidentsThisYear = this.filterToSchoolYear(this.props.incidents);
    const seriesData = incidentsThisYear.map(incident => {
      const x = categories.indexOf(moment.utc(incident.occurred_at).format("ddd"));
      const y = getincidentTimeAsMinutes(incident);
      const date = moment.utc(incident.occurred_at).format("MM/DD/YYYY");
      const type = incident.incident_code;
      return {x, y, date, type};
    });
    return(
      <DisciplineScatterPlot
        id={"string"}
        animation={false}
        titleText={"Incidents by Day and Time [School Year]"}
        categories={{categories: categories}}
        seriesData={seriesData}
        measureText={"Time of Incident"}
        studentChart={true}
        toolTipFormatter={this.toolTipFormatter}/>);
  }
}

IncidentHeatmap.propTypes = {
  incidents: PropTypes.array.isRequired
};
IncidentHeatmap.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
