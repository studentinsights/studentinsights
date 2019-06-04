import React from 'react';
import DibelsMegaChart from './DibelsMegaChart';
import {prettyDibelsText} from '../reading/readingData';

export default function DibelsDialog(props) {
  const {benchmarkAssessmentKey, currentSchoolYear, dataPointsByAssessmentKey, currentGrade} = props;
  const labelText = prettyDibelsText(benchmarkAssessmentKey);
  const benchmarkDataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey];
  return (
    <div style={{display: 'flex', flexDirection: 'column', marginBottom: 15}}>
      <div style={{fontSize: 12, marginBottom: 2, textAlign: 'left'}}>{labelText}</div>
      {/*<SliderChart
        risk={thresholds.risk}
        benchmark={thresholds.benchmark}
        range={{
          [DIBELS_FSF_WPM]: [0, 100],
          [DIBELS_LNF_WPM]: [0, 100],
          [DIBELS_PSF_WPM]: [0, 100],
          [DIBELS_NWF_CLS]: [0, 200]
        }[benchmarkAssessmentKey]}
        values={benchmarkDataPoints.map(d => d.json.data_point)}
        height={100}
      />*/}
      <DibelsMegaChart
        currentGrade={currentGrade}
        benchmarkDataPoints={benchmarkDataPoints}
        currentSchoolYear={currentSchoolYear}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
      />
    </div>
  );
}