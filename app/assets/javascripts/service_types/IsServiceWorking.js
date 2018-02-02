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

  renderStudents() {
    const {serializedData} = this.props;
    const chartData = serializedData.chartData;

    return chartData.map((datum) => {
      const student = datum.student;

      return (
        <div key={student.id} style={{marginBottom: 20}}>
          <h3>{student.first_name} {student.last_name}</h3>
          <ProfileBarChart
            events={this.props.absences}
            titleText="Absences"
            monthsBack={48} />
        </div>
      );
    });

  }

}

IsServiceWorking.propTypes = {
  serializedData: React.PropTypes.object.isRequired,
}

export default IsServiceWorking;
