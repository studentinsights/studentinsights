import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Nbsp from '../components/Nbsp';
import {prettyDibelsText} from '../reading/readingData';
import {benchmarkPeriodKeyFor} from '../reading/readingData';
import {
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH
} from '../reading/thresholds';


export default class ReadingScheduleGrid extends React.Component {
  cellForNow() {
    const {gradeNow} = this.props;
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const benchmarkPeriodKeyNow = benchmarkPeriodKeyFor(nowMoment);
    return [gradeNow, benchmarkPeriodKeyNow];
  }

  render() {
    const {benchmarkAssessmentKeys, grades, benchmarkPeriodKeys} = gridParams();
    const cells = _.flatMap(grades, grade => benchmarkPeriodKeys.map(periodKey => [grade, periodKey]));

    // highlight where student is now
    const cellForNow = this.cellForNow();
    return (
      <div className="ReadingScheduleGrid">
        <table style={styles.table}>
          <thead>
            <tr>
              <th><Nbsp /></th>
              {cells.map(cell => {
                const nowStyle = (_.isEqual(cell, cellForNow))
                  ? {...styles.nowCellStyle, borderTop: styles.nowCellStyle.borderLeft}
                  : null;
                return (
                  <th style={{...styles.headerCell, ...nowStyle}} key={cell.join('-')}>
                    <div style={{width: 40}}>{cell[0]}</div>
                    <div style={{width: 40}}>{cell[1]}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {benchmarkAssessmentKeys.map((benchmarkAssessmentKey, rowIndex) => {          
              return (
                <tr key={benchmarkAssessmentKey} style={styles.row}>
                  <td style={styles.labelCell}>
                    {prettyDibelsText(benchmarkAssessmentKey)}
                  </td>
                  {cells.map(cell => {
                    const nowStyle = (_.isEqual(cell, cellForNow)) ? styles.nowCellStyle : null;
                    const nowStyleWithBorder = (nowStyle && rowIndex === benchmarkAssessmentKeys.length - 1)
                      ? {...nowStyle, borderBottom: nowStyle.borderLeft}
                      : nowStyle;
                    return (
                      <td key={cell.join('-')} style={{...styles.cell, ...nowStyleWithBorder}}>
                        {this.renderCell(cell, benchmarkAssessmentKey)}
                      </td>
                    );
                  })}
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
    const {renderCellFn} = this.props;
    return renderCellFn(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  }
}
ReadingScheduleGrid.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  renderCellFn: PropTypes.func.isRequired
};
ReadingScheduleGrid.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const styles = {
  table: {
    margin: 10,
    fontSize: 12,
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerCell: {
    textAlign: 'center',
    width: 40
  },
  labelCell: {
    width: 80,
    whiteSpace: 'normal',
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    verticalAlign: 'top',
    marginwhiteSpace: 'normal'
  },
  cell: {
    paddingTop: 10,
    paddingBottom: 10
  },
  row: {
    borderTop: '1px solid #ccc',
    paddingBottom: 10,
    paddingTop: 10
  },
  nowCellStyle: {
    background: '#f8f8f8',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc'
  }
};


export function gridParams() {
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
  const benchmarkPeriodKeys = [
    'fall',
    'winter',
    'spring'
  ];
  const grades = ['KF', '1', '2', '3', '4', '5'];
  return {benchmarkAssessmentKeys, benchmarkPeriodKeys, grades};
}