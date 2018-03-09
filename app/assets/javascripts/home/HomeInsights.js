import React from 'react';
import qs from 'query-string';
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
    const limit = 100; // limit the data returned, not the query itself
    const url = `/home/unsupported_low_grades_json?${qs.stringify({limit})}`;
    return fetch(url, { credentials: 'include' })
      .then(response => response.json());
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

  renderAssignments(json) {
    const props = {
      limit: json.limit,
      totalCount: json.total_count,
      assignments: json.assignments
    };
    return <UnsupportedStudentsPure {...props} />;
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
    const {assignments, totalCount} = this.props;
    const {assignmentLimit} = this.state;
    const truncatedAssignments = assignments.slice(0, assignmentLimit);
    return (
      <div className="UnsupportedStudentsPure">
        <div style={styles.cardTitle}>Your 10GE students</div>
        <Card style={{border: 'none'}}>
          <div>There are <b>{totalCount} students</b> in sections you teach who have a D or an F right now but haven't been mentioned in 10GE for the last month.</div>
          <div style={{paddingTop: 10, paddingBottom: 10}}>
            {truncatedAssignments.map(assignment => {
              const {student, section} = assignment;
              return (
                <div key={assignment.id} style={{paddingLeft: 10}}>
                  <div>
                    <span><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></span>
                    <span> has a {parseInt(assignment.grade_numeric, 10)} in <a href={`/sections/${section.id}`}>{section.section_number}</a></span>
                  </div>
                </div>
              );
            })}
          </div>
          {this.renderMore(truncatedAssignments)}
        </Card>
      </div>
    );
  }

  renderMore(truncatedAssignments) {
    const {totalCount, limit, assignments} = this.props;

    if (truncatedAssignments.length !== assignments.length) {
      return <div><a href="#" onClick={this.onMoreAssignments}>See more</a></div>;
    }

    if (assignments.length < totalCount) {
      return <div>There are {totalCount} students total.  Start with checking in on these first {limit} students.</div>;
    }

    return null;
  }
}

UnsupportedStudentsPure.propTypes = {
  totalCount: React.PropTypes.number.isRequired,
  limit: React.PropTypes.number.isRequired,
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