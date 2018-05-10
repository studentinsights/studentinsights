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
            propsFromDraggable: {
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
    const {isEditable} = this.props;
    const cursor = (isEditable) ? 'pointer' : 'default';
    const highlightStyles = this.renderHighlightStyles(student);
    return (
      <div style={{...styles.studentCard, cursor, ...highlightStyles}} onClick={this.onClick}>
        <span>{student.last_name}, {student.first_name}</span>
        <MoreDots />
      </div>
    );
  }

  renderHighlightStyles(student) {
    const {highlightFn} = this.props;
    if (highlightFn) console.log(student, highlightFn);
    return (highlightFn && highlightFn(student))
      ? { backgroundColor: 'red' }
      : {};
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
  isEditable: React.PropTypes.bool.isRequired,
  highlightFn: React.PropTypes.func
};

const styles = {
  studentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    border: '1px solid #eee',
    padding: 6,
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