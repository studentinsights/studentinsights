import React from 'react';
import qs from 'query-string';
import Card from '../components/Card';
import HelpBubble from '../components/HelpBubble';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// Show teachers their students who have high absences
// but haven't been talked about in SST recently.
class CheckStudentsWithHighAbsences extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  fetchStudents() {
    const {educatorId, limit} = this.props;
    const params = educatorId ? {limit, educator_id: educatorId} : {limit};
    const url = `/api/home/students_with_high_absences_json?${qs.stringify(params)}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CheckStudentsWithHighAbsences" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchStudents}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const props = {
      limit: json.limit,
      totalStudents: json.total_students,
      studentsWithHighAbsences: json.students_with_high_absences
    };
    return <CheckStudentsWithHighAbsencesView {...props} />;
  }
}
CheckStudentsWithHighAbsences.propTypes = {
  educatorId: React.PropTypes.number.isRequired,
  limit: React.PropTypes.number // limit the data returned, not the query itself
};
CheckStudentsWithHighAbsences.defaultProps = {
  limit: 100
};


// Pure UI component.
export class CheckStudentsWithHighAbsencesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uiLimit: 4
    };
    this.renderHelpContent = this.renderHelpContent.bind(this);
    this.onMoreStudents = this.onMoreStudents.bind(this);
  }

  onMoreStudents(e) {
    e.preventDefault();
    const {uiLimit} = this.state;
    this.setState({ uiLimit: uiLimit + 4 });
  }

  render() {
    const {studentsWithHighAbsences, totalStudents} = this.props;
    const {uiLimit} = this.state;
    const truncatedStudentsWithHighAbsences = studentsWithHighAbsences.slice(0, uiLimit);

    return (
      <div className="CheckStudentsWithHighAbsences">
        <div style={styles.cardTitle}>
          Students missing school
          <HelpBubble
            teaser={<span style={styles.helpTeaser}>?</span>}
            title="Students missing school"
            content={this.renderHelpContent()} />
        </div>
        <Card style={{border: 'none'}}>
          {this.renderCopy(totalStudents)}
          {this.renderList(truncatedStudentsWithHighAbsences)}
          {this.renderMore(truncatedStudentsWithHighAbsences)}
        </Card>
      </div>
    );
  }

  // Branching on singular and plural and zero.
  renderCopy(totalStudents) {
    if (totalStudents === 1) {
      return <div>There is <b>one student</b> you work with you who is missing school but hasn't been mentioned in SST yet.</div>;
    } else {
      return <div>There are <b>{totalStudents === 0 ? 'no' : totalStudents} students</b> you work with you who are missing school but {"haven't"} been mentioned in SST yet.</div>;
    }
  }

  renderList(truncatedStudentsWithHighAbsences) {
    if (truncatedStudentsWithHighAbsences.length === 0) return null;
    return (
      <div style={{paddingTop: 10, paddingBottom: 10}}>
        {truncatedStudentsWithHighAbsences.map(studentsWithHighAbsences => {
          const {student, count} = studentsWithHighAbsences;
          return (
            <div key={student.id} style={styles.line}>
              <span>
                <a
                  style={styles.person}
                  href={`/students/${student.id}?column=attendance#absences`}>
                    {student.first_name} {student.last_name}
                  </a> has missed {count} days of school
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  renderMore(truncatedStudentsWithHighAbsences) {
    const {totalStudents, limit, studentsWithHighAbsences} = this.props;

    if (truncatedStudentsWithHighAbsences.length !== studentsWithHighAbsences.length) {
      return <div><a href="#" onClick={this.onMoreStudents}>See more</a></div>;
    }

    if (studentsWithHighAbsences.length < totalStudents) {
      return <div>There are {totalStudents} students total.  Start with checking in on these first {limit} students.</div>;
    }

    return null;
  }

  renderHelpContent() {
    return (
      <div>
        <p style={styles.helpContent}>These are all the students that you have access to who have a high number of absences over the last 45 days, but {"haven't"} been mentioned yet in SST.</p>
        <p style={styles.helpContent}>If you work directly with this student, you could talk with them or reach out to the family.  Or you could connect with a colleague providing support services (eg, attendance officers, counselors, redirect).  If the student in still missing school, attendance contracts might be a next step.</p>
        <p style={styles.helpContent}>The threshold for being included in this list is to have 4 or more absences in the last 45 calendar days.</p>
      </div>
    );
  }
}

CheckStudentsWithHighAbsencesView.propTypes = {
  limit: React.PropTypes.number.isRequired,
  totalStudents: React.PropTypes.number.isRequired,
  studentsWithHighAbsences: React.PropTypes.arrayOf(React.PropTypes.shape({
    count: React.PropTypes.number.isRequired,
    student: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      first_name: React.PropTypes.string.isRequired,
      last_name: React.PropTypes.string.isRequired,
      grade: React.PropTypes.string.isRequired,
      house: React.PropTypes.string
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
  helpTeaser: {
    display: 'inline-block',
    paddingLeft: 5,
    paddingRight: 5
  },
  helpContent: {
    margin: 10
  },
  cardTitle: {
    backgroundColor: '#eee',
    padding: 10,
    color: 'black',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between'
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


export default CheckStudentsWithHighAbsences;