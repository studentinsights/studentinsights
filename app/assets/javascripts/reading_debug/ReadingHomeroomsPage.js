import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import Educator from '../components/Educator';
import {shortDibelsText} from '../reading/readingData';
import tableStyles from '../components/tableStyles';
import {INSTRUCTIONAL_NEEDS} from '../reading/thresholds';


// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingHomeroomsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }


  fetchJson() {
    return apiFetchJson('/api/reading_debug/reading_by_homerooms_json');
  }

  render() {
    return (
      <div className="ReadingHomeroomsPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <SectionHeading titleStyle={styles.title}>
          Reading: Current period by homeroom
        </SectionHeading>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    return <ReadingHomeroomsView homerooms={json.homerooms_json} />;
  }
}


export class ReadingHomeroomsView extends React.Component {
  render() {
    const {homerooms} = this.props;

    // show instructional needs last
    const benchmarkAssessmentKeys = _.uniq(_.flatMap(homerooms, homeroom => Object.keys(homeroom.counts))).filter(key => key !== INSTRUCTIONAL_NEEDS).concat([INSTRUCTIONAL_NEEDS]);

    return (
      <div className="ReadingHomeroomsView">
        <div style={{margin: 20, fontSize: 14}}>This shows the number of students that {`don't`} yet have benchmark assessment data in the current period.  This is broken down by grade level and homeroom to make it easier to debug issues with the import process.  {`"Instructional needs"`} is shown differently, and instead shows the number of students with specific needs noted.</div>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.headerCell}>School</th>
              <th style={tableStyles.headerCell}>Grades</th>
              <th style={tableStyles.headerCell}>Educator</th>
              <th style={tableStyles.headerCell}>Students</th>
              {benchmarkAssessmentKeys.map(benchmarkAssessmentKey => (
                <th key={benchmarkAssessmentKey} style={tableStyles.headerCell}>
                  {shortDibelsText(benchmarkAssessmentKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {homerooms.map(homeroom => {
              return (
                <tr key={homeroom.id}>
                  <td style={tableStyles.cell}>{homeroom.school.local_id}</td>
                  <td style={tableStyles.cell}>{homeroom.grades.join(' ')}</td>
                  <td style={tableStyles.cell}>{homeroom.educator ? <Educator educator={homeroom.educator} /> : 'unknown'}</td>
                  <td style={tableStyles.cell}>{homeroom.total} students</td>
                  {benchmarkAssessmentKeys.map(benchmarkAssessmentKey => (
                    <td style={tableStyles.cell} key={benchmarkAssessmentKey}>
                      {this.renderCell(benchmarkAssessmentKey, homeroom)}
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

  renderCell(benchmarkAssessmentKey, homeroom) {
    if (homeroom.total === 0) return null;
    const count = homeroom.counts[benchmarkAssessmentKey];
    if (count === undefined) return null;

    if (benchmarkAssessmentKey === INSTRUCTIONAL_NEEDS) {
      if (count === 0) return null;
      return <span style={{color: 'green', fontWeight: 'bold'}}>+{count}</span>;
    }

    const notYet = (homeroom.total - count);
    const color = (notYet === 0) ? '#ccc': 'black';
    return <span style={{color}}>{notYet}</span>;
  }
}
ReadingHomeroomsView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ReadingHomeroomsView.propTypes = {
  homerooms: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    grades: PropTypes.array.isRequired,
    educator: PropTypes.object.isRequired,
    school: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
    counts: PropTypes.object.isRequired
  })).isRequired,
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cell: {
    fontWeight: 'bold'
  }
};
