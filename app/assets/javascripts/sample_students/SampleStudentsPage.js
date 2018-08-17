import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import qs from 'querystring';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedBySchoolType, rankedByGradeLevel} from '../helpers/SortHelpers';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import tableStyles from '../components/tableStyles';

// Developer and admin page, showing how a sample of students for
// spot-checking different profile changes.
export default class SampleStudentsPage extends React.Component {

  constructor(props) {
    super(props);

    this.fetch = this.fetch.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  fetch() {
    const {n, seed} = this.props;
    const queryString = qs.stringify({n, seed});
    return apiFetchJson(`/admin/api/sample_students_json?${queryString}`);
  }

  render() {
    return (
      <div className="SampleStudentsPage">
        <GenericLoader
          promiseFn={this.fetch}
          render={this.renderPage} />
      </div>
    );
  }

  renderPage(json) {
    const {seed, n} = this.props;

    return (
      <SampleStudentsPageView
        n={n}
        seed={seed}
        sampleStudents={json.sample_students} />
    );
  }
}
SampleStudentsPage.propTypes = {
  n: PropTypes.number.isRequired,
  seed: PropTypes.number.isRequired
};

export class SampleStudentsPageView extends React.Component {
  render() {
    const {sampleStudents, seed, n} = this.props;
    const sortedSampleStudents = _.sortBy(sampleStudents, student => {
      return [
        rankedBySchoolType(student.school.school_type),
        student.school.name,
        rankedByGradeLevel(student.grade),
        student.last_name,
        student.first_name
      ];
    });
    return (
      <div style={{margin: 10}}>
        <SectionHeading>Student sample for data quality checks</SectionHeading>
        <div style={{margin: 15, fontSize: 10}}>seed={seed} n={n}</div>
        {this.renderTable(sortedSampleStudents)}
      </div>
    );
  }

  renderTable(sampleStudents) {
    if (sampleStudents.length === 0) {
      return <div>No students.</div>;
    }

    return (
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Name</th>
            <th style={tableStyles.headerCell}>Grade</th>
            <th style={tableStyles.headerCell}>School</th>
            <th style={tableStyles.headerCell}>profile</th>
            <th style={tableStyles.headerCell}>v3</th>
          </tr>
        </thead>
        <tbody>
          {sampleStudents.map(student => (
            <tr key={student.id}>
              <td style={tableStyles.cell}>{student.first_name} {student.last_name}</td>
              <td style={tableStyles.cell}>{student.grade}</td>
              <td style={tableStyles.cell}>{student.school.name}</td>
              <td style={tableStyles.cell}><a target="_blank" href={`/students/${student.id}`}>{`/students/${student.id}`}</a></td>
              <td style={tableStyles.cell}><a target="_blank" href={`/students/${student.id}/v3`}>{`/students/${student.id}/v3`}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
SampleStudentsPageView.propTypes = {
  n: PropTypes.number.isRequired,
  seed: PropTypes.number.isRequired,
  sampleStudents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      school_type: PropTypes.string.isRequired
    }).isRequired,
  })).isRequired
};
