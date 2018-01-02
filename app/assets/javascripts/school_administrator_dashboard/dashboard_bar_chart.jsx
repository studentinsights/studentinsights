import React from 'react';
import _ from 'lodash';

import HighchartsWrapper from '../student_profile/HighchartsWrapper.js';

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
export default React.createClass({
  displayName: 'DashboardBarChart',

  propTypes: {
    id: React.PropTypes.string.isRequired, // short string identifier for links to jump to
    categories: React.PropTypes.array.isRequired, //Buckets used for X Axis
    seriesData: React.PropTypes.array.isRequired, // array of JSON event objects.
    titleText: React.PropTypes.string.isRequired,
    measureText: React.PropTypes.string.isRequired,
    categoryGroups: React.PropTypes.object,
    onColumnClick: React.PropTypes.func,
    onBackgroundClick: React.PropTypes.func
  },

  getDefaultProps: function(){
    return {
      categoryGroups: {}
    };
  },

  //Because the highcharts wrapper redraws the charts whether or not the props
  //have changed, this is necessary to prevent rerendering the charts when the
  //user only wanted to select a homeroom.
  shouldComponentUpdate: function(nextProps) {
    return !_.isEqual(this.props, nextProps);
  },

  render: function() {
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
          xAxis={[
            {
              categories: this.props.categories
            }, this.props.categoryGroups
          ]}
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
            min: 80,
            max: 100,
            allowDecimals: true,
            title: {text: this.props.measureText}
          }}
          tooltip={{
            pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
            valueSuffix: '%'}}
          series={[
            {
              showInLegend: false,
              data: this.props.seriesData
            }
          ]} />
      </div>
    );
  }

});
