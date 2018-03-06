import React from 'react';
import Card from '../components/Card';
import Educator from '../components/Educator';
import GenericLoader from '../components/GenericLoader';


// On the home page, show users the answers to their most important questions.
class HomeInsights extends React.Component {
  constructor(props) {
    super(props);
    this.renderAssignments = this.renderAssignments.bind(this);
  }

  fetchAssignments() {
    return fetch('/home/unsupported_low_grades_json', { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.assignments);
  }

  render() {
    return (
      <div className="HomeInsights" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchAssignments}
          render={this.renderAssignments} />
        {this.renderPlaceholder()}
      </div>
    );
  }

  renderAssignments(assignments) {
    return <UnsupportedStudentsPure assignments={assignments} />;
  }

  renderPlaceholder() {
    return (
      <Card style={styles.card}>
        <div style={styles.placeholderCard}>
          <div>What else would help you be a better teacher?</div>
          <div>Come talk with us about what we should build together!</div>
        </div>
      </Card>
    );
  }
}


// Pure UI component to render unsupported students
export class UnsupportedStudentsPure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assignmentLimit: 4
    };
    this.onMoreAssignments = this.onMoreAssignments.bind(this);
  }

  onMoreAssignments(e) {
    e.preventDefault();
    const {assignmentLimit} = this.state;
    this.setState({ assignmentLimit: assignmentLimit + 4 });
  }

  render() {
    const {assignments} = this.props;
    const {assignmentLimit} = this.state;
    const truncatedAssignments = assignments.slice(0, assignmentLimit);
    return (
      <div className="UnsupportedStudentsPure">
        <div style={styles.cardTitle}>Unsupported students</div>
        <Card style={{border: 'none'}}>
          <div>There are <b>{assignments.length} students</b> you work with who have a D or an F right now but haven't been mentioned in NGE or 10GE for the last month.</div>
          <div style={{paddingTop: 10, paddingBottom: 10}}>
            {truncatedAssignments.map(assignment => {
              const {student, section} = assignment;
              return (
                <div key={assignment.id} style={{paddingLeft: 10}}>
                  <div>
                    <span><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></span>
                    <span> has a {parseInt(assignment.grade_numeric, 10)} in <a href={`/sections/${section.id}`}>{section.section_number}</a></span>
                    <span> with {section.educators.map(educator => 
                      <Educator key={educator.id} style={styles.person} educator={educator} />
                    )}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {truncatedAssignments.length !== assignments.length &&
            <div><a href="#" onClick={this.onMoreAssignments}>See more</a></div>
          }
        </Card>
      </div>
    );
  }
}
UnsupportedStudentsPure.propTypes = {
  assignments: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    student: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      first_name: React.PropTypes.string.isRequired,
      last_name: React.PropTypes.string.isRequired
    }).isRequired,
    section: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      section_number: React.PropTypes.string.isRequired,
      educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    }).isRequired
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
  }
};


export default HomeInsights;