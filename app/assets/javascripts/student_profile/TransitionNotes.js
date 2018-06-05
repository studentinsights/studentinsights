import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import _ from 'lodash';

const styles = {
  textarea: {
    marginTop: 20,
    fontSize: 14,
    border: '4px solid rgba(153,117,185, 0.4)',
    width: '100%'
  }
};

const notePrompts = `What are this student's strengths?
——————————


What is this student's involvement in the school community like?
——————————


How does this student relate to their peers?
——————————


Who is the student's primary guardian?
——————————


Any additional comments or good things to know about this student?
——————————


`;

const restrictedNotePrompts = `Is this student receiving Social Services and if so, what is the name and contact info of their social worker?
——————————


Is this student receiving mental health supports?
——————————
  `;

class TransitionNotes extends React.Component {

  constructor(props) {
    super(props);

    const {transitionNotes} = props;
    const regularNote = _.find(transitionNotes, {is_restricted: false});
    const restrictedNote = _.find(transitionNotes, {is_restricted: true});

    this.state = {
      noteText: (regularNote ? regularNote.text : notePrompts),
      restrictedNoteText: (restrictedNote ? restrictedNote.text : restrictedNotePrompts),
    };

    this.onClickSave = this.onClickSave.bind(this);
    this.onClickSaveRestricted = this.onClickSaveRestricted.bind(this);
    this.onChangeRegularNote = this.onChangeRegularNote.bind(this);
    this.onChangeRestrictedNote = this.onChangeRestrictedNote.bind(this);
    this.buttonText = this.buttonText.bind(this);
    this.buttonTextRestricted = this.buttonTextRestricted.bind(this);
  }

  buttonText() {
    const {requestState} = this.props;

    if (requestState === 'pending') return 'Saving ...';

    if (requestState === 'error') return 'Error ...';

    return 'Save Note';
  }

  buttonTextRestricted() {
    const {requestStateRestricted} = this.props;

    if (requestStateRestricted === 'pending') return 'Saving ...';

    if (requestStateRestricted === 'error') return 'Error ...';

    return 'Save Note';
  }

  onClickSave() {
    const {transitionNotes} = this.props;
    const regularNote = _.find(transitionNotes, {is_restricted: false});
    const regularNoteId = (regularNote) ? regularNote.id : null;

    const params = {
      is_restricted: false,
      text: this.state.noteText
    };

    if (regularNoteId) { _.merge(params, {id: regularNoteId}); }

    this.props.onSave(params);
  }

  onClickSaveRestricted() {
    const {transitionNotes} = this.props;
    const restrictedNote = _.find(transitionNotes, {is_restricted: true});
    const restrictedNoteId = (restrictedNote) ? restrictedNote.id : null;

    const params = {
      is_restricted: true,
      text: this.state.restrictedNoteText
    };

    if (restrictedNoteId) { _.merge(params, {id: restrictedNoteId}); }

    this.props.onSave(params);
  }

  onChangeRegularNote(e) {
    this.setState({noteText: e.target.value});
  }

  onChangeRestrictedNote(e) {
    this.setState({restrictedNoteText: e.target.value});
  }

  render() {
    const {noteText, restrictedNoteText, readOnly} = this.state;

    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note
          </SectionHeading>
          <textarea
            rows={10}
            style={styles.textarea}
            value={noteText}
            onChange={this.onChangeRegularNote}
            readOnly={readOnly} />
          {this.renderButton(this.onClickSave, this.buttonText)}
        </div>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note (Restricted)
          </SectionHeading>
          <textarea
            rows={10}
            style={styles.textarea}
            value={restrictedNoteText}
            onChange={this.onChangeRestrictedNote}
            readOnly={readOnly} />
          {this.renderButton(this.onClickSaveRestricted, this.buttonTextRestricted)}
        </div>
      </div>
    );
  }

  renderButton(onClickFn, buttonTextFn) {
    const {readOnly} = this.props;

    if (readOnly) return null;

    return (
      <button onClick={onClickFn} className='btn save'>
        {buttonTextFn()}
      </button>
    );
  }

}

TransitionNotes.propTypes = {
  readOnly: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  transitionNotes: PropTypes.array.isRequired,
  requestState: PropTypes.string,              // can be null if no request
  requestStateRestricted: PropTypes.string     // can be null if no request
};

export default TransitionNotes;

