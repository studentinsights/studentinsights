import React from 'react';
import PropTypes from 'prop-types';
import HighchartsWrapper from '../components/HighchartsWrapper';

// Component for all charts in the dashboard page.
export default class DashboardScatterPlot extends React.Component{

  render() {
    return (
      <div id={this.props.id} className="DashboardScatterPlot" style={styles.root}>
        <HighchartsWrapper
          style={{flex: 1}}
          chart={{
            type: 'scatter'
          }}
          credits={false}
          xAxis={[this.props.categories]}
          plotOptions={{
            series: {
              animation: this.props.animation
            }
          }}
          title={{text: this.props.titleText}}
          yAxis={{
            min: this.props.yAxisMin,
            max: this.props.yAxisMax,
            allowDecimals: true,
            title: {text: this.props.measureText}
          }}
          tooltip={this.props.tooltip}
          series={[
            {
              showInLegend: false,
              data: this.props.seriesData,
              ...(this.props.series || {})
            }
          ]} />
      </div>
    );
  }
}

DashboardScatterPlot.propTypes = {
  id: PropTypes.string.isRequired, // short string identifier for links to jump to
  categories: PropTypes.object.isRequired,  //Buckets used for X Axis
  seriesData: PropTypes.array.isRequired, // array of JSON event objects.
  yAxisMin: PropTypes.number,
  yAxisMax: PropTypes.number,
  titleText: PropTypes.string, //discipline dashboard makes its own title
  measureText: PropTypes.string.isRequired,
  tooltip: PropTypes.object.isRequired,
  animation: PropTypes.bool,
  series: PropTypes.object
};
DashboardScatterPlot.defaultProps = {
  animation: true
};

const styles = {
  root: {
    flex: 1,
    width: '100%',
    padding: 10,
    display: 'flex'
  }
};