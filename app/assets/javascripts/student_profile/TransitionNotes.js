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

    const transitionNotes = props.transitionNotes;
    const regularNote = _.find(transitionNotes, {is_restricted: false});
    const restrictedNote = _.find(transitionNotes, {is_restricted: true});

    this.state = {
      noteText: (regularNote ? regularNote.text : notePrompts),
      restrictedNoteText: (restrictedNote ? restrictedNote.text : restrictedNotePrompts),
      regularNoteId: (regularNote ? regularNote.id : null),
      restrictedNoteId: (restrictedNote ? restrictedNote.id : null),
      regularNoteAutosaveStatus: null,
      restrictedNoteAutosaveStatus: null,
    };

    const throttleOptions = {leading: true, trailing: false};

    this.autosaveRegularNote = _.throttle(this.autosaveRegularNote.bind(this), 3000, throttleOptions);
    this.autosaveRestrictedNote = _.throttle(this.autosaveRestrictedNote.bind(this), 3000, throttleOptions);

    this.onChangeRegularNote = this.onChangeRegularNote.bind(this);
    this.onChangeRestrictedNote = this.onChangeRestrictedNote.bind(this);
  }


  // This method will be deprecated in React 16.3. But we're still using
  // React 15.4 and have some migration work to finish up til we can migrate to
  // React 16. Just noting that this will eventually have to be refactored
  // eventually.
  componentWillReceiveProps(newProps) {
    if (newProps.requestState !== this.props.requestState) {
      if (this.props.requestState === 'pending') {
        setTimeout(() => {
          this.setState({regularNoteAutosaveStatus: newProps.requestState})
        }, 2000);
      } else {
        this.setState({regularNoteAutosaveStatus: newProps.requestState});
      }
    }

    if (newProps.requestStateRestricted !== this.props.requestStateRestricted) {
      if (this.props.requestStateRestricted == 'pending') {
        setTimeout(() => {
          this.setState({restrictedNoteAutosaveStatus: newProps.requestState})
        },2000);
      } else {
        this.setState({restrictedNoteAutosaveStatus: newProps.requestState});
      }
    }
  }

  autosaveRegularNote() {
    const params = {
      is_restricted: false,
      text: this.state.noteText
    };

    if (this.state.regularNoteId) {
      _.merge(params, {id: this.state.regularNoteId});
    }

    this.props.onSave(params);
  }

  autosaveRestrictedNote() {
    const params = {
      is_restricted: true,
      text: this.state.restrictedNoteText
    };

    if (this.state.restrictedNoteId) {
      _.merge(params, {id: this.state.restrictedNoteId});
    }

    this.props.onSave(params);
  }

  autosaveStatusText(status) {
    if (status === 'saved') return 'Saved.';

    if (status === 'pending') return 'Autosaving ...';

    if (status === 'error') return 'There was an error autosaving this note.';

    return 'This note will autosave as you type.';
  }

  onChangeRegularNote(e) {
    this.setState({noteText: e.target.value}, () => {this.autosaveRegularNote()});
  }

  onChangeRestrictedNote(e) {
    this.setState({restrictedNoteText: e.target.value}, () => {this.autosaveRestrictedNote()});
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

