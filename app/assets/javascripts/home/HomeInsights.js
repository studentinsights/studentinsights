import React from 'react';
import qs from 'query-string';
import Card from '../components/Card';
import Section from '../components/Section';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// On the home page, show users the answers to their most important questions.
class HomeInsights extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudentsWithLowGrades = this.fetchStudentsWithLowGrades.bind(this);
    this.renderStudentsWithLowGrades = this.renderStudentsWithLowGrades.bind(this);
  }

  fetchStudentsWithLowGrades() {
    const {educatorId, limit} = this.props;
    const params = educatorId ? {limit, educator_id: educatorId} : {limit};
    const url = `/home/students_with_low_grades_json?${qs.stringify(params)}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="HomeInsights" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchStudentsWithLowGrades}
          render={this.renderStudentsWithLowGrades} />
        {this.renderPlaceholder()}
      </div>
    );
  }

  renderStudentsWithLowGrades(json) {
    const props = {
      limit: json.limit,
      totalCount: json.total_count,
      studentsWithLowGrades: json.students_with_low_grades
    };
    return <CheckStudentWithLowGradesView {...props} />;
  }

  renderPlaceholder() {
    return (
      <Card style={styles.card}>
        <div style={styles.placeholderCard}>
          <div>What else would help you support your students?</div>
          <div>Come talk with us about what we should build next!</div>
        </div>
      </Card>
    );
  }
}
HomeInsights.propTypes = {
  educatorId: React.PropTypes.number.isRequired,
  limit: React.PropTypes.number // limit the data returned, not the query itself
};
HomeInsights.defaultProps = {
  limit: 100
};


// Pure UI component, for showing a high school teacher
// which of their students have low grades but haven't been
// discussed in NGE or 10GE.  The intention is that this list of
// students to check in on is immediately actionable.
export class CheckStudentWithLowGradesView extends React.Component {
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
      <div className="CheckStudentWithLowGrades">
        <div style={styles.cardTitle}>NGE and 10GE students to check in on</div>
        <Card style={{border: 'none'}}>
          <div>There are <b>{totalCount} students</b> in your classes who have a D or an F right now but no one has mentioned in NGE or 10GE for the last month.</div>
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
          {this.renderMore(truncatedStudentsWithLowGrades)}
        </Card>
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

CheckStudentWithLowGradesView.propTypes = {
  limit: React.PropTypes.number.isRequired,
  totalCount: React.PropTypes.number.isRequired,
  studentsWithLowGrades: React.PropTypes.arrayOf(React.PropTypes.shape({
    student: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      first_name: React.PropTypes.string.isRequired,
      last_name: React.PropTypes.string.isRequired,
      grade: React.PropTypes.string.isRequired,
      house: React.PropTypes.string
    }).isRequired,
    assignments: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      grade_letter: React.PropTypes.string.isRequired,
      grade_numeric: React.PropTypes.string.isRequired,
      section: React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        section_number: React.PropTypes.string.isRequired,
        educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
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
  placeholderCard: {
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


export default HomeInsights;