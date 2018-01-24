import React from 'react';

window.shared || (window.shared = {});
const ProfileBarChart = window.shared.ProfileBarChart;

class IsServiceWorking extends React.Component {

  render() {
    const {absences} = this.props;

    return (
      <div>hey</div>
    );
  }

  renderChartForStudent() {
    return (
      <ProfileBarChart
        events={this.props.absences}
        id="absences"
        titleText="Absences"
        monthsBack={48}
        phaselines={this.phaselines()} />
    );
  }


}

export default IsServiceWorking;
