import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {allGrades} from '../helpers/gradeText';
import {high, medium, low} from '../helpers/colors';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {xAxisWithGrades} from '../student_profile/highchartsXAxisWithGrades';
import {lineChartOptions} from '../student_profile/highchartsLineChart';
import {
  DIBELS_FSF,
  DIBELS_PSF,
  DIBELS_LNF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  DIBELS_DORF_ACC,
  DIBELS_DORF_WPM,
  somervilleReadingThresholdsFor
} from '../reading/thresholds';
import DibelsSparkline from './DibelsSparkline';

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

    // const ds = toDataPoints(benchmarkDataPoints, currentSchoolYear);
    const toX = d3.scale.linear()
      .domain([nowFn().subtract(nMonthsBack, 'months').valueOf(), nowFn().valueOf()])
      .range([0, 200]);
    const toY = d3.scale.linear()
      .domain([0, 100])
      .range([100, 0]);
    const lineFunction = d3.svg.line()
      .x(d => toX(d.x))
      .y(d => toY(d.y))
      // .x(d => (d.x - _.first(ds).x) / (_.last(ds).x - _.first(ds).x) * 300)
      // .y(d => 200 - d.y * (200/100))
      .interpolate('linear');
    // var lineGraph = svg.append("path")
    //   .attr("d", lineFunction(lineData))
    //   .attr("stroke", "blue")
    //   .attr("stroke-width", 2)
    //   .attr("fill", "none");


    // TODO(kr) not flexible by time
    const nowPeriodKey = 'winter';
    const values = [
      valueFor(benchmarkDataPoints, benchmarkAssessmentKey, currentSchoolYear, 'fall'),
      valueFor(benchmarkDataPoints, benchmarkAssessmentKey, currentSchoolYear, 'winter'),
      valueFor(benchmarkDataPoints, benchmarkAssessmentKey, currentSchoolYear, 'spring')
    ];
    const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, currentGrade, nowPeriodKey);
    return (
      <div className="DibelsMegaChart" title={values} style={{height: 40, padding: 5}}>
        <div style={{position: 'relative', width: 300, height: 40}}>
          <DibelsSparkline
            style={{
              position: 'absolute',
              borderLeft: '1px solid #aaa',
              borderBottom: '1px solid #aaa',
              background: 'white',
              top: 0,
              left: 50,
              right: 40
            }}
            width={200}
            height={40}
            yPad={0}
            values={values}
            benchmark={thresholds ? thresholds.benchmark : null}
            risk={thresholds ? thresholds.risk : null}
            domain={[0, 100]}
          />
          <div style={{opacity: 0.5, fontSize: 10, width: 50, textAlign: 'right', paddingRight: 5, position: 'absolute', top: 0}}>100 wpm</div>
          <div style={{opacity: 0.5, fontSize: 10, width: 50, textAlign: 'right', paddingRight: 5, position: 'absolute', bottom: 0}}>0 wpm</div>
          <div style={{fontSize: 10, width: 40, height: 40, textAlign: 'left', paddingLeft: 5, position: 'absolute', right: 0}}>
            {this.renderBadge(values, thresholds)}
          </div>
        </div>
        {/*<div style={{position: 'relative', width: 200, height: 100, background: 'white', marginBottom: 20}}>
          <svg width={200} height={100} style={{background: 'white'}}>
            <path fill="none" opacity={1.0} strokeWidth={2} stroke="blue" d={lineFunction(toDataPoints(benchmarkDataPoints, currentSchoolYear))} />
            <path fill="none" opacity={0.5} strokeWidth={1} stroke="red" d={lineFunction(toThresholdSeries(benchmarkDataPoints, currentSchoolYear, currentGrade, benchmarkAssessmentKey, 'risk'))} />
            <path fill="none" opacity={0.5} strokeWidth={1} stroke="green" d={lineFunction(toThresholdSeries(benchmarkDataPoints, currentSchoolYear, currentGrade, benchmarkAssessmentKey, 'benchmark'))} />
          </svg>
          <div style={{fontSize: 10, position: 'absolute', top: 0}}>100 wpm</div>
          <div style={{fontSize: 10, position: 'absolute', bottom: 10}}>0 wpm</div>
          <div style={{fontSize: 10, position: 'absolute', bottom: -15, left: toX(moment.utc(`${currentSchoolYear}0901`, 'YYYYMMDD', true))}}>{currentGrade}</div>
        </div>*/}
        {/*<HighchartsWrapper {...props} />*/}
      </div>
    );
  }

  renderBadge(values, thresholds) {
    const value = _.last(values.filter(value => value));
    const color = (thresholds)
      ? classifyLevel(value, thresholds).color
      : '#eee';
    return <div style={{
      display: 'flex',
      backgroundColor: color,
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 18,
      color: 'white'
    }}>{value}</div>;
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
      value: PropTypes.any.isRequired
    }).isRequired
  })).isRequired,
  currentGrade: PropTypes.any.isRequired,
  currentSchoolYear: PropTypes.number.isRequired
};


function toDataPoints(benchmarkDataPoints, currentSchoolYear) {
  const dataPoints = (benchmarkDataPoints || []).map(dataPoint => {
    return {
      x: toMoment(currentSchoolYear, dataPoint.benchmark_period_key).valueOf(),
      y: parseInt(dataPoint.json.value, 10)
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
    const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, gradeThen, dataPoint.benchmark_period_key);
    // console.log('thresholds', thresholds, benchmarkAssessmentKey, gradeThen, dataPoint.benchmark_period_key);
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
    [DIBELS_FSF]: [0, 100],
    [DIBELS_LNF]: [0, 100],
    [DIBELS_PSF]: [0, 100],
    [DIBELS_NWF_CLS]: [0, 200],
    [DIBELS_NWF_WWR]: [0, 100],
    [DIBELS_DORF_ACC]: [0, 100],
    [DIBELS_DORF_WPM]: [0, 200],
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

function valueFor(benchmarkDataPoints, benchmarkAssessmentKey, schoolYear, benchmarkPeriodKey) {
  const dataPoint = _.find(benchmarkDataPoints, {
    benchmark_school_year: schoolYear,
    benchmark_period_key: benchmarkPeriodKey,
    benchmark_assessment_key: benchmarkAssessmentKey
  });
  return (dataPoint && dataPoint.json) ? parseInt(dataPoint.json.value, 10) : null;
}



function classifyLevel(value, thresholds) {
  // TODO(kr) move to bucketForDibels(text, benchmarkAssessmentKey, grade, benchmarkPeriodKey)
  // const {risk, benchmark} = thresholds;
  // const isRisk = value <= risk;
  // const isBenchmark = value >= benchmark;
  // const color = (!value) ? null : isBenchmark ? '#85b985' : isRisk ? 'orange' : '#ccc';
  // return {isRisk, isBenchmark, color};
  return {isRisk: false, isBenchmark: false, color: '#ccc'};
}
