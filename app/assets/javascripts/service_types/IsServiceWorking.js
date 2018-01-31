import React from 'react';

window.shared || (window.shared = {});
const ProfileBarChart = window.shared.ProfileBarChart;

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
        <div key={student.id}>
          {student.first_name} {student.last_name}
        </div>
      );
    });

  }

}

IsServiceWorking.propTypes = {
  serializedData: React.PropTypes.object.isRequired,
}

export default IsServiceWorking;
