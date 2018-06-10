import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import Card from '../components/Card';
import Section from '../components/Section';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// On the home page, show users the answers to their most important questions.
class CheckStudentsWithLowGrades extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudentsWithLowGrades = this.fetchStudentsWithLowGrades.bind(this);
    this.renderStudentsWithLowGrades = this.renderStudentsWithLowGrades.bind(this);
  }

  fetchStudentsWithLowGrades() {
    const {educatorId, limit} = this.props;
    const params = educatorId ? {limit, educator_id: educatorId} : {limit};
    const url = `/api/home/students_with_low_grades_json?${qs.stringify(params)}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CheckStudentsWithLowGrades" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchStudentsWithLowGrades}
          render={this.renderStudentsWithLowGrades} />
      </div>
    );
  }

  renderStudentsWithLowGrades(json) {
    const props = {
      limit: json.limit,
      totalCount: json.total_count,
      studentsWithLowGrades: json.students_with_low_grades
    };
    return <CheckStudentsWithLowGradesView {...props} />;
  }
}
CheckStudentsWithLowGrades.propTypes = {
  educatorId: PropTypes.number.isRequired,
  limit: PropTypes.number // limit the data returned, not the query itself
};
CheckStudentsWithLowGrades.defaultProps = {
  limit: 100
};


// Pure UI component, for showing a high school teacher
// which of their students have low grades but haven't been
// discussed in NGE or 10GE.  The intention is that this list of
// students to check in on is immediately actionable.
export class CheckStudentsWithLowGradesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uiLimit: 4
    };
    this.onMoreStudents = this.onMoreStudents.bind(this);
  }

  onMoreStudents(e) {
    e.preventDefault();
    const {uiLimit} = this.state;
    this.setState({ uiLimit: uiLimit + 4 });
  }

  render() {
    const {studentsWithLowGrades, totalCount} = this.props;
    const {uiLimit} = this.state;
    const truncatedStudentsWithLowGrades = studentsWithLowGrades.slice(0, uiLimit);

    return (
      <div className="CheckStudentsWithLowGrades">
        <div style={styles.cardTitle}>NGE and 10GE students to check in on</div>
        <Card style={{border: 'none'}}>
           <div>There {this.renderAreHowManyStudents(totalCount)} in your classes who have a D or an F right now but no one has mentioned in NGE or 10GE for the last 45 days.</div>
          {this.renderList(truncatedStudentsWithLowGrades)}
          {this.renderMore(truncatedStudentsWithLowGrades)}
        </Card>
      </div>
    );
  }

  renderAreHowManyStudents(totalCount) {
    if (totalCount === 0) return <span>are <b>no students</b></span>;
    if (totalCount === 1) return <span>is <b>one student</b></span>;
    return <span>are <b>{totalCount} students</b></span>;
  }

  renderList(truncatedStudentsWithLowGrades) {
    if (truncatedStudentsWithLowGrades.length === 0) return null;
    return (
      <div style={{paddingTop: 10, paddingBottom: 10}}>
        {truncatedStudentsWithLowGrades.map(studentWithLowGrades => {
          const {student, assignments} = studentWithLowGrades;
          return (
            <div key={student.id} style={styles.line}>
              <span><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></span>
              {this.renderCourseGrades(assignments)}
            </div>
          );
        })}
      </div>
    );
  }

  renderCourseGrades(assignments) {
    return (
      <span>{assignments.map(assignment => {
        const {section} = assignment;
        const hasAnText = (assignment.grade_letter === 'F')
          ? 'has an'
          : 'has a';
        return (
          <span key={assignment.id}>
            <span style={styles.middleText}>{hasAnText} {assignment.grade_letter} in</span>
            <Section
              id={section.id}
              courseDescription={section.course_description}
              sectionNumber={section.section_number} />
          </span>
        );
      })}</span>
    );
  }

  renderMore(truncatedStudentsWithLowGrades) {
    const {totalCount, limit, studentsWithLowGrades} = this.props;

    if (truncatedStudentsWithLowGrades.length !== studentsWithLowGrades.length) {
      return <div><a href="#" onClick={this.onMoreStudents}>See more</a></div>;
    }

    if (studentsWithLowGrades.length < totalCount) {
      return <div>There are {totalCount} students total.  Start with checking in on these first {limit} students.</div>;
    }

    return null;
  }
}

CheckStudentsWithLowGradesView.propTypes = {
  limit: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  studentsWithLowGrades: PropTypes.arrayOf(PropTypes.shape({
    student: PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
      house: PropTypes.string
    }).isRequired,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      grade_letter: PropTypes.string.isRequired,
      grade_numeric: PropTypes.string.isRequired,
      section: PropTypes.shape({
        id: PropTypes.number.isRequired,
        section_number: PropTypes.string.isRequired,
        educators: PropTypes.arrayOf(PropTypes.object).isRequired
      }).isRequired
    }))
  })).isRequired
};


const styles = {
  root: {
    fontSize: 14
  },
  card: {
    margin: 10,
    marginTop: 20,
    border: '1px solid #ccc',
    borderRadius: 3
  },
  cardTitle: {
    backgroundColor: '#eee',
    padding: 10,
    color: 'black',
    borderBottom: '1px solid #ccc'
  },
  person: {
    fontWeight: 'bold'
  },
  line: {
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  middleText: {
    display: 'inline-block',
    paddingLeft: 5,
    paddingRight: 5
  }
};


export default CheckStudentsWithLowGrades;