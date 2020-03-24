import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {previousGrade, gradeText} from '../helpers/gradeText';
import {toSchoolYear} from '../helpers/schoolYear';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {shouldHighlight} from './dibelsParsing';
import {BLANK, pickBoxColor} from './colors';
import {BoxChartContainer, YearBoxContainer, Box} from './BoxChartElements';


export default class BoxChart extends React.Component {
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
BoxChart.propTypes = {
  readerJson: PropTypes.object.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  gradeNow: PropTypes.string.isRequired,
  renderBoxFn: PropTypes.func.isRequired
};
BoxChart.contextTypes = {
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


export function renderDibelsBoxFn(params) {
  const {benchmarkPeriodKey, dataPoint, gradeThen, value} = params;
  const maybeShouldHighlight = (!dataPoint) ? null : shouldHighlight(dataPoint, gradeThen);
  const color = pickBoxColor(dataPoint, maybeShouldHighlight);
  return <Box key={benchmarkPeriodKey} title={value} color={color}>{benchmarkPeriodKey}</Box>;
}

export function renderRawDibelsScoreBoxFn(params) {
  const {benchmarkPeriodKey, value} = params;
  return <Box key={benchmarkPeriodKey} color={BLANK} title={value}>{value}</Box>;
}
