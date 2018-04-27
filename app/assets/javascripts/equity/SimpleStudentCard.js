import React from 'react';
import _ from 'lodash';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';
import MoreDots from '../components/MoreDots';
import ExperimentalBanner from '../components/ExperimentalBanner';

// Shows a small student card that is `Draggable` and also clickable
// to show a modal of the student's profile.
export default class SimpleStudentCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false
    };

    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClick() {
    this.setState({modalIsOpen: true});
  }

  onClose() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {student, index} = this.props;
    const {modalIsOpen} = this.state;
    return (
      <Draggable draggableId={`SimpleStudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return (
            <div>
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={this.onClose}
                contentLabel="Modal"
              >
                <h4><a style={{fontSize: 20}} href={`/students/${student.id}`} target="_blank">{student.first_name} {student.last_name}</a></h4>
                <br />
                <div>Disability: {student.disability}</div>
                <div>Program: {student.program_assigned}</div>
                <div>504 plan: {student.plan_504}</div>
                <div>Learning English: {student.limited_english_proficiency}</div>
                <div>Most recent ACCESS: <pre>{JSON.stringify(_.last(student.latest_access_results), null, 2)}</pre></div>
                <div>Home language: {student.home_language}</div>
                <br />
                <div>Free reduced lunch: {student.free_reduced_lunch}</div>
                <div>Race: {student.race}</div>
                <div>Hispanic: {student.hispanic_latino ? 'yes' : 'no'}</div>
                <div>Gender: {student.gender}</div>
                <br />
                <div>Most recent DIBELS: {student.dibels.length > 0 && _.last(student.dibels).performance_level}</div>
                <div>Most recent STAR Math percentile: {student.most_recent_star_math_percentile}</div>
                <div>Most recent STAR Reading percentile: {student.most_recent_star_reading_percentile}</div>
              </Modal>
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div style={styles.studentCard} onClick={this.onClick}>
                  <span style={{overflowX: 'hidden'}}>{student.first_name} {student.last_name}</span>
                  <span style={{float: 'right'}}><MoreDots /></span>
                </div>
              </div>
              {provided.placeholder /* this preserves space when dragging */}
            </div>
          );
        }}
      </Draggable>
    );
  }
}
SimpleStudentCard.propTypes = {
  student: React.PropTypes.object.isRequired,
  index: React.PropTypes.number.isRequired
};

const styles = {
  studentCard: {
    fontSize: 14,
    border: '1px solid #eee',
    padding: 6,
    cursor: 'pointer',
    borderRadius: 3,
    background: 'white'
  },
  modal: {
    zIndex: 100
  }
};