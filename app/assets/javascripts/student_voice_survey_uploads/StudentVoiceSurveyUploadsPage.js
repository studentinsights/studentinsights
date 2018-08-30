import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import StudentVoiceSurveyUploadsList from './StudentVoiceSurveyUploadsList';
import StudentVoiceSurveyUploadForm from './StudentVoiceSurveyUploadForm';


// Shows a list of uploads of student voice surveys; allow the user to 
// upload a new one.  Intended for a small number of admin users who have access.
export default class StudentVoiceSurveyUploadsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchCount: 0
    };
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
    const {fetchCount} = this.state;
    this.setState({fetchCount: fetchCount + 1});
  }

  render() {
    const {fetchCount} = this.state;
    return (
      <div className="StudentVoiceSurveyUploadsPage" style={{...styles.flexVertical, margin: 10, fontSize: 14}}>
        <SectionHeading>Student Voice Survey Uploads</SectionHeading>
        <GenericLoader
          key={fetchCount}
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
      <div style={{display: 'flex', flexDirection: 'row', padding: 20}}>
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

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};