//import _ from 'lodash';
import React from 'react';
import moment from 'moment';


const styles = {
  title: {
    color: 'black',
    paddingBottom: 20,
    fontSize: 24
  },
  container: {
    marginTop: 50,
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

// A function that grabs a monthKey from an event that is passed in.  Should return
// a string in the format YYYYMMDD for the first day of the month.
// Used for grouping events on the chart.
function defaultMonthKeyFn(event) {
  return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
}

// Component for all charts in the profile page.
export default React.createClass({
  displayName: 'DashboardBarChart',

  propTypes: {
    id: React.PropTypes.string.isRequired, // short string identifier for links to jump to
    categories: React.PropTypes.array.isRequired, //Buckets used for X Axis
    seriesData: React.PropTypes.array.isRequired, // array of JSON event objects.
    monthsBack: React.PropTypes.number.isRequired, // how many months in the past to display?
    tooltipTemplateString: React.PropTypes.string.isRequired, // Underscore template string that displays each line of a tooltip.
    titleText: React.PropTypes.string.isRequired,
    measureText: React.PropTypes.string.isRequired,
    categoryGroups: React.PropTypes.object,
    nowMomentUTC: React.PropTypes.instanceOf(moment),
    monthKeyFn: React.PropTypes.func,
    phaselines: React.PropTypes.array
  },

  getDefaultProps: function(){
    return {
      tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>",
      phaselines: [],
      nowMomentUTC: moment.utc(),
      monthKeyFn: defaultMonthKeyFn,
      categoryGroups: {}
    };
  },

  render: function() {
    const {HighchartsWrapper} = window.shared;
    return (
      <div id={this.props.id} style={styles.container}>
        <HighchartsWrapper
          chart={{type: 'column'}}
          credits={false}
          xAxis={[
            {
              categories: this.props.categories
            }, this.props.categoryGroups
          ]}
          title={{text: this.props.titleText}}
          yAxis={{
            min: 80,
            max: 100,
            allowDecimals: true,
            title: {text: this.props.measureText}
          }}
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
