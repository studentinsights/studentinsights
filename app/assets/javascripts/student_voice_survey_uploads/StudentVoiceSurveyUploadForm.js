import PropTypes from 'prop-types';
import React from 'react';
import {apiPostJson} from '../helpers/apiFetchJson';


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

  //   this.state = {
  //     serviceUploads: null,
  //     formData: {},

  //     // Student LASID validation
  //     studentLasidsReceivedFromBackend: false,
  //     incorrectLasids: [],
  //     missingLasidHeader: false,
  //     lasidAuthorizationError: false,

  //     // Overall form validation
  //     serverSideErrors: [],
  //     uploadingInProgress: false,
  //   };

  //   this.onGetPastServiceUploads = this.onGetPastServiceUploads.bind(this);
  //   this.onFileReaderLoaded = this.onFileReaderLoaded.bind(this);
  //   this.onSelectStartDate = this.onSelectStartDate.bind(this);
  //   this.onSelectEndDate = this.onSelectEndDate.bind(this);
  //   this.onUserTypingServiceType = this.onUserTypingServiceType.bind(this);
  //   this.onUserSelectServiceType = this.onUserSelectServiceType.bind(this);
  //   this.onClickUploadButton = this.onClickUploadButton.bind(this);
  //   this.onSelectFile = this.onSelectFile.bind(this);
  //   this.upload = this.upload.bind(this);
  //   this.onUpload = this.onUpload.bind(this);
  //   this.onValidateLasidAuthSuccess = this.onValidateLasidAuthSuccess.bind(this);
  //   this.onValidateLasidAuthError = this.onValidateLasidAuthError.bind(this);
  //   this.onClickDeleteServiceUpload = this.onClickDeleteServiceUpload.bind(this);
  //   this.onDeleteUpload = this.onDeleteUpload.bind(this);
  // }

  // componentWillMount(props, state) {
  //   this.api = new Api();
  // }

  // componentDidMount() {
  //   const onSucceed = this.onGetPastServiceUploads;

  //   this.api.getPastServiceUploads(onSucceed);
  // }

  // isMissingRequiredFields() {
  //   const formData = this.state.formData;

  //   if (!formData.file_name) return true;
  //   if (!formData.student_lasids) return true;
  //   if (!formData.service_type_name) return true;
  //   if (!formData.date_started) return true;

  //   return false;
  // }

  // upload() {
  //   this.setState({
  //     serverSideErrors: [],
  //     uploadingInProgress: true,
  //   });  // Clear out any errors

  //   $.ajax({
  //     url: '/service_uploads.json',
  //     method: 'POST',
  //     contentType: 'application/json; charset=UTF-8',
  //     dataType: 'json',
  //     data: JSON.stringify(this.state.formData),
  //     success: this.onUpload
  //   });
  // }

  // onGetPastServiceUploads(json) {
  //   this.setState({ serviceUploads: json });
  // }

  // onUpload(data) {
  //   if (data.service_upload) {
  //     this.setState({
  //       serviceUploads: [data.service_upload].concat(this.state.serviceUploads),
  //       uploadingInProgress: false,
  //       formData: {},
  //       studentLasidsReceivedFromBackend: false,
  //       incorrectLasids: [],
  //       missingLasidHeader: false,
  //       lasidAuthorizationError: false,
  //       serverSideErrors: [],
  //     });
  //   }

  //   if (data.errors) {
  //     this.setState({
  //       serverSideErrors: data.errors,
  //       uploadingInProgress: false
  //     });
  //   }
  // }

  // onValidateLasidAuthSuccess(uploadLasids, allLasids) {
  //   this.setState({
  //     studentLasidsReceivedFromBackend: true,
  //     incorrectLasids: _.difference(uploadLasids, allLasids),
  //     formData: merge(this.state.formData, { student_lasids: uploadLasids })
  //   });
  // }

  // onValidateLasidAuthError() {
  //   this.setState({ lasidAuthorizationError: true });
  // }

  // onDeleteUpload(data) {
  //   if (data.success) {
  //     this.setState({
  //       serviceUploads: this.state.serviceUploads.filter((upload) => {
  //         return upload.id !== parseInt(data.id);
  //       })
  //     });
  //   }
  // }

  // onClickDeleteServiceUpload(id) {
  //   return $.ajax({
  //     url: '/service_uploads/' + id + '.json',
  //     method: 'DELETE',
  //     contentType: 'application/json; charset=UTF-8',
  //     dataType: 'json',
  //     success: this.onDeleteUpload
  //   });
  // }

  // onSelectStartDate(event) {
  //   this.setState({
  //     formData: merge(this.state.formData, { date_started: event })
  //   });
  // }

  // onSelectEndDate(event) {
  //   this.setState({
  //     formData: merge(this.state.formData, { date_ended: event })
  //   });
  // }

  // onUserTypingServiceType(event) {
  //   this.setState({
  //     formData: merge(this.state.formData, { service_type_name: event.target.value })
  //   });
  // }

  // onUserSelectServiceType(string) {
  //   this.setState({
  //     formData: merge(this.state.formData, { service_type_name: string })
  //   });
  // }

  // onClickUploadButton() {
  //   if (this.isMissingRequiredFields()) return;

  //   this.upload();
  // }

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
    alert("The upload failed\n\n" + JSON.stringify(err, null, 2));
  }

  render() {
    const {style, surveyFormUrl} = this.props;
    return (
      <div className="StudentVoiceSurveyUploadForm" style={style}>
        {this.renderUploadButton()}
        <div style={{fontSize: 14}}>
          This upload form is intended to work with <a href={surveyFormUrl} target="_blank">this survey form</a>.
        </div>
      </div>
    );
  }

  renderUploadButton() {
    return (
      <div>
        <input
          type="file"
          id="fileUpload"
          onChange={this.onFileChanged}
          style={{
            display: 'none'
          }}
        />
        <label
          style={{
            width: 300,
            minHeight: 180,
            padding: '50px 0',
            border: '1px dashed gray',
            marginTop: 30,
            textAlign: 'center',
            cursor: 'pointer'
          }}
          htmlFor="fileUpload">
          <span
            className="btn"
            style={{
              fontSize: 16,
              width: 210,
              textAlign: 'center',
              margin: 'auto'
            }}>
            Upload CSV
          </span>
          {this.renderFileName()}
          {this.renderValidationMessage()}
        </label>
      </div>
    );
  }

  renderFileName() {
    const {fileName} = this.state;
    if (!fileName) return null;

    return <div style={{ fontWeight: 'bold' }}>{fileName}</div>;
  }

  renderValidationMessage() {
    return (
      <div style={{ fontSize: 14, padding: '14px 28px' }}>
        {null}
      </div>
    );
  }


  //   return (
  //     <NewServiceUpload
  //       // Actions
  //       onClickUploadButton={this.onClickUploadButton}
  //       onSelectStartDate={this.onSelectStartDate}
  //       onSelectEndDate={this.onSelectEndDate}
  //       onSelectFile={this.onSelectFile}
  //       onUserTypingServiceType={this.onUserTypingServiceType}
  //       onUserSelectServiceType={this.onUserSelectServiceType}
  //       // Student LASID validation
  //       lasidAuthorizationError={this.state.lasidAuthorizationError}
  //       studentLasidsReceivedFromBackend={this.state.studentLasidsReceivedFromBackend}
  //       incorrectLasids={this.state.incorrectLasids}
  //       missingLasidHeader={this.state.missingLasidHeader}
  //       // Overall form validation
  //       missingRequiredFields={this.isMissingRequiredFields()}
  //       formData={this.state.formData}
  //       serverSideErrors={this.state.serverSideErrors}
  //       uploadingInProgress={this.state.uploadingInProgress}
  //       serviceTypeNames={this.props.serializedData.serviceTypeNames} />
  //   );
  // }

}

StudentVoiceSurveyUploadForm.propTypes = {
  surveyFormUrl: PropTypes.string.isRequired,
  currentEducatorId: PropTypes.number.isRequired,
  onUploadDone: PropTypes.func.isRequired,
  style: PropTypes.object
};

