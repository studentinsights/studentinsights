import React from 'react';
import _ from 'lodash';
import Nbsp from '../components/Nbsp';
import SectionHeading from '../components/SectionHeading';
import {orderedFAndPLevels} from '../reading/readingData';
import {
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH,
  somervilleReadingThresholdsFor
} from '../reading/thresholds';


// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingThresholdsPage extends React.Component {
  render() {
    const SOURCE_CODE_URL = 'https://github.com/studentinsights/studentinsights/blob/master/app/assets/javascripts/reading/thresholds.js';
    const benchmarkAssessmentKeys = [
      DIBELS_FSF,
      DIBELS_LNF,
      DIBELS_PSF,
      DIBELS_NWF_CLS,
      DIBELS_NWF_WWR,
      DIBELS_DORF_WPM,
      DIBELS_DORF_ACC,
      F_AND_P_ENGLISH,
      F_AND_P_SPANISH
    ];
    const periodKeys = [
      ['fall'],
      ['winter'],
      ['spring']
    ];
    const grades = ['KF', '1', '2', '3', '4', '5'];
    const cells = _.flatMap(grades, grade => periodKeys.map(periodKey => [grade, periodKey]));
    return (
      <div className="ReadingThresholdsPage">
        <SectionHeading titleStyle={styles.title}>
          <div>Reading: Thresholds and benchmarks</div>
          <div style={styles.headerLinkContainer}>
            <a style={styles.headerLink} href={SOURCE_CODE_URL} target="_blank" rel="noopener noreferrer">Source code</a>
          </div>
        </SectionHeading>          
        <table style={{margin: 10, fontSize: 12}}>
          <thead>
            <tr>
              <th><Nbsp /></th>
              {cells.map(cell => (
                <th style={{textAlign: 'center', width: 40}} key={cell.join('-')}>
                  <div style={{width: 40}}>{cell[0]}</div>
                  <div style={{width: 40}}>{cell[1]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {benchmarkAssessmentKeys.map(benchmarkAssessmentKey => {          
              return (
                <tr key={benchmarkAssessmentKey}>
                  <td style={{width: 80, paddingRight: 10, paddingBottom: 20, verticalAlign: 'top', marginwhiteSpace: 'normal'}}>
                    {prettyText(benchmarkAssessmentKey)}
                  </td>
                  {cells.map(cell => (
                    <td key={cell.join('-')}>
                      {this.renderCell(cell, benchmarkAssessmentKey)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderCell(cell, benchmarkAssessmentKey) {
    const [grade, benchmarkPeriodKey] = cell;
    const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
    const [midLow, midHigh] = computeMids(thresholds, benchmarkAssessmentKey, grade, benchmarkPeriodKey);
    const [high, medium, low] = ['#F4C7C3','#FCE8B2','#B7E1CD']; // google sheets
    const missingEl = <div><Nbsp /></div>;
    return (
      <div key={cell.join('-')} style={{color: '#666', textAlign: 'center', height: 80}}>
        {thresholds && thresholds.benchmark !== undefined ? <div style={{backgroundColor: high}}>{thresholds.benchmark}</div> : missingEl}
        {midHigh ? <div style={{backgroundColor: medium}}>{midHigh}</div> : missingEl}
        {midLow ? <div style={{backgroundColor: medium}}>{midLow}</div> : missingEl}
        {thresholds && thresholds.risk !== undefined ? <div style={{backgroundColor: low}}>{thresholds.risk}</div> : missingEl}
      </div>
    );
  }
}

function computeMids(thresholds, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  if (!thresholds) return [null, null];
  if (thresholds.risk === undefined || thresholds.benchmark === undefined) return [null, null];  

  if ([F_AND_P_ENGLISH, F_AND_P_SPANISH].indexOf(benchmarkAssessmentKey) !== -1) {
    const levels = orderedFAndPLevels();
    return [
      levels[levels.indexOf(thresholds.risk) + 1],
      levels[levels.indexOf(thresholds.benchmark) - 1]
    ];
  }

  return [
    thresholds.risk + 1,
    thresholds.benchmark - 1
  ];
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
  }
};

function prettyText(benchmarkAssessmentKey) {
  return {
    [F_AND_P_ENGLISH]: 'F&P English',
    [F_AND_P_SPANISH]: 'F&P Spanish',
    [DIBELS_FSF]: 'FSF, First sound fluency',
    [DIBELS_LNF]: 'LNF, Letter naming fluency',
    [DIBELS_PSF]: 'PSF, Phonemic segmentation fluency',
    [DIBELS_NWF_CLS]: 'NWF-CLS, Nonsense word fluency',
    [DIBELS_NWF_WWR]: 'NWF-WWR, Nonsense word fluency',
    [DIBELS_DORF_WPM]: 'ORF words/minute',
    [DIBELS_DORF_ACC]: 'ORF accuracy',
  }[benchmarkAssessmentKey] || 'Unknown';
}
