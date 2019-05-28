import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {formatEducatorName} from '../helpers/educatorName';
import SecondTransitionNoteDialog, {
  renderAsTextWithoutRestrictedText,
  docFromJson,
  enableTransitionNoteDialog
} from './SecondTransitionNoteDialog';
import GenericLoader from '../components/GenericLoader';
import NoteText from '../components/NoteText';
import RestrictedNotePresence from '../student_profile/RestrictedNotePresence';


export default class SecondTransitionNoteInline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const {json, student} = this.props;
    const text = renderAsTextWithoutRestrictedText(student.first_name, json);

    return (
      <div className="SecondTransitionNoteInline">
        <NoteText text={text} />
        {this.renderRestrictedInline()}
        {this.renderEditLink()}
      </div>
    );
  }

  renderRestrictedInline() {
    const {student, currentEducator, json} = this.props;
    if (!json.has_restricted_text) return null;
    
    const educatorName = formatEducatorName(currentEducator);
    const educatorFirstNameOrEmail = educatorName.indexOf(' ') !== -1
      ? educatorName.split(' ')[0]
      : educatorName;
    const url = `/api/students/${student.id}/second_transition_notes/${json.id}/restricted_text_json`;
    const fetchRestrictedText = () => apiFetchJson(url).then(json => json.restricted_text);
    return (
      <div>
        <div><br/>What other services does {student.first_name} receive now, and who are the points of contact (eg, social workers, mental health counselors)?</div>
        <RestrictedNotePresence
          studentFirstName={student.first_name}
          educatorName={educatorFirstNameOrEmail}
          fetchRestrictedText={fetchRestrictedText}
        />
      </div>
    );
  }

  renderEditLink() {
    const {student, currentEducator} = this.props;
    const {isOpen} = this.state;
    const showEditLink = (
      (window.location.search.indexOf('enable_editing') !== -1) &&
      enableTransitionNoteDialog(currentEducator, student.grade)
    );

    return (
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
    );
  }

  // Before loading, fetching the actual content of the restricted note too.
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

