import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import _ from 'lodash';
import LoggerBox from './LoggerBox';
import Api from './Api.js';


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



export default class TransitionNotes extends React.Component {

  constructor(props) {
    super(props);

    const {defaultTransitionNote} = props;
    this.state = {
      requestState: 'saved',
      transitionNoteId: defaultTransitionNote.id || null,
      transitionNoteText: defaultTransitionNote.text || ''
    };

    this.api = new Api();
    this.loggerBox = new LoggerBox(document.body);

    this.onTransitionNoteChange = this.onTransitionNoteChange.bind(this);
    this.onSaveTransitionNoteDone = this.onSaveTransitionNoteDone.bind(this);
    this.onSaveTransitionNoteFail = this.onSaveTransitionNoteFail.bind(this);

    // const throttleOptions = {leading: false, trailing: true};
    // this.autosaveRegularNote = _.throttle(this.autosaveRegularNote.bind(this), 1000, throttleOptions);
    // this.autosave = this.autosave.bind(this);
    // this.doSave = _.throttle(this.doSave, 500);
  }

  componentWillReceiveProps(nextProps) {
    this.loggerBox.log('componentWillReceiveProps');
    
  }

  componentDidUpdate(prevProps, prevState) {
    this.loggerBox.log('   selectionStart', this.textareaEl.selectionStart);

    const hasIdChanged = (prevState.transitionNoteId !== this.state.transitionNoteId);
    const hasNoteChanged = (prevState.transitionNoteText !== this.state.transitionNoteText);
    if (hasIdChanged || hasNoteChanged) {
      this.loggerBox.log('isDirty', {hasNoteChanged, hasIdChanged});
      this.setState({requestState: 'pending'});
      this.doSave();
    }
  }

  componentWillUnmount() {
    this.loggerBox.destroy();
  }

  doSave() {
    this.loggerBox.log('doSave');
    this.loggerBox.log('   selectionStart', this.textareaEl.selectionStart);

    const {transitionNoteId, transitionNoteText} = this.state;
    const requestParams = {
      id: transitionNoteId,
      text: transitionNoteText,
      is_restricted: false
    };

    const {studentId} = this.props;
    this.api.saveTransitionNote(studentId, requestParams)
      .done(this.onSaveTransitionNoteDone)
      .fail(this.onSaveTransitionNoteFail);
  }

  onTransitionNoteChange(e) {
    this.setState({transitionNoteText: e.target.value});
  }

  onSaveTransitionNoteDone(response) {
    this.loggerBox.log('onSaveTransitionNoteDone');
    this.loggerBox.log('   selectionStart', this.textareaEl.selectionStart);
    this.setState({requestState: 'saved'});
    // const {parseResponse} = this.props;
    // const transitionNote = parseResponse(response);
    // this.setState({
    //   transitionNoteId: transitionNote.id,
    //   requestState: 'saved'
    // });
  }

  onSaveTransitionNoteFail(request, status, message) {
    this.loggerBox.log('onSaveTransitionNoteFail');
    this.setState({requestState: 'error'});
  }

  render() {
    const {requestState, transitionNoteText} = this.state;
    const {readOnly} = this.props;

    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note
          </SectionHeading>
          <textarea
            ref={el => this.textareaEl = el}
            rows={10}
            style={styles.textarea}
            value={_.isEmpty(transitionNoteText) ? notePrompts : transitionNoteText}
            onChange={this.onTransitionNoteChange}
            readOnly={readOnly}
          />
          <div style={{color: 'gray'}}>
            {this.renderAutosaveStatusText(requestState)}
          </div>
        </div>
      </div>
    );
  }

  renderAutosaveStatusText(status) {
    if (status === 'saved') return 'Saved.';
    if (status === 'pending') return 'Saving...';
    if (status === 'error') return 'There was an error autosaving this note.';

    return 'This note will autosave as you type.';
  }
}

TransitionNotes.propTypes = {
  studentId: PropTypes.number.isRequired,
  defaultTransitionNote: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  parseResponse: PropTypes.func.isRequired
};


const styles = {
  textarea: {
    marginTop: 20,
    fontSize: 14,
    border: '4px solid rgba(153,117,185, 0.4)',
    width: '100%'
  }
};



//one [] four five six seven eight 
/*
two three four
two three fou
jump to end of selection
*/