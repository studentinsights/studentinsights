import React from 'react';

window.shared || (window.shared = {});
const ProfileBarChart = window.shared.ProfileBarChart;

class IsServiceWorking extends React.Component {

  render() {
    const {chartData} = this.props;
    console.log('chartData', chartData);

    return (
      <div>hey</div>
    );
  }

}

export default IsServiceWorking;
