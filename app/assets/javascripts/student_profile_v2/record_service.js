(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;
  var ReactSelect = window.Select;
  var datepickerOptions = window.datepicker_options;
  var serviceColor = window.shared.serviceColor;

  var styles = {
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
  var RecordService = window.shared.RecordService = React.createClass({
    propTypes: {
      studentFirstName: React.PropTypes.string.isRequired,
      onSave: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired,
      requestState: PropTypes.nullable(React.PropTypes.string.isRequired),

      // context
      nowMoment: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        serviceTypeId: null,
        providedByEducatorId: null,
        dateStarted: null
      }
    },

    componentDidMount: function(props, state) {
      var el = ReactDOM.findDOMNode(this);
      $(el).find('.datepicker').datepicker(datepickerOptions);
    },

    onClickNoteType: function(noteTypeId, event) {
      this.setState({ eventNoteTypeId: noteTypeId });
    },

    onClickCancel: function(event) {
      this.props.onCancel();
    },

    onClickSave: function(event) {
      var params = _.pick(this.state, 'eventNoteTypeId', 'text');
      this.props.onSave(params);
    },

    onServiceClicked: function(serviceTypeId, event) {
      this.setState({ serviceTypeId: serviceTypeId });
    },

    render: function() {
      return dom.div({ className: 'RecordService', style: styles.dialog },
        this.renderWhichService(),
        this.renderWhoAndWhen(),
        this.renderButtons()
      );
    },

    renderWhichService: function() {
      return dom.div({}, 
        dom.div({ style: { marginBottom: 5 } }, 'Which service?'),
        dom.div({ style: { display: 'flex', justifyContent: 'flex-start' } },
          dom.div({ style: styles.buttonWidth },
            this.renderServiceButton(505),
            this.renderServiceButton(506)
          ),
          dom.div({ style: styles.buttonWidth },
            this.renderServiceButton(507),
            this.renderServiceButton(508)
          ),
          dom.div({ style: styles.buttonWidth },
            this.renderServiceButton(502),
            this.renderServiceButton(503),
            this.renderServiceButton(504)
          )
        )
      );
    },

    renderServiceButton: function(serviceTypeId, options) {
      var serviceText = this.props.serviceTypesIndex[serviceTypeId].name;
      var color = serviceColor(serviceTypeId);

      return dom.button({
        className: 'btn service-type',
        onClick: this.onServiceClicked.bind(this, serviceTypeId),
        tabIndex: -1,
        style: merge(styles.serviceButton, styles.buttonWidth, {
          background: color,
          opacity: (this.state.serviceTypeId === null || this.state.serviceTypeId === serviceTypeId) ? 1 : 0.25,
          border: (this.state.serviceTypeId === serviceTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })
      }, serviceText);
    },

    renderEducatorSelect: function() {
      var options = _.values(this.props.educatorsIndex).map(function(educator) {
        var name = (educator.full_name !== null)
          ? educator.full_name
          : educator.email.split('@')[0];
        return { value: educator.id, label: name };
      });

      return createEl(ReactSelect, {
        name: 'assigned-educator-select',
        clearable: false,
        placeholder: 'Type name..',
        value: this.state.serviceProvidedByEducatorId,
        options: options,
        onChange: this.onAssignedEducatorChanged
      });
    },


    renderWhoAndWhen: function() {
      return dom.div({},
        dom.div({ style: { marginTop: 20 } },
          dom.div({}, 'Who is working with ' + this.props.studentFirstName + '?'),
          dom.div({ style: { width: '50%' } }, this.renderEducatorSelect())
        ),
        dom.div({ style: { marginTop: 20 } }, 'When did they start?'),
        dom.input({ className: 'datepicker', style: { fontSize: 14, padding: 5, width: '50%' }, defaultValue: moment.utc().format('MM/DD/YYYY') })
      );
    },

    renderButtons: function() {
      // TODO(kr) allow saving once backend is ready
      var isSaveEnabled = false; // (this.state.serviceTypeId !== null);

      return dom.div({ style: { marginTop: 15 } },
        dom.button({
          style: {
            marginTop: 20,
            background: (isSaveEnabled) ? undefined : '#ccc'
          },
          disabled: !isSaveEnabled,
          className: 'btn save',
          onClick: this.onClickSave
        }, 'Record service'),
        dom.button({
          className: 'btn cancel',
          style: styles.cancelRecordServiceButton,
          onClick: this.onClickCancel
        }, 'Cancel'),
        (this.props.requestState === 'pending') ? dom.span({}, 'Saving...') : null,
        (this.props.requestState === 'error') ? dom.span({}, 'Try again!') : null
      );
    }
  });
})();