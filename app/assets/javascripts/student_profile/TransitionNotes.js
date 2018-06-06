import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading';
import WarnBeforeUnload from '../components/WarnBeforeUnload';
import Api from './Api.js';


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

    const {defaultTransitionNotes} = props;
    const regularNote = _.find(defaultTransitionNotes, {is_restricted: false});
    const restrictedNote = _.find(defaultTransitionNotes, {is_restricted: true});

    const noteText = regularNote ? regularNote.text : notePrompts;
    const restrictedNoteText = restrictedNote ? restrictedNote.text : restrictedNotePrompts;
    this.state = {
      noteText,
      restrictedNoteText,

      requestState: null,
      restrictedRequestState: null,

      serverNoteText: noteText,
      serverRestrictedNoteText: restrictedNoteText
    };

    this.api = new Api();
    this.onClickSave = this.onClickSave.bind(this);
    this.onClickSaveRestricted = this.onClickSaveRestricted.bind(this);
    this.onChangeRegularNote = this.onChangeRegularNote.bind(this);
    this.onChangeRestrictedNote = this.onChangeRestrictedNote.bind(this);
    this.onSaveTransitionNoteDone = this.onSaveTransitionNoteDone.bind(this);
    this.onSaveTransitionNoteFail = this.onSaveTransitionNoteFail.bind(this);
    this.buttonText = this.buttonText.bind(this);
    this.buttonTextRestricted = this.buttonTextRestricted.bind(this);
  }

  isDirty() {
    const {noteText, serverNoteText, restrictedNoteText, serverRestrictedNoteText} = this.state;
    if (noteText !== serverNoteText) return true;
    if (restrictedNoteText !== serverRestrictedNoteText) return true;
    return false;
  }

  warnBeforeUnloadMessage() {
    return (this.isDirty())
      ? 'You have unsaved changes.'
      : undefined;
  }

  buttonText() {
    const {requestState} = this.state;

    if (requestState === 'pending') return 'Saving ...';

    if (requestState === 'error') return 'Error ...';

    return 'Save Note';
  }

  buttonTextRestricted() {
    const {restrictedRequestState} = this.state;

    if (restrictedRequestState === 'pending') return 'Saving ...';

    if (restrictedRequestState === 'error') return 'Error ...';

    return 'Save Note';
  }

  doSaveTransitionNote(noteParams) {
    const {studentId} = this.props;
    const nextState = (noteParams.is_restricted)
      ? { restrictedRequestState: 'pending' }
      : { requestState: 'pending' };

    this.setState(nextState);
    this.api.saveTransitionNote(studentId, noteParams)
      .done(this.onSaveTransitionNoteDone.bind(this, noteParams))
      .fail(this.onSaveTransitionNoteFail.bind(this, noteParams));
  }

  onClickSave() {
    const params = {
      is_restricted: false,
      text: this.state.noteText
    };

    this.doSaveTransitionNote(params);
  }

  onClickSaveRestricted() {
    const params = {
      is_restricted: true,
      text: this.state.restrictedNoteText
    };

    this.doSaveTransitionNote(params);
  }

  onChangeRegularNote(e) {
    this.setState({noteText: e.target.value});
  }

  onChangeRestrictedNote(e) {
    this.setState({restrictedNoteText: e.target.value});
  }

  onSaveTransitionNoteDone(noteParams) {
    const nextStateForRequests = (noteParams.is_restricted)
      ? { restrictedRequestState: 'saved' }
      : { requestState: 'saved' };
    const nextStateForServer = (noteParams.is_restricted)
      ? { serverRestrictedNoteText: noteParams.text }
      : { serverNoteText: noteParams.text };

    this.setState({...nextStateForRequests, ...nextStateForServer});
  }

  onSaveTransitionNoteFail(noteParams, request, status, message) {
    const nextState = (request.is_restricted)
      ? { restrictedRequestState: 'error' }
      : { requestState: 'error' };

    this.setState(nextState);
  }

  render() {
    const {
      noteText,
      requestState, 
      restrictedNoteText,
      restrictedRequestState,
      readOnly
    } = this.state;

    return (
      <WarnBeforeUnload messageFn={this.warnBeforeUnloadMessage}>
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
            {this.renderButton(
              this.onClickSave,
              this.buttonText,
              (requestState === 'pending' || requestState === 'error')
            )}
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
            {this.renderButton(
              this.onClickSaveRestricted,
              this.buttonTextRestricted,
              (restrictedRequestState === 'pending' || restrictedRequestState === 'error')
            )}
          </div>
        </div>
      </WarnBeforeUnload>
    );
  }

  renderButton(onClickFn, buttonTextFn, isDisabled) {
    const {readOnly} = this.props;

    if (readOnly) return null;
    if (!this.isDirty()) return <span>Saved.</span>;

    return (
      <button onClick={onClickFn}
              className={`btn save ${isDisabled ? 'btn-disabled' : ''}`}
              disabled={isDisabled}>
        {buttonTextFn()}
      </button>
    );
  }

}

TransitionNotes.propTypes = {
  studentId: PropTypes.number.isRequired,
  defaultTransitionNotes: PropTypes.array.isRequired,
  readOnly: PropTypes.bool.isRequired
};

export default TransitionNotes;

