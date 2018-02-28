import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import HighchartsWrapper from '../../student_profile/HighchartsWrapper.js';

const styles = {
  title: {
    color: 'black',
    paddingBottom: 20,
    fontSize: 24
  },
  container: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 'auto',
    border: '1px solid #ccc',
    padding: '30px 30px 30px 30px',
    position: 'relative'
  },
  secHead: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30
  },
  navTop: {
    textAlign: 'right',
    verticalAlign: 'text-top'
  }
};

// Component for all charts in the dashboard page.
class DashboardBarChart extends React.Component{

  //Because the highcharts wrapper redraws the charts whether or not the props
  //have changed, this is necessary to prevent rerendering the charts when the
  //user only wanted to select a homeroom.
  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props.seriesData, nextProps.seriesData);
  }

  render() {
    return (
      <div id={this.props.id} style={styles.container}>
        <HighchartsWrapper
          chart={{
            type: 'column',
            events: {
              click: this.props.onBackgroundClick
            }
          }}
          credits={false}
          xAxis={[this.props.categories]}
          plotOptions={{
            series: {
              cursor: 'pointer',
              events: {
                click: this.props.onColumnClick
              }
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
              data: this.props.seriesData
            }
          ]} />
      </div>
    );
  }
}

DashboardBarChart.propTypes = {
  id: PropTypes.string.isRequired, // short string identifier for links to jump to
  categories: PropTypes.object.isRequired,  //Buckets used for X Axis
  seriesData: PropTypes.array.isRequired, // array of JSON event objects.
  yAxisMin: PropTypes.number,
  yAxisMax: PropTypes.number,
  titleText: PropTypes.string.isRequired,
  measureText: PropTypes.string.isRequired,
  tooltip: PropTypes.object.isRequired,
  onColumnClick: PropTypes.func,
  onBackgroundClick: PropTypes.func
};

export default DashboardBarChart;
