import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Datepicker from '../components/Datepicker';
import ServiceTypeDropdown from './ServiceTypeDropdown';

class NewServiceUpload extends React.Component {

  selectCsvButtonText() {
    if (this.props.formData.file_name) {
      return 'File Selected';
    } else {
      return 'Select CSV to Upload';
    }
  }

  uploadButtonColor() {
    if (this.disableUploadButton()) {
      return '#ccc';
    } else if (this.props.serverSideErrors.length > 0) {
      return 'red';
    } else if (this.props.incorrectLasids.length > 0) {
      return 'orange';
    } else {
      return undefined;
    }
  }

  uploadButtonText() {
    if (this.props.uploadingInProgress) {
      return 'Uploading...';
    } else if (this.props.serverSideErrors.length > 0) {
      return 'Error Uploading';
    } else if (this.props.incorrectLasids.length > 0) {
      return 'Confirm Upload Despite LASID Mismatches?';
    } else {
      return 'Confirm Upload';
    }
  }

  disableUploadButton() {
    return (this.props.missingRequiredFields || this.hasClientSideErrors());
  }

  hasClientSideErrors() {
    return (this.clientSideErrors().length > 0);
  }

  hasServerSideErrors() {
    return (this.props.serverSideErrors.length > 0);
  }

  clientSideErrors() {
    const errors = [];
    const formData = this.props.formData;

    const parsed_date_started = moment(formData.date_started, 'MM/DD/YYYY', true);
    const parsed_date_ended = moment(formData.date_ended, 'MM/DD/YYYY', true);

    if (!parsed_date_started.isValid()) {
      errors.push('Start date invalid, please use MM/DD/YYYY format.');
    }

    if (!parsed_date_ended.isValid()) {
      errors.push('End date invalid, please use MM/DD/YYYY format.');
    }

    if (parsed_date_ended.isBefore(parsed_date_started)) {
      errors.push('Start date can\'t be after end date.');
    }

    if (this.props.serviceTypeNames.indexOf(this.props.formData.service_type_name) === -1) {
      errors.push('Please select a valid service type.');
    }

    return errors;
  }

  render() {
    return (
      <div
        style={{
          marginLeft: 80,
        }}>
        <h1>
          Upload new services file
        </h1>
        {this.renderErrors()}
        <div style={{ marginTop: 30 }}>
          Start Date
        </div>
        {this.renderDatepicker(
          this.props.onSelectStartDate,
          this.props.formData.date_started || ''
        )}
        <div style={{ marginTop: 20 }}>
          End Date
        </div>
        {this.renderDatepicker(
          this.props.onSelectEndDate,
          this.props.formData.date_ended || ''
        )}
        <ServiceTypeDropdown
          onUserTypingServiceType={this.props.onUserTypingServiceType}
          onUserSelectServiceType={this.props.onUserSelectServiceType}
          value={this.props.formData.service_type_name || ''} />
        <input
          type="file"
          id="fileUpload"
          onChange={this.props.onSelectFile}
          style={{
            display: 'none'
          }} />
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
            {this.selectCsvButtonText()}
          </span>
          <br />
          {this.renderFileName()}
          <br />
          <div style={{ fontSize: 14, padding: '14px 28px' }}>
            {this.renderCSVValidationMessages()}
          </div>
        </label>
        <br />
        <div style={{ width: 300, textAlign: 'center' }}>
          <button
            className="btn"
            onClick={this.props.onClickUploadButton}
            disabled={this.disableUploadButton()}
            title={this.renderConfimationButtonHelptext()}
            style={{
              fontSize: 18,
              background: this.uploadButtonColor(),
              textAlign: 'center'
            }}>
            {this.uploadButtonText()}
          </button>
        </div>
      </div>
    );
  }

  renderFileName() {
    if (!this.props.formData.file_name) return null;

    return (
      <div style={{ fontWeight: 'bold' }}>
        <br />
        <br />
        {this.props.formData.file_name}
      </div>
    );
  }

  renderErrors() {
    if (this.props.missingRequiredFields) return null;

    if (!this.hasClientSideErrors() && !this.hasServerSideErrors()) return null;

    return (
      <div
        style={{
          width: 300,
          padding: '30px',
          border: '1px dashed red',
          marginTop: 30,
          marginBottom: 30,
          fontSize: 15,
          textAlign: 'left',
          cursor: 'pointer',
          color: 'red',
        }}>
        {this.renderClientSideErrors()}
        {this.renderServerSideErrors()}
      </div>
    );
  }

  renderClientSideErrors() {
    if (this.props.missingRequiredFields) return null;   // Only show errors when all fields are full

    return (
      <div>
        {this.clientSideErrors().map((error, index) => {
          return (<div key={`${error}${index}`}>{error}</div>);
        })}
      </div>
    );
  }

  renderServerSideErrors() {
    if (!this.props.serverSideErrors.length === 0) return null;

    return (
      <div>
        {this.props.serverSideErrors.map((error, index) => {
          return (<div key={`${error}${index}`}>{error}</div>);
        })}
      </div>
    );
  }

  renderConfimationButtonHelptext() {
    if (this.props.missingRequiredFields === false) return 'Ready to upload!';

    const formFieldsToNames = {
      'file_name': 'file name',
      'student_lasids': 'student LASIDs from the CSV',
      'date_started': 'start date',
      'service_type_id': 'service type',
    };

    const formFields = Object.keys(formFieldsToNames);

    const formData = this.props.formData;

    const missingFormFieldNames = [];

    formFields.map(function (formField) {
      if (formData[formField] === undefined) {
        missingFormFieldNames.push(formFieldsToNames[formField]);
      }
    });

    return 'Oooh, we are missing ' + missingFormFieldNames.join(' ');
  }

  renderCSVValidationMessages() {
    if (this.props.missingLasidHeader) {
      return (
        <div style={{ color: 'red' }}>
          The first column should be "LASID".
        </div>
      );
    } else if (this.props.lasidAuthorizationError) {
      return (
        <div style={{ color: 'red' }}>
          Hm, looks like there was some kind of authorization error.
        </div>
      );
    } else if (this.props.incorrectLasids.length > 0) {
      return (
        <div style={{ color: 'red', textAlign: 'left' }}>
          The following LASIDs do not match with any students in Insights:
          <br />
          <br />
          <ul>
            {this.props.incorrectLasids.map(function(lasid) {
              return (
                <li>
                  {lasid}
                </li>
              );
            }.bind(this))}
          </ul>
        </div>
      );
    } else if (this.props.studentLasidsReceivedFromBackend &&
               this.props.incorrectLasids.length === 0) {
      return (
        <div style={{ color: 'blue' }}>
          All LASIDs match!
        </div>
      );
    } else {
      return (
        <div>
          The first CSV column should be the LASID one.
        </div>
      );
    }
  }

  renderDatepicker(onChangeFn, value) {
    return (
      <Datepicker
        onChange={onChangeFn}
        value={value}
        styles={{ input: {
          fontSize: 14,
          padding: 5,
          width: '50%'
        } }}
        datepickerOptions={{
          showOn: 'both',
          dateFormat: 'mm/dd/yy',
          minDate: undefined
        }} />
    );
  }

}

NewServiceUpload.propTypes = {
  // Actions
  onClickUploadButton: PropTypes.func.isRequired,
  onSelectStartDate: PropTypes.func.isRequired,
  onSelectEndDate: PropTypes.func.isRequired,
  onSelectFile: PropTypes.func.isRequired,
  onUserTypingServiceType: PropTypes.func.isRequired,
  onUserSelectServiceType: PropTypes.func.isRequired,

  // Student LASID validation
  lasidAuthorizationError: PropTypes.bool.isRequired,
  studentLasidsReceivedFromBackend: PropTypes.bool.isRequired,
  incorrectLasids: PropTypes.array.isRequired,
  missingLasidHeader: PropTypes.bool.isRequired,

  // Overall form validation
  missingRequiredFields: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  serverSideErrors: PropTypes.array.isRequired,
  uploadingInProgress: PropTypes.bool.isRequired,
  serviceTypeNames: PropTypes.array.isRequired,
};

export default NewServiceUpload;
