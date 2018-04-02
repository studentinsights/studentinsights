import React from 'react';
import qs from 'query-string';
import Card from '../components/Card';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';


// On the home page, show users students with high absences
// that haven't been talked about in SST recently.
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
      totalCount: json.total_count,
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


// Pure UI component, for showing a high school teacher
// which of their students have low grades but haven't been
// discussed in NGE or 10GE.  The intention is that this list of
// students to check in on is immediately actionable.
export class CheckStudentsWithHighAbsencesView extends React.Component {
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
    const {studentsWithHighAbsences, totalCount} = this.props;
    const {uiLimit} = this.state;
    const truncatedStudentsWithHighAbsences = studentsWithHighAbsences.slice(0, uiLimit);

    return (
      <div className="CheckStudentsWithHighAbsences">
        <div style={styles.cardTitle}>Students to check in on about missing school</div>
        <Card style={{border: 'none'}}>
           <div>There {this.renderAreHowManyStudents(totalCount)} who have have missed more than 4 days of school in the last 45 days, but haven't been mentioned yet in SST.</div>
          {this.renderList(truncatedStudentsWithHighAbsences)}
          {this.renderMore(truncatedStudentsWithHighAbsences)}
        </Card>
      </div>
    );
  }

  renderAreHowManyStudents(totalCount) {
    if (totalCount === 0) return <span>are <b>no students</b></span>;
    if (totalCount === 1) return <span>is <b>one student</b></span>;
    return <span>are <b>{totalCount} students</b></span>;
  }

  renderList(truncatedStudentsWithHighAbsences) {
    if (truncatedStudentsWithHighAbsences.length === 0) return null;
    return (
      <div style={{paddingTop: 10, paddingBottom: 10}}>
        {truncatedStudentsWithHighAbsences.map(studentsWithHighAbsences => {
          const {student, count} = studentsWithHighAbsences;
          return (
            <div key={student.id} style={styles.line}>
              <span><a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a></span>
              has missed {count} days of school
            </div>
          );
        })}
      </div>
    );
  }

  renderMore(truncatedStudentsWithHighAbsences) {
    const {totalCount, limit, studentsWithHighAbsences} = this.props;

    if (truncatedStudentsWithHighAbsences.length !== studentsWithHighAbsences.length) {
      return <div><a href="#" onClick={this.onMoreStudents}>See more</a></div>;
    }

    if (studentsWithHighAbsences.length < totalCount) {
      return <div>There are {totalCount} students total.  Start with checking in on these first {limit} students.</div>;
    }

    return null;
  }
}

CheckStudentsWithHighAbsencesView.propTypes = {
  limit: React.PropTypes.number.isRequired,
  totalCount: React.PropTypes.number.isRequired,
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


export default CheckStudentsWithHighAbsences;