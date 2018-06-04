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
      regularNoteAutosaveStatus: null,
      restrictedNoteAutosaveStatus: null,
    };

    const throttleOptions = {leading: false, trailing: true};

    this.autosaveRegularNote = _.throttle(this.autosaveRegularNote.bind(this), 1000, throttleOptions);
    this.autosaveRestrictedNote = _.throttle(this.autosaveRestrictedNote.bind(this), 1000, throttleOptions);

    this.onChangeRegularNote = this.onChangeRegularNote.bind(this);
    this.onChangeRestrictedNote = this.onChangeRestrictedNote.bind(this);
  }

  // Note on componentWillReceiveProps:
  // This method will be deprecated in React 16.3. But we're still using
  // React 15.4 in Insights, and have some legacy-cleanup work to finish
  // til we can migrate to 16. Noting that this func will have to be refactored.

  // When the user types into the Transition Note textarea, the server
  // handles autosaving very quickly. In fact, so fast that in the "pending" state,
  // the status text is barely readable when it's supposed to say "Autosaving..."

  // This code adds a delay so that the text that says "Autosaving..."
  // can hang for  2 seconds to let the user read it.
  componentWillReceiveProps(newProps) {
    if (newProps.requestState !== this.props.requestState) {
      if (this.props.requestState === 'pending') {
        setTimeout(() => {
          this.setState({regularNoteAutosaveStatus: newProps.requestState});
        }, 2000);
      } else {
        this.setState({regularNoteAutosaveStatus: newProps.requestState});
      }
    }

    if (newProps.requestStateRestricted !== this.props.requestStateRestricted) {
      if (this.props.requestStateRestricted == 'pending') {
        setTimeout(() => {
          this.setState({restrictedNoteAutosaveStatus: newProps.requestStateRestricted});
        }, 2000);
      } else {
        this.setState({restrictedNoteAutosaveStatus: newProps.requestStateRestricted});
      }
    }
  }

  autosaveRegularNote() {
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

  autosaveRestrictedNote() {
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

  autosaveStatusText(status) {
    if (status === 'saved') return 'Saved.';

    if (status === 'pending') return 'Autosaving ...';

    if (status === 'error') return 'There was an error autosaving this note.';

    return 'This note will autosave as you type.';
  }

  onChangeRegularNote(e) {
    this.setState({noteText: e.target.value}, () => {this.autosaveRegularNote();});
  }

  onChangeRestrictedNote(e) {
    this.setState({restrictedNoteText: e.target.value}, () => {this.autosaveRestrictedNote();});
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
          <div style={{color: 'gray'}}>
            {this.autosaveStatusText(this.state.regularNoteAutosaveStatus)}
          </div>
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
          <div style={{color: 'gray'}}>
            {this.autosaveStatusText(this.state.restrictedNoteAutosaveStatus)}
          </div>
        </div>
      </div>
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

