import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import School from '../components/School';
import Section from '../components/Section';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {toMomentFromTime} from '../helpers/toMoment';

/*
Showing info about courses offered at a school.
*/
class SchoolCoursesPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchCourses = this.fetchCourses.bind(this);
    this.renderCourses = this.renderCourses.bind(this);
  }

  fetchCourses() {
    const {schoolId} = this.props;
    const url = `/api/schools/${schoolId}/courses`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SchoolCoursesPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchCourses}
          render={this.renderCourses} />
      </div>
    );
  }

  renderCourses(json) {
    const {courses, school} = json;
    const {nowFn} = this.context;
    const now = nowFn();

    const sortedCourses = _.sortBy(courses, course => course.course_number);
    return (
      <div style={styles.rendered}>
        <SectionHeading>
          Courses at <School id={school.id} name={school.name} style={{fontSize: 24, fontWeight: 300}}/>
        </SectionHeading>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>Course</th>
              <th style={styles.cell}>Sections</th>
              <th style={styles.cell}>Total students</th>
              <th style={styles.cell}>Student<br />grade range</th>
              <th style={styles.cell}>Student<br />age range</th>
            </tr>
          </thead>
          <tbody>{sortedCourses.map(course => {
            const students = _.flatten(course.sections.map(s => s.students));
            const grades = _.sortBy(_.uniq(students.map(s => s.grade)));
            const ages =  _.sortBy(_.uniq(students.map(s => toMomentFromTime(s.date_of_birth).unix())).map(unix => {
              const birthdate = moment.unix(unix).utc();
              return now.clone().diff(birthdate, 'year');
            }));
            return (
              <tr key={course.id}>
                <td style={styles.cell}>{course.course_number} {course.course_description}</td>
                <td style={styles.cell}>{_.sortBy(course.sections, s => s.section_number).map(section =>
                  <Section
                    key={section.id}
                    id={section.id}
                    domain="https://somerville.studentinsights.org"
                    style={{display: 'block'}}
                    sectionNumber={section.section_number}
                    courseDescription={course.course_description} />
                )}</td>
                <td style={styles.cell}>{students.length}</td>
                <td style={styles.cell}>{grades.length > 1
                    ? <span>{_.first(grades)} - {_.last(grades)}</span>
                    : grades[0]}</td>
                <td style={styles.cell}>{_.first(ages)} - {_.last(ages)}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  }
}
SchoolCoursesPage.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
SchoolCoursesPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};


const styles = {
  rendered: {
    padding: 10
  },
  table: {
    margin: 10
  },
  cell: {
    textAlign: 'left',
    verticalAlign: 'top',
    padding: 5
  },
  raw: {
    fontFamily: 'monospace',
    fontSize: 10,
    padding: 10
  }
};


export default SchoolCoursesPage;