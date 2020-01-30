import React from 'react';
import PropTypes from 'prop-types';
import HelpBubble from '../components/HelpBubble';
import {adjustedGrade} from '../helpers/gradeText';
import ReadingScheduleGrid from '../reading/ReadingScheduleGrid';
import {boxStyle} from './colors';

export default class DebugReadingScheduleGrid extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {readerJson, gradeNow} = this.props;
    return (
      <HelpBubble
        linkStyle={{color: '#ccc', padding: 10}}
        title="Debug Reading Schedule Grid"
        content={<ReadingScheduleGrid renderCellFn={(...params) => renderCellFn(readerJson, gradeNow, nowFn(), ...params)} />}
        teaser='history'
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


export function renderCellFn(readerJson, gradeNow, nowMoment, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const dataPoints = readerJson.benchmark_data_points || [];
  return (
    <div key={[grade, benchmarkAssessmentKey].join('-')} style={{color: '#666', textAlign: 'center', height: 80}}>
      {dataPoints.map((d, index) => {
        if (d.benchmark_assessment_key !== benchmarkAssessmentKey) return null;
        if (d.benchmark_period_key !== benchmarkPeriodKey) return null;
        const gradeThen = adjustedGrade(d.benchmark_school_year, gradeNow, nowMoment);
        if (gradeThen !== grade) return null;
        const style = boxStyle(d, gradeThen, styles.box);
        return <div key={index} style={style}>{d.json.value}</div>;
      })}
    </div>
  );
}

const styles = {
  box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2em',
    height: '2em',
    cursor: 'default'
  }
};
