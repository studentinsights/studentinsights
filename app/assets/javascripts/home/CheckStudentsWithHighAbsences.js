import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import Card from '../components/Card';
import HelpBubble from '../components/HelpBubble';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// Show teachers their students who have high absences
// but don't have any notes in Insights recently (eg, haven't been brought up in SST).
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
  educatorId: PropTypes.number.isRequired,
  limit: PropTypes.number // limit the data returned, not the query itself
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
      <div className="CheckStudentsWithHighAbsencesView">
        <div style={styles.cardTitle}>
          Students missing school
          <HelpBubble
            teaser={<span style={styles.helpTeaser}>what does this mean?</span>}
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
    const now = this.context.nowFn();
    const dateText = now.clone().subtract(45, 'days').format('MMMM Do');
    const sinceEl = <span>Since {dateText}:</span>;
    if (totalStudents === 0) {
      return <div>There are <b>no students</b> missing school recently who {"haven't"} been mentioned.</div>;
    } else if (totalStudents === 1) {
      return <div>There is <b>one student</b> missing school recently who {"hasn't"} been mentioned.  {sinceEl}</div>;
    } else {
      return <div>There are <b>{totalStudents} students</b> missing school recently who {"haven't"} been mentioned.  {sinceEl}</div>;
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
        <p style={styles.helpContent}>These are all the students that you have access to who have a high number of absences over the last 45 days, but {"haven't"} been mentioned recently.</p>
        <p style={styles.helpContent}>This means there aren't any notes about them from SST meetings, parent conversations, or anything else in Student Insights.  The threshold for being included in this list is to have 4 or more absences over the last 45 calendar days.</p>
        <p style={styles.helpContent}>If you work directly with this student, you could talk with them or reach out to the family.  Or you could connect with a colleague providing support services (eg, SST, attendance officers, counselors, redirect).  If the student in still missing school, attendance contracts might be a next step.</p>        
      </div>
    );
  }
}
CheckStudentsWithHighAbsencesView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
CheckStudentsWithHighAbsencesView.propTypes = {
  limit: PropTypes.number.isRequired,
  totalStudents: PropTypes.number.isRequired,
  studentsWithHighAbsences: PropTypes.arrayOf(PropTypes.shape({
    count: PropTypes.number.isRequired,
    student: PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
      house: PropTypes.string
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