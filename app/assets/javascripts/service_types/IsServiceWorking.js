import _ from 'lodash';
import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import {apiFetchJson} from '../helpers/apiFetchJson';
import IsServiceWorkingChart from './IsServiceWorkingChart.js';
import * as Routes from '../helpers/Routes';
import moment from 'moment';
import {toMomentFromTimestamp} from '../helpers/toMoment';

const style = {
  container: {
    margin: 30
  },
  studentRow: {
    marginBottom: 30,
  },
  chartStyles: {
    title: {
      fontSize: 20
    },
    container: {
      width: '100%',
      margin: '10px auto',
      position: 'relative'
    },
    chartHeight: 250,
  },
  a: {
    fontSize: 24
  },
  buttonStyle: {
    float: 'left',
    margin: 5,
  },
  buttonSectionStyle: {
    width: '100%',
    height: 50
  }
};

class IsServiceWorking extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      serviceTypeSelected: null // options: null, 502, 503
    };

    this.fetchIsServiceWorkingData = this.fetchIsServiceWorkingData.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  fetchIsServiceWorkingData() {
    const {serviceTypeSelected} = this.state;

    const url = `/api/is_service_working_json/${serviceTypeSelected.id}`;

    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="IsServiceWorking">
        <ExperimentalBanner />
        <SectionHeading>
          "Is this Service Working for this Student?"
        </SectionHeading>
        <p style={{padding: '10px 0 0 10px'}}>
          Every student is different.
          One student might respond well to a service, another student might respond differently.
        </p>
        <p style={{padding: '10px 0 10px 10px'}}>
          Use the buttons below to explore how students may have responded to
          services assigned to them over the past school year.
        </p>
        {this.renderButtons()}
        {this.renderCharts()}
      </div>
    );
  }

  renderButtons() {
    const attendanceOfficer = {
      id: 502,
      name: 'Attendance Officer',
    };

    const attendanceContract = {
      id: 503,
      name: 'Attendance Contract',
    };

    return (
      <div style={style.buttonSectionStyle}>
        <Button style={style.buttonStyle}
          onClick={() => {
            this.setState({serviceTypeSelected: null}, () => {
              this.setState({serviceTypeSelected: attendanceOfficer});
            });
          }}>
          Attendance Officer
        </Button>
        <Button style={style.buttonStyle}
          onClick={() => {
            this.setState({serviceTypeSelected: null}, () => {
              this.setState({serviceTypeSelected: attendanceContract});
            });
          }}>
          Attendance Contract
        </Button>
      </div>
    );
  }

  renderCharts() {
    const {serviceTypeSelected} = this.state;

    if (!serviceTypeSelected) return null;

    return (
      <GenericLoader
        promiseFn={this.fetchIsServiceWorkingData}
        render={this.renderPage} />
    );
  }

  renderPage(json) {
    return (
      <div style={style.container}>
        {this.renderStudents(json)}
      </div>
    );
  }

  renderPhasebands(services) {
    return services.map(service => {
      return {
        momentUTCstart: moment.utc(service.date_started),
        momentUTCend: moment.utc(service.discontinued_at),
        text: this.state.serviceTypeSelected.name
      };
    }, this);
  }

  renderStudents(json) {
    const chartData = json.chart_data;

    // Sort students by which had service start first
    const sortedData = _.sortBy(chartData, datum => {
      if (datum.services.length === 0) return 0;

      return datum.services.map(service => toMomentFromTimestamp(service.date_started)).sort()[0];
    });

    return sortedData.map((datum) => {
      const student = datum.student;
      const services = datum.services;
      const phasebands = this.renderPhasebands(services);

      return (
        <div key={student.id} style={style.studentRow}>
          <a href={Routes.studentProfile(student.id)} style={style.a}>
            {student.first_name} {student.last_name}
          </a>
          <span style={{marginLeft: 5}}>({datum.school} Grade {student.grade})</span>
          <IsServiceWorkingChart
            events={datum.absences}
            titleText="Absences"
            monthsBack={24}
            phasebands={phasebands}
            styles={style.chartStyles} />
        </div>
      );
    }, this);

  }

}

export default IsServiceWorking;
