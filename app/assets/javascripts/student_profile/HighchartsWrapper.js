import React from 'react';
import 'highcharts';

// This component wraps Highcharts so that you can provide Highcharts
// options as props, and it bridges calling into the library.

class HighchartsWrapper extends React.Component {

  constructor(props) {
    super(props);

    this.onRefForChart = this.onRefForChart.bind(this);
  }

  componentDidMount(props, state) {
    $(this._chartEl).highcharts(this.props);
  }

  componentWillReceiveProps(newProps) {
    $(this._chartEl).highcharts(newProps);
  }

  componentWillUnmount(props, state) {
    delete this._chartEl;
  }

  onRefForChart(el) {
    this._chartEl = el;
  }

  render() {
    return (
      <div className="HighchartsWrapper">
        <div ref={this.onRefForChart} />
      </div>
    );
  }

}

export default HighchartsWrapper;


