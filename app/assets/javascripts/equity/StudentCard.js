import React from 'react';
import Card from '../components/Card';
import {studentAge} from '../helpers/studentAge';

// Shows a student card in the `ClassroomListCreator` UI
export default class StudentCard extends React.Component {
  render() {
    const now = this.context.nowFn();
    const {student, style} = this.props;
    return (
      <Card style={style}>
        <div>{student.first_name} {student.last_name}</div>
        <div>{studentAge(now, student.date_of_birth)} years old</div>
        <div>{student.limited_english_proficiency || '\u00A0'}</div>
      </Card>
    );
  }
}
StudentCard.propTypes= {
  student: React.PropTypes.object.isRequired,
  style: React.PropTypes.object
};

StudentCard.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};