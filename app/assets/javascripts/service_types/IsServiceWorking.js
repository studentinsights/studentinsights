import _ from 'lodash';
import React from 'react';
import ProfileBarChart from '../student_profile/ProfileBarChart.js';

class IsServiceWorking extends React.Component {

  render() {
    return (
      <div style={{margin: 30}}>
        {this.renderStudents()}
      </div>
    );
  }

  renderServicePhaselines(services) {
    return services.map(function (service) {
      return { momentUTC: moment.utc(service.date_started), text: 'Started' };
    }, this);
  }

  renderStudents() {
    const {serializedData} = this.props;
    const chartData = serializedData.chartData;
    const sortedData = _.sortBy(chartData, (datum) => {
      return datum.services[0].date_started;
    }).reverse();

    return sortedData.map((datum) => {
      const student = datum.student;
      const services = datum.services;
      const servicePhaselines = this.renderServicePhaselines(services);

      return (
        <div key={student.id} style={{marginBottom: 20}}>
          <h3>{student.first_name} {student.last_name}</h3>
          <ProfileBarChart
            events={datum.absences}
            titleText="Absences"
            monthsBack={8}
            phaselines={servicePhaselines} />
          <ProfileBarChart
            events={datum.tardies}
            titleText="Tardies"
            monthsBack={8}
            phaselines={servicePhaselines} />
        </div>
      );
    }, this);

  }

}

IsServiceWorking.propTypes = {
  serializedData: React.PropTypes.object.isRequired,
}

export default IsServiceWorking;
