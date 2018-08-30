import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import StudentVoiceSurveyUploadForm from './StudentVoiceSurveyUploadForm';


// Shows a list of uploads of student voice surveys; allow the user to 
// upload a new one.  Intended for a small number of admin users who have access.
export default class StudentVoiceSurveyUploadsPage extends React.Component {
  constructor(props) {
    super(props);

    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.onUploadDone = this.onUploadDone.bind(this);
  }

  fetchJson() {
    const url = `/admin/api/student_voice_survey_uploads`;
    return apiFetchJson(url);
  }

  onUploadDone() {
    // essentially, reload the list from the server and avoid keeping any separate client state
    // TODO(kr)
  }

  render() {
    return (
      <div className="StudentVoiceSurveyUploadsPage" style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Student Voice Survey Uploads</SectionHeading>
        <GenericLoader
          style={styles.flexVertical}
          promiseFn={this.fetchJson}
          render={this.renderJson} />          
      </div>
    );
  }

  renderJson(json) {
    const {currentEducatorId} = this.props;
    const studentVoiceSurveyUploads = json.student_voice_survey_uploads;
    const surveyFormUrl = json.student_voice_survey_form_url;
    return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <StudentVoiceSurveyUploadForm
          style={{flex: 1}}
          surveyFormUrl={surveyFormUrl}
          currentEducatorId={currentEducatorId}
          onUploadDone={this.onUploadDone} />
        <StudentVoiceSurveyUploadsList
          currentEducatorId={currentEducatorId}
          studentVoiceSurveyUploads={studentVoiceSurveyUploads} />
      </div>
    );
  }
}
StudentVoiceSurveyUploadsPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired
};


function StudentVoiceSurveyUploadsList(props) {
  const {studentVoiceSurveyUploads} = props;
  return (
    <div className="StudentVoiceSurveyUploadsList" style={{...styles.flexVertical, margin: 10}}>
      <pre>{JSON.stringify(studentVoiceSurveyUploads, null, 2)}</pre>
    </div>
  );
}
StudentVoiceSurveyUploadsList.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  studentVoiceSurveyUploads: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    file_name: PropTypes.string.isRequired,
    file_size: PropTypes.number.isRequired,
    file_digest: PropTypes.string.isRequired,
    stats: PropTypes.object.isRequired,
    completed: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
    students: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string
    })).isRequired,
    uploaded_by_educator: PropTypes.shape({
      id: PropTypes.number.isRequired,
      full_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired
    }).isRequired
  })).isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};