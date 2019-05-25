import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import SectionHeading from '../components/SectionHeading';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import Loading from '../components/Loading';
import LightHelpBubble  from '../student_profile/LightHelpBubble';
import SecondTransitionNoteDocumentContext, {
  STRENGTHS,
  CONNECTING,
  COMMUNITY,
  PEERS,
  OTHER
} from './SecondTransitionNoteDocumentContext';


export default class TransitionNoteDialog extends React.Component {
  onStarClicked(params, e) {
    e.preventDefault();
    const {doc, onDocChanged} = params;
    const {isStarred} = doc;
    onDocChanged({isStarred: !isStarred});
  }

  onRestrictedTextChanged(onDocChanged, e) {
    e.preventDefault();
    onDocChanged({restrictedText: e.target.value});
  }

  onDeleteNoteClicked(doDelete, e) {
    e.preventDefault();
    const {onWritingTransitionNoteChanged} = this.props;
    doDelete().then(() => onWritingTransitionNoteChanged(false));
  }

  onSaveClick(doSave, e) {
    e.preventDefault();
    doSave();
  }

  onSaveAndNextClick(doSave, e) {
    e.preventDefault();
    doSave().then(() => alert('next student!'));
  }

  onRequestClose(params, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Warn about pending changes
    const {pending, failed} = params;
    if (pending.length > 0 || failed.length > 0) {
      if (!confirm('You have unsaved changes, discard them?')) return;
    }
    const {onWritingTransitionNoteChanged} = this.props;
    onWritingTransitionNoteChanged(false);
  }

  render() {
    const {student, isWritingTransitionNote} = this.props;
    if (!isWritingTransitionNote) return null;

    return (
      <SecondTransitionNoteDocumentContext studentId={student.id}>
        {params => (
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
            onRequestClose={this.onRequestClose.bind(this, params)}
          >
            {this.renderDialogContent(params)}
          </ReactModal>
        )}
      </SecondTransitionNoteDocumentContext>
    );
  }

  renderDialogContent(params) {
    const {
      doc,
      onDocChanged,
      doSave,
      doDelete,
      pending,
      failed
    } = params;

    const {student} = this.props;
    const {isStarred, restrictedText} = doc;
    return (
      <div style={{fontSize: 14, flex: 1, display: 'flex', flexDirection: 'column'}}>
        <SectionHeading style={{padding: 0, paddingBottom: 10}} titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <StudentPhotoCropped studentId={student.id} />
            <div style={{marginLeft: 10}}>Transition note for {student.first_name}</div>
          </div>
          <div style={{display: 'flex'}}>
            {pending.length > 0 ? <Pending /> : null}
            {failed.length > 0 ? <Failure /> : null}
            <a href="#" onClick={this.onRequestClose.bind(this, params)}>Close</a>
          </div>
        </SectionHeading>
        <div style={{fontSize: 14, padding: 15, marginTop: 10, background: '#0366d61a', border: '1px solid #0366d61a'}}>
          "What we say shapes how adults think about and treat students, how students feel about themselves and their peers."<br/>Adapted from <a href="http://schooltalking.org/schooltalk/" target="_blank" rel="noopener noreferrer">Schooltalk</a>
        </div>
        <div style={{display: 'flex', flex: 1}}>
          <div style={{marginTop: 10}}>
            <div>
              <div style={styles.row}>
                <div style={styles.question}>
                  <div style={styles.prompt}>What are {student.first_name}'s strengths?</div>
                  {this.renderTextarea(doc, onDocChanged, STRENGTHS, {autoFocus: true, rows: 5})}
                </div>
                <div style={styles.spacer} />
                <div style={styles.question}>
                  <div style={styles.prompt}>What works well for connecting with {student.first_name}?</div>
                  {this.renderTextarea(doc, onDocChanged, CONNECTING, {rows: 5})}
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.question}>
                  <div style={styles.prompt}>How has {student.first_name} become involved with the school community?</div>
                  {this.renderTextarea(doc, onDocChanged, COMMUNITY, {rows: 4})}
                </div>
                <div style={styles.spacer} />
                <div style={styles.question}>
                  <div style={styles.prompt}>How does {student.first_name} relate to their peers?</div>
                  {this.renderTextarea(doc, onDocChanged, PEERS, {rows: 4})}
                </div>
              </div>
              <div style={styles.row}>
                <div style={{...styles.question,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={styles.prompt}>Any additional comments or good things to know?</div>
                  {this.renderTextarea(doc, onDocChanged, OTHER, {rows: 6})}
                  <a href="#" style={styles.starLine} onClick={this.onStarClicked.bind(this, params)}>
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
                <div style={styles.spacer} />
                <div style={styles.question}>
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 15, marginTop: 10, marginBottom: 20, background: '#d603031a', border: '1px solid #d603031a'}}>
                    <div>
                      <div style={{marginBottom: 5}}>What other services does {student.first_name} receive now, and who are the points of contact?  Include social workers, mental health counselors, or any other services.</div>
                      <textarea
                        style={styles.textarea}
                        placeholder="None"
                        rows={3}
                        value={restrictedText}
                        onChange={this.onRestrictedTextChanged.bind(this, onDocChanged)}
                      />
                      <div style={{marginTop: 5}}>This will only be visible to educators with restricted access.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <button
                    className="btn save"
                    onClick={this.onSaveClick.bind(this, doSave)}>Save</button>
                  <button
                    className="btn"
                    style={styles.plainButton}
                    onClick={this.onSaveAndNextClick.bind(this, doSave)}>Save and next student</button>
                  <button
                    className="btn cancel"
                    style={styles.plainButton}
                    onClick={this.onRequestClose.bind(this, params)}>Close</button>
                  </div>
                {doDelete && (
                  <a
                    href="#"
                    onClick={this.onDeleteNoteClicked.bind(this, doDelete)}>Delete transition note</a>
                )}
              </div>
            </div>
          </div>
        </div>
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
TransitionNoteDialog.propTypes = {
  student: PropTypes.object.isRequired,
  isWritingTransitionNote: PropTypes.bool.isRequired,
  onWritingTransitionNoteChanged: PropTypes.func.isRequired
};

const styles = {
  section: {
    marginTop: 20
  },
  textarea: {
    fontSize: 14,
    marginTop: 2,
    resize: 'none',
    color: '#333',
    border: '1px solid #eee',
    width: '100%' //overriding strange global CSS, should cleanup
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  question: {
    flex: 1,
    marginTop: 15
  },
  spacer: {
    width: 20
  },
  prompt: {
    display: 'flex',
    fontWeight: 'bold',
    color: '#555'
  },
  starLine: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  plainButton: {
    marginLeft: 10,
    background: '#eee',
    color: 'black'
  }
};


function Pending() {
  return <span style={{
    width: '8em',
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 10,
    padding: 5}}>...</span>;
}

function Failure() {
  return <span style={{
    width: '8em',
    textAlign: 'center',
    backgroundColor: 'red',
    color: 'white',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 5,
    fontWeight: 'bold'
  }}>network error</span>;
}