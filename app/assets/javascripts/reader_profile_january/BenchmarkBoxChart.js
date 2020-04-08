import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {previousGrade, gradeText} from '../helpers/gradeText';
import {toSchoolYear} from '../helpers/schoolYear';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {shouldHighlightBenchmarkDataPoint} from '../reading/readingData';
import {BLANK, pickBoxColor} from './colors';
import {BoxChartContainer, YearBoxContainer, Box} from './BoxChartElements';


export default class BenchmarkBoxChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, readerJson, benchmarkAssessmentKey, renderBoxFn} = this.props;
    const dataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
    const sortedDataPoints = _.sortBy(dataPoints, dataPoint => {
      return -1 * benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
    });
    const schoolYear = toSchoolYear(nowFn());

    return (
      <BoxChartContainer>
        <YearBox
          gradeThen={previousGrade(gradeNow)}
          schoolYear={schoolYear-1}
          sortedDataPoints={sortedDataPoints}
          renderBoxFn={renderBoxFn}
        />
        <YearBox
          style={{paddingLeft: 20}}
          gradeThen={gradeNow}
          schoolYear={schoolYear}
          sortedDataPoints={sortedDataPoints}
          renderBoxFn={renderBoxFn}
        />
      </BoxChartContainer>
    );
  }
}
BenchmarkBoxChart.propTypes = {
  readerJson: PropTypes.object.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  gradeNow: PropTypes.string.isRequired,
  renderBoxFn: PropTypes.func.isRequired
};
BenchmarkBoxChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


// Take only most recent (the constraint comes from the input spreadsheets)
function YearBox(props) {
  const {schoolYear, gradeThen, sortedDataPoints, renderBoxFn, style = {}} = props;
  const benchmarkPeriodKeys = ['fall', 'winter', 'spring'];
  const ds = benchmarkPeriodKeys.map(benchmarkPeriodKey => {
    return _.find(sortedDataPoints, d => d.benchmark_school_year === schoolYear && d.benchmark_period_key == benchmarkPeriodKey);
  });

  const periodEls = benchmarkPeriodKeys.map((benchmarkPeriodKey, index) => {
    const dataPoint = ds[index];
    const value = dataPoint ? dataPoint.json.value : null;
    return renderBoxFn({
      schoolYear,
      gradeThen,
      benchmarkPeriodKey,
      dataPoint,
      value
    });
  });

  return (
    <YearBoxContainer
      periodEls={periodEls}
      captionEl={`${gradeText(gradeThen)}, ${schoolYear}`}
      style={style}
    />
  );
}
YearBox.propTypes = {
  schoolYear: PropTypes.number.isRequired,
  gradeThen: PropTypes.string.isRequired,
  sortedDataPoints: PropTypes.array.isRequired,
  renderBoxFn: PropTypes.func.isRequired,
  style: PropTypes.object
};


export function renderDibelsBoxFn(boxParams) {
  return renderColoredBox(boxParams, boxParams.benchmarkPeriodKey);
}

export function renderBenchmarkValueBoxFn(boxParams, style = {}) {
  return renderColoredBox(boxParams, boxParams.value, style);
}

function renderColoredBox(boxParams, contentEl, style = {}) {
  const {benchmarkPeriodKey, dataPoint, gradeThen, value} = boxParams;
  const maybeShouldHighlight = (!dataPoint) ? null : shouldHighlightBenchmarkDataPoint(dataPoint, gradeThen);
  const color = pickBoxColor(dataPoint, maybeShouldHighlight);
  const title = (value) ? value.toString() : null;
  return <Box key={benchmarkPeriodKey} title={title} color={color} style={style}>{contentEl}</Box>;
}

export function renderRawDibelsScoreBoxFn(boxParams) {
  const {benchmarkPeriodKey, value} = boxParams;
  return (
    <Box
      key={benchmarkPeriodKey}
      title={value}
      color={BLANK}
      style={{color: '#666'}}>
      {value}
    </Box>
  );
}
