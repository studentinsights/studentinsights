import React from 'react';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
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
    return apiFetchJson('/admin/api/sample_students_json');
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
    const sampleStudents = json.sample_students;
    const sortedSampleStudents = _.sortBy(sampleStudents, student => {
      return [
        student.school.school_type,
        student.school.name,
        rankedByGradeLevel(student.grade),
        student.last_name,
        student.first_name
      ];
    });
    return (
      <div style={{margin: 10}}>
        <SectionHeading>Sample students</SectionHeading>
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
