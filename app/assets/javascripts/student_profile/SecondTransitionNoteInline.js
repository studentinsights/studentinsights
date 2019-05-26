import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SecondTransitionNoteDialog, {
  renderAsText,
  docFromJson,
  enableTransitionNoteDialog
} from './SecondTransitionNoteDialog';
import GenericLoader from '../components/GenericLoader';
import NoteText from '../components/NoteText';


export default class SecondTransitionNoteInline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const {json, student, currentEducator} = this.props;
    const {isOpen} = this.state;
    const text = renderAsText(student.first_name, json);
    const showEditLink = (
      (window.location.search.indexOf('enable_editing') !== -1) &&
      enableTransitionNoteDialog(currentEducator, student.grade)
    );

    return (
      <div className="SecondTransitionNoteInline">
        <NoteText text={text} />
        <div style={{display: 'flex', flexDirection: 'row'}}>
          {showEditLink && (
            <a style={styles.link} href="#" onClick={e => {
              e.preventDefault();
              this.setState({isOpen: true});
            }}>Edit transition note</a>
          )}
          <div style={{display: 'inline-block'}}>
            {isOpen && this.renderTransitionNoteDialog()}
          </div>
        </div>
      </div>
    );
  }

  // Before loading, fetching the actual content of the 
  renderTransitionNoteDialog() {
    const {student, json} = this.props;
    const studentId = json.student_id;
    const url = `/api/students/${studentId}/second_transition_notes/${json.id}/restricted_text_json`;
    
    return (
      <GenericLoader
        promiseFn={() => apiFetchJson(url)}
        render={restrictedTextJson => (
          <SecondTransitionNoteDialog
            student={student}
            initialId={json.id}
            initialDoc={{
              ...docFromJson(json),
              restrictedText: restrictedTextJson.restricted_text
            }}
            onClose={() => this.setState({isOpen: false})}
          />
        )}
      />
    );
  }
}
SecondTransitionNoteInline.propTypes = {
  json: PropTypes.object.isRequired,
  currentEducator: PropTypes.object.isRequired,
  student: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  link: {
    display: 'block',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10
  }
};

