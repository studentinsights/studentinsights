import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import chroma from 'chroma-js';
import {previousGrade, gradeText} from '../helpers/gradeText';
import {toSchoolYear} from '../helpers/schoolYear';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {shouldHighlight} from './dibelsParsing';
import {ORANGE, GREEN, PRESENT, BLANK} from './colors';


export default class BoxChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    const dataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
    const sortedDataPoints = _.sortBy(dataPoints, dataPoint => {
      return -1 * benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
    });
    const schoolYear = toSchoolYear(nowFn());

    return (
      <div>
        <div style={styles.years}>
          <YearBox
            gradeThen={previousGrade(gradeNow)}
            schoolYear={schoolYear-1}
            sortedDataPoints={sortedDataPoints}
          />
          <YearBox
            gradeThen={gradeNow}
            schoolYear={schoolYear}
            sortedDataPoints={sortedDataPoints}
          />
        </div>
      </div>
    );
  }
}
BoxChart.propTypes = {
  readerJson: PropTypes.object.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  gradeNow: PropTypes.string.isRequired
};
BoxChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


// Take only most recent (the constraint comes from the input spreadsheets)
function YearBox(props) {
  const {schoolYear, gradeThen, sortedDataPoints} = props;
  const benchmarkPeriodKeys = ['fall', 'winter', 'spring'];
  const ds = benchmarkPeriodKeys.map(benchmarkPeriodKey => {
    return _.find(sortedDataPoints, d => d.benchmark_school_year === schoolYear && d.benchmark_period_key == benchmarkPeriodKey);
  });
  return (
    <div style={styles.yearBox}>
      <div style={styles.yearCells}>
        {benchmarkPeriodKeys.map((benchmarkPeriodKey, index) => {
          const dataPoint = ds[index];
          const valueEl = dataPoint ? dataPoint.json.value : null;
          const style = pickStyle(dataPoint, gradeThen);
          return (
            <div key={benchmarkPeriodKey} style={style} title={valueEl}>
              {benchmarkPeriodKey}
            </div>
          );
        })}
      </div>
      <div style={styles.yearWhen}>{gradeText(gradeThen)}, {schoolYear}</div>
    </div>
  );
}
YearBox.propTypes = {
  schoolYear: PropTypes.number.isRequired,
  gradeThen: PropTypes.string.isRequired,
  sortedDataPoints: PropTypes.array.isRequired
};


function pickStyle(dataPoint, gradeThen) {
  // no data
  if (!dataPoint) {
    return boxStyle(BLANK);
  }

  // data, but how should we color it?
  const isOrange = shouldHighlight(dataPoint, gradeThen);
  if (isOrange === true) {
    return boxStyle(ORANGE);
  }
  if (isOrange === false) {
    return boxStyle(GREEN);
  }

  // value, but no thresholds
  return boxStyle(PRESENT);
}


function boxStyle(color) {
  return {
    ...styles.box,
    background: color,
    outline: `1px solid ${chroma(color).darken().hex()}`,
    color: chroma(color).darken().darken().hex()
  };
}


const styles = {
  years: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 12
  },
  yearBox: {
    flex: 1,
    paddingRight: 20
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
