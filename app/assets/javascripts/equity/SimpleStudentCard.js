import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';
import MoreDots from '../components/MoreDots';

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
                <div>#{student.id}: {student.first_name} {student.last_name}</div>
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
  }
};