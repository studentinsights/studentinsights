import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import SectionHeading from '../components/SectionHeading';
import Button, {PlainButton} from '../components/Button';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import {Pending, Failure} from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import * as Routes from '../helpers/Routes';
import SecondTransitionNoteServerBridge from './SecondTransitionNoteServerBridge';

const STRENGTHS = 'strengths';
const CONNECTING = 'connecting';
const COMMUNITY = 'community';
const PEERS = 'peers';
const FAMILY = 'family';
const OTHER = 'other';


// This is the dialog for writing, and then later editing, a
// second transition note.  Writing is intended to only be open
// for a window of time at the end of the school year.
export default class SecondTransitionNoteDialog extends React.Component {
  onStarClicked(bridge, e) {
    e.preventDefault();
    const {doc, onDocChanged} = bridge;
    const {isStarred} = doc;
    onDocChanged({isStarred: !isStarred});
  }

  onRestrictedTextChanged(onDocChanged, e) {
    e.preventDefault();
    onDocChanged({restrictedText: e.target.value});
  }

  onDeleteNoteClicked(doDelete, e) {
    e.preventDefault();
    const {onClose} = this.props;
    doDelete().then(() => onClose());
  }

  onSaveClick(doSave, e) {
    e.preventDefault();
    doSave();
  }

  onNextClick(doSave, e) {
    e.preventDefault();
    const {student} = this.props;
    const url = `/api/students/${student.id}/second_transition_notes/next_student_json`;
    apiFetchJson(url).then(json => {
      window.location = Routes.studentProfile(json.next_student_id);
    });
  }

  onRequestClose(bridge, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Warn about pending changes
    const {isDirty, pending, failed} = bridge;
    if (isDirty || pending.length > 0 || failed.length > 0) {
      if (!confirm('You have unsaved changes, discard them?')) return;
    }
    const {onClose} = this.props;
    onClose();
  }

  render() {
    const {student, initialDoc} = this.props;
    return (
      <SecondTransitionNoteServerBridge initialDoc={initialDoc} studentId={student.id}>
        {bridge => (
          <ReactModal
            isOpen={true}
            style={{
              content: {
                top: 15,
                bottom: 20,
                left: 40,
                right: 40,
                display: 'flex',
                flexDirection: 'column'
              }
            }}
            onRequestClose={this.onRequestClose.bind(this, bridge)}
          >
            {this.renderDialogContent(bridge)}
          </ReactModal>
        )}
      </SecondTransitionNoteServerBridge>
    );
  }

  renderDialogContent(bridge) {
    return (
      <div style={styles.root}>
        {this.renderDialogTitle(bridge)}
        <div style={styles.quote}>
          <span>"What we say shapes how adults think about and treat students, how students feel about themselves and their peers."</span>
          <a style={{marginLeft: 10}} href="http://schooltalking.org/schooltalk/" target="_blank" rel="noopener noreferrer">Schooltalk</a>
        </div>
        <div style={{display: 'flex', flex: 1}}>
          <div style={styles.columnsContainer}>
            {this.renderLeftColumn(bridge)}
            <div style={styles.spacer} />
            {this.renderRightColumn(bridge)}
          </div>
        </div>
        {this.renderButtonStrip(bridge)}
      </div>
    );
  }

  renderDialogTitle(bridge) {
    const {student} = this.props;
    const {pending, failed} = bridge;

    return (
      <SectionHeading style={{padding: 0, paddingBottom: 10}} titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <StudentPhotoCropped studentId={student.id} />
          <div style={{marginLeft: 10}}>Transition note for {student.first_name}</div>
        </div>
        <div style={{display: 'flex'}}>
          {pending.length > 0 ? <Pending /> : null}
          {failed.length > 0 ? <Failure /> : null}
          <a href="#" onClick={this.onRequestClose.bind(this, bridge)}>Close</a>
        </div>
      </SectionHeading>
    );
  }

  renderLeftColumn(bridge) {
    const {student} = this.props;
    const {doc, onDocChanged} = bridge;

    return (
      <div style={styles.column}>
        <div style={styles.prompt}>What are {student.first_name}'s strengths?</div>
        {this.renderTextarea(doc, onDocChanged, STRENGTHS, {autoFocus: true, rows: 4})}
        
        <div style={styles.prompt}>What works well for connecting with {student.first_name}?</div>
        {this.renderTextarea(doc, onDocChanged, CONNECTING, {rows: 4})}
        
        <div style={styles.prompt}>How does {student.first_name} relate to their peers?</div>
        {this.renderTextarea(doc, onDocChanged, PEERS, {rows: 4})}

        <div style={styles.prompt}>How has {student.first_name} become involved with the school community?</div>
        {this.renderTextarea(doc, onDocChanged, COMMUNITY, {rows: 4})}
      </div>
    );
  }

  renderRightColumn(bridge) {
    const {student} = this.props;
    const {doc, onDocChanged} = bridge;
    const {restrictedText, isStarred} = doc;

    return (
      <div style={styles.column}>
        <div style={styles.restrictedBox}>
          <div style={{marginBottom: 5}}>What other services does {student.first_name} receive now, and who are the points of contact (eg, social workers, mental health counselors)?</div>
          <textarea
            style={styles.textarea}
            placeholder="None"
            rows={3}
            value={restrictedText}
            onChange={this.onRestrictedTextChanged.bind(this, onDocChanged)}
          />
          <div style={{marginTop: 5}}>This will only be visible to educators with restricted access.</div>
        </div>

        <div style={styles.prompt}>What works well for communicating with Ryan’s family?</div>
        {this.renderTextarea(doc, onDocChanged, FAMILY, {rows: 4})}

        <div style={styles.prompt}>Any additional comments or good things to know?</div>
        {this.renderTextarea(doc, onDocChanged, OTHER, {rows: 6})}
        
        <a href="#" style={styles.starLine} onClick={this.onStarClicked.bind(this, bridge)}>
          <span style={{
            marginRight: 10,
            fontSize: 20,
            filter: (isStarred) ? null : 'grayscale(100%)'
          }}>⭐</span>
          <span style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {isStarred ? <b>Starred for discussion</b> : 'Star for discussion'}
          </span>
        </a>
      </div>
    );
  }

  renderButtonStrip(bridge) {
    const {isDirty, doDelete, doSave} = bridge;

    return (
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div>
          <Button
            isDisabled={!isDirty}
            containerStyle={styles.buttonSpacing}
            onClick={this.onSaveClick.bind(this, doSave)}>Save</Button>
          <PlainButton
            containerStyle={styles.buttonSpacing}
            onClick={this.onRequestClose.bind(this, bridge)}>Close</PlainButton>
          <PlainButton
            isDisabled={isDirty}
            containerStyle={{...styles.buttonSpacing, marginLeft: 20}}
            onClick={this.onNextClick.bind(this, doSave)}>Jump to next student</PlainButton>
        </div>
        {doDelete && (
          <a
            href="#"
            onClick={this.onDeleteNoteClicked.bind(this, doDelete)}>Delete transition note</a>
        )}
      </div>
    );
  }

  renderTextarea(doc, onDocChanged, key, props = {}) {
    const value = doc.formJson[key] || '';
    return (
      <textarea
        {...props}
        style={styles.textarea}
        value={value}
        onChange={e => {
          const {formJson} = doc;
          onDocChanged({
            formJson: {
              ...formJson,
              [key]: e.target.value
            }
          });
        }}
      />
    );
  }
}
SecondTransitionNoteDialog.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  initialDoc: PropTypes.object
};
SecondTransitionNoteDialog.defaultProps = {
  initialDoc: createInitialDoc()
};

const styles = {
  root: {
    fontSize: 14,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  section: {
    marginTop: 20
  },
  quote: {
    padding: 15,
    marginTop: 10,
    background: '#0366d61a',
    border: '1px solid #0366d61a'
  },
  textarea: {
    fontSize: 14,
    marginTop: 2,
    resize: 'none',
    color: '#333',
    border: '1px solid #eee',
    width: '100%' //overriding strange global CSS, should cleanup
  },
  columnsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10
  },
  column: {
    flex: 1
  },
  spacer: {
    width: 30
  },
  prompt: {
    display: 'flex',
    fontWeight: 'bold',
    color: '#555',
    marginTop: 15
  },
  starLine: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10
  },
  buttonSpacing: {
    display: 'inline-block',
    marginRight: 10
  },
  restrictedBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    background: '#d603031a',
    border: '1px solid #d603031a'
  }
};


function createInitialDoc() {
  return {
    isStarred: false,
    formJson: {
      [STRENGTHS]: '',
      [CONNECTING]: '',
      [COMMUNITY]: '',
      [PEERS]: '',
      [FAMILY]: '',
      [OTHER]: ''
    },
    restrictedText: ''
  };
}
