import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';
import chroma from 'chroma-js';
import MoreDots from '../components/MoreDots';
import {
  steelBlue,
  high,
  medium,
  low,
  genderColor
} from '../helpers/colors';
import InlineStudentProfile from './InlineStudentProfile';
import {
  isLimitedOrFlep,
  isIepOr504,
  isLowIncome,
  isHighDiscipline,
  starBucketThresholds,
  HighlightKeys
} from './studentFilters';

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
    const {isEditable, highlightKey, style} = this.props;
    const cursor = (isEditable) ? 'pointer' : 'default';
    const highlightStyle = this.renderHighlightStyle(student, highlightKey);
    return (
      <div style={{...styles.studentCard, ...style, cursor, ...highlightStyle}} onClick={this.onClick}>
        <span>{student.last_name}, {student.first_name}</span>
        <MoreDots />
      </div>
    );
  }

  renderHighlightStyle(student, highlightKey) {
    const highlightFn = highlightFns[highlightKey];
    return highlightFn ? highlightFn(student) : null;
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
        ariaHideApp={false}
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
StudentCard.propTypes = {
  student: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  fetchProfile: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  highlightKey: PropTypes.string,
  style: PropTypes.object
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
  },
  highlight: {
    backgroundColor: chroma(steelBlue).alpha(0.4).css()
  },
  none: {
    backgroundColor: 'white'
  }
};

// For highlighting students based on their attributes.
const highlightFns = {
  [HighlightKeys.IEP_OR_504]: student => highlightStylesIf(isIepOr504(student)),
  [HighlightKeys.LIMITED_OR_FLEP]: student => highlightStylesIf(isLimitedOrFlep(student)),
  [HighlightKeys.LOW_INCOME]: student => highlightStylesIf(isLowIncome(student)),
  [HighlightKeys.HIGH_DISCIPLINE]: student => highlightStylesIf(isHighDiscipline(student)),
  [HighlightKeys.STAR_MATH]: student => starStyles(student.most_recent_star_math_percentile),
  [HighlightKeys.STAR_READING]: student => starStyles(student.most_recent_star_reading_percentile),
  [HighlightKeys.DIBELS]: student => dibelsStyles(student.latest_dibels),
  [HighlightKeys.GENDER]: student => {
    const backgroundColor = genderColor(student.gender);
    return {backgroundColor};
  }
};

// Perform color operation for STAR percentile scores, calling out high and low only
// Missing scores aren't called out.
function starStyles(maybePercentile) {
  const starScale = chroma.scale([low, medium, high]).classes(starBucketThresholds);
  const hasScore = _.isNumber(maybePercentile);
  if (!hasScore) return styles.none;
  const fraction = maybePercentile / 100;
  const backgroundColor = chroma(starScale(fraction)).alpha(0.5).css();
  return {backgroundColor};
}

function dibelsStyles(maybeLatestDibels) {
  if (!maybeLatestDibels) return styles.none;
  const benchmark = maybeLatestDibels.benchmark;
  const colorMap = {
    CORE: high,
    STRATEGIC: medium,
    INTENSIVE: low
  };
  const backgroundColor = colorMap[benchmark];
  return {backgroundColor};
}

function highlightStylesIf(isTrue) {
  return isTrue ? styles.highlight : styles.none;
}
