import React from 'react';
import _ from 'lodash';
import * as Routes from '../helpers/Routes';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import Delay from '../components/Delay';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import BoxCard from '../components/BoxCard';
import WordCloud from '../components/WordCloud';


// For reflecting on patterns within notes
export default class ReflectionOnNotesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      n: 10
    };
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.onClickMore = this.onClickMore.bind(this);
  }

  fetchJson() {
    return apiFetchJson('/api/reflection/notes_patterns_json');
  }

  onClickMore(e) {
    e.preventDefault();
    const {n} = this.state;
    this.setState({n: n + 10});
  }

  render() {
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Reflection on notes</SectionHeading>
        <GenericLoader
          promiseFn={this.fetchJson}
          render={this.renderJson}
        />
      </div>
    );
  }

  renderJson(json) {
    const {n} = this.state;
    const students = json.students;
    const segmentsByStudentId = json.segments_by_student_id;
    const sortedStudents = _.sortBy(students, student => -1 * (segmentsByStudentId[student.id] || []).length);
    return (
      <div style={styles.main}>
        {this.renderMeta(students, n)}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {sortedStudents.slice(0, n).map((student, studentIndex) => {
            return this.renderForStudent(student, studentIndex, segmentsByStudentId[student.id] || []);
          })}
        </div>
        {students.length > n && <div><a onClick={this.onClickMore} href="#">More</a></div>}
      </div>
    );
  }

  renderMeta(students, n) {
    return (
      <div style={styles.meta}>
        <div>Students with the most written about them this school year are shown first.</div>
        <div>Showing first {n} of {students.length} students.</div>
      </div>
    );
  }

  renderForStudent(student, studentIndex, segments) {
    const words = _.flatMap(segments, segment => segment.split(' '));
    return (
      <div key={student.id} style={{display: 'flex', flexDirection: 'row', marginBottom: 50}}>
        <div>
          <StudentPhotoCropped
            studentId={student.id}
            style={{
              width: 400,
              height: 400
            }}
          />
          <div>
            <a href={Routes.studentProfile(student.id)} style={{fontSize: 24, margin: 5}}>
              {student.first_name} {student.last_name}
            </a>
          </div>
        </div>
        <BoxCard
          style={{
            margin: 0,
            minWidth: 400 // prevent jump when loading
          }}
          title={`Patterns in ${words.length} words written`}>
          <Delay wait={studentIndex * 100}> {/* ux, to prioritize drawing top rows first */ }
            <WordCloud
              style={{
                cursor: 'default',
                height: 400,
                width: 400
              }}
              width={400}
              height={400}
              words={words}
            />
          </Delay>
        </BoxCard>
      </div>
    );
  }
}

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  main: {
    fontSize: 14,
    paddingLeft: 10
  },
  meta: {
    padding: 10,
    paddingLeft: 0,
    color: '#999'
  }
};
