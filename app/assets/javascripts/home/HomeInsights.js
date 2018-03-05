import React from 'react';
import Card from '../components/Card';
import Educator from '../components/Educator';


// On the home page, show users the answers to their most important questions.
class HomeInsights extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assignments: null,
      assignmentLimit: 3
    };
    this.onData = this.onData.bind(this);
    this.onError = this.onError.bind(this);
    this.onMoreAssignments = this.onMoreAssignments.bind(this);
  }

  componentDidMount() {
    fetch('/home/assignments_json', { credentials: 'include' })
      .then(response => response.json())
      .then(this.onData)
      .catch(this.onError);
  }

  onData(json) {
    this.setState({ assignments: json.assignments });
  }

  onError(err) {
    console.error(err); // eslint-disable-line no-console
  }

  onMoreAssignments() {
    const {assignmentLimit} = this.state;
    this.setState({ assignmentLimit: assignmentLimit + 3 });
  }

  render() {
    return (
      <div className="HomeInsights" style={styles.root}>
        {this.renderInsights()}
      </div>
    );
  }

  renderInsights() {
    const {assignments} = this.state;
    if (assignments === null) return <div style={styles.card}>Loading...</div>;

    return (
      <div>
        {this.renderAssignments(assignments)}
        <Card style={styles.card}><div style={styles.placeholderCard}>...</div></Card>
        <Card style={styles.card}><div style={styles.placeholderCard}>...</div></Card>
      </div>
    );
  }

  renderAssignments(assignments) {
    const {assignmentLimit} = this.state;

    return (
      <div style={styles.card}>
        <div style={{backgroundColor: '#eee', padding: 10, color: 'black', border: '1px solid #ccc', borderBottom: 'none'}}>Unsupported students</div>
        <Card>
          <div>There are <b>{assignments.length}</b> students failing more than one course, but haven't been mentioned in NGE or 10GE for the last month.</div>
          {assignments.slice(0, assignmentLimit).map(assignment => {
            const {student, section} = assignment;
            return (
              <div key={assignment.id} style={{padding: 10}}>
                <div>
                  <div><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></div>
                  <span> has a {assignment.grade_numeric} in <a href={`/sections/${section.id}`}>{section.section_number}</a></span>
                  <span> with {section.educators.map(educator => 
                    <Educator key={educator.id} style={styles.person} educator={educator} />
                  )}</span>
                </div>
              </div>
            );
          })}
          <div><a href="#" onClick={this.onMoreAssignments}>See more</a></div>
        </Card>
      </div>
    );
  }
}

// TODO(kr) duplicate
const styles = {
  root: {
    fontSize: 14
  },
  card: {
    margin: 10,
    marginTop: 20
  },
  person: {
    fontWeight: 'bold'
  },
  placeholderCard: {
    height: 200
  }
};


export default HomeInsights;