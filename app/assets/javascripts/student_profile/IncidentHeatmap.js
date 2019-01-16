import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DisciplineScatterPlot, {getincidentTimeAsMinutes} from '../components/DisciplineScatterPlot';

export default class IncidentHeatmap extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const seriesData = this.props.incidents.map(incident => {
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
        titleText={"Incidents by Day and Time"}
        categories={{categories: categories}}
        seriesData={seriesData}
        measureText={"Time of Incident"}
        studentChart={true}/>);
  }
}

IncidentHeatmap.propTypes = {
  incidents: PropTypes.array.isRequired
};