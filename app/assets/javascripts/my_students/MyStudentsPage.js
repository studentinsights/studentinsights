import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {sortByGrade} from '../helpers/SortHelpers';
import {sortSchoolSlugsByGrade} from '../helpers/PerDistrict';


const styles = {
  caption: {
    fontSize: 12,
    margin: 10
  },
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
  },
  bar: {
    borderLeft: '1px solid #aaa',
    height: '100%'
  }
};


export default class MyStudentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderEnrollment = this.renderEnrollment.bind(this);
  }

  fetchStudents() {
    const url = `/api/educators/my_students_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="MyStudentsPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchStudents}
          render={this.renderEnrollment} />
      </div>
    );
  }

  renderEnrollment(json) {
    const {enrollments} = json;
    const districtKey = json.district_key;
    const districtName = json.district_name;
    
    return (
      <MyStudentsPageView
        enrollments={enrollments}
        districtKey={districtKey}
        districtName={districtName} />
    );
  }
}

export class MyStudentsPageView extends React.Component {
  render() {
    const {enrollments, districtKey, districtName} = this.props;

    const grades = _.uniq(enrollments.map(enrollment => enrollment.grade)).sort(sortByGrade);
    const sortedSchools = _.uniq(enrollments.map(enrollment => enrollment.school), 'id').sort((a, b) => {
      const bySchool = sortSchoolSlugsByGrade(districtKey, a.slug, b.slug);
      if (bySchool !== 0) return bySchool;
      return computeStudentCountForSchool(a, enrollments) - computeStudentCountForSchool(b, enrollments);
    });
    const totalCount = enrollments.reduce((count, enrollment) => count + enrollment.enrollment, 0);

    return (
      <div>
        <SectionHeading>Enrollment in {districtName}</SectionHeading>
        <div style={styles.caption}>Different color bars are at different scales.</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>&nbsp;</th>
              {sortedSchools.map(school => {
                return <th key={school.id} style={styles.cell}>
                  <School id={school.id} name={school.slug} />
                </th>;
              })}
              <th style={styles.cell}>Totals</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => {
              const studentCountForGrade = enrollments
                .filter(enrollment => enrollment.grade === grade)
                .reduce((count, enrollment) => count + enrollment.enrollment, 0);
              return (
                <tr key={grade}>
                  <td key="grade" style={styles.cell}>{grade}</td>
                  {sortedSchools.map(school => {
                    const cell = _.find(enrollments, enrollment => {
                      return enrollment.grade === grade && enrollment.school.id == school.id;
                    });
                    const studentCount = (cell === undefined)
                      ? 0
                      : cell.enrollment;
                    return (
                      <td key={school.id} style={styles.cell}>
                        {this.renderBar(studentCount)}
                      </td>
                    );
                  })}
                  <td key="totals" style={styles.cell}>
                    {this.renderBar(studentCountForGrade, { scaleFactor: 0.1, backgroundColor: '#ffe78e' })}
                  </td>
                </tr>
              );
            })}
            <tr key="totals">
              <td style={styles.cell}>Totals</td>
              {sortedSchools.map(school => {
                const studentCountForSchool = computeStudentCountForSchool(school, enrollments);
                return (
                  <td key={school.id} style={styles.cell}>
                    {this.renderBar(studentCountForSchool, { scaleFactor: 0.05, backgroundColor: 'rgb(255, 173, 142)' })}
                  </td>
                );
              })}
              <td style={styles.cell}>{totalCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Render a horizontal bar.
  renderBar(studentCount, options = {}) {
    const scaleFactor = options.scaleFactor || 0.5;
    const percentage = (studentCount === 0)
        ? 0
        : studentCount * scaleFactor;
    const width = (percentage > 100)
      ? '100%'
      : percentage + '%';
    const padding = percentage === 0 ? 0 : 3;
    const backgroundColor = options.backgroundColor || (percentage > 100 ? '#666' : '#ccc');
    const color = percentage > 100 ? 'white' : 'black';
    const text = percentage === 0 ? '\u00A0' : studentCount;

    return <div style={{...styles.bar, padding, width, color, backgroundColor}}>{text}</div>;
  }
}
MyStudentsPageView.propTypes = {
  districtKey: PropTypes.string.isRequired,
  districtName: PropTypes.string.isRequired,
  enrollments: PropTypes.arrayOf(PropTypes.shape({
    enrollment: PropTypes.number.isRequired,
    grade: PropTypes.string.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
  })).isRequired
};
