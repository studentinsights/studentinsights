import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Nbsp from '../components/Nbsp';
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
  prettyText
} from '../reading/thresholds';


export default class ReadingScheduleGrid extends React.Component {
  render() {
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
      'fall',
      'winter',
      'spring'
    ];
    const grades = ['KF', '1', '2', '3', '4', '5'];
    const cells = _.flatMap(grades, grade => periodKeys.map(periodKey => [grade, periodKey]));

    return (
      <div className="ReadingScheduleGrid">
        <table style={{margin: 10, fontSize: 12, width: '100%'}}>
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
    const {renderCellFn} = this.props;
    return renderCellFn(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  }
}
ReadingScheduleGrid.propTypes = {
  renderCellFn: PropTypes.func.isRequired
};


