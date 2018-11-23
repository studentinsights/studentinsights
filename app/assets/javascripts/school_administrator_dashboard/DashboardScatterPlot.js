import React from 'react';
import PropTypes from 'prop-types';
import HighchartsWrapper from '../components/HighchartsWrapper';
import  hash from 'object-hash';

// Component for all charts in the dashboard page.
export default class DashboardScatterPlot extends React.Component{

//highcharts has trouble combining zoom with a render, so rendering is prevented unless the displayed data changes
  shouldComponentUpdate(nextProps) {
    return hash.MD5(nextProps.seriesData)!==hash.MD5(this.props.seriesData);
  }

  formatter() { //time is sent as minutes from midnight on each day
    const minutes = this.value;
    const hour = Math.floor(minutes/60);
    const minute = minutes % 60 || "00";
    const a = hour < 12 ? 'AM' : 'PM';
    return `${hour % 12 || 12}:${minute} ${a}`;
  }

  render() {
    return (
      <div id={this.props.id} className="DashboardScatterPlot" style={styles.root}>
        <HighchartsWrapper
          style={{flex: 1}}
          chart={{
            type: 'scatter',
            events: {selection:this.props.onZoom},
            zoomType: 'xy'
          }}
          credits={false}
          xAxis={{
            ...this.props.categories,
            plotBands: [{
              color: '#1ebbd7',
              from: -0.5,
              to: 0.5
            },{
              color: '#348AA7',
              from: 0.5,
              to: 1.5
            },
            {
              color: '#1ebbd7',
              from: 1.5,
              to: 2.5
            },
            {
              color: '#348AA7',
              from: 2.5,
              to: 3.5
            },{
              color: '#1ebbd7',
              from: 3.5,
              to: 4.5
            },
            {
              color: '#348AA7',
              from: 4.5,
              to: 5.5
            },
            {
              color: '#1ebbd7',
              from: 5.5,
              to: 6.5
            }
            ]}}
          plotOptions={{
            series: {
              animation: this.props.animation,
              marker: {
                radius: 12,
                fillColor: 'rgba(47,226,216,0.5)'
              }
            }
          }}
          title={{text: this.props.titleText}}
          yAxis={{
            min: this.props.yAxisMin,
            max: this.props.yAxisMax,
            allowDecimals: true,
            title: {text: this.props.measureText},
            labels: {formatter: this.formatter}
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
  onZoom: PropTypes.func.isRequired,
  animation: PropTypes.bool,
  series: PropTypes.object,
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