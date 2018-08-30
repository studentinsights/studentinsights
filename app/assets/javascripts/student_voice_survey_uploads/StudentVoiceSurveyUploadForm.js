import PropTypes from 'prop-types';
import React from 'react';
import {apiPostJson} from '../helpers/apiFetchJson';

// Lets the user upload a CSV from a particular student voice survey form.
export default class StudentVoiceSurveyUploadForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileName: null,
      fileText: null,
      uploadState: null
    };

    this.onFileChanged = this.onFileChanged.bind(this);
    this.onFileReaderLoaded = this.onFileReaderLoaded.bind(this);
    this.onUploadDone = this.onUploadDone.bind(this);
    this.onUploadFailed = this.onUploadFailed.bind(this);
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    if (!file || !file.name) return;
    
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = this.onFileReaderLoaded.bind(this, reader, filename);
    reader.readAsText(file);
  }

  onFileReaderLoaded(reader, filename, e) {
    const fileText = reader.result;
    this.setState({filename, fileText, uploadState: 'pending'});
    apiPostJson('/admin/api/student_voice_survey_uploads', {
      file_name: filename,
      file_text: fileText
    }).then(this.onUploadDone).catch(this.onUploadFailed);
  }

  onUploadDone(json) {
    const {onUploadDone} = this.props;
    this.setState({
      filename: null,
      fileText: null,
      uploadState: null
    });
    onUploadDone();
    alert("Done!\n\n" + JSON.stringify(json, null, 2));
  }

  onUploadFailed(err) {
    const {onUploadDone} = this.props;
    onUploadDone();
    alert("The upload failed.\n\n" + JSON.stringify(err, null, 2));
  }

  render() {
    const {style, surveyFormUrl} = this.props;
    return (
      <div className="StudentVoiceSurveyUploadForm" style={{...styles.root, style}}>
        {this.renderUploadArea()}
        <div style={{padding: 10}}>
          This upload is intended to work
          with <a href={surveyFormUrl} target="_blank">this
          survey form</a>.
        </div>
      </div>
    );
  }

  renderUploadArea() {
    return (
      <div style={{width: '100%'}}>
        <input
          id="StudentVoiceSurveyUploadForm-fileUpload"
          style={{display: 'none'}}
          type="file"
          onChange={this.onFileChanged}
        />
        <label
          style={styles.label}
          htmlFor="StudentVoiceSurveyUploadForm-fileUpload">
          <div className="btn">Upload CSV</div>
        </label>
      </div>
    );
  }
}

StudentVoiceSurveyUploadForm.propTypes = {
  surveyFormUrl: PropTypes.string.isRequired,
  currentEducatorId: PropTypes.number.isRequired,
  onUploadDone: PropTypes.func.isRequired,
  style: PropTypes.object
};

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10
  },
  label: {
    width: '100%',
    minHeight: 180,
    display: 'flex',
    border: '1px dashed gray',
    cursor: 'pointer'
  }
};
