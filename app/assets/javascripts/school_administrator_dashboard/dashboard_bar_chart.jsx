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
    marginLeft: 'auto',
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
    nowMomentUTC: React.PropTypes.instanceOf(moment),
    monthKeyFn: React.PropTypes.func,
    phaselines: React.PropTypes.array
  },

  getDefaultProps: function(){
    return {
      tooltipTemplateString: "<span><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></span>",
      phaselines: [],
      nowMomentUTC: moment.utc(),
      monthKeyFn: defaultMonthKeyFn
    };
  },

  render: function() {
    const {GraphHelpers} = window.shared;
    const {HighchartsWrapper} = window.shared;
    const monthKeys = GraphHelpers.monthKeys(this.props.nowMomentUTC, this.props.monthsBack);
    //const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, this.props.events);
    const yearCategories = GraphHelpers.yearCategories(monthKeys);

    return (
      <div id={this.props.id} >
        <HighchartsWrapper
          chart={{type: 'column'}}
          credits={false}
          xAxis={[
            {
              categories: this.props.categories
            },
            {
              offset: 50,
              linkedTo: 0,
              categories: yearCategories,
              tickPositions: Object.keys(yearCategories).map(Number),
              tickmarkPlacement: "on"
            }
          ]}
          title={{text: ''}}
          yAxis={{
            min: 80,
            max: 100,
            allowDecimals: true,
            title: {text: this.props.titleText}
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

  // getInitialState: function() {
  //   console.log(ReactHighcharts);
  //   const monthKeys = GraphHelpers.monthKeys(this.props.nowMomentUTC, this.props.monthsBack);
  //   //const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, this.props.events);
  //   const yearCategories = GraphHelpers.yearCategories(monthKeys);
  //   return ({
  //     config: {
  //       chart: {type: 'column'},
  //       title: {text: ''},
  //       xAxis: [
  //         {
  //           categories: this.props.categories
  //         },
  //         {
  //           offset: 50,
  //           linkedTo: 0,
  //           categories: yearCategories,
  //           tickPositions: Object.keys(yearCategories).map(Number),
  //           tickmarkPlacement: "on"
  //         }
  //       ],
  //       yAxis: {
  //         min: 76,
  //         max: 100,
  //         allowDecimals: true,
  //         title: {text: this.props.titleText}
  //       },
  //       series: {
  //         showInLegend: false,
  //         data: this.props.seriesData
  //       }
  //     }
  //   });
  // },

  // componentDidMount: function() {
  //   const monthKeys = GraphHelpers.monthKeys(this.props.nowMomentUTC, this.props.monthsBack);
  //   //const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, this.props.events);
  //   const yearCategories = GraphHelpers.yearCategories(monthKeys);
  //   this.setState({
  //     config: {
  //       xAxis: [
  //         {
  //           categories: this.props.categories
  //         },
  //         {
  //           offset: 50,
  //           linkedTo: 0,
  //           categories: yearCategories,
  //           tickPositions: Object.keys(yearCategories).map(Number),
  //           tickmarkPlacement: "on"
  //         }
  //       ],
  //       series: {
  //         showInLegend: false,
  //         data: this.props.seriesData
  //       }
  //     }
  //   });
  // },

  // render: function() {
  //   return <ReactHighcharts config={this.state.config} ref="chart"></ReactHighcharts>;
  // },


  // renderHeader: function() {
  //   const nYearsBack = Math.ceil(this.props.monthsBack / 12);
  //   const title = this.props.titleText + ', last ' + nYearsBack + ' years';

  //   return (
  //     <div style={styles.secHead}>
  //       <h4 style={styles.title}>
  //         {title}
  //       </h4>
  //       <span style={styles.navTop}>
  //         <a href="#">
  //           Back to top
  //         </a>
  //       </span>
  //     </div>
  //   );
  // }

});
