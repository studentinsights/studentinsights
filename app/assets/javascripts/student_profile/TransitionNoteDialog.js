import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import SectionHeading from '../components/SectionHeading';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import {modalFullScreenFlex} from '../components/HelpBubble';


export default class TransitionNoteDialog extends React.Component {
  render() {
    const {student, isWritingTransitionNote, onWritingTransitionNoteChanged} = this.props;
    return (
      <ReactModal
        isOpen={isWritingTransitionNote}
        style={modalFullScreenFlex}
        onRequestClose={e => {
          e.preventDefault();
          e.stopPropagation();
          onWritingTransitionNoteChanged(false);
        }}
      >
        <div style={{fontSize: 14, flex: 1, display: 'flex', flexDirection: 'column'}}>
          <SectionHeading titleStyle={{display: 'flex', alignItems: 'center'}}>
            <StudentPhotoCropped studentId={student.id} />
            <div style={{marginLeft: 10}}>Transition note for {student.first_name}</div>
          </SectionHeading>
          <div style={{display: 'flex', flex: 1}}>
            <div style={{flex: 1, paddingTop: 10, paddingRight: 10}}>
              <div style={{minHeight: '6em', fontSize: 14, padding: 10, background: '#0366d61a'}}>This column will be <b>shared with all educators</b> working with {student.first_name} next year. <a href="#" style={{fontSize: 14}}>read more</a></div>
                <div style={{padding: 10}}>
                  <div style={styles.section}>
                    <div>What are {student.first_name}'s strengths?</div>
                    <textarea style={styles.textarea} rows={2}></textarea>
                  </div>
                  <div style={styles.section}>
                    <div>What is {student.first_name}'s involvement in the school community like?</div>
                    <textarea style={styles.textarea} rows={3}></textarea>
                  </div>
                  <div style={styles.section}>
                    <div>How does {student.first_name} relate to their peers?</div>
                    <textarea style={styles.textarea} rows={3}></textarea>
                  </div>
                  <div style={styles.section}>
                    <div>Any additional comments or good things to know about {student.first_name}?</div>
                    <textarea style={styles.textarea} rows={3}></textarea>
                  </div>
                </div>
            </div>
            <div style={{flex: 1, paddingTop: 10, paddingRight: 10}}>
              <div style={{minHeight: '6em', fontSize: 14, padding: 10, background: '#d603031a'}}>This column will only be visible to <b>educators with restricted access</b>, typically counselors, assistant principals, or district student support admin. <a href="#" style={{fontSize: 14}}>read more</a></div>
              <div style={{padding: 10}}>
                <div style={styles.section}>
                  <div>Is {student.first_name} receiving Social Services and if so, what is the name and contact info of their social worker?</div>
                  <textarea placeholder="No" style={styles.textarea} rows={4}></textarea>
                </div>
                <div style={styles.section}>
                  <div>Is {student.first_name} receiving mental health supports?</div>
                  <textarea placeholder="No" style={styles.textarea} rows={4}></textarea>
                </div>
              </div>
            </div>
          </div>
          <div>
            <button className="btn save">Save</button>
            <button className="btn cancel" style={{marginLeft: 10, background: '#ccc'}}>Cancel</button>
          </div>
        </div>
      </ReactModal>
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
    marginTop: 15
  },
  textarea: {
    fontSize: 14,
    marginTop: 5,
    resize: 'none',
    border: '1px solid #eee',
    width: '100%' //overriding strange global CSS, should cleanup
  }
};
