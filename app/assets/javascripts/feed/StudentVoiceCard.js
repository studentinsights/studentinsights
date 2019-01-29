import PropTypes from 'prop-types';
import React from 'react';
import Card from '../components/Card';
import {toMomentFromTimestamp} from '../helpers/toMoment';


// Render a card in the feed showing there are new student voice surveys in,
// and allow clicking to see list of students and then jump to their profiles.
export default class StudentVoiceCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

  onExpand(e) {
    e.preventDefault();
    this.setState({isExpanded: true});
  }

  render() {
    const {style = {}} = this.props;
    // const {isExpanded} = this.state;
    // const now = this.context.nowFn();
    // const thisYearBirthdateMoment = toMomentFromTimestamp(studentBirthdayCard.date_of_birth).year(now.year());
    // const isWas = (thisYearBirthdateMoment.isBefore(now.clone().startOf('day'))) ? 'was' : 'is';
    return (
      <Card className="StudentVoiceCard" style={style}>
        
      </Card>
    );
  }

  renderStudentsAndCount() {
    const {studentVoiceCardJson} = this.props;
    const {students} = studentVoiceCardJson;

    // if it's <=3 students, just show them each with links
    // if it's more, list two with links and then +n more, which expands
    if (students.length === 0) {
      return null; // shouldn't happen, but guard
    } else if (students.length === 1) {
      return <div>New student voice surveys are in for {this.renderShortList(students)}.</div>;
    } else if (students.length === 2) {
      return <div>New student voice surveys are in for {this.renderShortList(students)}.</div>;
    } else if (students.length === 3) {
      return <div>New student voice surveys are in for {this.renderShortList(students)}.</div>;
    } else {
      return <div>New student voice surveys are in for {this.renderExpandableList(students)}.</div>;
    }
  }

  renderShortList(students) {
    // const nStudentsText = (count === 1) ? 'one student' : `${count} students`;
  }

  renderExpandableList() {
    // } href={`/students/${studentStudentVoiceCard.id}`}>{studentStudentVoiceCard.first_name} {studentStudentVoiceCard.last_name}
  }
}
StudentVoiceCard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentVoiceCard.propTypes = {
  studentVoiceCardJson: PropTypes.shape({
    latest_form_timestamp: PropTypes.string.isRequired,
    imported_forms_for_date_count: PropTypes.number.isRequired,
    students: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  style: PropTypes.object
};


const styles = {
  person: {
    fontWeight: 'bold'
  }
};
