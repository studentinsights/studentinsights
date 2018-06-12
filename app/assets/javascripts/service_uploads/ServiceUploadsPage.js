import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {merge} from '../helpers/merge';
import PastServiceUploads from '../service_uploads/PastServiceUploads';
import NewServiceUpload from '../service_uploads/NewServiceUpload';
import Api from './Api';

class ServiceUploadsPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      serviceUploads: null,
      formData: {},

      // Student LASID validation
      studentLasidsReceivedFromBackend: false,
      incorrectLasids: [],
      missingLasidHeader: false,
      lasidAuthorizationError: false,

      // Overall form validation
      serverSideErrors: [],
      uploadingInProgress: false,
    };

    this.onGetPastServiceUploads = this.onGetPastServiceUploads.bind(this);
    this.onFileReaderLoaded = this.onFileReaderLoaded.bind(this);
    this.onSelectStartDate = this.onSelectStartDate.bind(this);
    this.onSelectEndDate = this.onSelectEndDate.bind(this);
    this.onUserTypingServiceType = this.onUserTypingServiceType.bind(this);
    this.onUserSelectServiceType = this.onUserSelectServiceType.bind(this);
    this.onClickUploadButton = this.onClickUploadButton.bind(this);
    this.onSelectFile = this.onSelectFile.bind(this);
    this.upload = this.upload.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onValidateLasidAuthSuccess = this.onValidateLasidAuthSuccess.bind(this);
    this.onValidateLasidAuthError = this.onValidateLasidAuthError.bind(this);
    this.onClickDeleteServiceUpload = this.onClickDeleteServiceUpload.bind(this);
    this.onDeleteUpload = this.onDeleteUpload.bind(this);
  }

  componentWillMount(props, state) {
    this.api = new Api();
  }

  componentDidMount() {
    const onSucceed = this.onGetPastServiceUploads;

    this.api.getPastServiceUploads(onSucceed);
  }

  isMissingRequiredFields() {
    const formData = this.state.formData;

    if (!formData.file_name) return true;
    if (!formData.student_lasids) return true;
    if (!formData.service_type_name) return true;
    if (!formData.date_started) return true;

    return false;
  }

  upload() {
    this.setState({
      serverSideErrors: [],
      uploadingInProgress: true,
    });  // Clear out any errors

    $.ajax({
      url: '/service_uploads.json',
      method: 'POST',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify(this.state.formData),
      success: this.onUpload
    });
  }

  onGetPastServiceUploads(json) {
    this.setState({ serviceUploads: json });
  }

  onUpload(data) {
    if (data.service_upload) {
      this.setState({
        serviceUploads: [data.service_upload].concat(this.state.serviceUploads),
        uploadingInProgress: false,
        formData: {},
        studentLasidsReceivedFromBackend: false,
        incorrectLasids: [],
        missingLasidHeader: false,
        lasidAuthorizationError: false,
        serverSideErrors: [],
      });
    }

    if (data.errors) {
      this.setState({
        serverSideErrors: data.errors,
        uploadingInProgress: false
      });
    }
  }

  onValidateLasidAuthSuccess(uploadLasids, allLasids) {
    this.setState({
      studentLasidsReceivedFromBackend: true,
      incorrectLasids: _.difference(uploadLasids, allLasids),
      formData: merge(this.state.formData, { student_lasids: uploadLasids })
    });
  }

  onValidateLasidAuthError() {
    this.setState({ lasidAuthorizationError: true });
  }

  onDeleteUpload(data) {
    if (data.success) {
      this.setState({
        serviceUploads: this.state.serviceUploads.filter((upload) => {
          return upload.id !== parseInt(data.id);
        })
      });
    }
  }

  onClickDeleteServiceUpload(id) {
    return $.ajax({
      url: '/service_uploads/' + id + '.json',
      method: 'DELETE',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      success: this.onDeleteUpload
    });
  }

  onSelectStartDate(event) {
    this.setState({
      formData: merge(this.state.formData, { date_started: event })
    });
  }

  onSelectEndDate(event) {
    this.setState({
      formData: merge(this.state.formData, { date_ended: event })
    });
  }

  onUserTypingServiceType(event) {
    this.setState({
      formData: merge(this.state.formData, { service_type_name: event.target.value })
    });
  }

  onUserSelectServiceType(string) {
    this.setState({
      formData: merge(this.state.formData, { service_type_name: string })
    });
  }

  onClickUploadButton() {
    if (this.isMissingRequiredFields()) return;

    this.upload();
  }

  onSelectFile(event) {
    const file = event.target.files[0];
    if (!file || !file.name) return;

    this.setState({ formData: merge(this.state.formData, { file_name: file.name }) });

    const reader = new FileReader();
    reader.onload = this.onFileReaderLoaded.bind(this, reader);
    reader.readAsText(file);
  }

  onFileReaderLoaded(reader, e) {
    const text = reader.result;
    const rows = text.split("\n");
    const headerRow = rows.shift().split(",");

    if (headerRow[0].trim() !== 'LASID') {
      this.setState({ missingLasidHeader: true });
      return;
    }

    const student_lasids = rows.map((row) => { return row.split(",")[0].trim(); })
                             .filter((lasid) => { return lasid !== ''; });
    const onSuccess = this.onValidateLasidAuthSuccess;
    const onError = this.onValidateLasidAuthError;

    this.api.validateLasidsInUploadFile(student_lasids, onSuccess, onError);
  }

  render() {
    return (
      <div>
        <div
          style={{
            width: '50%',
            float: 'left',
            padding: 20,
            marginTop: 20,
          }}>
          {this.renderNewServiceUploadForm()}
        </div>
        <div
          style={{
            width: '50%',
            float: 'left'
          }}>
          {this.renderServiceDetails()}
        </div>
      </div>
    );
  }

  renderNewServiceUploadForm() {
    return (
      <NewServiceUpload
        // Actions
        onClickUploadButton={this.onClickUploadButton}
        onSelectStartDate={this.onSelectStartDate}
        onSelectEndDate={this.onSelectEndDate}
        onSelectFile={this.onSelectFile}
        onUserTypingServiceType={this.onUserTypingServiceType}
        onUserSelectServiceType={this.onUserSelectServiceType}
        // Student LASID validation
        lasidAuthorizationError={this.state.lasidAuthorizationError}
        studentLasidsReceivedFromBackend={this.state.studentLasidsReceivedFromBackend}
        incorrectLasids={this.state.incorrectLasids}
        missingLasidHeader={this.state.missingLasidHeader}
        // Overall form validation
        missingRequiredFields={this.isMissingRequiredFields()}
        formData={this.state.formData}
        serverSideErrors={this.state.serverSideErrors}
        uploadingInProgress={this.state.uploadingInProgress}
        serviceTypeNames={this.props.serializedData.serviceTypeNames} />
    );
  }

  renderServiceDetails() {
    const { serviceUploads } = this.state;

    return (
      <PastServiceUploads
        serviceUploads={serviceUploads}
        onClickDeleteServiceUpload={this.onClickDeleteServiceUpload}
      />
    );
  }

}

ServiceUploadsPage.propTypes = {
  serializedData: PropTypes.object.isRequired,
};

export default ServiceUploadsPage;
