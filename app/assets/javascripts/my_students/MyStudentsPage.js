import PropTypes from 'prop-types';
import React from 'react';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';
import {apiFetchJson} from '../helpers/apiFetchJson';


const styles = {
  table: {
    borderCollapse: 'collapse',
    margin: 10,
    tableLayout: 'fixed',
    width: '90%',
    border: '1px solid #eee'
  },
  cell: {
    padding: 5,
    textAlign: 'left'
  }
};


export default class MyStudentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  fetchStudents() {
    const url = `/api/educators/my_students_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="MyStudentsPage">
        <GenericLoader
          promiseFn={this.fetchStudents}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const {students} = json;
    return <MyStudentsPageView students={students} />;
  }
}

export class MyStudentsPageView extends React.Component {
  render() {
    const {students} = this.props;

    return (
      <div>
        <SectionHeading>My students</SectionHeading>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>Name</th>
              <th style={styles.cell}>School</th>
              <th style={styles.cell}>Grade</th>
              <th style={styles.cell}>House</th>
              <th style={styles.cell}>Counselor</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              return (
                <tr key={student.id}>
                  <td style={styles.cell}>
                    <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank">{student.first_name} {student.last_name}</a>
                  </td>
                  <td style={styles.cell}><School {...student.school} /></td>
                  <td style={styles.cell}>{student.grade}</td>
                  <td style={styles.cell}>{student.house}</td>
                  <td style={styles.cell}>{student.counselor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
MyStudentsPageView.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    house: PropTypes.string.isRequired,
    counselor: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
  })).isRequired
};
