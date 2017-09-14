(function() {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;

  const Datepicker = window.shared.Datepicker;
  const serviceColor = window.shared.serviceColor;

  const ProvidedByEducatorDropdown = window.shared.ProvidedByEducatorDropdown;

  const styles = {
    dialog: {
      border: '1px solid #ccc',
      borderRadius: 2,
      padding: 20,
      marginBottom: 20,
      marginTop: 10
    },
    cancelRecordServiceButton: { // overidding CSS
      color: 'black',
      background: '#eee',
      marginLeft: 10,
      marginRight: 10
    },
    datepickerInput: {
      fontSize: 14,
      padding: 5,
      width: '50%'
    },
    serviceButton: {
      background: '#eee', // override CSS
      color: 'black'
    },
    buttonWidth: {
      width: '12em',
      fontSize: 12,
      padding: 8
    }
  };


  /*
  Pure UI form for recording that a student is receiving a service.
  Tracks its own local state and submits values to prop callbacks.
  */
  window.shared.RecordService = React.createClass({
    displayName: 'RecordService',

    propTypes: {
      studentFirstName: React.PropTypes.string.isRequired,
      studentId: React.PropTypes.number.isRequired,
      onSave: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired,
      requestState: React.PropTypes.string, // or null

      // context
      nowMoment: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        serviceTypeId: null,
        providedByEducatorName: "",
        momentStarted: moment.utc() // TODO should thread through
      };
    },

    onDateChanged: function(dateText) {
      const textMoment = moment.utc(dateText, 'MM/DD/YYYY');
      const updatedMoment = (textMoment.isValid()) ? textMoment : null;
      this.setState({ momentStarted: updatedMoment });
    },

    onProvidedByEducatorTyping: function(event) {
      this.setState({ providedByEducatorName: event.target.value });
    },

    onProvidedByEducatorDropdownSelect: function(string) {
      this.setState({ providedByEducatorName: string });
    },

    onServiceClicked: function(serviceTypeId, event) {
      this.setState({ serviceTypeId: serviceTypeId });
    },

    onClickCancel: function(event) {
      this.props.onCancel();
    },

    onClickSave: function(event) {
      // Get the value of the autocomplete input
      this.props.onSave({
        serviceTypeId: this.state.serviceTypeId,
        providedByEducatorName: this.state.providedByEducatorName,
        dateStartedText: this.state.momentStarted.format('YYYY-MM-DD'),
        recordedByEducatorId: this.props.currentEducator.id
      });
    },

    render: function() {
      return (
        <div className="RecordService" style={styles.dialog}>
          {this.renderWhichService()}
          {this.renderWhoAndWhen()}
          {this.renderButtons()}
        </div>
      );
    },

    renderWhichService: function() {
      return (
        <div>
          <div style={{ marginBottom: 5, display: 'inline' }}>
            Which service?
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={styles.buttonWidth}>
              {this.renderServiceButton(503)}
              {this.renderServiceButton(502)}
              {this.renderServiceButton(504)}
            </div>
            <div style={styles.buttonWidth}>
              {this.renderServiceButton(505)}
              {this.renderServiceButton(506)}
              {this.renderServiceButton(507)}
            </div>
          </div>
        </div>
      );
    },

    renderServiceButton: function(serviceTypeId, options) {
      const serviceText = this.props.serviceTypesIndex[serviceTypeId].name;
      const color = serviceColor(serviceTypeId);

      return (
        <button
          className="btn service-type"
          onClick={this.onServiceClicked.bind(this, serviceTypeId)}
          tabIndex={-1}
          style={merge(styles.serviceButton, styles.buttonWidth, {
            background: color,
            outline: 0,
            border: (this.state.serviceTypeId === serviceTypeId)
              ? '4px solid rgba(49, 119, 201, 0.75)'
              : '4px solid white'
          })}>
          {serviceText}
        </button>
      );
    },

    renderEducatorSelect: function() {
      return (
        <ProvidedByEducatorDropdown
          onUserTyping={this.onProvidedByEducatorTyping}
          onUserDropdownSelect={this.onProvidedByEducatorDropdownSelect}
          studentId={this.props.studentId} />
      );
    },

    renderWhoAndWhen: function() {
      return (
        <div>
          <div style={{ marginTop: 20 }}>
            <div>
              {'Who is working with ' + this.props.studentFirstName + '?'}
            </div>
            <div>
              {this.renderEducatorSelect()}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            When did they start?
          </div>
          <Datepicker
            styles={{ input: styles.datepickerInput }}
            value={this.state.momentStarted.format('MM/DD/YYYY')}
            onChange={this.onDateChanged}
            datepickerOptions={{
              showOn: 'both',
              dateFormat: 'mm/dd/yy',
              minDate: undefined
            }} />
        </div>
      );
    },

    renderButtons: function() {
      const isFormComplete = (this.state.serviceTypeId && this.state.momentStarted);
      return (
        <div style={{ marginTop: 15 }}>
          <button
            style={{
              marginTop: 20,
              background: (isFormComplete) ? undefined : '#ccc'
            }}
            disabled={!isFormComplete}
            className="btn save"
            onClick={this.onClickSave}>
            Record service
          </button>
          <button
            className="btn cancel"
            style={styles.cancelRecordServiceButton}
            onClick={this.onClickCancel}>
            Cancel
          </button>
          {(this.props.requestState === 'pending') ? <span>
            Saving...
          </span> : this.props.requestState}
        </div>
      );
    }
  });
})();
