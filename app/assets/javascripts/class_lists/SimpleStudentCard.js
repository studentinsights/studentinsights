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

  // This is an optimization that in particular is trying to avoid
  // unnecessary renders of <Draggable />.
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.index !== nextProps.index) return true;
    if (this.state.modalIsOpen !== nextState.modalIsOpen) return true;
    return false;
  }

  onClick() {
    this.setState({modalIsOpen: true});
  }

  onClose() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {isEditable, student, index} = this.props;

    if (!isEditable) return this.renderClickableStudentCard(student);

    return (
      <Draggable draggableId={`SimpleStudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return this.renderClickableStudentCard(student, {
            ref: provided.innerRef,
            placeholder: provided.placeholder,
            props: {
              ...provided.draggableProps,
              ...provided.dragHandleProps
            }
          });
        }}
      </Draggable>
    );
  }

  // Optionally pass arguments to make this work as a Draggable
  renderClickableStudentCard(student, options = {}) {
    const {ref, placeholder, propsFromDraggable = {}} = options;
    return (
      <div>
        {this.renderModal()}
        <div ref={ref} {...propsFromDraggable}>
          {this.renderStudentCard(student)}
        </div>
        {placeholder /* this preserves space when dragging */}
      </div>
    );
  }

  renderStudentCard(student) {
    return (
      <div style={styles.studentCard} onClick={this.onClick}>
        <span>{student.first_name} {student.last_name}</span>
        <MoreDots />
      </div>
    );
  }

  renderModal() {
    const {student, fetchProfile} = this.props;
    const {modalIsOpen} = this.state;
    return (
      <Modal
        style={{
          overlay: styles.modalOverlay,
          content: styles.modalContent
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
  fetchProfile: React.PropTypes.func.isRequired,
  isEditable: React.PropTypes.bool.isRequired
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
    backgroundColor: 'white'
  },
  modalOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.75)',
    zIndex: 10
  },
  modalContent: {
    left: 200,
    right: 200,
    padding: 0,
    zIndex: 20
  }
};