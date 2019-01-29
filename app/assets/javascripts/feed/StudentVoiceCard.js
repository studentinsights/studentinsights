import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import hash from 'object-hash';
import Card from '../components/Card';


// Render a card in the feed showing there are new student voice surveys in,
// and allow clicking to see list of students and then jump to their profiles.
export default class StudentVoiceCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      shuffleSeed: props.shuffleSeed || _.random(0, 32)
    };

    this.onExpandClicked = this.onExpandClicked.bind(this);
  }

  onExpandClicked(e) {
    e.preventDefault();
    this.setState({isExpanded: true});
  }

  render() {
    const {style = {}} = this.props;
    return (
      <Card className="StudentVoiceCard" style={style}>
        {this.renderStudentsAndCount()}        
      </Card>
    );
  }

  renderStudentsAndCount() {
    const {studentVoiceCardJson} = this.props;
    const {students} = studentVoiceCardJson;
    const {isExpanded, shuffleSeed} = this.state;
    const emoji = <span style={{position: 'relative', top: 1}}>💬</span>;

    // If the list is <=3 students, show them all inline with links.
    // If it's more, pick two random to show and then +n more, which expands.
    if (students.length === 0) {
      return null; // shouldn't happen, but guard
    } else if (students.length === 1) {
      return <div>{emoji} {this.renderStudentLink(students[0])} shared a new student voice survey.</div>;
    } else if (students.length === 2) {
      return <div>{emoji} {this.renderStudentLink(students[0])} and {this.renderStudentLink(students[1])} shared new student voice surveys.</div>;
    } else if (students.length === 3) {
      return <div>{emoji} {this.renderStudentLink(students[0])}, {this.renderStudentLink(students[1])} and {this.renderStudentLink(students[2])} shared new student voice surveys.</div>;
    }

    const shuffledStudents = _.sortBy(students, student => hash({...student, shuffleSeed}));
    if (!isExpanded) {
      return <div>{emoji} {this.renderStudentLink(shuffledStudents[0])}, {this.renderStudentLink(shuffledStudents[1])} and {this.renderExpandableListLink(shuffledStudents.slice(2))} shared new student voice surveys.</div>;
    } else {
      return <div>{emoji} {this.renderStudentLink(shuffledStudents[0])}, {this.renderStudentLink(shuffledStudents[1])} and {this.renderMoreStudentsText(shuffledStudents.slice(2))} shared new student voice surveys.{this.renderExpandedList(shuffledStudents.slice(2))}</div>;
    }
  }

  renderMoreStudentsText(restOfStudents) {
    return `${restOfStudents.length} more students`;
  }

  renderExpandableListLink(restOfStudents) {
    return <a href="#" onClick={this.onExpandClicked}>{this.renderMoreStudentsText(restOfStudents)}</a>;
  }

  renderExpandedList(restOfStudents) {
    return (
      <div style={{paddingTop: 10, paddingLeft: 10}}>
        {restOfStudents.map(student => (
          <div key={student.id} style={{padding: 5}}>{this.renderStudentLink(student)}</div>
        ))}
      </div>
    );
  }

  renderStudentLink(student) {
    return <a style={{fontWeight: 'bold'}} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>;
  }
}
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
  style: PropTypes.object,
  shuffleSeed: PropTypes.number
};
