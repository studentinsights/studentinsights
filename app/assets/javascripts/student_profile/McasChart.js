import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {nextGenMcasScoreRange} from '../helpers/mcasScores';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {xAxisWithGrades} from './highchartsXAxisWithGrades';
import {lineChartOptions} from './highchartsLineChart';
import {yAxisPercentileOptions} from './highchartsYAxisPercentileOptions';
import {toMoment, toValue} from './QuadConverter';


// Components for the MCAS charts in the profile page (next gen, SGP, old)
//
// See below for exported classes for making each kind of chart.
class McasChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {seriesName, mcasSeries, studentGrade, yAxis} = this.props;

    const props = {
      ...lineChartOptions(),
      yAxis,
      xAxis: xAxisWithGrades(studentGrade, nowFn()),
      series: [{
        name: seriesName,
        data: toDataPoints(mcasSeries)
      }]
    };

    return (
      <div className="McasChart">
        <HighchartsWrapper {...props} />
      </div>
    );
  }
}
McasChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
McasChart.propTypes = {
  seriesName: PropTypes.string.isRequired,
  mcasSeries: PropTypes.array.isRequired, // [year, month, date, value] quads
  yAxis: PropTypes.object.isRequired,
  studentGrade: PropTypes.string.isRequired
};


// For next generation MCAS
export function McasNextGenChart(props) {
  const notMeetingMin = nextGenMcasScoreRange('NM')[0];
  const exceedingMax = nextGenMcasScoreRange('E')[1];
  return (
    <McasChart
      {...props}
      seriesName="Scaled score"
      yAxis={{
        ...defaultYAxis,
        min: notMeetingMin,
        max: exceedingMax,
        plotLines: nextGenBandsPlotlines,
        tickPositions: nextGenBandsPlotlines.map(p => p.from).concat([_.last(nextGenBandsPlotlines).to]),
        gridLineWidth: 0,
        title: { text: 'Scaled score' }
      }}
    />
  );
}

// For old MCAS
export function McasOldChart(props) {
  return (
    <McasChart
      {...props}
      seriesName="Scaled score"
      yAxis={{
        ...defaultYAxis,
        min: 200,
        max: 280,
        plotLines: oldMcasBandsPlotlines,
        title: { text: 'Scaled score' }
      }}
    />
  );
}

// For student growth percentiles
export function McasSgpChart(props) {
  return (
    <McasChart
      {...props}
      seriesName="Student growth percentile (SGP)"
      yAxis={{
        ...yAxisPercentileOptions(),
        title: {
          text: 'Student growth percentile (SGP)'
        }
      }}
    />
  );
}

const oldMcasBandsPlotlines = [{
  color: '#E7EBED',
  from: 200,
  to: 218,
  label: {
    text: 'Warning',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#F6F7F8',
  from: 220,
  to: 238,
  label: {
    text: 'Needs Improvement',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#E7EBED',
  from: 240,
  to: 258,
  label: {
    text: 'Proficient',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#F6F7F8',
  from: 260,
  to: 280,
  label: {
    text: 'Advanced',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}];

function toRangeForChart(code) {
  const [min, max] = nextGenMcasScoreRange(code);
  return {
    from: min,
    to: max
  };
}

const nextGenBandsPlotlines = [{
  color: '#E7EBED',
  ...toRangeForChart('NM'),
  label: {
    text: 'Not Meeting Expectations',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#F6F7F8',
  ...toRangeForChart('PM'),
  label: {
    text: 'Partially Meeting',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#E7EBED',
  ...toRangeForChart('M'),
  label: {
    text: 'Meeting Expectations',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}, {
  color: '#F6F7F8',
  ...toRangeForChart('E'),
  label: {
    text: 'Exceeding Expectations',
    align: 'left',
    style: {
      color: '#999999'
    }
  }
}];

const defaultYAxis = {
  // Without these, max/min aren't actually enforced.
  endOnTick: false,
  startOnTick: false,
  alignTicks: false,

  allowDecimals: false,
  title: {
    text: '',
    style: {
      display: 'none'
    }
  },
  plotLines: []
};

function toDataPoints(mcasSeries) {
  return (mcasSeries || []).map(quad => {
    return [toMoment(quad).valueOf(), toValue(quad)];
  });
}