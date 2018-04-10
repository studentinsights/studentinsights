import React from 'react';
import Card from '../components/Card';
import {studentAge} from '../helpers/studentAge';

// Shows a student card in the `ClassroomListCreator` UI
export default class StudentCard extends React.Component {
  render() {
    const now = this.context.nowFn();
    const {student, style} = this.props;
    return (
      <Card className="StudentCard" style={style}>
        <div>{student.first_name} {student.last_name}</div>
        <div>Math: {student.most_recent_star_reading_percentile || '\u00A0'}</div>
        <div>Reading: {student.most_recent_star_math_percentile || '\u00A0'}</div>
        <div>{student.free_reduced_lunch || '\u00A0'}</div>
        <div>{student.disability || '\u00A0'}</div>
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