import PropTypes from 'prop-types';
import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import MoreDots from '../components/MoreDots';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import InlineStudentProfile from './InlineStudentProfile';
import {highlightStyleForKey} from './highlights';

// Shows a small student card that is `Draggable` and also clickable
// to show a modal of the student's profile.
export default class StudentCard extends React.Component {
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
    if (this.props.highlightKey !== nextProps.highlightKey) return true;
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
      <Draggable draggableId={`StudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return this.renderClickableStudentCard(student, {
            ref: provided.innerRef,
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
    const {ref, propsFromDraggable = {}} = options;
    return (
      <div>
        {this.renderModal()}
        <div ref={ref} {...propsFromDraggable}>
          {this.renderStudentCard(student)}
        </div>
      </div>
    );
  }

  renderStudentCard(student) {
    const {isEditable, studentPhotoUrl, highlightKey, style} = this.props;
    const cursor = (isEditable) ? 'pointer' : 'default';
    const highlightStyle = highlightStyleForKey(student, highlightKey);
    const noteIconEl = this.renderNoteIcon(student);

    return (
      <div style={{...styles.studentCard, ...style, cursor, ...highlightStyle}} onClick={this.onClick}>
        <div style={styles.photoAndName}>
          <StudentPhotoCropped
            studentId={student.id}
            photoUrl={studentPhotoUrl}
            style={styles.studentPhoto}
          />
          <div style={styles.name}>{student.last_name}, {student.first_name}</div>
        </div>
        {noteIconEl || <MoreDots />}
      </div>
    );
  }

  renderNoteIcon(student) {
    const {nowFn} = this.context;
    if (!student.latest_note) return;
    const noteMoment = toMomentFromTimestamp(student.latest_note.recorded_at);
    const daysAgo = nowFn().clone().diff(noteMoment, 'days');
    if (daysAgo > 45) return null;
    return <div style={styles.noteIcon}>📝</div>;
  }

  renderModal() {
    const {student, gradeLevelNextYear, fetchProfile} = this.props;
    const {modalIsOpen} = this.state;
    return (
      <Modal
        style={{
          overlay: styles.modalOverlay,
          content: styles.modalContent
        }}
        ariaHideApp={false}
        isOpen={modalIsOpen}
        onRequestClose={this.onClose}
        contentLabel="Modal"
      >
        <InlineStudentProfile
          student={student}
          gradeLevelNextYear={gradeLevelNextYear}
          fetchProfile={fetchProfile} />
      </Modal>
    );
  }
}
StudentCard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentCard.propTypes = {
  student: PropTypes.object.isRequired,
  studentPhotoUrl: PropTypes.string.isRequired,
  gradeLevelNextYear: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  fetchProfile: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  highlightKey: PropTypes.string,
  style: PropTypes.object
};

const styles = {
  studentCard: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    border: '1px solid #eee',
    padding: 5,
    borderRadius: 3,
    backgroundColor: 'white'
  },
  photoAndName: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 1
  },
  name: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1
  },
  studentPhoto: {
    width: 32,
    height: 32,
  },
  noteIcon: {
    fontSize: 16,
    paddingLeft: 5,
    paddingRight: 5
  },
  modalOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.75)',
    zIndex: 10
  },
  modalContent: {
    left: 100,
    right: 100,
    padding: 0,
    zIndex: 20
  }
};