import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import StudentCard from './StudentCard';
import {gradeText} from '../helpers/gradeText';

function randomValue() {
  return Math.round(Math.random()*100);
}

const width = 165;
const styles = {
  root: {
    overflowY: 'hidden',
    overflowX: 'hidden',
    height: 580, // TODO(kr)
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  loader: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  sectionHeading: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 0
  },
  classrooms: {
    padding: 10
  },
  padded: {
    margin: 10
  },
  students: {
    padding: 10,
    paddingTop: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  links: {
    fontSize: 12,
    paddingLeft: 10
  },
  link: {
    display: 'inline-block',
    padding: 5,
    fontSize: 12
  },
  studentsGrid: {
    flex: 1,
    overflowY: 'scroll',
    overflowX: 'hidden',
    border: '1px solid #ccc'
  },
  listsContainer: {
    display: 'flex'
  },
  indicator: {
    fontSize: 12
  },
  column: {
    width: width,
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    padding: 10
  },
  listStyle: {
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    height: 180,
    width: width
  },
  itemStyle: {
    userSelect: 'none'
  },
  leftListStyle: {
    width: width
  }
};

// For grade-level teaching teams 
export default class ClassroomListCreator extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  // TODO(KR) this wouldn't work for teacher authorization; this is just placeholder
  // TODO(KR) authorization is tricky since we're not using the same rules here.
  fetchStudents() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ClassroomListCreator" style={styles.root}>
        <GenericLoader
          style={styles.loader}
          promiseFn={this.fetchStudents}
          render={this.renderContent} />
      </div>
    );
  }

  renderContent(json) {
    const {grade} = this.props;
    const {students, school} = json;
    const rooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    return (
      <div style={styles.content}>
        <div style={styles.classrooms}>
          <SectionHeading style={styles.sectionHeading}>Classroom communities: {gradeText(grade)} at {school.name}</SectionHeading>
          <div style={styles.padded}>
            <div style={styles.listsContainer}>
              <div key="unplaced" style={styles.column}>
                <h2>Not yet placed</h2>
              </div>
              {rooms.map(room =>
                <div key={room} style={styles.column}>
                  <h2>{room}</h2>
                  <div style={styles.indicator}>Students: {12}</div>
                  <div style={styles.indicator}>{'\u00A0'}</div>
                  <div style={styles.indicator}>{this.renderValue('Low income', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('ELL', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('SPED', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('<25th Math', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('<25th ELA', randomValue())}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.students}>
          <SectionHeading style={styles.sectionHeading}>Students to place: {students.length}</SectionHeading>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={styles.links}>
              Sort by:
              <a href="#" style={styles.link}>not yet placed</a>
              <a href="#" style={styles.link}>classroom</a>
              <a href="#" style={styles.link}>alphabetical</a>
            </div>
            <div style={styles.links}>
              Actions:
              <a href="#" style={styles.link}>reset to blank</a>
              <a href="#" style={styles.link}>randomly assign not yet placed</a>
            </div>
          </div>
          <div style={styles.studentsGrid}>
            {students.map(student => {
              const left = width*Math.floor(Math.random()*rooms.length + 1);
              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  style={{
                    display: 'block',
                    position: 'relative',
                    fontSize: 12,
                    left,
                    width
                  }} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  renderValue(text, value) {
    return (value > 80)
      ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
      : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
  }
}
ClassroomListCreator.propTypes = {
  schoolId: React.PropTypes.string.isRequired,
  grade: React.PropTypes.string.isRequired
};



