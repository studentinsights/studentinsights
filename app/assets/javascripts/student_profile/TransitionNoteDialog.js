import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import SectionHeading from '../components/SectionHeading';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import LightHelpBubble  from '../student_profile/LightHelpBubble';

const STRENGTHS = 'strengths';
const CONNECTING = 'connecting';
const COMMUNITY = 'community';
const PEERS = 'peers';
const OTHER = 'other';

export default class TransitionNoteDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isStarred: false,
      formJson: {
        [STRENGTHS]: '',
        [CONNECTING]: '',
        [COMMUNITY]: '',
        [PEERS]: '',
        [OTHER]: ''
      },
      restrictedText: ''
    };

    this.onStarClicked = this.onStarClicked.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onSaveAndNextClick = this.onSaveAndNextClick.bind(this);
  }

  onStarClicked(e) {
    e.preventDefault();
    const {isStarred} = this.state;
    this.setState({isStarred: !isStarred});
  }

  onSaveAndNextClick(e) {

  }

  onSaveClick(e) {
    
  }

  render() {
    const {student, isWritingTransitionNote, onWritingTransitionNoteChanged} = this.props;
    const {isStarred, restrictedText} = this.state;

    return (
      <ReactModal
        isOpen={isWritingTransitionNote}
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
        onRequestClose={e => {
          e.preventDefault();
          e.stopPropagation();
          onWritingTransitionNoteChanged(false);
        }}
      >
        <div style={{fontSize: 14, flex: 1, display: 'flex', flexDirection: 'column'}}>
          <SectionHeading style={{padding: 0, paddingBottom: 10}} titleStyle={{display: 'flex', alignItems: 'center'}}>
            <StudentPhotoCropped studentId={student.id} />
            <div style={{marginLeft: 10}}>Transition note for {student.first_name}</div>
          </SectionHeading>
          <div style={{fontSize: 14, padding: 15, marginTop: 10, background: '#0366d61a', border: '1px solid #0366d61a'}}>
            "What we say shapes how adults think about and treat students, how students feel about themselves and their peers, and who gets which dollars, teachers, daily supports, and opportunities to learn."
            <LightHelpBubble style={{display: 'inline-block'}} title="Transition note examples" content={'... helpful example ...'} />
          </div>
          <div style={{display: 'flex', flex: 1}}>
            <div style={{marginTop: 10}}>
              <div>
                <div style={styles.row}>
                  <div style={styles.question}>
                    <div style={styles.prompt}>What are {student.first_name}'s strengths?</div>
                    {this.renderTextarea(STRENGTHS, {autoFocus: true, rows: 5})}
                  </div>
                  <div style={styles.spacer} />
                  <div style={styles.question}>
                    <div style={styles.prompt}>How would you suggest teachers connect with {student.first_name}?</div>
                    {this.renderTextarea(CONNECTING, {rows: 5})}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.question}>
                    <div style={styles.prompt}>How has {student.first_name} become involved with the school community?</div>
                    {this.renderTextarea(COMMUNITY, {rows: 4})}
                  </div>
                  <div style={styles.spacer} />
                  <div style={styles.question}>
                    <div style={styles.prompt}>How does {student.first_name} relate to their peers?</div>
                    {this.renderTextarea(PEERS, {rows: 4})}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={{...styles.question,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div style={styles.prompt}>Any additional comments or good things to know?</div>
                    {this.renderTextarea(OTHER, {rows: 6})}
                    <a href="#" style={{display: 'flex', marginTop: 15, marginBottom: 15}} onClick={this.onStarClicked}>
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
                          onChange={e => this.setState({restrictedText: e.target.value})}
                        />
                        <div style={{marginTop: 5}}>This will only be visible to educators with restricted access.</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    className="btn save"
                    onClick={this.onSaveAndNextClick}>Save and next student</button>
                  <button
                    className="btn"
                    style={styles.plainButton}
                    onClick={this.onSaveClick}>Save</button>
                  <button
                    className="btn cancel"
                    style={styles.plainButton}
                    onClick={onWritingTransitionNoteChanged}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReactModal>
    );
  }

  renderTextarea(key, props = {}) {
    const {formJson} = this.state;
    const value = formJson[key] || '';
    return (
      <textarea
        style={styles.textarea}
        value={value}
        onChange={e => {
          this.setState({
            formJson: {
              ...this.state.formJson,
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
  plainButton: {
    marginLeft: 10,
    background: '#eee',
    color: 'black'
  }
};
