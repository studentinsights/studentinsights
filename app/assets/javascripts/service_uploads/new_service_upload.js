(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var Datepicker = window.shared.Datepicker;
  var ServiceTypeDropdown = window.shared.ServiceTypeDropdown;

  var NewServiceUpload = window.shared.NewServiceUpload = React.createClass({

    propTypes: {
      // Actions
      onClickUploadButton: React.PropTypes.func.isRequired,
      onSelectStartDate: React.PropTypes.func.isRequired,
      onSelectEndDate: React.PropTypes.func.isRequired,
      onSelectFile: React.PropTypes.func.isRequired,
      onUserTypingServiceType: React.PropTypes.func.isRequired,
      onUserSelectServiceType: React.PropTypes.func.isRequired,

      // Student LASID validation
      lasidAuthorizationError: React.PropTypes.bool.isRequired,
      studentLasidsReceivedFromBackend: React.PropTypes.bool.isRequired,
      incorrectLasids: React.PropTypes.array.isRequired,
      missingLasidHeader: React.PropTypes.bool.isRequired,

      // Overall form validation
      missingRequiredFields: React.PropTypes.bool.isRequired,
      formData: React.PropTypes.object.isRequired,
      serverSideErrors: React.PropTypes.array.isRequired,
      uploadingInProgress: React.PropTypes.bool.isRequired,
      serviceTypeNames: React.PropTypes.array.isRequired,
    },

    render: function () {
      return dom.div({
        style: {
          marginLeft: 80,
        }
      },
        dom.h1({}, 'Upload new services file'),
        this.renderErrors(),
        dom.div({ style: { marginTop: 30 } }, 'Start Date'),
        this.renderDatepicker(
          this.props.onSelectStartDate,
          this.props.formData.date_started || ''
        ),
        dom.div({ style: { marginTop: 20 } }, 'End Date'),
        this.renderDatepicker(
          this.props.onSelectEndDate,
          this.props.formData.date_ended || ''
        ),
        createEl(ServiceTypeDropdown, {
          onUserTypingServiceType: this.props.onUserTypingServiceType,
          onUserSelectServiceType: this.props.onUserSelectServiceType
        }),
        dom.input({
          type: 'file',
          id: 'fileUpload',
          onChange: this.props.onSelectFile,
          style: {
            display: 'none'
          }
        }),
        dom.label({
          style: {
            width: 300,
            minHeight: 180,
            padding: '50px 0',
            border: '1px dashed gray',
            marginTop: 30,
            textAlign: 'center',
            cursor: 'pointer'
          },
          htmlFor: 'fileUpload'
        },
          dom.span({
            className: 'btn',
            style: {
              fontSize: 16,
              width: 210,
              textAlign: 'center',
              margin: 'auto'
            }
          }, this.selectCsvButtonText()),
          dom.br({}),
          this.renderFileName(),
          dom.br({}),
          dom.div({ style: { fontSize: 14, padding: '14px 28px' } },
            this.renderCSVValidationMessages()
          )
        ),
        dom.br({}),
        dom.div({ style: { width: 300, textAlign: 'center' } },
          dom.button({
            className: 'btn',
            onClick: this.props.onClickUploadButton,
            disabled: this.disableUploadButton(),
            title: this.renderConfimationButtonHelptext(),
            style: {
              fontSize: 18,
              background: this.uploadButtonColor(),
              textAlign: 'center'
            }
          }, this.uploadButtonText())
        )
      );
    },

    selectCsvButtonText: function () {
      if (this.props.formData.file_name) {
        return 'File Selected';
      } else {
        return 'Select CSV to Upload';
      };
    },

    renderFileName: function () {
      if (!this.props.formData.file_name) return null;

      return dom.div({ style: { fontWeight: 'bold' } },
        dom.br({}),
        dom.br({}),
        this.props.formData.file_name
      );
    },

    renderErrors: function () {
      if (this.props.missingRequiredFields) return null;

      if (!this.hasClientSideErrors() && !this.hasServerSideErrors()) return null;

      return dom.div({
        style: {
          width: 300,
          padding: '30px',
          border: '1px dashed red',
          marginTop: 30,
          marginBottom: 30,
          fontSize: 15,
          textAlign: 'left',
          cursor: 'pointer',
          color: 'red',
        },
      },
        this.renderClientSideErrors(),
        this.renderServerSideErrors()
      );
    },

    uploadButtonColor: function () {
      if (this.disableUploadButton()) {
        return '#ccc';
      } else if (this.props.serverSideErrors.length > 0) {
        return 'red';
      } else if (this.props.incorrectLasids.length > 0) {
        return 'orange';
      } else {
        return undefined;
      }
    },

    uploadButtonText: function () {
      if (this.props.uploadingInProgress) {
        return 'Uploading...';
      } else if (this.props.serverSideErrors.length > 0) {
        return 'Error Uploading';
      } else if (this.props.incorrectLasids.length > 0) {
        return 'Confirm Upload Despite LASID Mismatches?';
      } else {
        return 'Confirm Upload';
      };
    },

    disableUploadButton: function () {
      return (this.props.missingRequiredFields || this.hasClientSideErrors());
    },

    hasClientSideErrors: function () {
      return (this.clientSideErrors().length > 0);
    },

    hasServerSideErrors: function () {
      return (this.props.serverSideErrors.length > 0);
    },

    clientSideErrors: function () {
      var errors = [];
      var formData = this.props.formData;

      var parsed_date_started = moment(formData.date_started, 'MM/DD/YYYY', true);
      var parsed_date_ended = moment(formData.date_ended, 'MM/DD/YYYY', true);

      if (!parsed_date_started.isValid()) {
        errors.push('Start date invalid, please use MM/DD/YYYY format.');
      };

      if (!parsed_date_ended.isValid()) {
        errors.push('End date invalid, please use MM/DD/YYYY format.');
      };

      if (parsed_date_ended.isBefore(parsed_date_started)) {
        errors.push('Start date can\'t be after end date.');
      };

      if (this.props.serviceTypeNames.indexOf(this.props.formData.service_type_name) === -1) {
        errors.push('Please select a valid service type.');
      };

      return errors;
    },

    renderClientSideErrors: function () {
      if (this.props.missingRequiredFields) return null;   // Only show errors when all fields are full

      return dom.div({},
        this.clientSideErrors().map(function (error) {
          return dom.div({}, error);
        })
      );
    },

    renderServerSideErrors: function () {
      if (!this.props.serverSideErrors.length === 0) return null;

      return dom.div({},
        this.props.serverSideErrors.map(function (error) {
          return dom.div({}, error);
        })
      );
    },

    renderConfimationButtonHelptext: function () {
      if (this.props.missingRequiredFields === false) return 'Ready to upload!';

      var formFieldsToNames = {
        'file_name': 'file name',
        'student_lasids': 'student LASIDs from the CSV',
        'date_started': 'start date',
        'service_type_id': 'service type',
      };

      var formFields = Object.keys(formFieldsToNames);

      var formData = this.props.formData;

      var missingFormFieldNames = [];

      formFields.map(function (formField) {
        if (formData[formField] === undefined) {
          missingFormFieldNames.push(formFieldsToNames[formField]);
        };
      });

      return 'Oooh, we are missing ' + missingFormFieldNames.join(' ');
    },

    renderCSVValidationMessages: function () {
      if (this.props.missingLasidHeader) {
        return dom.div({ style: { color: 'red' }}, 'The first column should be "LASID".');
      } else if (this.props.lasidAuthorizationError) {
        return dom.div({ style: { color: 'red' }}, 'Hm, looks like there was some kind of authorization error.');
      } else if (this.props.incorrectLasids.length > 0) {
        return dom.div({ style: { color: 'red', textAlign: 'left' }},
          'The following LASIDs do not match with any students in Insights:',
          dom.br({}),
          dom.br({}),
          dom.ul({},
            this.props.incorrectLasids.map(function(lasid) {
              return dom.li({}, lasid)
            }.bind(this))
          )
        );
      } else if (this.props.studentLasidsReceivedFromBackend &&
                 this.props.incorrectLasids.length === 0) {
        return dom.div({ style: { color: 'blue' }}, 'All LASIDs match!');
      } else {
        return dom.div({}, "The first CSV column should be the LASID one.");
      };
    },

    renderDatepicker: function (onChangeFn, value) {
      return createEl(Datepicker, {
        onChange: onChangeFn,
        value: value,
        styles: { input: {
          fontSize: 14,
          padding: 5,
          width: '50%'
        } },
        datepickerOptions: {
          showOn: 'both',
          dateFormat: 'mm/dd/yy',
          minDate: undefined
        }
      });
    },

  });

})();

