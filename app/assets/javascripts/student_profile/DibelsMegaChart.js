import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {allGrades} from '../helpers/gradeText';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {xAxisWithGrades} from './highchartsXAxisWithGrades';
import {lineChartOptions} from './highchartsLineChart';
import {yAxisPercentileOptions} from './highchartsYAxisPercentileOptions';
import {
  DIBELS_FSF_WPM,
  DIBELS_PSF_WPM,
  DIBELS_LNF_WPM,
  DIBELS_NWF_CLS,
  somervilleDibelsThresholdsFor
} from '../reading/readingData';


export default class DibelsMegaChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {currentGrade, benchmarkDataPoints, currentSchoolYear, benchmarkAssessmentKey} = this.props;
    console.log('DibelsMegaChart:benchmarkDataPoints', benchmarkDataPoints);
    
    const nMonthsBack = {
      'KF': 12,
      '1': 24,
      '2': 36
    }[currentGrade] || 48;
    const props = {
      ...lineChartOptions(),
      chart: {
        ...lineChartOptions().chart,
        height: 200,
        width: 300
      },
      series: [{
        name: 'Benchmark',
        data: toThresholdSeries(benchmarkDataPoints, currentSchoolYear, currentGrade, benchmarkAssessmentKey, 'benchmark'),
        color: 'rgba(0, 128, 0, 0.5)',
        lineWidth: 1,
        marker: {
          radius: 0,
          fillColor: 'rgba(0, 128, 0, 0.5)'
        }
      }, {
        name: 'Data',
        data: toDataPoints(benchmarkDataPoints, currentSchoolYear),
        lineWidth: 3
      }, {
        name: 'Risk',
        data: toThresholdSeries(benchmarkDataPoints, currentSchoolYear, currentGrade, benchmarkAssessmentKey, 'risk'),
        color: 'rgba(128, 0, 0, 0.5)',
        lineWidth: 1,
        marker: {
          radius: 0,
          fillColor: 'rgba(128, 0, 0, 0.5)'
        }
      }],
      xAxis: xAxisWithGrades(currentGrade, nowFn(), {nMonthsBack}),
      yAxis: {
        ...yAxis(benchmarkAssessmentKey)
      }
      // tooltip: starChartTooltip(),
    };

    return (
      <div className="DibelsMegaChart">
        <HighchartsWrapper {...props} />
      </div>
    );
  }
}
DibelsMegaChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
DibelsMegaChart.propTypes = {
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  benchmarkDataPoints: PropTypes.arrayOf(PropTypes.shape({
    benchmark_period_key: PropTypes.string.isRequired,
    json: PropTypes.shape({
      data_point: PropTypes.any.isRequired
    }).isRequired
  })).isRequired,
  currentGrade: PropTypes.any.isRequired,
  currentSchoolYear: PropTypes.number.isRequired
};


function toDataPoints(benchmarkDataPoints, currentSchoolYear) {
  const dataPoints = (benchmarkDataPoints || []).map(dataPoint => {
    return {
      x: toMoment(currentSchoolYear, dataPoint.benchmark_period_key).valueOf(),
      y: parseInt(dataPoint.json.data_point, 10)
    };
  });

  // HighCharts wants time series data sorted in ascending x order
  return _.sortBy(dataPoints, 'x');
}


function toThresholdSeries(benchmarkDataPoints, currentSchoolYear, currentGrade, benchmarkAssessmentKey, thresholdKey) {
  const grades = allGrades();
  const dataPoints = (benchmarkDataPoints || []).map(dataPoint => {
    const nYearsBack = currentSchoolYear - dataPoint.benchmark_school_year;
    const currentGradeIndex = grades.indexOf(currentGrade);
    const gradeThen = grades[currentGradeIndex - nYearsBack];
    const thresholds = somervilleDibelsThresholdsFor(benchmarkAssessmentKey, gradeThen, dataPoint.benchmark_period_key);
    console.log('thresholds', thresholds, benchmarkAssessmentKey, gradeThen, dataPoint.benchmark_period_key);
    return {
      x: toMoment(currentSchoolYear, dataPoint.benchmark_period_key).valueOf(),
      y: parseInt(thresholds[thresholdKey], 10)
    };
  });
  
  // HighCharts wants time series data sorted in ascending x order
  return _.sortBy(dataPoints, 'x');
}

function toMoment(currentSchoolYear, benchmarkPeriodKey) {
  const monthText = {
    fall: '0901',
    winter: '0101',
    spring: '0501'
  }[benchmarkPeriodKey];
  const yearOffset = {
    fall: 0,
    winter: 1,
    spring: 1
  }[benchmarkPeriodKey];
  const year = currentSchoolYear + yearOffset;
  return moment.utc(`${year}${monthText}`, 'YYYYMMDD', true);
}

function yAxis(benchmarkAssessmentKey) {
  const allTimeRange = {
    [DIBELS_FSF_WPM]: [0, 100],
    [DIBELS_LNF_WPM]: [0, 100],
    [DIBELS_PSF_WPM]: [0, 100],
    [DIBELS_NWF_CLS]: [0, 200]
  }[benchmarkAssessmentKey];

  return {
    allowDecimals: false,
    min: allTimeRange[0],
    max: allTimeRange[1]
    // plotLines: [{
    //   color: '#666',
    //   width: 1,
    //   zIndex: 3,
    //   value: 50,
    //   label: {
    //     text: '50th percentile',
    //     align: 'center',
    //     style: {
    //       color: '#999999'
    //     }
    //   }
    // }]
  };
}