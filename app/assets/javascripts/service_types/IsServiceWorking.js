import _ from 'lodash';
import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ProfileBarChart from '../student_profile/ProfileBarChart.js';

const style = {
  container: {
    margin: 30
  },
  studentRow: {
    marginBottom: 30,
  },
  profileBarChartStyles: {
    title: {
      fontSize: 20
    },
    container: {
      width: '100%',
      margin: '10px auto',
      position: 'relative'
    },
    chartHeight: 220
  }
};

class IsServiceWorking extends React.Component {

  constructor(props) {
    super(props);

    this.fetchIsServiceWorkingData = this.fetchIsServiceWorkingData.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  render() {
    return (
      <div className="IsServiceWorking">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchIsServiceWorkingData}
          render={this.renderPage} />
      </div>
    );
  }

  fetchIsServiceWorkingData() {
    const url = `/api/is_service_working_json`;
    return apiFetchJson(url);
  }

  renderPage(json) {
    return (
      <div style={style.container}>
        {this.renderStudents(json)}
      </div>
    );
  }

  renderServicePhaselines(services) {
    return services.map(function (service) {
      return { momentUTC: moment.utc(service.date_started), text: 'Started' };
    }, this);
  }

  renderStudents(json) {
    const chartData = json.chart_data;
    const sortedData = _.sortBy(chartData, (datum) => {
      return datum.services[0].date_started;
    }).reverse();

    return sortedData.map((datum) => {
      const student = datum.student;
      const services = datum.services;
      const servicePhaselines = this.renderServicePhaselines(services);

      return (
        <div key={student.id} style={style.studentRow}>
          <h1>{student.first_name} {student.last_name}</h1>
          <ProfileBarChart
            events={datum.absences}
            titleText="Absences"
            monthsBack={8}
            phaselines={servicePhaselines}
            hideBackToTop={true}
            styles={style.profileBarChartStyles} />
        </div>
      );
    }, this);

  }

}

IsServiceWorking.propTypes = {
  serializedData: React.PropTypes.object.isRequired,
}

export default IsServiceWorking;
