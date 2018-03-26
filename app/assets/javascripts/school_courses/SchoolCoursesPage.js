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
    return <SchoolCoursesPagePure courses={courses} school={school} />;
  }
}
SchoolCoursesPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};


export class SchoolCoursesPagePure extends React.Component {
  render() {
    const {courses, school} = this.props;
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
              <th style={{...styles.cell, ...styles.headerCell}}>Course</th>
              <th style={{...styles.cell, ...styles.headerCell}}>Sections</th>
              <th style={{...styles.cell, ...styles.headerCell}}>Total students</th>
              <th style={{...styles.cell, ...styles.headerCell}}>Grade levels</th>
              <th style={{...styles.cell, ...styles.headerCell}}>Ages</th>
              <th style={{...styles.cell, ...styles.headerCell}}>Schools</th>
            </tr>
          </thead>
          <tbody>{sortedCourses.map(course => {
            const rightAlignStyle = {...styles.cell, textAlign: 'right'};
            const students = _.flatten(course.sections.map(s => s.students));
            const grades = _.sortBy(_.uniq(students.map(s => parseInt(s.grade, 10))));
            const ages =  _.sortBy(_.uniq(students.map(s => toMomentFromTime(s.date_of_birth).unix())).map(unix => {
              const birthdate = moment.unix(unix).utc();
              return now.clone().diff(birthdate, 'year');
            }));
            const schools = _.sortBy(_.uniq(_.flatten(students.map(s => s.school)), 'id'), 'name');
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
                <td style={rightAlignStyle}>{students.length}</td>
                <td style={rightAlignStyle}>{grades.length > 1
                    ? <span>{_.first(grades)} - {_.last(grades)}</span>
                    : grades[0]}</td>
                <td style={rightAlignStyle}>{_.first(ages)} - {_.last(ages)}</td>
                <td style={styles.cell}>{schools.map(school =>
                  <School
                    key={school.id}
                    id={school.id}
                    name={school.name}
                    style={{display: 'block'}} />
                )}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  }
}
SchoolCoursesPagePure.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
SchoolCoursesPagePure.propTypes = {
  courses: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    course_number: React.PropTypes.string.isRequired,
    course_description: React.PropTypes.string.isRequired,
    sections: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      section_number: React.PropTypes.string.isRequired,
      students: React.PropTypes.arrayOf(React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        grade: React.PropTypes.string.isRequired,
        date_of_birth: React.PropTypes.string.isRequired,
        school: React.PropTypes.shape({
          id: React.PropTypes.number.isRequired,
          name: React.PropTypes.string.isRequired
        }).isRequired
      })).isRequired
    })).isRequired
  })).isRequired,
  school: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired
  }).isRequired
};


const styles = {
  rendered: {
    padding: 10
  },
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    border: '1px solid #eee'
  },
  cell: {
    textAlign: 'left',
    verticalAlign: 'top',
    padding: 10,
    border: '1px solid #eee'
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#ccc'
  },
  raw: {
    fontFamily: 'monospace',
    fontSize: 10,
    padding: 10
  }
};


export default SchoolCoursesPage;