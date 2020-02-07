import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {previousGrade, gradeText} from '../helpers/gradeText';
import {toSchoolYear} from '../helpers/schoolYear';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {boxStyle} from './colors';


export default class BoxChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, readerJson, benchmarkAssessmentKey, renderRaw, renderCellFn} = this.props;
    const dataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
    const sortedDataPoints = _.sortBy(dataPoints, dataPoint => {
      return -1 * benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
    });
    const schoolYear = toSchoolYear(nowFn());

    return (
      <div className="BoxChart" style={styles.years}>
        <YearBox
          gradeThen={previousGrade(gradeNow)}
          schoolYear={schoolYear-1}
          sortedDataPoints={sortedDataPoints}
          renderRaw={renderRaw}
          renderCellFn={renderCellFn}
        />
        <YearBox
          style={{paddingLeft: 20}}
          gradeThen={gradeNow}
          schoolYear={schoolYear}
          sortedDataPoints={sortedDataPoints}
          renderRaw={renderRaw}
          renderCellFn={renderCellFn}
        />
      </div>
    );
  }
}
BoxChart.propTypes = {
  readerJson: PropTypes.object.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  gradeNow: PropTypes.string.isRequired,
  renderCellFn: PropTypes.func.isRequired,
  renderRaw: PropTypes.bool
};
BoxChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


// Take only most recent (the constraint comes from the input spreadsheets)
function YearBox(props) {
  const {schoolYear, gradeThen, sortedDataPoints, renderCellFn, renderRaw, style = {}} = props;
  const benchmarkPeriodKeys = ['fall', 'winter', 'spring'];
  const ds = benchmarkPeriodKeys.map(benchmarkPeriodKey => {
    return _.find(sortedDataPoints, d => d.benchmark_school_year === schoolYear && d.benchmark_period_key == benchmarkPeriodKey);
  });
  return (
    <div style={{...styles.yearBox, ...style}}>
      <div style={styles.yearCells}>
        {benchmarkPeriodKeys.map((benchmarkPeriodKey, index) => {
          const dataPoint = ds[index];
          const value = dataPoint ? dataPoint.json.value : null;
          const styled = boxStyle(dataPoint, gradeThen, styles.box);
          const el = renderCellFn({
            styled,
            boxStyle: styles.box,
            schoolYear,
            gradeThen,
            benchmarkPeriodKey,
            dataPoint,
            value
          });
          return (renderRaw)
            ? el
            : <div key={benchmarkPeriodKey} style={styled} title={value}>{el}</div>;
        })}
      </div>
      <div style={styles.yearWhen}>{gradeText(gradeThen)}, {schoolYear}</div>
    </div>
  );
}
YearBox.propTypes = {
  schoolYear: PropTypes.number.isRequired,
  gradeThen: PropTypes.string.isRequired,
  sortedDataPoints: PropTypes.array.isRequired,
  renderCellFn: PropTypes.func.isRequired,
  renderRaw: PropTypes.bool,
  style: PropTypes.object
};

const styles = {
  years: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 12
  },
  yearBox: {
    flex: 1
  },
  yearCells: {
    display: 'flex',
    flexDirection: 'row'
  },
  yearWhen: {
    marginTop: 5
  },
  box: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    cursor: 'default'
  }
};
