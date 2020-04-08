import React from 'react';
import PropTypes from 'prop-types';
import Nbsp from '../components/Nbsp';
import SectionHeading from '../components/SectionHeading';
import {computeMids} from '../reading/readingData';
import {somervilleReadingThresholdsFor} from '../reading/thresholds';
import ReadingScheduleGrid from '../reading/ReadingScheduleGrid';


// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingThresholdsPage extends React.Component {
  render() {
    const SOURCE_CODE_URL = 'https://github.com/studentinsights/studentinsights/blob/master/app/assets/javascripts/reading/thresholds.js';
    return (
      <div className="ReadingThresholdsPage">
        <SectionHeading titleStyle={styles.title}>
          <div>Reading: Thresholds and benchmarks</div>
          <div style={styles.headerLinkContainer}>
            <a style={styles.headerLink} href={SOURCE_CODE_URL} target="_blank" rel="noopener noreferrer">Source code</a>
          </div>
        </SectionHeading>
        <ReadingThresholdsGrid />
      </div>
    );
  }
}


const styles = {
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLinkContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  headerLink: {
    fontSize: 12
  },
  cell: {
    color: '#666',
    height: 80,
    textAlign: 'center',
    overflow: 'hidden'
  }
};


export function ReadingThresholdsGrid({gradeNow}) {
  return <ReadingScheduleGrid renderCellFn={renderCellFn} gradeNow={gradeNow} />;
}
ReadingThresholdsGrid.propTypes = {
  gradeNow: PropTypes.string
};


function renderCellFn(benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  const [midLow, midHigh] = computeMids(thresholds, benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  const [belowRisk, medium, aboveBenchmark] = ['#F4C7C3','#FCE8B2','#B7E1CD']; // google sheets
  const missingEl = <div><Nbsp /></div>;
  return (
    <div key={[grade, benchmarkAssessmentKey].join('-')} style={styles.cell}>
      {thresholds && thresholds.benchmark !== undefined ? <div style={{backgroundColor: aboveBenchmark}}>{thresholds.benchmark}</div> : missingEl}
      {midHigh && midLow ? <div style={{color: '#666', backgroundColor: medium}}>{midLow}..{midHigh}</div> : missingEl}
      {thresholds && thresholds.risk !== undefined ? <div style={{backgroundColor: belowRisk}}>{thresholds.risk}</div> : missingEl}
    </div>
  );
}