import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';
import MoreDots from '../components/MoreDots';
import InlineStudentProfile from './InlineStudentProfile';


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
    return (
      <Draggable draggableId={`SimpleStudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return (
            <div>
              {this.renderModal()}
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div style={styles.studentCard} onClick={this.onClick}>
                  <span>{student.first_name} {student.last_name}</span>
                  <MoreDots />
                </div>
              </div>
              {provided.placeholder /* this preserves space when dragging */}
            </div>
          );
        }}
      </Draggable>
    );
  }

  renderModal() {
    const {student, fetchProfile} = this.props;
    const {modalIsOpen} = this.state;
    return (
      <Modal
        style={{
          overlay: styles.modalOverlay,
          context: styles.modalContent
        }}
        isOpen={modalIsOpen}
        onRequestClose={this.onClose}
        contentLabel="Modal"
      >
        <InlineStudentProfile
          student={student}
          fetchProfile={fetchProfile} />
      </Modal>
    );
  }
}
SimpleStudentCard.propTypes = {
  student: React.PropTypes.object.isRequired,
  index: React.PropTypes.number.isRequired,
  fetchProfile: React.PropTypes.func.isRequired
};

const styles = {
  studentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    border: '1px solid #eee',
    padding: 6,
    cursor: 'pointer',
    borderRadius: 3,
    background: 'white'
  },
  modalOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.75)'
  },
  modalContent: {
    left: 100,
    right: 100
  }
};