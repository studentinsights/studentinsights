import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {high, medium, low} from '../helpers/colors';
import GenericLoader from '../components/GenericLoader';
import tableStyles from '../components/tableStyles';
import {
  DIBELS_FSF_WPM,
  DIBELS_PSF_WPM,
  DIBELS_LNF_WPM,
  DIBELS_NWF_CLS,
  prettyDibelsText
} from '../reading/readingData';


export default class ReaderProfile extends React.Component {
  render() {
    const {student} = this.props;
    const {id} = student;
    return (
      <div className="ReaderProfile">
        <GenericLoader
          promiseFn={() => apiFetchJson(`/api/students/${id}/reader_profile_json`)}
          render={json => this.renderJson(json)} />
      </div>
    );
  }

  renderJson(json) {
    const benchmarkDataPoints = json.benchmark_data_points;
    const grade = json.grade;
    const currentSchoolYear = json.current_school_year;
    const dataPointsByAssessmentKey = _.groupBy(benchmarkDataPoints, 'benchmark_assessment_key');
  //   return (
  //     <div>
  //       {_.entries(dataPointsByAssessmentKey).map(([benchmarkAssessmentKey, dataPoints]) => {
  //         return (
  //           <div key={benchmarkAssessmentKey}>
  //             <h3>{prettyDibelsText(benchmarkAssessmentKey)}</h3>
  //             <div>{dataPoints.map(dataPoint => {
  //               const dataPointMoment = toMoment(currentSchoolYear, dataPoint.benchmark_period_key);
  //               return (
  //                 <div key={dataPointMoment.format('YYYYMMDD')}>{dataPointMoment.format('M/D/YY')}</div>
  //               );
  //             })}</div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }
    return this.renderTable(grade, currentSchoolYear, dataPointsByAssessmentKey);
  }

  renderTable(grade, currentSchoolYear, dataPointsByAssessmentKey) {
    const backgroundColor = 'rgb(244, 204, 204)';
    const borderRight = '5px solid #ccc';
    const cell = {
      ...tableStyles.cell,
      whiteSpace: 'normal',
      backgroundColor,
      border: 0,
      textAlign: 'center',
      verticalAlign: 'center'
    };
    const headerCell = {
      ...tableStyles.headerCell,
      width: 150,
      border: 0
    };
    const chartSizing = {
      width: 300
    };
    const tableStyle = {
      ...tableStyles.table,
      backgroundColor
    };

    return (
      <table className="ReadingCurriculumView" style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCell}>Ingredient</th>
            <th style={{...headerCell, borderRight}}>Curriculum</th>
            <th style={headerCell}>Tier 2</th>
            <th style={{...headerCell, borderRight}}>Tier 3</th>
            <th style={{...headerCell, ...chartSizing}}>Screeners</th>
            <th style={headerCell}>Evaluations</th>
            {/*<th style={headerCell}>IEPs</th>
            <th style={headerCell}>English</th>
            <th style={headerCell}>MTSS</th>*/}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cell}>Word parts</td>
            <td style={{...cell, borderRight}}>SPS Phonological Awareness</td>
            <td style={cell}>PA in small group, second time</td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_FSF_WPM, currentSchoolYear, dataPointsByAssessmentKey)}
              {this.renderDibels(DIBELS_PSF_WPM, currentSchoolYear, dataPointsByAssessmentKey)}
            </td>
            <td style={cell}>CTOPP</td>
          </tr>
          <tr>
            <td style={cell}>Letter Names</td>
            <td style={{...cell, borderRight}}>Fundations</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}>Lively Letters</td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_LNF_WPM, currentSchoolYear, dataPointsByAssessmentKey)}
            </td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>Letter Sounds</td>
            <td style={{...cell, borderRight}}>Fundations</td>
            <td style={cell}>ERI in small group</td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_NWF_CLS, currentSchoolYear, dataPointsByAssessmentKey)}
            </td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>Tapping and Blending Written Words</td>
            <td style={{...cell, borderRight}}>Fundations</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>Sight Words</td>
            <td style={{...cell, borderRight}}>Fundations</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>How texts work</td>
            <td style={{...cell, borderRight}}>Readers Workshop</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}>Heggerty</td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>Left to Right</td>
            <td style={{...cell, borderRight}}>Readers Workshop</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
          </tr>
          <tr>
            <td style={cell}>Independent Reading</td>
            <td style={{...cell, borderRight}}>Readers Workshop</td>
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              <div>F&P</div>
              <div>Independent reading</div>
            </td>
            <td style={cell}></td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderDibels(benchmarkAssessmentKey, currentSchoolYear, dataPointsByAssessmentKey) {
    const labelText = prettyDibelsText(benchmarkAssessmentKey);
    const benchmarkDataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey];
    return (
      <div style={{display: 'flex', flexDirection: 'column', marginBottom: 10}}>
        <div style={{fontWeight: 'bold', marginBottom: 2}}>{labelText}</div>
        <div>{benchmarkDataPoints.map(dataPoint => {
          const dataPointMoment = toMoment(currentSchoolYear, dataPoint.benchmark_period_key);
          return (
            <div key={dataPointMoment.format('YYYYMMDD')}>{dataPointMoment.format('M/D/YY')}</div>
          );
        })}</div>
      </div>
    );
  }

}

ReaderProfile.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};


function toMoment(currentSchoolYear, benchmarkPeriodKey) {
  const monthText = {
    fall: '0901',
    winter: '0101',
    spring: '0501'
  }[benchmarkPeriodKey];
  const yearOffset = {
    fall: 0,
    winter: 1,
    spring: 1
  }[benchmarkPeriodKey];
  const year = currentSchoolYear + yearOffset;
  return moment.utc(`${year}${monthText}`, 'YYYYMMDD', true);
}