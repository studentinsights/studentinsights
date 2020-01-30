import React from 'react';
import PropTypes from 'prop-types';
import HelpBubble from '../components/HelpBubble';
import {adjustedGrade} from '../helpers/gradeText';
import ReadingScheduleGrid from '../reading/ReadingScheduleGrid';


export default class DebugReadingScheduleGrid extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {readerJson, gradeNow} = this.props;
    return (
      <HelpBubble
        linkStyle={{color: '#ccc', padding: 10}}
        title="Debug Reading Schedule Grid"
        content={<ReadingScheduleGrid renderCellFn={(...params) => renderCellFn(readerJson, gradeNow, nowFn(), ...params)} />}
        teaser='debug'
      />
    );
  }
}
DebugReadingScheduleGrid.propTypes = {
  readerJson: PropTypes.object.isRequired,
  gradeNow: PropTypes.string.isRequired
};
DebugReadingScheduleGrid.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


function renderCellFn(readerJson, gradeNow, nowMoment, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const dataPoints = (readerJson.benchmark_data_points || []).filter(d => {
    if (d.benchmark_assessment_key !== benchmarkAssessmentKey) return false;
    if (d.benchmark_period_key !== benchmarkPeriodKey) return false;
    const gradeThen = adjustedGrade(d.benchmark_school_year, gradeNow, nowMoment);
    if (gradeThen !== grade) return false;
    return true;
  });

  return (
    <div key={[grade, benchmarkAssessmentKey].join('-')} style={{color: '#666', textAlign: 'center', height: 80}}>
      {dataPoints.map((d, index) => <div key={index} style={{margin: 10}}>{d.json.value}</div>)}
    </div>
  );
}
