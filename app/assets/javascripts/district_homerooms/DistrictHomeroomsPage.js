import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {shortSchoolName} from '../helpers/PerDistrict';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {sortByGrade} from '../helpers/SortHelpers';
import {sortSchoolSlugsByGrade} from '../helpers/PerDistrict';


// Show homerooms at each grade level
export default function DistrictHomeroomsPage(props) {
  const url = '/api/district/homerooms_json';
  return (
    <div className="DistrictHomeroomsPage">
      <ExperimentalBanner />
      <GenericLoader
        promiseFn={() => apiFetchJson(url)}
        render={json => (
          <DistrictHomeroomsView
            districtName={json.district_name}
            students={json.students}
          />
        )}
      />
    </div>
  );
}

export class DistrictHomeroomsView extends React.Component {
  render() {
    const {districtKey} = this.context;
    const {students, districtName} = this.props;

    const grades = _.uniq(students.map(student => student.grade)).sort(sortByGrade);
    const sortedSchools = _.uniqBy(students.map(student => student.school), 'id').sort((a, b) => {
      const bySchool = sortSchoolSlugsByGrade(districtKey, a.slug, b.slug);
      if (bySchool !== 0) return bySchool;
      return computeStudentCountForSchool(a, students) - computeStudentCountForSchool(b, students);
    });
    // const totalCount = enrollments.reduce((count, enrollment) => count + enrollment.enrollment, 0);

    return (
      <div>
        <SectionHeading>Classrooms in {districtName}</SectionHeading>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>&nbsp;</th>
              {sortedSchools.map(school => {
                return <th key={school.id} style={styles.cell}>
                  <School id={school.id} name={shortSchoolName(districtKey, school.local_id)} />
                </th>;
              })}
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => {
              // const studentCountForGrade = students.filter(student => student.grade === grade);
              return (
                <tr key={grade}>
                  <td key="grade" style={styles.cell}>{grade}</td>
                  {sortedSchools.map(school => {
                    const studentsInGradeAtSchool = students
                      .filter(student => student.school.id === school.id)
                      .filter(student => student.grade === grade);
                    const homerooms = _.uniqBy(_.compact(studentsInGradeAtSchool.map(student => student.homeroom)), 'id');
                    return (
                      <td key={school.id} style={{...styles.cell, verticalAlign: 'top'}}>
                        <div>
                          {homerooms.map(homeroom => {
                            const studentsInHomeroom = studentsInGradeAtSchool.filter(student => student.homeroom && student.homeroom.id === homeroom.id);
                            return (
                              <a
                                key={homeroom.id}
                                style={{display: 'block'}}
                                title={JSON.stringify(studentsInHomeroom, null, 2)}
                                href={`/homerooms/${homeroom.id}`}>{studentsInHomeroom.length}: {homeroom.educator ? homeroom.educator.full_name : homeroom.name}</a>
                            );
                          })}
                        </div>
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
DistrictHomeroomsView.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
DistrictHomeroomsView.propTypes = {
  districtName: PropTypes.string.isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    house: PropTypes.string,
    counselor: PropTypes.string,
    grade: PropTypes.string.isRequired,
    has_photo: PropTypes.bool.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      local_id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    }).isRequired,
    homeroom: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      educator: PropTypes.shape({
        id: PropTypes.number.isRequired,
        email: PropTypes.string.isRequired,
        full_name: PropTypes.string.isRequired
      })
    })
  })).isRequired
};


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
    textAlign: 'left',
    border: '1px solid #eee',
    overflow: 'hidden'
  },
  bar: {
    borderLeft: '1px solid #aaa',
    height: '100%'
  }
};


function computeStudentCountForSchool(school, students) {
  return students.filter(student => student.school.id === school.id).length;
}
